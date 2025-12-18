const { Schema, model } = require('mongoose');

const otpSchema = new Schema({

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  otpHash: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ['login', 'verification', 'password-reset', '2fa'],
    required: true,
  },

  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },

  isUsed: {
    type: Boolean,
    default: false,
  },

  attempts: {
    type: Number,
    default: 0,
  },

  maxAttempts: {
    type: Number,
    default: 3,
  },

  ipAddress: {
    type: String,
  },

  userAgent: {
    type: String,
  },
});

otpSchema.index({ email: 1, type: 1, isUsed: 1 });
otpSchema.index({ userId: 1, type: 1 });

const OTP = model('OTP', otpSchema);
module.exports = OTP;