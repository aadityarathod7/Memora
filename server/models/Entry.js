import mongoose from 'mongoose';

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
  aiResponse: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Entry = mongoose.model('Entry', entrySchema);
export default Entry;
