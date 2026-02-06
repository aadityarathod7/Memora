import express from 'express';
import {
  getEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  replyToEntry,
  toggleFavorite,
  updateTags,
  searchEntries,
  getFavorites,
  getOnThisDay,
  getMoodAnalytics,
  getWritingStats,
  getWeeklySummary,
  getDailyPrompts
} from '../controllers/entryController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Special routes (must come before /:id routes)
router.get('/search', protect, searchEntries);
router.get('/favorites', protect, getFavorites);
router.get('/on-this-day', protect, getOnThisDay);
router.get('/analytics/mood', protect, getMoodAnalytics);
router.get('/stats', protect, getWritingStats);
router.get('/summary/weekly', protect, getWeeklySummary);
router.get('/prompts', protect, getDailyPrompts);

router.route('/')
  .get(protect, getEntries)
  .post(protect, createEntry);

router.route('/:id')
  .get(protect, getEntry)
  .put(protect, updateEntry)
  .delete(protect, deleteEntry);

// Reply to conversation
router.post('/:id/reply', protect, replyToEntry);

// Toggle favorite
router.put('/:id/favorite', protect, toggleFavorite);

// Update tags
router.put('/:id/tags', protect, updateTags);

export default router;
