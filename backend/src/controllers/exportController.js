import Transaction from '../models/Transaction.js';
import Income from '../models/Income.js';
import { generatePDF } from '../services/pdfService.js';
import { generateExcel } from '../services/excelService.js';
import { sendReportEmail } from '../services/emailService.js';

// Helper to resolve string date filters to database query bounds
const resolveFilterDates = (filter, startDate, endDate) => {
  const start = new Date();
  const end = new Date();

  // Reset boundary times to start/end of day
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  let label = 'Custom Period';

  switch (filter) {
    case 'today':
      label = 'Today';
      break;
    case 'week':
      // Get Sunday of the current week as start
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      label = 'This Week';
      break;
    case 'month':
      start.setDate(1);
      label = 'This Month';
      break;
    case 'lastMonth':
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      end.setMonth(end.getMonth() - 1);
      end.setDate(new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate());
      label = 'Last Month';
      break;
    case 'year':
      start.setMonth(0, 1);
      label = 'This Year';
      break;
    case 'custom':
      if (startDate) {
        const customStart = new Date(startDate);
        if (!isNaN(customStart)) {
          start.setTime(customStart.getTime());
          start.setHours(0, 0, 0, 0);
        }
      }
      if (endDate) {
        const customEnd = new Date(endDate);
        if (!isNaN(customEnd)) {
          end.setTime(customEnd.getTime());
          end.setHours(23, 59, 59, 999);
        }
      }
      label = `${start.toLocaleDateString('en-IN')} - ${end.toLocaleDateString('en-IN')}`;
      break;
    default:
      start.setTime(0); // All time
      label = 'All Time';
      break;
  }

  // If filtering for all time, we omit date bounds on the query
  const queryRange = filter === 'all' ? {} : { date: { $gte: start, $lte: end } };
  return { range: queryRange, label };
};

// Helper to fetch, merge, and summarize data
const getExportData = async (userId, filter, startDate, endDate) => {
  const { range, label } = resolveFilterDates(filter, startDate, endDate);
  
  const query = { user: userId, ...range };

  const [expenses, incomes] = await Promise.all([
    Transaction.find(query),
    Income.find(query),
  ]);

  const expenseList = expenses.map((t) => ({
    date: t.date,
    type: 'expense',
    category: t.category,
    name: t.name,
    amount: Math.abs(t.amount),
  }));

  const incomeList = incomes.map((t) => ({
    date: t.date,
    type: 'income',
    category: t.source,
    name: t.notes || t.source,
    amount: t.amount,
  }));

  const transactions = [...expenseList, ...incomeList].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const totalIncome = incomeList.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseList.reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  return {
    transactions,
    summary: { totalIncome, totalExpense, netBalance },
    label,
  };
};

// @desc    Download transactions as PDF
// @route   POST /api/export/pdf
// @access  Private
export const exportPDF = async (req, res, next) => {
  try {
    const { filter, startDate, endDate } = req.body;
    const { transactions, summary, label } = await getExportData(
      req.user._id,
      filter,
      startDate,
      endDate
    );

    const buffer = await generatePDF(req.user, transactions, summary, label);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=FinTrack_Report.pdf');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// @desc    Download transactions as Excel
// @route   POST /api/export/excel
// @access  Private
export const exportExcel = async (req, res, next) => {
  try {
    const { filter, startDate, endDate } = req.body;
    const { transactions, summary, label } = await getExportData(
      req.user._id,
      filter,
      startDate,
      endDate
    );

    const buffer = await generateExcel(req.user, transactions, summary, label);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=FinTrack_Report.xlsx');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// @desc    Email transaction report to user
// @route   POST /api/export/email
// @access  Private
export const exportEmail = async (req, res, next) => {
  try {
    const { format, email, filter, startDate, endDate } = req.body;

    if (!format || !['pdf', 'excel'].includes(format.toLowerCase())) {
      res.status(400);
      return next(new Error("Format must be either 'pdf' or 'excel'"));
    }

    const recipientEmail = email || req.user.email;
    const { transactions, summary, label } = await getExportData(
      req.user._id,
      filter,
      startDate,
      endDate
    );

    let buffer;
    if (format.toLowerCase() === 'pdf') {
      buffer = await generatePDF(req.user, transactions, summary, label);
    } else {
      buffer = await generateExcel(req.user, transactions, summary, label);
    }

    if (!buffer || buffer.length === 0) {
      res.status(500);
      return next(new Error(`Failed to generate ${format.toUpperCase()} report attachment`));
    }

    await sendReportEmail(
      recipientEmail,
      req.user.name,
      buffer,
      format.toLowerCase(),
      label,
      summary
    );

    res.json({
      success: true,
      message: `Transaction report successfully emailed to ${recipientEmail}`,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
