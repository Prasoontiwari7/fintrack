import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a transaction name'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add a transaction amount'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: [
          'Food',
          'Transport',
          'Shopping',
          'Utilities',
          'Entertainment',
          'Health',
          'Income',
        ],
        message: '{VALUE} is not a supported category',
      },
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
