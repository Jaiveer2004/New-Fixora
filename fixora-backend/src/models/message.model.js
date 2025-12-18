const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatRoomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true,
  },
  sender: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'partner'],
      required: true,
    }
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxLength: 2000,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
  },
  attachments: [{
    url: String,
    filename: String,
    fileType: String,
    fileSize: Number
  }],
}, { timestamps: true });

messageSchema.index({ chatRoomId: 1, createdAt: -1 });
messageSchema.index({ 'sender.userId': 1 });

module.exports = mongoose.model('Messages', messageSchema);