import express from 'express';
import {
  signup,
  login,
  getProfile,
  updateSettings,
  getCustomTags,
  addCustomTag,
  deleteCustomTag,
  exportUserData,
  updateReminders,
  getReminders,
  setPin,
  verifyPin,
  disablePin,
  getPinStatus,
  forgotPassword,
  resetPassword,
  changePassword
} from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.get('/profile', protect, getProfile);
router.put('/settings', protect, updateSettings);
router.get('/tags', protect, getCustomTags);
router.post('/tags', protect, addCustomTag);
router.delete('/tags/:tag', protect, deleteCustomTag);
router.get('/export', protect, exportUserData);

// Reminders
router.get('/reminders', protect, getReminders);
router.put('/reminders', protect, updateReminders);

// PIN lock
router.get('/pin/status', protect, getPinStatus);
router.post('/pin', protect, setPin);
router.post('/pin/verify', protect, verifyPin);
router.delete('/pin', protect, disablePin);

// Password reset
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, resetPassword);
router.post('/change-password', protect, changePassword);

export default router;
