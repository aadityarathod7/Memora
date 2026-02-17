import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const users = await User.find({}).select('name email emailVerified createdAt');

    console.log(`Total users in database: ${users.length}\n`);

    if (users.length === 0) {
      console.log('No users found.');
    } else {
      console.log('User List:');
      console.log('─────────────────────────────────────────────────');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
        console.log(`   Email Verified: ${user.emailVerified ? '✅ YES' : '❌ NO'}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('');
      });
      console.log('─────────────────────────────────────────────────');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkUsers();
