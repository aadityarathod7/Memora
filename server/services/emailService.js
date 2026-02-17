import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for sending emails
const createTransporter = () => {
  // Using Gmail as example - users can configure their own SMTP
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // App-specific password for Gmail
    }
  });
};

// Send reminder email
export const sendReminderEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '🌙 Time to reflect with Memora',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Georgia', serif;
              background-color: #F5F1E8;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              color: #3F5B36;
              margin-bottom: 30px;
            }
            .header h1 {
              font-size: 32px;
              margin: 0;
              color: #6F9463;
            }
            .content {
              color: #2C3E2A;
              line-height: 1.8;
              font-size: 16px;
            }
            .cta-button {
              display: inline-block;
              background: #6F9463;
              color: white;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: 600;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #E0E0E0;
              color: #8A9A87;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Memora</h1>
              <p style="font-style: italic; color: #5A6B57;">Where memories talk back</p>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>It's time to pause and reflect on your day. Your journal is waiting to hear from you.</p>
              <p>Take a moment to capture your thoughts, feelings, and experiences. Whether it was a great day or a challenging one, your words matter.</p>
              <div style="text-align: center;">
                <a href="${process.env.APP_URL || 'http://localhost:3000'}/journal" class="cta-button">
                  Open Your Journal
                </a>
              </div>
              <p style="margin-top: 30px; font-style: italic; color: #5A6B57;">
                "Writing is the painting of the voice." - Voltaire
              </p>
            </div>
            <div class="footer">
              <p>You're receiving this because you enabled daily reminders in Memora.</p>
              <p><a href="${process.env.APP_URL || 'http://localhost:3000'}/journal" style="color: #6F9463;">Manage your reminder settings</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return false;
  }
};

// Send streak protection email
export const sendStreakProtectionEmail = async (userEmail, userName, currentStreak) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `🔥 Don't break your ${currentStreak}-day streak!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Georgia', serif;
              background-color: #F5F1E8;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              color: #3F5B36;
              margin-bottom: 30px;
            }
            .streak-badge {
              font-size: 72px;
              margin: 20px 0;
            }
            .streak-number {
              font-size: 48px;
              font-weight: bold;
              color: #FF6B35;
            }
            .content {
              color: #2C3E2A;
              line-height: 1.8;
              font-size: 16px;
            }
            .cta-button {
              display: inline-block;
              background: #FF6B35;
              color: white;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: 600;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #E0E0E0;
              color: #8A9A87;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="streak-badge">🔥</div>
              <p class="streak-number">${currentStreak} Days</p>
              <p style="font-style: italic; color: #5A6B57;">Your current streak</p>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p><strong>You're on a roll!</strong> You've journaled for ${currentStreak} consecutive days, and we'd hate to see that streak end.</p>
              <p>You haven't written yet today. Take just a few minutes to keep your momentum going!</p>
              <div style="text-align: center;">
                <a href="${process.env.APP_URL || 'http://localhost:3000'}/journal" class="cta-button">
                  Keep Your Streak Alive
                </a>
              </div>
              <p style="margin-top: 30px; font-style: italic; color: #5A6B57;">
                Every day you write is a day you grow. Keep it up!
              </p>
            </div>
            <div class="footer">
              <p>Streak protection reminder from Memora</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Streak protection email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending streak protection email:', error);
    return false;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (userEmail, resetUrl) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '🔐 Reset Your Memora Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Georgia', serif;
              background-color: #F5F1E8;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              color: #3F5B36;
              margin-bottom: 30px;
            }
            .header h1 {
              font-size: 32px;
              margin: 0;
              color: #6F9463;
            }
            .content {
              color: #2C3E2A;
              line-height: 1.8;
              font-size: 16px;
            }
            .cta-button {
              display: inline-block;
              background: #6F9463;
              color: white;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: 600;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #E0E0E0;
              color: #8A9A87;
              font-size: 14px;
            }
            .warning {
              background: #FFF8E1;
              border-left: 4px solid #FFC107;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Memora</h1>
              <p style="font-style: italic; color: #5A6B57;">Password Reset Request</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your Memora password. Click the button below to create a new password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="cta-button">
                  Reset Password
                </a>
              </div>
              <div class="warning">
                <p style="margin: 0; font-size: 14px;"><strong>⚠️ Security Notice:</strong></p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">This link will expire in 30 minutes for your security.</p>
              </div>
              <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
              <p style="margin-top: 30px; font-size: 14px; color: #8A9A87;">
                For security reasons, this link can only be used once and will expire after 30 minutes.
              </p>
            </div>
            <div class="footer">
              <p>If the button doesn't work, copy and paste this link:</p>
              <p style="word-break: break-all; color: #6F9463;">${resetUrl}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

export default { sendReminderEmail, sendStreakProtectionEmail, sendPasswordResetEmail };

// Send test email
export const sendTestEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '✅ Memora Email Test',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Georgia', serif;
              background-color: #F5F1E8;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              color: #3F5B36;
              margin-bottom: 30px;
            }
            .header h1 {
              font-size: 32px;
              margin: 0;
              color: #6F9463;
            }
            .content {
              color: #2C3E2A;
              line-height: 1.8;
              font-size: 16px;
            }
            .success-badge {
              text-align: center;
              font-size: 64px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Memora</h1>
              <p style="font-style: italic; color: #5A6B57;">Email Configuration Test</p>
            </div>
            <div class="success-badge">✅</div>
            <div class="content">
              <p>Hello ${userName || 'there'},</p>
              <p><strong>Great news!</strong> Your email configuration is working perfectly.</p>
              <p>This is a test email to verify that Memora can successfully send emails using your configured SMTP settings.</p>
              <p style="margin-top: 30px; color: #5A6B57;">
                <strong>Configuration Details:</strong><br>
                Email Service: ${process.env.EMAIL_SERVICE || 'gmail'}<br>
                Sender: ${process.env.EMAIL_USER}
              </p>
              <p style="margin-top: 30px; font-style: italic; color: #5A6B57;">
                You can now receive reminder emails and other notifications from Memora!
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Test email sent successfully to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
};

// Send email verification with OTP
export const sendVerificationEmail = async (userEmail, userName, verificationOTP) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '✨ Your Memora Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Georgia', serif;
              background-color: #F5F1E8;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              color: #3F5B36;
              margin-bottom: 30px;
            }
            .header h1 {
              font-size: 32px;
              margin: 0;
              color: #6F9463;
            }
            .content {
              color: #2C3E2A;
              line-height: 1.8;
              font-size: 16px;
            }
            .otp-box {
              background: linear-gradient(135deg, #6F9463 0%, #3F5B36 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 12px;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 48px;
              font-weight: bold;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
              margin: 10px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #E8E4DB;
              color: #5A6B57;
              font-size: 14px;
              text-align: center;
            }
            .warning {
              background: #FFF8E1;
              border-left: 4px solid #FFC107;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Welcome to Memora</h1>
              <p style="font-style: italic; color: #5A6B57;">"Where memories talk back..."</p>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p><strong>Thank you for joining Memora!</strong></p>
              <p>To verify your email address and activate your account, please use the verification code below:</p>

              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">Your Verification Code</p>
                <div class="otp-code">${verificationOTP}</div>
                <p style="margin: 0; font-size: 12px; opacity: 0.8;">Enter this code on the verification page</p>
              </div>

              <div class="warning">
                <p style="margin: 0; font-size: 14px;"><strong>⏰ Important:</strong></p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">This code will expire in <strong>10 minutes</strong>.</p>
              </div>

              <p style="margin-top: 20px;">If you didn't create a Memora account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p style="font-style: italic;">Every memory deserves to be remembered.</p>
              <p style="margin-top: 10px; font-size: 12px; color: #8A9A87;">
                For security reasons, never share this code with anyone.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification OTP sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};
