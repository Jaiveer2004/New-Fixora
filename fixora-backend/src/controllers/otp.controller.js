// Import the User model to interact with stored user data
const User = require('../models/user.model');

// Import LoginHistory model to record each successful login attempt
const LoginHistory = require('../models/loginHistory.model');

// Import OTP utility functions for creating, verifying, sending OTPs, and incrementing failed OTP attempts
const { createOTP, verifyOTP, sendOTPEmail, incrementOTPAttempts } = require('../utils/otp.utils');

// Import JWT library to generate authentication tokens
const jwt = require('jsonwebtoken');

// Function that generates a JWT token for a given user ID
// Encodes user ID, signs it with JWT secret, and sets expiration time
const generateJWT = async (userId, role) => {
  return jwt.sign({ id: userId, role: role }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
}

// -----------------------------
// Controller: Request Login OTP
// -----------------------------

const requestLoginOTP = async (req, res) => {
  try {
    // Extract email from request body
    const { email } = req.body;

    // Validate that email exists
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user in database by email
    const user = await User.findOne({ email });

    // If user does not exist, send a generic response for security reasons
    if (!user) {
      return res.status(200).json({
        message: 'If this email is registered, you will receive an OTP shortly.',
      });
    }


    // Check if the user's email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        requiresVerification: true,
      });
    }

    // Check if the user's account is locked due to too many failed attempts
    if (user.isLocked) {
      return res.status(423).json({
        message: 'Account is temporarily locked. Please try again later.'
      });
    }

    // Determine OTP expiry time from environment variables
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;

    // Generate OTP and store it in database
    const { otp } = await createOTP(user._id, email, 'login', expiryMinutes);

    // Get device and IP info
    const device = req.headers['user-agent'] || 'Unknown Device';
    const ipAddress = req.ip || req.connection?.remoteAddress || 'Unknown';

    // Send OTP to user's email
    await sendOTPEmail(email, otp, user.fullName, 'login', device, ipAddress);

    // Send success response to client with expiry info
    return res.status(200).json({
      message: 'OTP sent successfully! Please check your email.',
      email,
      expiryMinutes,
    });

  } catch (error) {
    // Handle any unexpected errors and return server error response
    console.error('Request OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// -----------------------------
// Controller: Verify Login OTP
// -----------------------------

const verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Verify OTP
    const verification = await verifyOTP(email, otp, 'login');

    if (!verification.success) {
      // Increment attempts
      await incrementOTPAttempts(email, otp, 'login');

      return res.status(401).json({ message: verification.message });
    }

    // Get user
    const user = await User.findById(verification.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Reset login attempts
    await user.resetLoginAttempts();

    // Update last login info
    user.lastLogin = new Date();
    user.lastLoginIP = req.ip || req.connection?.remoteAddress || 'Unknown';
    user.lastLoginDevice = req.headers['user-agent'] || 'Unknown';
    await user.save();

    // Log login history
    await LoginHistory.create({
      userId: user._id,
      email: user.email,
      loginMethod: 'otp',
      ipAddress: req.ip || req.connection?.remoteAddress || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
      status: 'success',
    });

    // Generate token
    const token = await generateJWT(user._id, user.role);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  requestLoginOTP,
  verifyLoginOTP,
};