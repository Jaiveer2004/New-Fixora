const ChatRoom = require('../models/chatRoom.model');
const Message = require('../models/message.model');
const Booking = require('../models/booking.model');
const chatRoomModel = require('../models/chatRoom.model');

// Create or get chat room for a booking
exports.getOrCreateChatRoom = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id.toString(); // Use _id from user object

    // Verify booking exists and user is involved:
    const booking = await Booking.findById(bookingId)
      .populate('customer', 'fullName email role')
      .populate({
        path: 'partner',
        populate: {
          path: 'user',
          select: 'fullName email role'
        }
      });

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found'
      });
    }

    const isCustomer = booking.customer._id.toString() === userId;
    const isPartner = booking.partner?.user?._id?.toString() === userId;

    if (!isCustomer && !isPartner) {
      return res.status(403).json({
        message: 'Unauthorized access to chat',
        debug: {
          userId,
          customerId: booking.customer?._id?.toString(),
          partnerUserId: booking.partner?.user?._id?.toString()
        }
      });
    }

    let chatRoom = await ChatRoom.findOne({ bookingId })
      .populate('participants.userId', 'fullName, email, role');

    if (!chatRoom) {
      // Ensure we have valid user IDs before creating chat room
      if (!booking.partner?.user?._id) {
        return res.status(500).json({
          message: 'Partner user information not found',
          debug: { partnerId: booking.partner?._id }
        });
      }

      chatRoom = await ChatRoom.create({
        bookingId,
        participants: [
          {
            userId: booking.customer._id,
            role: 'customer',
            lastSeen: new Date()
          },
          {
            userId: booking.partner.user._id,
            role: 'partner',
            lastSeen: new Date()
          }
        ]
      });

      await chatRoom.populate('participants.userId', 'fullName email role');
    }

    res.status(200).json({
      success: true,
      chatRoom: {
        _id: chatRoom._id,
        bookingId: chatRoom.bookingId,
        participants: chatRoom.participants,
        lastMessage: chatRoom.lastMessage,
        lastMessageAt: chatRoom.lastMessageAt,
        unreadCount: chatRoom.unreadCount,
        isActive: chatRoom.isActive
      }
    });
  } catch (error) {
    console.error('Error getting/creating chat room: ', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all chat rooms for user
exports.getUserChatRooms = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    // Find all chat rooms where the user is a participant
    const chatRooms = await ChatRoom.find({
      'participants.userId': userId,
      isActive: true,
    })
      .populate('participants.userId', 'fullName email role')
      .populate({
        path: 'bookingId',
        populate: {
          path: 'service',
          select: 'name category',
        }
      })
      .sort({ lastMessageAt: -1 });

    // Ensure we always return an array
    const roomsArray = Array.isArray(chatRooms) ? chatRooms : [];

    res.status(200).json({
      success: true,
      chatRooms: roomsArray.map(room => ({
        _id: room._id,
        bookingId: room.bookingId,
        participants: room.participants,
        lastMessage: room.lastMessage,
        lastMessageAt: room.lastMessageAt,
        // unreadCount might be an object keyed by role; guard access
        unreadCount: (room.unreadCount && room.unreadCount[userRole]) ? room.unreadCount[userRole] : 0,
        otherParticipant: (room.participants || []).find(p => {
          const pid = p.userId && (p.userId._id ? p.userId._id.toString() : p.userId.toString());
          return pid !== userId;
        }) || null
      }))
    });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get messages for a chat room
exports.getChatMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const userId = req.user._id.toString();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user is participant
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    const isParticipant = chatRoom.participants.some(
      p => p.userId.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Get messages with pagination
    const messages = await Message.find({ chatRoomId })
      .populate('sender.userId', 'fullName role email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalMessages = await Message.countDocuments({ chatRoomId });

    // Transform messages to match socket structure
    const transformedMessages = messages.reverse().map(msg => ({
      _id: msg._id,
      chatRoomId: msg.chatRoomId,
      sender: {
        userId: msg.sender.userId._id.toString(),
        fullName: msg.sender.userId.fullName,
        role: msg.sender.role,
      },
      content: msg.content,
      type: msg.type,
      isRead: msg.isRead,
      createdAt: msg.createdAt
    }));

    res.status(200).json({
      success: true,
      messages: transformedMessages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasMore: skip + messages.length < totalMessages
      }
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    // Update unread messages
    const result = await Message.updateMany(
      {
        chatRoomId,
        'sender.userId': { $ne: userId },
        isRead: false
      },
      {
        $set: { isRead: true, readAt: new Date() }
      }
    );

    // Reset unread count
    await ChatRoom.updateOne(
      { _id: chatRoomId },
      { $set: { [`unreadCount.${userRole}`]: 0 } }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete chat room (soft delete)
exports.deleteChatRoom = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const userId = req.user._id.toString();

    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    // Verify user is participant
    const isParticipant = chatRoom.participants.some(
      p => p.userId.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await ChatRoom.updateOne(
      { _id: chatRoomId },
      { $set: { isActive: false } }
    );

    res.status(200).json({
      success: true,
      message: 'Chat room deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chat room:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};