import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile / settings
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    const { name, monthlyBudget } = req.body;

    if (name) user.name = name;
    if (monthlyBudget !== undefined) user.monthlyBudget = Number(monthlyBudget);

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          monthlyBudget: updatedUser.monthlyBudget,
          profileImage: updatedUser.profileImage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile image to Cloudinary
// @route   POST /api/users/upload-profile
// @access  Private
export const uploadProfileImage = async (req, res, next) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName || cloudName.trim().includes('your_cloudinary_')) {
      res.status(400);
      return next(new Error('Cloudinary is not configured. Please replace the placeholders in backend/.env with your real Cloudinary credentials.'));
    }

    if (!req.file) {
      res.status(400);
      return next(new Error('Please upload an image file'));
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    // Delete existing remote asset from Cloudinary before replacing
    if (user.profileImagePublicId) {
      try {
        await cloudinary.uploader.destroy(user.profileImagePublicId);
        console.log(`[Cloudinary] Deleted old profile image: ${user.profileImagePublicId}`);
      } catch (destroyError) {
        console.error('[Cloudinary] Warning: Failed to destroy old image asset:', destroyError.message);
      }
    }

    // Upload from buffer to Cloudinary using upload_stream inside a Promise
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'FinTrack/profile-images',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        stream.end(req.file.buffer);
      });
    };

    const uploadResult = await uploadToCloudinary();

    // Save secure URL and public ID to Mongo
    user.profileImage = uploadResult.secure_url;
    user.profileImagePublicId = uploadResult.public_id;
    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          monthlyBudget: updatedUser.monthlyBudget,
          profileImage: updatedUser.profileImage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove user profile image
// @route   DELETE /api/users/profile-image
// @access  Private
export const deleteProfileImage = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    if (!user.profileImagePublicId) {
      res.status(400);
      return next(new Error('No profile image found to delete'));
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(user.profileImagePublicId);
      console.log(`[Cloudinary] Deleted profile image: ${user.profileImagePublicId}`);
    } catch (destroyError) {
      console.error('[Cloudinary] Error destroying image asset:', destroyError.message);
      res.status(500);
      return next(new Error(`Failed to delete profile photo from Cloudinary: ${destroyError.message}`));
    }

    // Reset User properties in MongoDB
    user.profileImage = '';
    user.profileImagePublicId = '';
    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile image removed successfully',
      data: {
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          monthlyBudget: updatedUser.monthlyBudget,
          profileImage: '',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
