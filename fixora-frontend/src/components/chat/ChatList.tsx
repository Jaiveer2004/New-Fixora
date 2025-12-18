"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getChatRooms, getUnreadCount } from '@/services/chatService';
import { getSocket, initializeSocket } from '@/lib/socket';
import toast from 'react-hot-toast';
import { MessageCircle, Search } from 'lucide-react';
import { ChatRoom } from './ChatRoom';

interface ChatRoomData {
  _id: string;
  bookingId: {
    _id: string;
    service?: {
      name: string;
    };
  };
  participants: Array<{
    _id: string;
    fullName: string;
    role: string;
  }>;
  lastMessage?: {
    text: string;
    timestamp: string;
  };
  unreadCount: number;
}

export function ChatList() {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoomData[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Initialize socket
    const token = localStorage.getItem('authToken');
    if (token) {
      const socket = initializeSocket(token);

      // Listen for new messages
      socket.on('receiveMessage', () => {
        loadChatRooms();
        loadUnreadCount();
      });
    }

    loadChatRooms();
    loadUnreadCount();

    return () => {
      const socket = getSocket();
      socket?.off('receiveMessage');
    };
  }, [user]);

  const loadChatRooms = async () => {
    try {
      setIsLoading(true);
      const response = await getChatRooms();
      setChatRooms(response.data.rooms || []);
    } catch (error) {
      toast.error('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setTotalUnread(response.data.unreadCount || 0);
    } catch (error) {
      // Silently fail for unread count
    }
  };

  const getOtherParticipant = (room: ChatRoomData) => {
    return room.participants.find(p => p._id !== user?.id);
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredRooms = chatRooms.filter(room => {
    const otherUser = getOtherParticipant(room);
    return otherUser?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           room.bookingId.service?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (selectedRoom) {
    const otherUser = getOtherParticipant(selectedRoom);
    const partner = selectedRoom.participants.find(p => p.role === 'partner');
    const customer = selectedRoom.participants.find(p => p.role === 'customer');

    return (
      <ChatRoom
        roomId={selectedRoom._id}
        bookingId={selectedRoom.bookingId._id}
        partnerName={partner?.fullName || 'Partner'}
        customerName={customer?.fullName || 'Customer'}
        onClose={() => {
          setSelectedRoom(null);
          loadChatRooms();
          loadUnreadCount();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white text-xl font-bold">Messages</h2>
          {totalUnread > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {totalUnread}
            </span>
          )}
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
            <MessageCircle size={48} className="mb-2 opacity-50" />
            <p className="text-center">
              {searchQuery ? 'No chats found' : 'No conversations yet'}
            </p>
            <p className="text-xs text-center mt-2">
              {!searchQuery && 'Start chatting with your bookings'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredRooms.map((room) => {
              const otherUser = getOtherParticipant(room);
              
              return (
                <button
                  key={room._id}
                  onClick={() => setSelectedRoom(room)}
                  className="w-full p-4 hover:bg-gray-800 transition-colors text-left flex items-start gap-3"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {otherUser?.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {room.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-semibold truncate">
                        {otherUser?.fullName}
                      </h3>
                      {room.lastMessage && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatLastMessageTime(room.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-blue-400 mb-1">
                      {room.bookingId.service?.name || `Booking #${room.bookingId._id.slice(-6)}`}
                    </p>
                    
                    {room.lastMessage && (
                      <p className={`text-sm truncate ${room.unreadCount > 0 ? 'text-white font-medium' : 'text-gray-400'}`}>
                        {room.lastMessage.text}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
