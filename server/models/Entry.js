import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const entrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please write something'],
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'anxious', 'calm', 'excited', 'grateful', 'frustrated', 'hopeful', 'tired', 'neutral'],
    default: 'neutral'
  },
  // Keep for backwards compatibility
  aiResponse: {
    type: String,
    default: ''
  },
  // Conversation thread for back-and-forth
  conversation: {
    type: [messageSchema],
    default: []
  },
  // Custom tags
  tags: {
    type: [String],
    default: []
  },
  // Favorite/Bookmark
  isFavorite: {
    type: Boolean,
    default: false
  },
  // Image attachments (URLs or base64)
  images: {
    type: [String],
    default: []
  },
  // Word count for stats
  wordCount: {
    type: Number,
    default: 0
  },
  // Pin entry to top
  isPinned: {
    type: Boolean,
    default: false
  },
  // Audio memo URL
  audioUrl: {
    type: String,
    default: ''
  },
  // Location data
  location: {
    name: {
      type: String,
      default: ''
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  // AI reflection questions
  reflectionQuestions: {
    type: [String],
    default: []
  },
  // Spotify track playing while writing
  spotifyTrack: {
    name: { type: String, default: '' },
    artist: { type: String, default: '' },
    albumArt: { type: String, default: '' },
    trackUrl: { type: String, default: '' }
  },
  // Voice entry flag
  isVoiceEntry: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate word count
entrySchema.pre('save', function(next) {
  if (this.content) {
    this.wordCount = this.content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
  next();
});

// Indexes for performance
entrySchema.index({ user: 1, createdAt: -1 }); // For fetching user's entries sorted by date
entrySchema.index({ user: 1, isFavorite: 1 }); // For favorites queries
entrySchema.index({ user: 1, isPinned: 1 }); // For pinned entries
entrySchema.index({ user: 1, mood: 1 }); // For mood-based queries
entrySchema.index({ user: 1, tags: 1 }); // For tag-based queries
entrySchema.index({ user: 1, createdAt: -1, mood: 1 }); // Compound index for common queries
entrySchema.index({ title: 'text', content: 'text', tags: 'text' }); // Text search index

const Entry = mongoose.model('Entry', entrySchema);
export default Entry;
