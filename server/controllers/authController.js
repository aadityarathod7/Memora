import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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
