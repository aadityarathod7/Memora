import cron from 'node-cron';
import User from '../models/User.js';
import Entry from '../models/Entry.js';
import { sendReminderEmail, sendStreakProtectionEmail } from './emailService.js';

// Store active cron jobs
const activeCronJobs = new Map();

// Check if user has written today
const hasWrittenToday = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const entry = await Entry.findOne({
    user: userId,
    createdAt: { $gte: today }
  });

  return !!entry;
};

// Send reminder to a specific user
const sendUserReminder = async (user) => {
  try {
    // Check if user has already written today
    const writtenToday = await hasWrittenToday(user._id);

    if (writtenToday) {
      console.log(`User ${user.email} has already written today, skipping reminder`);
      return;
    }

    // Check if we should send streak protection
    if (user.reminders.streakProtection && user.streak?.current > 0) {
      await sendStreakProtectionEmail(user.email, user.name, user.streak.current);
    } else {
      await sendReminderEmail(user.email, user.name);
    }

    // Update last notified time
    user.reminders.lastNotified = new Date();
    await user.save();
  } catch (error) {
    console.error(`Error sending reminder to ${user.email}:`, error);
  }
};

// Schedule reminder for a specific user
export const scheduleUserReminder = (user) => {
  // If reminder already scheduled, remove it first
  if (activeCronJobs.has(user._id.toString())) {
    activeCronJobs.get(user._id.toString()).stop();
    activeCronJobs.delete(user._id.toString());
  }

  if (!user.reminders.enabled) {
    return;
  }

  // Parse user's reminder time (format: "HH:MM")
  const [hours, minutes] = user.reminders.time.split(':');

  // Create cron expression: "MM HH * * *" (every day at HH:MM)
  const cronExpression = `${minutes} ${hours} * * *`;

  console.log(`Scheduling reminder for ${user.email} at ${user.reminders.time} (cron: ${cronExpression})`);

  // Create and start the cron job
  const job = cron.schedule(cronExpression, async () => {
    console.log(`Running scheduled reminder for ${user.email}`);
    await sendUserReminder(user);
  }, {
    timezone: user.reminders.timezone || 'UTC'
  });

  activeCronJobs.set(user._id.toString(), job);
};

// Remove scheduled reminder for a user
export const removeUserReminder = (userId) => {
  const userIdStr = userId.toString();
  if (activeCronJobs.has(userIdStr)) {
    activeCronJobs.get(userIdStr).stop();
    activeCronJobs.delete(userIdStr);
    console.log(`Removed reminder for user ${userIdStr}`);
  }
};

// Initialize all reminders on server start
export const initializeReminders = async () => {
  try {
    console.log('Initializing reminder scheduler...');

    // Find all users with reminders enabled
    const users = await User.find({ 'reminders.enabled': true });

    console.log(`Found ${users.length} users with reminders enabled`);

    // Schedule reminders for each user
    users.forEach(user => {
      scheduleUserReminder(user);
    });

    console.log('Reminder scheduler initialized successfully');
  } catch (error) {
    console.error('Error initializing reminders:', error);
  }
};

// Send immediate test reminder (for testing purposes)
export const sendTestReminder = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await sendUserReminder(user);
    return true;
  } catch (error) {
    console.error('Error sending test reminder:', error);
    throw error;
  }
};

export default {
  scheduleUserReminder,
  removeUserReminder,
  initializeReminders,
  sendTestReminder
};
