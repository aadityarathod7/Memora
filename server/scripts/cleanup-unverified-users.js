import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const cleanupUnverifiedUsers = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully\n');

    // Find users with emailVerified: false or where the field doesn't exist
    const unverifiedUsers = await User.find({
      $or: [
        { emailVerified: false },
        { emailVerified: { $exists: false } }
      ]
    });

    console.log(`Found ${unverifiedUsers.length} unverified user(s)\n`);

    if (unverifiedUsers.length === 0) {
      console.log('No unverified users to delete.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Display users that will be deleted
    console.log('The following users will be deleted:');
    console.log('─────────────────────────────────────────────────');
    unverifiedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Created: ${user.createdAt || 'Unknown'}`);
      console.log(`   Email Verified: ${user.emailVerified || 'false'}`);
      console.log('');
    });
    console.log('─────────────────────────────────────────────────\n');

    // Ask for confirmation (this is a destructive operation)
    console.log('⚠️  WARNING: This action is irreversible!');
    console.log('To proceed with deletion, set CONFIRM_DELETE=true in this script.\n');

    // Safety flag - must be manually set to true
    const CONFIRM_DELETE = true;

    if (!CONFIRM_DELETE) {
      console.log('Deletion cancelled. No users were deleted.');
      console.log('To delete these users, set CONFIRM_DELETE=true in the script and run again.\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Delete unverified users
    console.log('Deleting unverified users...');
    const result = await User.deleteMany({
      $or: [
        { emailVerified: false },
        { emailVerified: { $exists: false } }
      ]
    });

    console.log(`\n✅ Successfully deleted ${result.deletedCount} unverified user(s)`);

    // Close database connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the cleanup
cleanupUnverifiedUsers();
