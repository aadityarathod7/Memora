import express from 'express';
import {
  signup,
  login,
  getProfile,
  updateSettings,
  getCustomTags,
  addCustomTag,
  deleteCustomTag,
  exportUserData
} from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/settings', protect, updateSettings);
router.get('/tags', protect, getCustomTags);
router.post('/tags', protect, addCustomTag);
router.delete('/tags/:tag', protect, deleteCustomTag);
router.get('/export', protect, exportUserData);

export default router;
