const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['partner', 'customer'],
      required: true,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  }],
  lastMessage: {
    type: String,
    default: '',
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  unreadCount: {
    customer: {
      type: Number,
      default: 0
    },
    partner: {
      type: Number,
      default: 0
    }
  }
}, { timestamps: true });

// Only define explicit indexes, not duplicates
chatRoomSchema.index({ 'participants.userId': 1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);