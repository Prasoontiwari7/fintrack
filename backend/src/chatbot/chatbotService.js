import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Income from '../models/Income.js';

// Supported Expense Categories
const VALID_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Utilities',
  'Entertainment',
  'Health',
];

// Supported Income Sources
const VALID_INCOME_SOURCES = [
  'Salary',
  'Freelancing',
  'Business',
  'Gift',
  'Interest',
  'Other',
];

// Helper to sanitize incoming phone strings (e.g. "whatsapp:+1234567890" -> "+1234567890")
export const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/^whatsapp:/i, '').trim();
};

/**
 * Finds or links user by incoming phone number or session
 */
export const resolveUserByPhone = async (rawPhone) => {
  const phone = cleanPhoneNumber(rawPhone);
  if (!phone) return null;

  // 1. Direct match on phoneNumber
  let user = await User.findOne({ phoneNumber: phone });
  if (user) return user;

  // 2. Loose match (last 10 digits for mobile numbers with/without country code)
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length >= 10) {
    const last10 = digitsOnly.slice(-10);
    user = await User.findOne({
      phoneNumber: { $regex: new RegExp(last10 + '$') },
    });
    if (user) return user;
  }

  return null;
};

/**
 * Get quick dashboard summary stats for a user
 */
export const getUserDashboardSummary = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Total all-time income
  const incomeAgg = await Income.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalIncome = incomeAgg.length > 0 ? incomeAgg[0].total : 0;

  // Total all-time expense
  const expenseAgg = await Transaction.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } },
  ]);
  const totalExpense = expenseAgg.length > 0 ? expenseAgg[0].total : 0;

  const currentBalance = totalIncome - totalExpense;

  // Monthly spending
  const monthlyExpenseAgg = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        amount: { $lt: 0 },
        date: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } },
  ]);
  const monthlySpending = monthlyExpenseAgg.length > 0 ? monthlyExpenseAgg[0].total : 0;
  const budget = user.monthlyBudget || 0;
  const budgetRemaining = Math.max(0, budget - monthlySpending);
  const budgetPercentUsed = budget > 0 ? Math.round((monthlySpending / budget) * 100) : 0;

  return {
    userName: user.name,
    currentBalance,
    totalIncome,
    totalExpense,
    monthlySpending,
    budget,
    budgetRemaining,
    budgetPercentUsed,
  };
};

/**
 * Log an expense transaction to the user's dashboard
 */
export const logExpense = async (userId, amount, category, name) => {
  const absAmount = Math.abs(Number(amount));
  if (!absAmount || isNaN(absAmount)) {
    throw new Error('Please specify a valid numeric expense amount.');
  }

  // Find best match for category or default to 'Shopping'
  const matchedCategory =
    VALID_CATEGORIES.find((c) => c.toLowerCase() === (category || '').toLowerCase()) ||
    'Shopping';

  const transaction = await Transaction.create({
    user: userId,
    name: name || `${matchedCategory} Expense`,
    amount: -absAmount,
    category: matchedCategory,
    date: new Date(),
  });

  return transaction;
};

/**
 * Log an income record to the user's dashboard
 */
export const logIncome = async (userId, amount, source, notes) => {
  const absAmount = Math.abs(Number(amount));
  if (!absAmount || isNaN(absAmount)) {
    throw new Error('Please specify a valid numeric income amount.');
  }

  // Find best match for source or default to 'Other'
  const matchedSource =
    VALID_INCOME_SOURCES.find((s) => s.toLowerCase() === (source || '').toLowerCase()) ||
    'Other';

  const income = await Income.create({
    user: userId,
    amount: absAmount,
    source: matchedSource,
    notes: notes || `${matchedSource} Income`,
    date: new Date(),
  });

  return income;
};

/**
 * Get recent transactions and incomes
 */
export const getRecentTransactions = async (userId, limit = 5) => {
  const expenses = await Transaction.find({ user: userId }).sort({ date: -1 }).limit(limit);
  const incomes = await Income.find({ user: userId }).sort({ date: -1 }).limit(limit);

  const formattedExpenses = expenses.map((e) => ({
    type: 'Expense',
    name: e.name,
    category: e.category,
    amount: Math.abs(e.amount),
    date: e.date,
  }));

  const formattedIncomes = incomes.map((i) => ({
    type: 'Income',
    name: i.notes || i.source,
    category: i.source,
    amount: i.amount,
    date: i.date,
  }));

  return [...formattedExpenses, ...formattedIncomes]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
};

/**
 * Calls Python FastAPI MuRIL Model Service for transaction classification
 */
export const classifyWithMuRIL = async (text) => {
  const modelApiUrl = (process.env.MODEL_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
  const modelApiKey = (process.env.MODEL_API_KEY || '').trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const headers = {
      'Content-Type': 'application/json',
    };
    if (modelApiKey) {
      headers['X-API-Key'] = modelApiKey;
    }

    const response = await fetch(`${modelApiUrl}/predict`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message: text }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.text();
      console.warn(`[MuRIL Client] API returned status ${response.status}: ${errBody}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn(`[MuRIL Client] Failed to contact Model API at ${modelApiUrl}: ${error.message}`);
    return null;
  }
};

/**
 * Main parser and command router for incoming messages
 */
export const processIncomingMessage = async ({ text, fromPhone, authenticatedUserId }) => {
  const rawText = (text || '').trim();
  const lower = rawText.toLowerCase();

  // 1. Resolve user
  let user = null;
  if (authenticatedUserId) {
    user = await User.findById(authenticatedUserId);
  } else if (fromPhone) {
    user = await resolveUserByPhone(fromPhone);
  }

  // Account Linking Command: "link user@example.com" or "connect user@example.com"
  if (lower.startsWith('link ') || lower.startsWith('connect ')) {
    const parts = rawText.split(/\s+/);
    const email = (parts[1] || '').trim().toLowerCase();

    if (!email) {
      return 'Please provide your registered FinTrack email.\nExample: link yourname@example.com';
    }

    const candidateUser = await User.findOne({ email });
    if (!candidateUser) {
      return `No FinTrack account found with email "${email}". Please verify your email or register on the dashboard.`;
    }

    if (fromPhone) {
      candidateUser.phoneNumber = cleanPhoneNumber(fromPhone);
      await candidateUser.save();
    }

    return `FinTrack Account Linked!\nWelcome, ${candidateUser.name}! Your phone is now connected to your FinTrack dashboard. Type "balance" or "help" to get started.`;
  }

  // If user is not yet linked, allow fallback to first user for demo convenience if solitary user exists
  if (!user) {
    const totalUsers = await User.countDocuments();
    if (totalUsers === 1) {
      user = await User.findOne();
      if (fromPhone && user && !user.phoneNumber) {
        user.phoneNumber = cleanPhoneNumber(fromPhone);
        await user.save();
      }
    }
  }

  if (!user) {
    return (
      `FinTrack Assistant\n\n` +
      `Your phone number (${cleanPhoneNumber(fromPhone) || 'Unknown'}) is not yet linked to a FinTrack account.\n\n` +
      `To link your account, reply:\n` +
      `link <your-fintrack-email>\n\n` +
      `Example: link john@example.com`
    );
  }

  // 2. Help command
  if (lower === 'help' || lower === 'commands' || lower === 'start' || lower === 'hi' || lower === 'hello') {
    return (
      `FinTrack Assistant Menu (Hi, ${user.name}!)\n\n` +
      `Here is what you can do:\n\n` +
      `1. Check Dashboard:\n` +
      `   Reply "balance" or "status"\n\n` +
      `2. Log Expense:\n` +
      `   "spend <amount> on <category> [note]"\n` +
      `   Example: spend 250 on Food lunch with team\n` +
      `   Categories: Food, Transport, Shopping, Utilities, Entertainment, Health\n\n` +
      `3. Log Income:\n` +
      `   "income <amount> <source> [note]"\n` +
      `   Example: income 50000 Salary monthly paycheck\n` +
      `   Sources: Salary, Freelancing, Business, Gift, Interest, Other\n\n` +
      `4. Recent Transactions:\n` +
      `   Reply "recent" or "history"\n\n` +
      `5. Budget Status:\n` +
      `   Reply "budget"`
    );
  }

  // 3. Balance / Status Command
  if (lower === 'balance' || lower === 'status' || lower === 'dashboard') {
    const summary = await getUserDashboardSummary(user._id);
    return (
      `FinTrack Dashboard Summary\n\n` +
      `Current Balance: ₹${summary.currentBalance.toLocaleString('en-IN')}\n` +
      `Total Income: ₹${summary.totalIncome.toLocaleString('en-IN')}\n` +
      `Total Expense: ₹${summary.totalExpense.toLocaleString('en-IN')}\n\n` +
      `This Month's Spending: ₹${summary.monthlySpending.toLocaleString('en-IN')}\n` +
      `Monthly Budget: ₹${summary.budget.toLocaleString('en-IN')}\n` +
      `Remaining Budget: ₹${summary.budgetRemaining.toLocaleString('en-IN')} (${summary.budgetPercentUsed}% used)`
    );
  }

  // 4. Budget Command
  if (lower === 'budget') {
    const summary = await getUserDashboardSummary(user._id);
    return (
      `Monthly Budget Overview\n\n` +
      `Budget: ₹${summary.budget.toLocaleString('en-IN')}\n` +
      `Spent This Month: ₹${summary.monthlySpending.toLocaleString('en-IN')}\n` +
      `Remaining: ₹${summary.budgetRemaining.toLocaleString('en-IN')}\n` +
      `Status: ${summary.budgetPercentUsed}% used${summary.budgetPercentUsed > 80 ? ' ⚠️ (High spending!)' : ' (On track)'}`
    );
  }

  // 5. Recent Transactions Command
  if (lower === 'recent' || lower === 'history' || lower === 'transactions') {
    const recent = await getRecentTransactions(user._id, 5);
    if (!recent.length) {
      return 'No transactions recorded yet in your FinTrack dashboard.';
    }

    const items = recent.map((item, index) => {
      const sign = item.type === 'Income' ? '+' : '-';
      const dateStr = new Date(item.date).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });
      return `${index + 1}. [${dateStr}] ${item.name} (${item.category}): ${sign}₹${item.amount.toLocaleString('en-IN')}`;
    });

    return `Recent Transactions:\n\n${items.join('\n')}\n\nType "balance" for total summary.`;
  }

  // 6. AI MuRIL Model Transaction Classification & Database Logging
  const modelResult = await classifyWithMuRIL(rawText);

  if (modelResult) {
    console.log(`[MuRIL Classified] Type: ${modelResult.type}, Category: ${modelResult.category} (${modelResult.mapped_category}), Amount: ${modelResult.amount}, Conf: ${modelResult.confidence}`);

    if (modelResult.ready_to_save && modelResult.amount > 0) {
      const amount = modelResult.amount;
      const isIncome = modelResult.type === 'Income';
      const mappedCategory = modelResult.mapped_category;
      const originalCategory = modelResult.category;
      const sourceLabel = modelResult.source === 'muril' ? 'MuRIL Neural AI' : 'Hybrid Rule';
      const confPercent = Math.round(modelResult.confidence * 100);

      if (isIncome) {
        // Save to Income collection in MongoDB
        const createdIncome = await logIncome(user._id, amount, mappedCategory, rawText);
        const summary = await getUserDashboardSummary(user._id);

        return (
          `✅ Income Logged to Dashboard!\n\n` +
          `• Amount: +₹${amount.toLocaleString('en-IN')}\n` +
          `• Source: ${createdIncome.source} (${sourceLabel}: ${originalCategory}, ${confPercent}%)\n` +
          `• Note: "${rawText}"\n\n` +
          `💰 Updated Balance: ₹${summary.currentBalance.toLocaleString('en-IN')}`
        );
      } else {
        // Save to Transaction collection in MongoDB
        const createdTx = await logExpense(user._id, amount, mappedCategory, rawText);
        const summary = await getUserDashboardSummary(user._id);

        return (
          `✅ Expense Logged to Dashboard!\n\n` +
          `• Amount: -₹${amount.toLocaleString('en-IN')}\n` +
          `• Category: ${createdTx.category} (${sourceLabel}: ${originalCategory}, ${confPercent}%)\n` +
          `• Note: "${rawText}"\n\n` +
          `💰 Updated Balance: ₹${summary.currentBalance.toLocaleString('en-IN')}\n` +
          `📊 Remaining Budget: ₹${summary.budgetRemaining.toLocaleString('en-IN')} (${summary.budgetPercentUsed}% used)`
        );
      }
    }

    // Handled by model but missing amount or low confidence
    if (!modelResult.amount) {
      return (
        `FinTrack AI Assistant\n\n` +
        `I recognized this as a ${modelResult.category} (${modelResult.type}), but couldn't detect the amount.\n\n` +
        `Please specify the amount in your message, for example:\n` +
        `"₹250 for ${modelResult.category.toLowerCase()}"`
      );
    }
  }

  // Fallback 7. Regex rule parser if Model API is offline
  const expenseRegex = /^(?:spend|spent|expense|add expense|paid|pay|bought)?\s*(\d+(?:\.\d+)?)\s*(?:on|for\s+)?([a-zA-Z]+)?\s*(.*)$/i;
  const expenseMatch = rawText.match(expenseRegex);

  if (!lower.startsWith('income') && !lower.startsWith('salary') && !lower.startsWith('earned') && expenseMatch && expenseMatch[1]) {
    const amount = parseFloat(expenseMatch[1]);
    const candidateCategory = expenseMatch[2] || 'Shopping';
    const note = (expenseMatch[3] || '').trim();

    const matchedCategory =
      VALID_CATEGORIES.find(
        (c) => c.toLowerCase() === candidateCategory.toLowerCase()
      ) || 'Shopping';

    const txName = note ? note : `${matchedCategory} purchase`;
    const createdTx = await logExpense(user._id, amount, matchedCategory, txName);
    const summary = await getUserDashboardSummary(user._id);

    return (
      `Expense Logged Successfully!\n\n` +
      `Amount: -₹${amount.toLocaleString('en-IN')}\n` +
      `Category: ${createdTx.category}\n` +
      `Description: ${createdTx.name}\n\n` +
      `Updated Balance: ₹${summary.currentBalance.toLocaleString('en-IN')}\n` +
      `Remaining Budget: ₹${summary.budgetRemaining.toLocaleString('en-IN')}`
    );
  }

  const incomeRegex = /^(?:income|earned|add income|received)\s*(\d+(?:\.\d+)?)\s*(?:from\s+)?([a-zA-Z]+)?\s*(.*)$/i;
  const incomeMatch = rawText.match(incomeRegex);

  if (incomeMatch && incomeMatch[1]) {
    const amount = parseFloat(incomeMatch[1]);
    const candidateSource = incomeMatch[2] || 'Other';
    const note = (incomeMatch[3] || '').trim();

    const matchedSource =
      VALID_INCOME_SOURCES.find(
        (s) => s.toLowerCase() === candidateSource.toLowerCase()
      ) || 'Other';

    const incName = note ? note : `${matchedSource} Income`;
    const createdIncome = await logIncome(user._id, amount, matchedSource, incName);
    const summary = await getUserDashboardSummary(user._id);

    return (
      `Income Logged Successfully!\n\n` +
      `Amount: +₹${amount.toLocaleString('en-IN')}\n` +
      `Source: ${createdIncome.source}\n` +
      `Notes: ${createdIncome.notes}\n\n` +
      `Updated Balance: ₹${summary.currentBalance.toLocaleString('en-IN')}`
    );
  }

  // Unrecognized command fallback
  return (
    `I didn't quite catch that. Here are some quick examples you can try:\n\n` +
    `• "balance" - View current balance & budget\n` +
    `• "yaar 250 ka pizza mangaya" - AI auto-classifies & logs expense\n` +
    `• "amazon se 1800 ke shoes liye" - AI auto-classifies & logs shopping\n` +
    `• "aaj salary 45000 aa gayi" - AI auto-classifies & logs salary\n` +
    `• "recent" - Show latest transactions\n` +
    `• "help" - List all commands`
  );
};
