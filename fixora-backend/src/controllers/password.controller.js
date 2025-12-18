const User = require('../models/user.model');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const transporter = require('../config/email.config');
const {
  generateSecureRandom,
  hashWithSHA256
} = require('../utils/crypto.utils');

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return res.status(200).json({ 
        message: 'If this email is registered, you will receive a password reset link.' 
      });
    }

    // Generate reset token
    const resetToken = generateSecureRandom(32);
    const hashToken = hashWithSHA256(resetToken);

    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetTokenHash = hashToken;
    user.passwordResetExpiry = resetExpiry;
    await user.save();

    // Send email
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendURL}/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reset Your Fixora Password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
      `,
    });

    res.status(200).json({
      message: 'Password reset link sent successfully',
    });

  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        message: 'Token and new password are required' 
      });
    }
    
    const hashToken = hashWithSHA256(token);

    const user = await User.findOne({
      passwordResetTokenHash: hashToken,
      passwordResetExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();

    res.status(200).json({
      message: 'Password reset successful. You can now login.',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  requestPasswordReset,
  resetPassword,
};