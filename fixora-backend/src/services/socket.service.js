const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/message.model');
const ChatRoom = require('../models/chatRoom.model');

class SocketService {
  constructor() {
    this.io = null,
    this.connectedUsers = new Map();
  }

  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Authenticate middleware:
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id; // JWT contains 'id', not 'userId'
        socket.userRole = decoded.role;

        next();
      } catch (error) {
        console.error('Socket auth error:', error);
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      // Store connected user:
      this.connectedUsers.set(socket.userId, socket.id);

      // Join user to their personal room:
      socket.join(`user:${socket.userId}`);

      // Handle joining chat rooms:
      socket.on('join_chat', async (data) => {
        await this.handleJoinChat(socket, data);
      });

      // Handle sending messages
      socket.on('send_message', async (data) => {
        await this.handleSendMessage(socket, data);
      });

      // Handle typing indicator
      socket.on('typing_start', (data) => {
        this.handleTypingStart(socket, data);
      });

      socket.on('typing_stop', (data) => {
        this.handleTypingStop(socket, data);
      });

      // Handle message read
      socket.on('mark_as_read', async (data) => {
        await this.handleMarkAsRead(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.connectedUsers.delete(socket.userId);
      });
    });
  }

  async handleJoinChat(socket, data) {
    try {
      const { chatRoomId } = data;

      // Verify user is a participant
      const chatRoom = await ChatRoom.findById(chatRoomId);
      if (!chatRoom) {
        socket.emit('error', {
          message: 'Chat room not found'
        });
        return;
      }

      const isParticipant = chatRoom.participants.some(
        p => p.userId.toString() === socket.userId
      );

      if (!isParticipant) {
        socket.emit('error', {
          message: 'Unauthorized access to chat room',
        });
        return;
      }

      // Join the chat room
      socket.join(`chat:${chatRoomId}`);
      
      // Update last seen
      await ChatRoom.updateOne(
        { 
          _id: chatRoomId,
          'participants.userId': socket.userId
        },
        {
          $set: { 'participants.$.lastSeen': new Date() }
        }
      );

      socket.emit('joined_chat', {
        chatRoomId,
        message: 'Successfully joined chat room'
      });
    } catch (error) {
      console.error('Error joining chat:', error);
      socket.emit('error', { message: 'Failed to join chat room' });
    }
  }

  async handleSendMessage(socket, data) {
    try {
      const { chatRoomId, content, type = 'text' } = data;

      // Verify user is in the chat room
      const chatRoom = await ChatRoom.findById(chatRoomId).populate('participants.userId', 'fullName role email');
      if (!chatRoom) {
        socket.emit('error', { message: 'Chat room not found' });
        return;
      }

      // Create a message:
      const message = await Message.create({
        chatRoomId,
        sender: {
          userId: socket.userId,
          role: socket.userRole,
        },
        content,
        type,
      });

      // Populate sender details
      await message.populate('sender.userId', 'fullName role email');

      // Update chat room:
      await ChatRoom.findByIdAndUpdate(chatRoomId, {
        lastMessage: content.substring(0, 100),
        lastMessageAt: new Date(),
        $inc: {
          [`unreadCount.${socket.userRole === 'customer' ? 'partner' : 'customer'}`]: 1
        }
      });

      // Emit to all users in the chat room
      this.io.to(`chat:${chatRoomId}`).emit('new_message', {
        message: {
          _id: message._id,
          chatRoomId: message.chatRoomId,
          sender: {
            userId: message.sender.userId._id,
            fullName: message.sender.userId.fullName,
            role: message.sender.role,
          },
          content: message.content,
          type: message.type,
          isRead: message.isRead,
          createdAt: message.createdAt
        }
      });

      // Send notification to the other participant if they're online but not in the chat
      const otherParticipant = chatRoom.participants.find(
        p => p.userId._id.toString() !== socket.userId
      );

      if (otherParticipant) {
        this.io.to(`user:${otherParticipant.userId._id}`).emit('new_message_notification', {
          chatRoomId,
          message: content.substring(0, 50),
          senderName: message.sender.userId.fullName
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  handleTypingStart(socket, data) {
    const { chatRoomId } = data;
    socket.to(`chat:${chatRoomId}`).emit('user_typing', {
      userId: socket.userId,
      chatRoomId
    });
  }

  handleTypingStop(socket, data) {
    const { chatRoomId } = data;
    socket.to(`chat:${chatRoomId}`).emit('user_stopped_typing', {
      userId: socket.userId,
      chatRoomId
    });
  }

  async handleMarkAsRead(socket, data) {
    try {
      const { chatRoomId, messageIds } = data;

      // Update messages
      await Message.updateMany(
        {
          _id: { $in: messageIds },
          chatRoomId,
          'sender.userId': { $ne: socket.userId },
          isRead: false
        },
        {
          $set: { isRead: true, readAt: new Date() }
        }
      );

      // Reset unread count:
      await ChatRoom.updateOne(
        { _id: chatRoomId },
        { $set: { [`unreadCount.${socket.userRole}`] : 0 } }
      );

      // Notify other user
      socket.to(`chat:${chatRoomId}`).emit('message_read', {
        messageIds,
        readBy: socket.userId
      });

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  // Method to send system messages:
  async sendSystemMessage(chatRoomId, content) {
    try {
      const message = await Message.create({
        chatRoomId,
        sender: {
          userId: null,
          role: 'system'
        },
        content,
        type: 'system',
      });

      this.io.to(`chat:${chatRoomId}`).emit('new_message', {message});
    } catch (error) {
      console.error('Error sending system message:', error);
    }
  }

  getIO() {
    return this.io;
  }

  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
}

module.exports = new SocketService();