import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing MongoDB connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password

const testConnection = async () => {
  try {
    console.log('\nAttempting to connect...');

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,
    });

    console.log('\n✅ SUCCESS! MongoDB Connected');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    console.log('Connection state:', conn.connection.readyState);

    await mongoose.connection.close();
    console.log('\nConnection closed successfully');
    process.exit(0);

  } catch (error) {
    console.log('\n❌ FAILED! Could not connect to MongoDB');
    console.log('Error name:', error.name);
    console.log('Error message:', error.message);

    if (error.message.includes('ETIMEDOUT')) {
      console.log('\n🔍 Diagnosis: Network timeout');
      console.log('Possible causes:');
      console.log('  - MongoDB Atlas cluster is paused (check your dashboard)');
      console.log('  - Firewall blocking connection');
      console.log('  - Network connectivity issues');
      console.log('  - IP whitelist changes still propagating (wait 2-5 minutes)');
    }

    if (error.message.includes('authentication failed')) {
      console.log('\n🔍 Diagnosis: Authentication error');
      console.log('Possible causes:');
      console.log('  - Incorrect username or password');
      console.log('  - Database user does not exist');
    }

    process.exit(1);
  }
};

testConnection();
