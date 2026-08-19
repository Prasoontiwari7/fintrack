import express from 'express';
import { getSummary, getAnalytics } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/analytics', getAnalytics);

export default router;
