import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Income from '../models/Income.js';

const categoryColors = {
  Food: '#c9a35e',
  Transport: '#4a8a6d',
  Shopping: '#b3552f',
  Utilities: '#e3c98a',
  Entertainment: '#7d9c8a',
  Health: '#a8695f',
  Income: '#6fae8c',
};

// Helper to get start and end of current month
const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

// @desc    Get dashboard summary metrics and latest transactions
// @route   GET /api/dashboard/summary
// @access  Private
export const getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    const { start: startOfMonth, end: endOfMonth } = getCurrentMonthRange();

    // Helper to format percentages cleanly (e.g. 2.5%, 10%, 0%)
    const formatPercent = (val) => {
      if (isNaN(val) || !isFinite(val)) return '0%';
      const rounded = Math.round(val * 10) / 10;
      return rounded % 1 === 0 ? `${rounded.toFixed(0)}%` : `${rounded.toFixed(1)}%`;
    };

    // Range for previous month to compute accurate MoM changes
    const startOfPrevMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 0, 23, 59, 59, 999);

    // 1. Calculate Total Income (all-time sum of all income records)
    const incomeAllTimeResult = await Income.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalIncome = incomeAllTimeResult.length > 0 ? incomeAllTimeResult[0].total : 0;

    // Current month's income
    const currentIncomeResult = await Income.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const currentMonthlyIncome = currentIncomeResult.length > 0 ? currentIncomeResult[0].total : 0;

    // Previous month's income
    const prevIncomeResult = await Income.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const prevMonthlyIncome = prevIncomeResult.length > 0 ? prevIncomeResult[0].total : 0;

    // 2. Calculate Total Expenses (all-time sum of absolute values of expense transactions)
    const expenseAllTimeResult = await Transaction.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } },
    ]);
    const totalExpense = expenseAllTimeResult.length > 0 ? expenseAllTimeResult[0].total : 0;

    // 3. Calculate Total Balance = Total Income - Total Expenses
    const totalBalance = totalIncome - totalExpense;

    // 4. Calculate This Month's Spending (expense)
    const spendingResult = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          amount: { $lt: 0 },
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } },
    ]);
    const monthlySpendingVal = spendingResult.length > 0 ? spendingResult[0].total : 0;

    // 5. Budget Remaining = Budget - Expenses (this month)
    const budgetRemaining = Math.max(0, user.monthlyBudget - monthlySpendingVal);
    const rawBudgetUsedPercent = user.monthlyBudget > 0
      ? (monthlySpendingVal / user.monthlyBudget) * 100
      : 0;
    const budgetUsedPercent = Math.round(rawBudgetUsedPercent * 10) / 10;
    const budgetUsedStr = formatPercent(rawBudgetUsedPercent);

    // Calculate accurate Total Income MoM change
    let incomeChangeText = '0%';
    let incomeUp = true;
    if (prevMonthlyIncome > 0) {
      const diff = ((currentMonthlyIncome - prevMonthlyIncome) / prevMonthlyIncome) * 100;
      incomeChangeText = `${diff >= 0 ? '+' : ''}${formatPercent(diff)} vs last mo.`;
      incomeUp = diff >= 0;
    } else if (currentMonthlyIncome > 0) {
      incomeChangeText = '+100% vs last mo.';
      incomeUp = true;
    } else {
      incomeChangeText = '0% vs last mo.';
      incomeUp = true;
    }

    // Calculate accurate Total Balance change / Savings rate
    let balanceChangeText = totalBalance >= 0 ? '+100%' : '-100%';
    let balanceUp = totalBalance >= 0;
    if (currentMonthlyIncome > 0) {
      const savingsRate = Math.max(0, ((currentMonthlyIncome - monthlySpendingVal) / currentMonthlyIncome) * 100);
      balanceChangeText = `${formatPercent(savingsRate)} saved`;
      balanceUp = savingsRate >= 20;
    } else if (totalIncome > 0) {
      const savingsRate = Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100);
      balanceChangeText = `${formatPercent(savingsRate)} saved`;
      balanceUp = savingsRate >= 20;
    }

    // Format metrics matching frontend array format
    const metrics = [
      {
        label: 'Total Balance',
        value: totalBalance,
        change: '',
        up: true,
      },
      {
        label: "This Month's Spending",
        value: monthlySpendingVal,
        change: '',
        up: true,
      },
      {
        label: 'Total Income',
        value: totalIncome,
        change: '',
        up: true,
      },
      {
        label: 'Budget Remaining',
        value: budgetRemaining,
        change: '',
        up: true,
        subtext: `of ₹${user.monthlyBudget.toLocaleString()} limit`,
      },
    ];

    // 6. Get latest 5 transactions (Incomes and Expenses merged)
    const expenses = await Transaction.find({ user: userId }).sort({ date: -1 }).limit(5);
    const incomes = await Income.find({ user: userId }).sort({ date: -1 }).limit(5);

    const expenseList = expenses.map((t) => ({
      _id: t._id,
      name: t.name,
      amount: t.amount,
      category: t.category,
      date: t.date,
      type: 'expense',
    }));

    const incomeList = incomes.map((t) => ({
      _id: t._id,
      name: t.notes || t.source,
      amount: t.amount,
      category: t.source,
      date: t.date,
      type: 'income',
    }));

    const latestTransactions = [...expenseList, ...incomeList]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // 7. Get spending overview for current month (grouped by day)
    const monthlySpendingGroup = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          amount: { $lt: 0 },
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: '$date' },
          amount: { $sum: { $abs: '$amount' } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Map to array of days up to current day
    const now = new Date();
    const currentDay = now.getDate();
    const monthlySpendingChart = [];
    const spendingMap = new Map(monthlySpendingGroup.map((d) => [d._id, d.amount]));

    for (let day = 1; day <= currentDay; day++) {
      monthlySpendingChart.push({
        day: String(day),
        amount: spendingMap.get(day) || 0,
      });
    }

    if (monthlySpendingChart.length < 7) {
      for (let day = monthlySpendingChart.length + 1; day <= 7; day++) {
        monthlySpendingChart.push({
          day: String(day),
          amount: 0,
        });
      }
    }

    // 8. Get category breakdown for all-time expenses
    const categoryGroup = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          amount: { $lt: 0 },
        },
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: { $abs: '$amount' } },
        },
      },
    ]);

    const categoryBreakdown = categoryGroup.map((cg) => ({
      category: cg._id,
      amount: cg.amount,
      color: categoryColors[cg._id] || '#7d9c8a',
    }));

    const standardCategories = ['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Health'];
    standardCategories.forEach((cat) => {
      if (!categoryBreakdown.some((cb) => cb.category === cat)) {
        categoryBreakdown.push({
          category: cat,
          amount: 0,
          color: categoryColors[cat],
        });
      }
    });

    res.json({
      success: true,
      message: 'Summary loaded successfully',
      data: {
        metrics,
        budgetUsedPercent,
        latestTransactions,
        monthlySpending: monthlySpendingChart,
        categoryBreakdown: categoryBreakdown.sort((a, b) => b.amount - a.amount),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics metrics and trends
// @route   GET /api/dashboard/analytics
// @access  Private
export const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Get category breakdown (all-time expenses)
    const categoryGroup = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          amount: { $lt: 0 },
        },
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: { $abs: '$amount' } },
        },
      },
    ]);

    const categoryBreakdown = categoryGroup.map((cg) => ({
      category: cg._id,
      amount: cg.amount,
      color: categoryColors[cg._id] || '#7d9c8a',
    }));

    const standardCategories = ['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Health'];
    standardCategories.forEach((cat) => {
      if (!categoryBreakdown.some((cb) => cb.category === cat)) {
        categoryBreakdown.push({
          category: cat,
          amount: 0,
          color: categoryColors[cat],
        });
      }
    });

    // 2. Income vs Expense & Net Savings Trend (last 6 months)
    const sixMonthTrend = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const targetMonthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = targetMonthDate.getFullYear();
      const month = targetMonthDate.getMonth();
      const monthLabel = monthNames[month];

      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

      // Aggregate Expenses
      const statsExpense = await Transaction.aggregate([
        {
          $match: {
            user: userId,
            amount: { $lt: 0 },
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $abs: '$amount' } },
          },
        },
      ]);
      const monthlyExpense = statsExpense.length > 0 ? statsExpense[0].total : 0;

      // Aggregate Incomes
      const statsIncome = await Income.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);
      const monthlyIncome = statsIncome.length > 0 ? statsIncome[0].total : 0;

      sixMonthTrend.push({
        month: monthLabel,
        income: monthlyIncome,
        expense: monthlyExpense,
        savings: monthlyIncome - monthlyExpense, // Net Savings
      });
    }

    // 3. Daily spend heatmap for the last 35 days (ending today)
    const dailyHeatmap = [];
    for (let i = 34; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const spend = await Transaction.aggregate([
        {
          $match: {
            user: userId,
            amount: { $lt: 0 },
            date: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $abs: '$amount' } },
          },
        },
      ]);

      dailyHeatmap.push(spend.length > 0 ? spend[0].total : 0);
    }

    res.json({
      success: true,
      message: 'Analytics loaded successfully',
      data: {
        categoryBreakdown: categoryBreakdown.sort((a, b) => b.amount - a.amount),
        sixMonthTrend,
        dailyHeatmap,
      },
    });
  } catch (error) {
    next(error);
  }
};
