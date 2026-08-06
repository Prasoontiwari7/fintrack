import express from 'express';
import { body } from 'express-validator';
import { exportPDF, exportExcel, exportEmail } from '../controllers/exportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(protect);

router.post(
  '/pdf',
  validate([
    body('filter')
      .optional()
      .isIn(['all', 'today', 'week', 'month', 'lastMonth', 'year', 'custom'])
      .withMessage('Invalid date filter type'),
    body('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    body('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  ]),
  exportPDF
);

router.post(
  '/excel',
  validate([
    body('filter')
      .optional()
      .isIn(['all', 'today', 'week', 'month', 'lastMonth', 'year', 'custom'])
      .withMessage('Invalid date filter type'),
    body('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    body('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  ]),
  exportExcel
);

router.post(
  '/email',
  validate([
    body('format')
      .isIn(['pdf', 'excel'])
      .withMessage('Format must be either pdf or excel'),
    body('email').optional().isEmail().withMessage('Please specify a valid email address'),
    body('filter')
      .optional()
      .isIn(['all', 'today', 'week', 'month', 'lastMonth', 'year', 'custom'])
      .withMessage('Invalid date filter type'),
    body('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    body('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  ]),
  exportEmail
);

export default router;
