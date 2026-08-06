import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please add an income amount'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    source: {
      type: String,
      required: [true, 'Please select an income source'],
      enum: {
        values: ['Salary', 'Freelancing', 'Business', 'Gift', 'Interest', 'Other'],
        message: '{VALUE} is not a supported income source',
      },
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Income = mongoose.model('Income', incomeSchema);

export default Income;
