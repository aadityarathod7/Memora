import Entry from '../models/Entry.js';
import User from '../models/User.js';
import { generateAIResponse, generateReplyResponse } from '../services/aiService.js';

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

    const { tags, images } = req.body;

    const entry = await Entry.create({
      user: req.user._id,
      title,
      content,
      mood,
      aiResponse,
      tags: tags || [],
      images: images || []
    });

    // Update user's streak
    await updateStreak(req.user._id);

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

// @desc    Reply to AI in an entry conversation
// @route   POST /api/entries/:id/reply
export const replyToEntry = async (req, res) => {
  try {
    const { message } = req.body;
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Add user message to conversation
    entry.conversation.push({
      role: 'user',
      content: message
    });

    // Generate AI reply with conversation context
    const aiReply = await generateReplyResponse(
      entry.content,
      entry.mood,
      entry.aiResponse,
      entry.conversation,
      req.user.name
    );

    // Add AI response to conversation
    entry.conversation.push({
      role: 'assistant',
      content: aiReply
    });

    await entry.save();

    res.json({
      message: aiReply,
      conversation: entry.conversation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle favorite status
// @route   PUT /api/entries/:id/favorite
export const toggleFavorite = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    entry.isFavorite = !entry.isFavorite;
    await entry.save();

    res.json({ isFavorite: entry.isFavorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update entry tags
// @route   PUT /api/entries/:id/tags
export const updateTags = async (req, res) => {
  try {
    const { tags } = req.body;
    const entry = await Entry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    entry.tags = tags || [];
    await entry.save();

    res.json({ tags: entry.tags });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search entries
// @route   GET /api/entries/search
export const searchEntries = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const entries = await Entry.find({
      user: req.user._id,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get favorite entries
// @route   GET /api/entries/favorites
export const getFavorites = async (req, res) => {
  try {
    const entries = await Entry.find({
      user: req.user._id,
      isFavorite: true
    }).sort({ createdAt: -1 });

    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get "On This Day" entries
// @route   GET /api/entries/on-this-day
export const getOnThisDay = async (req, res) => {
  try {
    const today = new Date();
    const month = today.getMonth();
    const day = today.getDate();

    const entries = await Entry.find({ user: req.user._id });

    const onThisDayEntries = entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate.getMonth() === month &&
             entryDate.getDate() === day &&
             entryDate.getFullYear() !== today.getFullYear();
    });

    res.json(onThisDayEntries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get mood analytics
// @route   GET /api/entries/analytics/mood
export const getMoodAnalytics = async (req, res) => {
  try {
    const { period } = req.query; // 'week', 'month', 'year'

    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      startDate.setMonth(startDate.getMonth() - 1); // default to month
    }

    const entries = await Entry.find({
      user: req.user._id,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Mood distribution
    const moodCounts = {};
    entries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    // Mood over time (for line chart)
    const moodTimeline = entries.map(entry => ({
      date: entry.createdAt,
      mood: entry.mood
    }));

    res.json({
      moodCounts,
      moodTimeline,
      totalEntries: entries.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get writing stats
// @route   GET /api/entries/stats
export const getWritingStats = async (req, res) => {
  try {
    const entries = await Entry.find({ user: req.user._id });
    const user = await User.findById(req.user._id);

    const totalEntries = entries.length;
    const totalWords = entries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0);
    const avgWordsPerEntry = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;

    // Entries per month (last 6 months)
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const count = entries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= monthStart && entryDate <= monthEnd;
      }).length;

      monthlyStats.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        entries: count
      });
    }

    // Longest entry
    const longestEntry = entries.reduce((max, entry) =>
      (entry.wordCount || 0) > (max?.wordCount || 0) ? entry : max, null);

    res.json({
      totalEntries,
      totalWords,
      avgWordsPerEntry,
      monthlyStats,
      longestEntry: longestEntry ? {
        title: longestEntry.title,
        wordCount: longestEntry.wordCount,
        date: longestEntry.createdAt
      } : null,
      streak: user?.streak || { current: 0, longest: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get weekly summary
// @route   GET /api/entries/summary/weekly
export const getWeeklySummary = async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const entries = await Entry.find({
      user: req.user._id,
      createdAt: { $gte: weekAgo }
    }).sort({ createdAt: -1 });

    const totalWords = entries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0);

    const moodCounts = {};
    entries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    const dominantMood = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

    res.json({
      entriesCount: entries.length,
      totalWords,
      dominantMood,
      moodBreakdown: moodCounts,
      entries: entries.map(e => ({
        id: e._id,
        title: e.title,
        mood: e.mood,
        date: e.createdAt,
        wordCount: e.wordCount
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update streak on entry creation
const updateStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastEntry = user.streak?.lastEntryDate;

  if (!lastEntry) {
    user.streak = { current: 1, longest: 1, lastEntryDate: today };
  } else {
    const lastDate = new Date(lastEntry);
    lastDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (dayDiff === 0) {
      // Same day, no change
    } else if (dayDiff === 1) {
      // Consecutive day
      user.streak.current += 1;
      if (user.streak.current > user.streak.longest) {
        user.streak.longest = user.streak.current;
      }
      user.streak.lastEntryDate = today;
    } else {
      // Streak broken
      user.streak.current = 1;
      user.streak.lastEntryDate = today;
    }
  }

  await user.save();
};

// @desc    Get daily writing prompts
// @route   GET /api/entries/prompts
export const getDailyPrompts = async (req, res) => {
  const prompts = [
    "What made you smile today?",
    "Describe a challenge you overcame recently.",
    "What are you most grateful for right now?",
    "If you could change one thing about today, what would it be?",
    "What's a goal you're working toward?",
    "Describe your perfect day.",
    "What's something you learned recently?",
    "Write about someone who inspires you.",
    "What are you looking forward to?",
    "How did you take care of yourself today?",
    "What's on your mind that you need to let go of?",
    "Describe a memory that makes you happy.",
    "What would you tell your past self?",
    "What are your hopes for tomorrow?",
    "Write about a place that feels like home.",
    "What's a fear you want to overcome?",
    "Describe your current mood in detail.",
    "What accomplishment are you proud of?",
    "Write a letter to your future self.",
    "What brings you peace?",
    "Describe a moment of kindness you witnessed.",
    "What's something you want to try?",
    "Write about a lesson life taught you.",
    "What does happiness mean to you?",
    "Describe the best part of your week.",
    "What are you holding onto that you should release?",
    "Write about your dreams for the future.",
    "What makes you feel alive?",
    "Describe a person who changed your life.",
    "What are you curious about right now?"
  ];

  // Get 3 random prompts based on today's date
  const today = new Date();
  const seed = today.getFullYear() * 1000 + today.getMonth() * 100 + today.getDate();

  const shuffled = [...prompts].sort(() => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x) - 0.5;
  });

  res.json({
    date: today.toISOString().split('T')[0],
    prompts: shuffled.slice(0, 3)
  });
};

// Export updateStreak for use in createEntry
export { updateStreak };
