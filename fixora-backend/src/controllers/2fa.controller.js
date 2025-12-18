const bcrypt = require('bcryptjs');

// Import speakeasy library for generating and verifying TOTP-based 2FA codes
const speakeasy = require('speakeasy');

// Import qrcode library to generate QR codes for authenticator apps
const qrcode = require('qrcode');

// Import User model to update 2FA-related fields
const User = require('../models/user.model');

const {
  encrypt,
  decrypt,
  hashWithBcrypt,
  compareBcrypt
} = require('../utils/crypto.utils');

// -----------------------------
// Controller: Enable 2FA
// -----------------------------
const enable2FA = async (req, res) => {
  try {
    // Get current authenticated user ID
    const userId = req.user._id

    // Generate a 2FA secret for the user with app name and issuer information
    const secret = speakeasy.generateSecret({
      name: `Fixora (${req.user.email})`,
      issuer: 'Fixora',
    });

    const encryptedSecret = encrypt(secret.base32);

    // Generate Backup Codes:

    // Create an array to store backup codes
    const backupCodes = [];
    const plainBackupCodes = [];

    // Loop to generate 10 random backup codes and mark each as unused
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      plainBackupCodes.push(code);

      const codeHash = await hashWithBcrypt(code);
      backupCodes.push({ codeHash, used: false });
    }

    // Save secret and backup codes to user's database record
    const user = await User.findByIdAndUpdate(userId, {
      twoFactorSecretEncrypted: encryptedSecret,
      twoFactorInitiated: true,
      backupCodes,
    }, { new: true }
    );

    // Generate a QR code URL from the secret for mobile authenticator apps
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    // Send QR code, secret key, and backup codes to frontend for 2FA setup
    res.status(200).json({
      message: '2FA setup initiated',
      qrCode: qrCodeUrl,
      secret: secret.base32,
      backupCodes: plainBackupCodes,
    });


  } catch (error) {
    // Handle unexpected errors and return server error response
    console.error('Enable 2FA error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// -----------------------------
// Controller: Verify and Activate 2FA
// -----------------------------
const verify2FA = async (req, res) => {
  try {
    // Extract 2FA token entered by the user
    const { token } = req.body;

    // Get current authenticated user ID
    const userId = req.user._id;

    // Fetch user record from database
    const user = await User.findById(userId);

    // Check if user initiated 2FA setup before verification
    if (!user.twoFactorInitiated) {
      return res.status(400).json({ message: '2FA not Enabled.' });
    }

    // Check if secret exists
    if (!user.twoFactorSecretEncrypted) {
      return res.status(400).json({ 
        message: '2FA secret not found. Please enable 2FA again.' 
      });
    }

    // Decrypt the 2FA secret
    const decryptedSecret = decrypt(user.twoFactorSecretEncrypted);


    // Verify submitted token using speakeasy TOTP verification
    const verified = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    // If token invalid, return unauthorized response
    if (!verified) {
      return res.status(401).json({ message: 'Invalid 2FA token' });
    }

    // Activate 2FA by setting flag to true in user's record
    user.twoFactorEnabled = true;

    // Save changes and send success response
    await user.save();

    res.status(200).json({
      message: '2FA enabled successfully',
      twoFactorEnabled: true,
    });

  } catch (error) {
    // Handle unexpected errors and return server error response
    console.error('Verify 2FA error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Verify 2FA during login
const verify2FALogin = async (req, res) => {
  try {
    const { email, token: twoFactorToken } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    // Check if secret exists
    if (!user.twoFactorSecretEncrypted) {
      return res.status(400).json({ 
        message: '2FA secret not found. Please enable 2FA again.' 
      });
    }

    // Decrypt the secret
    const decryptedSecret = decrypt(user.twoFactorSecretEncrypted);

    // Verify TOTP token
    const verified = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token: twoFactorToken,
      window: 2,
    });

    if (!verified) {
      return res.status(401).json({ message: 'Invalid 2FA token' });
    }

    // Update last login info
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const authToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(200).json({
      message: '2FA verification successful',
      verified: true,
      token: authToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        twoFactorEnabled: true,
      },
    });

  } catch (error) {
    console.error('Verify 2FA login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify backup code
const verifyBackupCode = async (req, res) => {
  try {
    const { email, backupCode } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    // Check each hashed backup code
    for (let i = 0; i < user.backupCodes.length; i++) {
      const bc = user.backupCodes[i];

      if (bc.used) continue;

      // Compare with hash
      const isMatch = await compareBcrypt(backupCode, bc.codeHash);

      if (isMatch) {
        // Mark as used
        user.backupCodes[i].used = true;
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const jwt = require('jsonwebtoken');
        const authToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
          expiresIn: '24h',
        });

        return res.status(200).json({
          message: 'Backup code verified successfully',
          verified: true,
          token: authToken,
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            twoFactorEnabled: true,
          },
        });
      }
    }

    res.status(401).json({ message: 'Invalid or used backup code' });

  } catch (error) {
    console.error('Verify backup code error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// -----------------------------
// Controller: Disable 2FA
// -----------------------------
// Disable 2FA
const disable2FA = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecretEncrypted = undefined;
    user.backupCodes = [];
    await user.save();

    res.status(200).json({
      message: '2FA disabled successfully',
    });

  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  enable2FA,
  verify2FA,
  verify2FALogin,
  verifyBackupCode,
  disable2FA,
};