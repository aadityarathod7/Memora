import Goal from '../models/Goal.js';
import Entry from '../models/Entry.js';

// @desc    Get all goals for user
// @route   GET /api/goals
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Update completion status for all goals
    for (let goal of goals) {
      goal.checkCompletion();
      await goal.save();
    }

    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new goal
// @route   POST /api/goals
export const createGoal = async (req, res) => {
  try {
    const { type, title, description, target, unit, endDate } = req.body;

    // Calculate end date if not provided
    let calculatedEndDate = endDate;
    if (!endDate) {
      const now = new Date();
      switch (type) {
        case 'daily_word_count':
          calculatedEndDate = new Date(now.setDate(now.getDate() + 1));
          break;
        case 'weekly_entries':
          calculatedEndDate = new Date(now.setDate(now.getDate() + 7));
          break;
        case 'monthly_entries':
          calculatedEndDate = new Date(now.setMonth(now.getMonth() + 1));
          break;
        case '30_day_challenge':
          calculatedEndDate = new Date(now.setDate(now.getDate() + 30));
          break;
        default:
          calculatedEndDate = new Date(now.setMonth(now.getMonth() + 1));
      }
    }

    const goal = await Goal.create({
      user: req.user._id,
      type,
      title,
      description,
      target,
      unit: unit || 'entries',
      endDate: calculatedEndDate
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update goal progress
// @route   PUT /api/goals/:id/progress
export const updateGoalProgress = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { increment, date } = req.body;

    if (increment) {
      goal.current += increment;
    }

    // For 30-day challenge, track dates
    if (goal.type === '30_day_challenge' && date) {
      const dateObj = new Date(date);
      const dateExists = goal.progressDates.some(d =>
        d.toDateString() === dateObj.toDateString()
      );

      if (!dateExists) {
        goal.progressDates.push(dateObj);
        goal.current = goal.progressDates.length;
      }
    }

    goal.checkCompletion();
    await goal.save();

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await goal.deleteOne();
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get goal statistics
// @route   GET /api/goals/stats
export const getGoalStats = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id });

    const stats = {
      total: goals.length,
      active: goals.filter(g => g.isActive).length,
      completed: goals.filter(g => g.isCompleted).length,
      failed: goals.filter(g => !g.isActive && !g.isCompleted).length,
      badges: goals.filter(g => g.badge).map(g => ({
        badge: g.badge,
        title: g.title,
        completedAt: g.completedAt
      }))
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auto-update goals based on new entry
// @route   Internal function called when entry is created
export const updateGoalsOnEntry = async (userId, entry) => {
  try {
    const goals = await Goal.find({
      user: userId,
      isActive: true
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let goal of goals) {
      let updated = false;

      switch (goal.type) {
        case 'daily_word_count':
          // Check if entry is from today
          const entryDate = new Date(entry.createdAt);
          entryDate.setHours(0, 0, 0, 0);

          if (entryDate.getTime() === today.getTime()) {
            goal.current += entry.wordCount || 0;
            updated = true;
          }
          break;

        case 'weekly_entries':
        case 'monthly_entries':
          goal.current += 1;
          updated = true;
          break;

        case '30_day_challenge':
          const dateExists = goal.progressDates.some(d =>
            d.toDateString() === today.toDateString()
          );

          if (!dateExists) {
            goal.progressDates.push(today);
            goal.current = goal.progressDates.length;
            updated = true;
          }
          break;
      }

      if (updated) {
        goal.checkCompletion();
        await goal.save();
      }
    }
  } catch (error) {
    console.error('Error updating goals:', error);
  }
};
