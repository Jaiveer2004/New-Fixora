"use client";

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ChatList } from '@/components/chat/ChatList';

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
              <p className="text-gray-400">
                Chat with your service providers or customers
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <ChatList />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
