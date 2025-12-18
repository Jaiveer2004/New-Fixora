"use client";

import { useAuth } from "@/context/AuthContext";

interface WelcomeBannerProps {
  stats?: {
    totalBookings?: number;
    totalServices?: number;
    averageRating?: number;
    isOnline?: boolean;
  };
}

export function WelcomeBanner({ stats }: WelcomeBannerProps) {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getWelcomeMessage = () => {
    if (user?.role === 'partner') {
      return "Ready to help customers today?";
    }
    return "What service can we help you with today?";
  };

  return (
    <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">
            {getGreeting()}, {user?.fullName?.split(' ')[0]}! 👋
          </h1>
          <p className="text-blue-100 text-lg mb-4">
            {getWelcomeMessage()}
          </p>
          
          {user?.role === 'partner' && stats && (
            <div className="flex items-center space-x-6">
              {stats.isOnline !== undefined && (
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${stats.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                  <span className="text-sm">
                    {stats.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              )}
              {stats.averageRating && (
                <div className="flex items-center">
                  <span className="text-yellow-300 mr-1">⭐</span>
                  <span className="text-sm">{stats.averageRating.toFixed(1)} rating</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="hidden lg:block">
          <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-6xl">
              {user?.role === 'partner' ? '🛠️' : '🏠'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick stats for mobile */}
      {user?.role === 'partner' && stats && (
        <div className="lg:hidden mt-4 flex space-x-4">
          {stats.isOnline !== undefined && (
            <div className="flex items-center bg-white/10 rounded-lg px-3 py-2">
              <div className={`w-2 h-2 rounded-full mr-2 ${stats.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span className="text-sm">{stats.isOnline ? 'Online' : 'Offline'}</span>
            </div>
          )}
          {stats.averageRating && (
            <div className="flex items-center bg-white/10 rounded-lg px-3 py-2">
              <span className="text-yellow-300 mr-1 text-sm">⭐</span>
              <span className="text-sm">{stats.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}