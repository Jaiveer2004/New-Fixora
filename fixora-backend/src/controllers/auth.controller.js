// This file will handle the business logic for registering and logging in users.

const User = require("../models/user.model");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const { generateVerificationToken, sendVerificationEmail } = require('../utils/otp.utils');
const { hashWithSHA256 } = require('../utils/crypto.utils');

// Helper function to generate a JWT
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role: role }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role = 'customer' } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      if (userExists.isEmailVerified) {
        return res.status(409).json({ message: 'User with this email already exists' });
      } else {
        await User.findByIdAndDelete(userExists._id);
      }
    }

    const verificationToken = generateVerificationToken();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const tokenHash = hashWithSHA256(verificationToken);
    const codeHash = hashWithSHA256(verificationCode);

    // 6-digit code
    const expiryHours = parseInt(process.env.EMAIL_VERIFICATION_EXPIRY_HOURS) || 24;
    const verificationExpiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    // 2. Create new User: (password will be hashed by the pre-save hook in the model)
    const user = await User.create({
      fullName,
      email,
      password,
      role,
      isEmailVerified: false,
      accountStatus: 'pending',
      emailVerificationTokenHash: tokenHash,
      emailVerificationCodeHash: codeHash,
      emailVerificationExpiry: verificationExpiry,
    });

    await sendVerificationEmail(email, verificationCode, verificationToken, fullName);

    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      email: user.email,
      userId: user._id,
      requiresVerification: true,
    });


  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token, code } = req.body;

    if (!code || !token) {
      return res.status(400).json({ message: 'Verification token and code are required' });
    }

    const tokenHash = hashWithSHA256(token);
    const codeHash = hashWithSHA256(code);

    const user = await User.findOne({
      emailVerificationCodeHash: codeHash,
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiry: { $gt: new Date() },
      isEmailVerified: false,
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired verification link. Please request a new verification email.'
      });
    }

    // Update user as verified
    user.isEmailVerified = true;
    user.accountStatus = 'active';
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationCodeHash = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();

    // Generate JWT token
    const jwtToken = generateToken(user._id, user.role);

    res.status(200).json({
      message: 'Email verified successfully! You can now login.',
      token: jwtToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled || false
      },
    });


  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// NEW: Resend verification email
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, isEmailVerified: false });

    if (!user) {
      return res.status(404).json({
        message: 'User not found or already verified'
      });
    }

    // Generate new verification codes
    const verificationToken = generateVerificationToken();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const tokenHash = hashWithSHA256(verificationToken);
    const codeHash = hashWithSHA256(verificationCode);

    const expiryHours = parseInt(process.env.EMAIL_VERIFICATION_EXPIRY_HOURS) || 24;
    const verificationExpiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    // Update user
    user.emailVerificationTokenHash = tokenHash;
    user.emailVerificationCodeHash = codeHash;
    user.emailVerificationExpiry = verificationExpiry;
    await user.save();

    // Send email
    await sendVerificationEmail(email, verificationCode, verificationToken, user.fullName);

    res.status(200).json({
      message: 'Verification email sent successfully!',
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by email:
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'You need to Sign Up before login.' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        requiresVerification: true,
        email: user.email,
      });
    }

    if (user.isLocked) {
      return res.status(423).json({
        message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
      });
    }

    // 2. Compare the entered password with the hashed password:
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({ message: 'Password is incorrect.' })
    }

    await user.resetLoginAttempts();

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Return response indicating 2FA is required
      return res.status(200).json({
        message: '2FA verification required',
        requires2FA: true,
        email: user.email,
      });
    }

    // 6. Update last login info
    user.lastLogin = new Date();
    user.lastLoginIP = req.ip;
    user.lastLoginDevice = req.headers['user-agent'];
    await user.save();

    // 3. Generate token and send responses:
    const token = generateToken(user._id, user.role);
    res.status(200).json({
      message: 'Login Successful',
      token,
      user: { 
        id: user._id, 
        fullName: user.fullName, 
        email: user.email, 
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled || false
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

const googleAuthCallback = async (req, res) => {
  try {
    const user = req.user;

    // Check if email is verified (for Google users, mark as verified)
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      user.accountStatus = 'active';
      await user.save();
    }

    const token = generateToken(user._id, user.role);
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectURL = `${frontendURL}/auth/callback?token=${token}&user=${encodeURIComponent(
      JSON.stringify({
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled || false,
      })
    )}`;

    res.redirect(redirectURL);
  } catch (error) {
    console.error('Google auth callback error:', error);
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendURL}/login?error=authentication_failed`);
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleAuthCallback,
  verifyEmail,
  resendVerificationEmail,
};