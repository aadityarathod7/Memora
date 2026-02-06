import express from 'express';
import {
  getEntries,
  getEntry,
  createEntry,
  updateEntry,
  deleteEntry
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

export default router;
