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

const Entry = mongoose.model('Entry', entrySchema);
export default Entry;
