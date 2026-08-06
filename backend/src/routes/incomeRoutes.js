import express from 'express';
import { body } from 'express-validator';
import {
  getIncomes,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
} from '../controllers/incomeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getIncomes)
  .post(
    validate([
      body('amount')
        .isNumeric()
        .withMessage('Amount must be a number')
        .notEmpty()
        .withMessage('Amount is required'),
      body('source')
        .isIn(['Salary', 'Freelancing', 'Business', 'Gift', 'Interest', 'Other'])
        .withMessage('Invalid income source'),
      body('date').optional().isISO8601().withMessage('Invalid date format'),
      body('notes').optional().trim(),
    ]),
    createIncome
  );

router.route('/:id')
  .get(getIncomeById)
  .put(
    validate([
      body('amount').optional().isNumeric().withMessage('Amount must be a number'),
      body('source')
        .optional()
        .isIn(['Salary', 'Freelancing', 'Business', 'Gift', 'Interest', 'Other'])
        .withMessage('Invalid income source'),
      body('date').optional().isISO8601().withMessage('Invalid date format'),
      body('notes').optional().trim(),
    ]),
    updateIncome
  )
  .delete(deleteIncome);

export default router;
