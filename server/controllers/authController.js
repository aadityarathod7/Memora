import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { scheduleUserReminder, removeUserReminder } from '../services/reminderScheduler.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
        streak: user.streak,
        customTags: user.customTags
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user settings
// @route   PUT /api/auth/settings
export const updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { theme, darkMode, font } = req.body;

    if (theme !== undefined) user.settings.theme = theme;
    if (darkMode !== undefined) user.settings.darkMode = darkMode;
    if (font !== undefined) user.settings.font = font;

    await user.save();

    res.json({ settings: user.settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's custom tags
// @route   GET /api/auth/tags
export const getCustomTags = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ customTags: user.customTags });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add custom tag
// @route   POST /api/auth/tags
export const addCustomTag = async (req, res) => {
  try {
    const { tag } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.customTags.includes(tag.toLowerCase())) {
      user.customTags.push(tag.toLowerCase());
      await user.save();
    }

    res.json({ customTags: user.customTags });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete custom tag
// @route   DELETE /api/auth/tags/:tag
export const deleteCustomTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.customTags = user.customTags.filter(t => t !== tag.toLowerCase());
    await user.save();

    res.json({ customTags: user.customTags });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export all user data (backup)
// @route   GET /api/auth/export
export const exportUserData = async (req, res) => {
  try {
    const Entry = (await import('../models/Entry.js')).default;

    const user = await User.findById(req.user._id).select('-password');
    const entries = await Entry.find({ user: req.user._id });

    res.json({
      exportDate: new Date().toISOString(),
      user: {
        name: user.name,
        email: user.email,
        settings: user.settings,
        customTags: user.customTags,
        streak: user.streak
      },
      entries: entries.map(e => ({
        title: e.title,
        content: e.content,
        mood: e.mood,
        tags: e.tags,
        isFavorite: e.isFavorite,
        wordCount: e.wordCount,
        aiResponse: e.aiResponse,
        conversation: e.conversation,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update reminder settings
// @route   PUT /api/auth/reminders
export const updateReminders = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { enabled, time, timezone, streakProtection } = req.body;

    if (enabled !== undefined) user.reminders.enabled = enabled;
    if (time !== undefined) user.reminders.time = time;
    if (timezone !== undefined) user.reminders.timezone = timezone;
    if (streakProtection !== undefined) user.reminders.streakProtection = streakProtection;

    await user.save();

    // Update the reminder scheduler
    if (user.reminders.enabled) {
      scheduleUserReminder(user);
    } else {
      removeUserReminder(user._id);
    }

    res.json({ reminders: user.reminders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reminder settings
// @route   GET /api/auth/reminders
export const getReminders = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ reminders: user.reminders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Set PIN lock
// @route   POST /api/auth/pin
export const setPin = async (req, res) => {
  try {
    const { pin, biometricEnabled } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (pin) {
      // Hash the PIN for security
      const salt = await bcrypt.genSalt(10);
      user.pinLock.pin = await bcrypt.hash(pin, salt);
      user.pinLock.enabled = true;
    }

    if (biometricEnabled !== undefined) {
      user.pinLock.biometricEnabled = biometricEnabled;
    }

    await user.save();

    res.json({
      pinLock: {
        enabled: user.pinLock.enabled,
        biometricEnabled: user.pinLock.biometricEnabled
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify PIN
// @route   POST /api/auth/pin/verify
export const verifyPin = async (req, res) => {
  try {
    const { pin } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.pinLock.enabled || !user.pinLock.pin) {
      return res.json({ verified: true });
    }

    const isMatch = await bcrypt.compare(pin, user.pinLock.pin);

    res.json({ verified: isMatch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Disable PIN lock
// @route   DELETE /api/auth/pin
export const disablePin = async (req, res) => {
  try {
    const { pin } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current PIN before disabling
    if (user.pinLock.enabled && user.pinLock.pin) {
      const isMatch = await bcrypt.compare(pin, user.pinLock.pin);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect PIN' });
      }
    }

    user.pinLock.enabled = false;
    user.pinLock.pin = '';
    user.pinLock.biometricEnabled = false;
    await user.save();

    res.json({ message: 'PIN lock disabled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get PIN lock status
// @route   GET /api/auth/pin/status
export const getPinStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      enabled: user.pinLock.enabled,
      biometricEnabled: user.pinLock.biometricEnabled
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ message: 'If an account exists, a password reset link has been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save hashed token and expiry to user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // Send email
    const resetUrl = `${process.env.APP_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    res.json({ message: 'If an account exists, a password reset link has been sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error sending password reset email' });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Hash the token from URL
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

// @desc    Change password (when logged in)
// @route   POST /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
};
