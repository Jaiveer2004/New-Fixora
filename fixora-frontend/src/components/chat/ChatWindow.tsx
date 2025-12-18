"use client";

import { getChatResponse } from "@/services/apiService";
import { useState } from "react";

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface ChatWindowProps {
  onClose?: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const [messages, setMessage] = useState<Message[]>([
    { sender: 'ai', text: 'Hi! I\'m your Fixora AI assistant. Ask me about any home services you need! 😊' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessage(prev  => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getChatResponse(input);
      const aiMessage: Message = { sender: 'ai', text: response.data.reply };
      setMessage(prev => [...prev, aiMessage]);
    } catch (error) {
      // More detailed error handling
      let errorText = "Sorry, I'm having trouble connecting.";
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { status?: number }; code?: string };
        if (axiosError.response?.status === 400) {
          errorText = "Please provide a valid message.";
        } else if (axiosError.response?.status === 500) {
          errorText = "Our AI service is temporarily unavailable. Please try again later.";
        } else if (axiosError.code === 'NETWORK_ERROR') {
          errorText = "Network error. Please check your internet connection.";
        }
      }
      
      const errorMessage: Message = {sender: 'ai', text: errorText};
      setMessage(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-[380px] bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">AI</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">Fixora Assistant</h3>
            <p className="text-blue-100 text-xs">Online • Ready to help</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-900 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
            )}
            <div className={`rounded-2xl px-4 py-3 max-w-[80%] shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-blue-500 text-white rounded-br-md' 
                : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-bl-md'
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
            {msg.sender === 'user' && (
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                <span className="text-white text-xs font-bold">U</span>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2 mt-1">
              <span className="text-white text-xs font-bold">AI</span>
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
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about our services..."
            disabled={isLoading}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-all duration-200 flex items-center justify-center min-w-[48px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );

}