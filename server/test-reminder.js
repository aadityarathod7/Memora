import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import { sendTestReminder } from './services/reminderScheduler.js';

dotenv.config();

const testReminder = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Testing reminder email...\n');

    // Find first user (you can replace with specific email)
    const user = await User.findOne();

    if (!user) {
      console.log('❌ No users found in database');
      console.log('Please sign up first at http://localhost:3000');
      process.exit(1);
    }

    console.log('Found user:', user.email);
    console.log('User name:', user.name);
    console.log('Current streak:', user.streak?.current || 0);
    console.log('\nSending test reminder email...\n');

    // Send test reminder
    await sendTestReminder(user._id);

    console.log('✅ Test reminder sent successfully!');
    console.log(`Check your inbox at: ${user.email}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error sending test reminder:', error.message);
    process.exit(1);
  }
};

testReminder();
