"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSocket, initializeSocket } from '@/lib/socket';
import { getChatMessages, markMessagesAsRead } from '@/services/chatService';
import toast from 'react-hot-toast';
import { Send, Paperclip, MoreVertical, X } from 'lucide-react';

interface Message {
  _id: string;
  sender: {
    userId: string;
    fullName: string;
    role: string;
  };
  content: string;
  createdAt: string;
  isRead: boolean;
  type: string;
}

interface ChatRoomProps {
  roomId: string;
  bookingId: string;
  partnerName: string;
  customerName: string;
  onClose?: () => void;
}

export function ChatRoom({ roomId, bookingId, partnerName, customerName, onClose }: ChatRoomProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socket = getSocket();

  const otherUserName = user?.role === 'partner' ? customerName : partnerName;

  useEffect(() => {
    if (!user) return;

    // Initialize socket if not connected
    const token = localStorage.getItem('authToken');
    if (token && !socket?.connected) {
      initializeSocket(token);
    }

    // Load initial messages
    loadMessages();

    // Join the chat room
    socket?.emit('join_chat', { chatRoomId: roomId });

    // Listen for incoming messages
    socket?.on('new_message', (data: { message: Message }) => {
      setMessages(prev => [...prev, data.message]);
      scrollToBottom();
    });

    // Listen for typing indicator
    socket?.on('user_typing', ({ userId }: { userId: string }) => {
      if (userId !== user.id) {
        setOtherUserTyping(true);
        setTimeout(() => setOtherUserTyping(false), 3000);
      }
    });

    // Mark messages as read when opening chat
    markMessagesAsRead(roomId).catch(() => {});

    return () => {
      socket?.emit('leave_chat', { chatRoomId: roomId });
      socket?.off('new_message');
      socket?.off('user_typing');
    };
  }, [roomId, user, socket]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await getChatMessages(roomId);
      setMessages(response.data.messages);
      scrollToBottom();
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket || !user) return;

    const messageData = {
      chatRoomId: roomId,
      content: inputMessage.trim(),
      type: 'text'
    };

    socket.emit('send_message', messageData);
    setInputMessage('');
    setIsTyping(false);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    if (!isTyping && socket) {
      setIsTyping(true);
      socket.emit('typing_start', { chatRoomId: roomId, userId: user?.id });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('typing_stop', { chatRoomId: roomId, userId: user?.id });
    }, 2000) as unknown as NodeJS.Timeout;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + 
             date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(msg => {
      const date = new Date(msg.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">
              {otherUserName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-white font-semibold">{otherUserName}</h3>
            <p className="text-blue-100 text-xs">
              {otherUserTyping ? 'Typing...' : 'Booking #' + bookingId.slice(-6)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-white hover:text-gray-200 transition-colors p-2">
            <MoreVertical size={20} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-900 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Send size={48} className="mb-2 opacity-50" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, msgs]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-400 border border-gray-700">
                  {date}
                </div>
              </div>

              {/* Messages for this date */}
              {msgs.map((msg) => {
                const isOwnMessage = msg.sender.userId === user?.id;
                
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}
                  >
                    {!isOwnMessage && (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {msg.sender.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-col max-w-[70%]">
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          isOwnMessage
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                      </div>
                      <span className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>

                    {isOwnMessage && (
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                          {msg.sender.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
        
        {otherUserTyping && (
          <div className="flex justify-start mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-xs font-bold">
                {otherUserName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3 border border-gray-700">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex gap-2 items-center">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-200 transition-colors p-2"
            title="Attach file (Coming soon)"
          >
            <Paperclip size={20} />
          </button>
          <input
            value={inputMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-all duration-200 flex items-center justify-center min-w-[48px]"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
