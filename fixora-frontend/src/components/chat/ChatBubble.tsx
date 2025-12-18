"use client";

import { useState } from "react";
import { ChatWindow } from "./ChatWindow";

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className="mb-4">
          <ChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        aria-label="Open AI Chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
        
        {!isOpen && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
        )}
      </button>
    </div>
  );
}