// This model will handle data for both customers and the authentication base for partners.

const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new Schema({

  fullName: {
    type: String,
    required: [true, 'Full name is required.'],
    trim: true,
  },

  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: function () {
      return this.authProvider === 'local';
    },
    minlength: 6,
  },

  phoneNumber: {
    type: String,
  },

  profilePicture: {
    type: String,
    default: 'default_profile_picture_url',
  },

  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },

  googleId: {
    type: String,
  },

  role: {
    type: String,
    enum: ['customer', 'partner', 'admin'],
    default: 'customer',
  },

  isEmailVerified: {
    type: Boolean,
    default: false,
  },

  emailVerificationTokenHash: {
    type: String,
  },

  emailVerificationCodeHash: {
    type: String,
  },

  emailVerificationExpiry: {
    type: Date,
  },

  accountStatus: {
    type: String,
    enum: ['pending', 'active', 'suspend', 'deactivated'],
    default: 'pending',
  },

  // 2FA:
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },

  twoFactorSecretEncrypted: {
    type: String,
  },

  twoFactorInitiated: {
    type: Boolean,
    default: false,
  },

  backupCodes: [{
    codeHash: String,
    used: {
      type: Boolean,
      default: false,
    }
  }],

  // Account Security
  loginAttempts: {
    type: Number,
    default: 0,
  },

  lockUntil: {
    type: Date,
  },

  lastLogin: {
    type: Date,
  },

  lastLoginIP: {
    type: String,
  },

  lastLoginDevice: {
    type: String,
  },

  // Password Reset
  passwordResetTokenHash: {
    type: String,
  },

  passwordResetExpiry: {
    type: Date,
  },

  passwordChangedAt: {
    type: Date,
  },

}, { timestamps: true });

// Virtual for checking if account is locked:
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Method to increment login attempts:
userSchema.methods.incLoginAttempts = function () {
  // If Lock has expired, restart at 1:
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  const lockTime = parseInt(process.env.LOCKOUT_DURATION_MINUTES) || 15;

  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + (lockTime * 60 * 1000) };
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Mongoose middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = model('User', userSchema);
module.exports = User;