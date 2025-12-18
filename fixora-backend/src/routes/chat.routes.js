const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(protect);

// Get or create chat room for a booking
router.get('/booking/:bookingId', chatController.getOrCreateChatRoom);

// Get all chat rooms for user
router.get('/rooms', chatController.getUserChatRooms);

// Get messages for a chat room
router.get('/rooms/:chatRoomId/messages', chatController.getChatMessages);

// Mark messages as read
router.patch('/rooms/:chatRoomId/read', chatController.markMessagesAsRead);

// Delete chat room
router.delete('/rooms/:chatRoomId', chatController.deleteChatRoom);

module.exports = router;