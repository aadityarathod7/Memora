import dotenv from 'dotenv';
import { sendVerificationEmail } from '../services/emailService.js';

dotenv.config();

const testEmail = async () => {
  console.log('Testing email configuration...\n');
  console.log('Email Service:', process.env.EMAIL_SERVICE);
  console.log('Email User:', process.env.EMAIL_USER);
  console.log('Email Password:', process.env.EMAIL_PASSWORD ? '***configured***' : '❌ NOT SET');
  console.log('Client URL:', process.env.CLIENT_URL);
  console.log('\n');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Email credentials not configured in .env file');
    process.exit(1);
  }

  try {
    console.log('Sending test verification email...');
    const testToken = 'test-token-12345';
    const success = await sendVerificationEmail(
      process.env.EMAIL_USER, // Send to yourself
      'Test User',
      testToken
    );

    if (success) {
      console.log('\n✅ Test email sent successfully!');
      console.log('Check your inbox:', process.env.EMAIL_USER);
      console.log('\nVerification link would be:');
      console.log(`${process.env.CLIENT_URL}/verify-email/${testToken}`);
    } else {
      console.log('\n❌ Failed to send test email');
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }

  process.exit(0);
};

testEmail();
