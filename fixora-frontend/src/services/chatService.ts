import api from '@/lib/api';

interface CreateChatRoomData {
  bookingId: string;
  participants?: string[]; // Optional - backend gets participants from booking
}

interface Message {
  senderId: string;
  text: string;
  timestamp: Date;
}

// Get all chat rooms for the current user
export const getChatRooms = () => {
  return api.get('/chat/rooms');
};

// Get a specific chat room by ID
export const getChatRoom = (roomId: string) => {
  return api.get(`/chat/rooms/${roomId}`);
};

// Get or create a chat room for a booking
export const createChatRoom = (data: CreateChatRoomData) => {
  return api.get(`/chat/booking/${data.bookingId}`);
};

// Get messages for a chat room
export const getChatMessages = (roomId: string, limit = 50, skip = 0) => {
  return api.get(`/chat/rooms/${roomId}/messages`, {
    params: { limit, skip }
  });
};

// Mark messages as read
export const markMessagesAsRead = (roomId: string) => {
  return api.post(`/chat/rooms/${roomId}/read`);
};

// Get unread message count
export const getUnreadCount = () => {
  return api.get('/chat/unread-count');
};

// Send a message (HTTP fallback, primarily using WebSocket)
export const sendMessage = (roomId: string, message: Message) => {
  return api.post(`/chat/rooms/${roomId}/messages`, message);
};
