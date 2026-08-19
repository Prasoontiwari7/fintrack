import express from 'express';
import { body } from 'express-validator';
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTransactions)
  .post(
    validate([
      body('name').notEmpty().withMessage('Transaction name is required').trim(),
      body('amount')
        .isNumeric()
        .withMessage('Amount must be a number')
        .notEmpty()
        .withMessage('Amount is required'),
      body('category')
        .isIn(['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Health', 'Income'])
        .withMessage('Invalid category'),
      body('date').optional().isISO8601().withMessage('Invalid date format'),
    ]),
    createTransaction
  );

router.route('/:id').delete(deleteTransaction);

export default router;
