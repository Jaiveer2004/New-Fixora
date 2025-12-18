const { Schema, model } = require('mongoose');

const loginHistorySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  loginMethod: {
    type: String,
    enum: ['password', 'otp', 'google', '2fa'],
    required: true,
  },

  ipAddress: {
    type: String,
  },

  userAgent: {
    type: String,
  },

  deviceType: {
    type: String,
  },

  browser: {
    type: String,
  },

  os: {
    type: String,
  },

  location: {
    country: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number,
    }
  },

  status: {
    type: String,
    enum: ['success', 'failed', 'blocked'],
    required: true,
  },

  failureReason: {
    type: String,
  },

  isSuspicious: {
    type: Boolean,
    default: false,
  },

}, { timestamps: true });

// Indexes for performance
loginHistorySchema.index({ userId: 1, createdAt: -1 });
loginHistorySchema.index({ email: 1, status: 1 });
loginHistorySchema.index({ isSuspicious: 1 });

const LoginHistory = model('LoginHistory', loginHistorySchema);
module.exports = LoginHistory;