import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import entryRoutes from './routes/entryRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import { initializeReminders } from './services/reminderScheduler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

dotenv.config();

// Connect to database
connectDB();

// Initialize reminder scheduler
initializeReminders();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/goals', goalRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Book Companion API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
