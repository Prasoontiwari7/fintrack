import express from 'express';
import { body } from 'express-validator';
import { signup, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post(
  '/signup',
  validate([
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6 or more characters'),
  ]),
  signup
);

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  login
);

router.get('/me', protect, getMe);

export default router;
