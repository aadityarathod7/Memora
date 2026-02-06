import Entry from '../models/Entry.js';
import { generateAIResponse } from '../services/aiService.js';

// @desc    Get all entries for user
// @route   GET /api/entries
export const getEntries = async (req, res) => {
  try {
    const entries = await Entry.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single entry
// @route   GET /api/entries/:id
export const getEntry = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Check ownership
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new entry
// @route   POST /api/entries
export const createEntry = async (req, res) => {
  try {
    const { title, content, mood } = req.body;

    // Get recent entries for context
    const recentEntries = await Entry.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('content mood createdAt');

    // Generate AI response
    const aiResponse = await generateAIResponse(content, mood, recentEntries, req.user.name);

    const entry = await Entry.create({
      user: req.user._id,
      title,
      content,
      mood,
      aiResponse
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update entry
// @route   PUT /api/entries/:id
export const updateEntry = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { title, content, mood } = req.body;
    entry.title = title || entry.title;
    entry.content = content || entry.content;
    entry.mood = mood || entry.mood;

    const updatedEntry = await entry.save();
    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete entry
// @route   DELETE /api/entries/:id
export const deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await entry.deleteOne();
    res.json({ message: 'Entry removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
