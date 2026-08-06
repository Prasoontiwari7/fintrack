import Income from '../models/Income.js';

// @desc    Get all user income records
// @route   GET /api/income
// @access  Private
export const getIncomes = async (req, res, next) => {
  try {
    const incomes = await Income.find({ user: req.user._id }).sort({ date: -1 });

    res.json({
      success: true,
      message: 'Income records retrieved successfully',
      data: {
        incomes,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single income record
// @route   GET /api/income/:id
// @access  Private
export const getIncomeById = async (req, res, next) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, user: req.user._id });

    if (!income) {
      res.status(404);
      return next(new Error('Income record not found'));
    }

    res.json({
      success: true,
      message: 'Income record retrieved successfully',
      data: {
        income,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new income record
// @route   POST /api/income
// @access  Private
export const createIncome = async (req, res, next) => {
  try {
    const { amount, source, date, notes } = req.body;

    const absoluteAmount = Math.abs(Number(amount));
    if (absoluteAmount === 0) {
      res.status(400);
      return next(new Error('Income amount must be greater than zero'));
    }

    const income = await Income.create({
      user: req.user._id,
      amount: absoluteAmount,
      source,
      date: date || undefined,
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Income record created successfully',
      data: {
        income,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an income record
// @route   PUT /api/income/:id
// @access  Private
export const updateIncome = async (req, res, next) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, user: req.user._id });

    if (!income) {
      res.status(404);
      return next(new Error('Income record not found or unauthorized'));
    }

    const { amount, source, date, notes } = req.body;

    if (amount !== undefined) {
      const absoluteAmount = Math.abs(Number(amount));
      if (absoluteAmount === 0) {
        res.status(400);
        return next(new Error('Income amount must be greater than zero'));
      }
      income.amount = absoluteAmount;
    }

    if (source) income.source = source;
    if (date) income.date = date;
    if (notes !== undefined) income.notes = notes;

    const updatedIncome = await income.save();

    res.json({
      success: true,
      message: 'Income record updated successfully',
      data: {
        income: updatedIncome,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an income record
// @route   DELETE /api/income/:id
// @access  Private
export const deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, user: req.user._id });

    if (!income) {
      res.status(404);
      return next(new Error('Income record not found or unauthorized'));
    }

    await income.deleteOne();

    res.json({
      success: true,
      message: 'Income record deleted successfully',
      data: {
        id: req.params.id,
      },
    });
  } catch (error) {
    next(error);
  }
};
