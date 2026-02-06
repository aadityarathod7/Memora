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
  // New: conversation thread for back-and-forth
  conversation: {
    type: [messageSchema],
    default: []
  }
}, {
  timestamps: true
});

const Entry = mongoose.model('Entry', entrySchema);
export default Entry;
