import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['daily_word_count', 'weekly_entries', 'monthly_entries', '30_day_challenge', 'custom'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  target: {
    type: Number, // Target number (words, entries, etc.)
    required: true
  },
  current: {
    type: Number, // Current progress
    default: 0
  },
  unit: {
    type: String, // 'words', 'entries', 'days'
    default: 'entries'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  // For 30-day challenge tracking
  progressDates: {
    type: [Date],
    default: []
  },
  // Reward/badge earned
  badge: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Method to calculate progress percentage
goalSchema.methods.getProgressPercentage = function() {
  return Math.min(Math.round((this.current / this.target) * 100), 100);
};

// Method to check if goal is completed
goalSchema.methods.checkCompletion = function() {
  if (this.current >= this.target && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
    this.isActive = false;

    // Assign badge based on goal type
    if (this.type === '30_day_challenge') {
      this.badge = '🏆 30-Day Warrior';
    } else if (this.type === 'daily_word_count') {
      this.badge = '✍️ Wordsmith';
    } else if (this.type === 'weekly_entries') {
      this.badge = '📝 Weekly Writer';
    } else if (this.type === 'monthly_entries') {
      this.badge = '🌟 Monthly Master';
    }
  }

  // Check if goal expired
  if (new Date() > this.endDate && this.isActive && !this.isCompleted) {
    this.isActive = false;
  }

  return this.isCompleted;
};

const Goal = mongoose.model('Goal', goalSchema);
export default Goal;
