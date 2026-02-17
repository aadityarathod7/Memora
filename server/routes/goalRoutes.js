import express from 'express';
import {
  getGoals,
  createGoal,
  updateGoalProgress,
  deleteGoal,
  getGoalStats
} from '../controllers/goalController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Goal routes
router.get('/stats', protect, getGoalStats);
router.route('/')
  .get(protect, getGoals)
  .post(protect, createGoal);

router.route('/:id')
  .delete(protect, deleteGoal);

router.put('/:id/progress', protect, updateGoalProgress);

export default router;
