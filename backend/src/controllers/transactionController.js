import Transaction from '../models/Transaction.js';
import Income from '../models/Income.js';

// @desc    Get all user transactions (Expenses and Incomes merged)
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res, next) => {
  try {
    const expenses = await Transaction.find({ user: req.user._id });
    const incomes = await Income.find({ user: req.user._id });

    const expenseList = expenses.map((t) => ({
      _id: t._id,
      name: t.name,
      amount: t.amount, // negative
      category: t.category,
      date: t.date,
      type: 'expense',
    }));

    const incomeList = incomes.map((t) => ({
      _id: t._id,
      name: t.notes || t.source,
      amount: t.amount, // positive
      category: t.source,
      date: t.date,
      type: 'income',
    }));

    const merged = [...expenseList, ...incomeList].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: {
        transactions: merged,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res, next) => {
  try {
    const { name, amount, category, date } = req.body;

    // Ensure amount matches the category's expected sign:
    // If category is 'Income', amount should be positive.
    // If category is anything else, amount should be negative.
    let absoluteAmount = Math.abs(Number(amount));
    if (absoluteAmount === 0) {
      res.status(400);
      return next(new Error('Transaction amount cannot be zero'));
    }

    const finalAmount = category === 'Income' ? absoluteAmount : -absoluteAmount;

    const transaction = await Transaction.create({
      user: req.user._id,
      name,
      amount: finalAmount,
      category,
      date: date || undefined, // use default Date.now if not provided
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: {
        transaction,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      res.status(404);
      return next(new Error('Transaction not found or unauthorized'));
    }

    await transaction.deleteOne();

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
      data: {
        id: req.params.id,
      },
    });
  } catch (error) {
    next(error);
  }
};
