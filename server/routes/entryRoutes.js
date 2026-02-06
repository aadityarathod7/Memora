import express from 'express';
import {
  getEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  replyToEntry
} from '../controllers/entryController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getEntries)
  .post(protect, createEntry);

router.route('/:id')
  .get(protect, getEntry)
  .put(protect, updateEntry)
  .delete(protect, deleteEntry);

// Reply to conversation
router.post('/:id/reply', protect, replyToEntry);

export default router;
