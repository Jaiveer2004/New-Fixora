"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PartnerStatusToggle } from "@/components/partner/PartnerStatusToggle";
import { getDashboardStats } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import Skeleton from "react-loading-skeleton";

interface DashboardStats {
  // Customer stats
  totalBookings?: number;
  pendingBookings?: number;
  completedBookings?: number;
  totalSpent?: number;
  
  // Partner stats
  totalServices?: number;
  activeServices?: number;
  totalEarnings?: number;
  totalReviews?: number;
  averageRating?: number;
  isOnline?: boolean;
  
  // Common
  recentBookings?: Array<{
    _id: string;
    service?: { name: string };
    customer?: { fullName: string };
    partner?: { fullName: string };
    status: string;
    bookingDate: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getActivityFromBookings = (bookings: DashboardStats['recentBookings']) => {
    return (bookings || []).map(booking => ({
      id: booking._id,
      type: 'booking' as const,
      title: booking.service?.name || 'Service Booking',
      description: user?.role === 'partner' 
        ? `Booking from ${booking.customer?.fullName || 'Customer'}`
        : `Booked ${booking.service?.name || 'service'}`,
      time: formatTimeAgo(booking.createdAt),
      icon: '📅',
      status: (booking.status === 'pending' || booking.status === 'completed' || booking.status === 'cancelled' 
        ? booking.status 
        : 'pending') as 'pending' | 'completed' | 'cancelled'
    }));
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="container mx-auto py-8 px-4 space-y-8">
          {/* Welcome Banner */}
          <WelcomeBanner stats={stats} />

          {/* Partner Create Service CTA */}
          {user?.role === 'partner' && (!stats.totalServices || stats.totalServices === 0) && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">🚀 Ready to start earning?</h3>
                  <p className="text-blue-100 mb-4">Create your first service and start accepting bookings from customers.</p>
                  <Link href="/partner/services/create">
                    <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3">
                      Create Your First Service
                    </Button>
                  </Link>
                </div>
                <div className="hidden md:block text-6xl">
                  🎯
                </div>
              </div>
            </div>
          )}

          {/* Partner Quick Service Actions */}
          {user?.role === 'partner' && stats.totalServices && stats.totalServices > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/partner/services/create">
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white hover:from-green-700 hover:to-green-800 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold mb-1">Create New Service</h4>
                      <p className="text-green-100">Add another service to your portfolio</p>
                    </div>
                    <div className="text-2xl group-hover:scale-110 transition-transform">➕</div>
                  </div>
                </div>
              </Link>
              <Link href="/partner/services">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white hover:from-purple-700 hover:to-purple-800 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold mb-1">Manage Services</h4>
                      <p className="text-purple-100">Edit or update your existing services</p>
                    </div>
                    <div className="text-2xl group-hover:scale-110 transition-transform">🛠️</div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Partner Status Toggle */}
          {user?.role === 'partner' && (
            <div className="flex justify-end">
              <PartnerStatusToggle />
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                  <Skeleton height={20} baseColor="#374151" highlightColor="#4B5563" />
                  <Skeleton height={32} baseColor="#374151" highlightColor="#4B5563" className="mt-2" />
                  <Skeleton height={16} baseColor="#374151" highlightColor="#4B5563" className="mt-2" />
                </div>
              ))
            ) : user?.role === 'customer' ? (
              // Customer stats
              <>
                <StatsCard
                  title="Total Bookings"
                  value={stats.totalBookings || 0}
                  icon="📅"
                  description="All time bookings"
                  color="blue"
                />
                <StatsCard
                  title="Pending Bookings"
                  value={stats.pendingBookings || 0}
                  icon="⏳"
                  description="Awaiting confirmation"
                  color="orange"
                />
                <StatsCard
                  title="Completed Services"
                  value={stats.completedBookings || 0}
                  icon="✅"
                  description="Successfully completed"
                  color="green"
                />
                <StatsCard
                  title="Total Spent"
                  value={formatCurrency(stats.totalSpent || 0)}
                  icon="💰"
                  description="Amount spent on services"
                  color="purple"
                />
              </>
            ) : (
              // Partner stats
              <>
                <StatsCard
                  title="Total Services"
                  value={stats.totalServices || 0}
                  icon="🛠️"
                  description={`${stats.activeServices || 0} active`}
                  color="blue"
                />
                <StatsCard
                  title="Total Bookings"
                  value={stats.totalBookings || 0}
                  icon="📋"
                  description={`${stats.completedBookings || 0} completed`}
                  color="green"
                />
                <StatsCard
                  title="Total Earnings"
                  value={formatCurrency(stats.totalEarnings || 0)}
                  icon="💰"
                  description="From completed services"
                  color="purple"
                />
                <StatsCard
                  title="Average Rating"
                  value={stats.averageRating ? `${stats.averageRating.toFixed(1)} ⭐` : 'No ratings'}
                  icon="⭐"
                  description={`${stats.totalReviews || 0} reviews`}
                  color="orange"
                />
              </>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Feed */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                  <Skeleton height={24} baseColor="#374151" highlightColor="#4B5563" className="mb-4" />
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex space-x-3 mb-4">
                      <Skeleton circle height={32} width={32} baseColor="#374151" highlightColor="#4B5563" />
                      <div className="flex-1">
                        <Skeleton height={16} baseColor="#374151" highlightColor="#4B5563" />
                        <Skeleton height={14} baseColor="#374151" highlightColor="#4B5563" className="mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ActivityFeed 
                  activities={getActivityFromBookings(stats.recentBookings || [])}
                />
              )}
            </div>

            <div>
              <QuickActions userRole={user?.role || 'customer'} />
            </div>
          </div>

          {user?.role === 'partner' && !loading && (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Tips for Success</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className="text-2xl mb-2">📸</div>
                  <h4 className="font-semibold text-white mb-1">Add Portfolio Images</h4>
                  <p className="text-gray-400 text-sm">Showcase your work to attract more customers</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className="text-2xl mb-2">⚡</div>
                  <h4 className="font-semibold text-white mb-1">Stay Online</h4>
                  <p className="text-gray-400 text-sm">Online partners get 3x more bookings</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className="text-2xl mb-2">💬</div>
                  <h4 className="font-semibold text-white mb-1">Respond Quickly</h4>
                  <p className="text-gray-400 text-sm">Fast response times improve your ratings</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className="text-2xl mb-2">🎯</div>
                  <h4 className="font-semibold text-white mb-1">Complete Services</h4>
                  <p className="text-gray-400 text-sm">Higher completion rates boost visibility</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}