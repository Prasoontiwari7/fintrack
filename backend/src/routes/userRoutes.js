import express from 'express';
import { body } from 'express-validator';
import { 
  getProfile, 
  updateProfile, 
  uploadProfileImage, 
  deleteProfileImage 
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/profile')
  .get(getProfile)
  .put(
    validate([
      body('name').optional().notEmpty().withMessage('Name cannot be empty').trim(),
      body('monthlyBudget')
        .optional()
        .isNumeric()
        .withMessage('Monthly budget must be a number')
        .custom((val) => val >= 0)
        .withMessage('Budget must be positive or zero'),
    ]),
    updateProfile
  );

router.post('/upload-profile', upload.single('profileImage'), uploadProfileImage);
router.delete('/profile-image', deleteProfileImage);

export default router;
