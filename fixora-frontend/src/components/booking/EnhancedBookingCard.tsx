"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Booking {
  _id: string;
  service: {
    name: string;
    _id: string;
  };
  partner?: {
    user: {
      fullName: string;
      profilePicture?: string;
    };
    averageRating?: number;
  };
  customer?: {
    fullName: string;
  };
  bookingDate: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
  paymentStatus: 'pending' | 'paid';
  createdAt: string;
}

interface EnhancedBookingCardProps {
  booking: Booking;
  userRole?: string;
  onReviewClick?: (bookingId: string) => void;
  onCancelClick?: (bookingId: string) => void;
  onContactClick?: (booking: Booking) => void;
  onConfirmClick?: (bookingId: string) => void;
  onRejectClick?: (bookingId: string) => void;
  onStatusUpdate?: (bookingId: string, status: string) => void;
}

export function EnhancedBookingCard({ 
  booking, 
  userRole = 'customer',
  onReviewClick,
  onCancelClick,
  onContactClick,
  onConfirmClick,
  onRejectClick,
  onStatusUpdate
}: EnhancedBookingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'confirmed':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'confirmed':
        return '🔄';
      case 'pending':
        return '⏳';
      case 'cancelled':
        return '❌';
      default:
        return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const { date, time } = formatDate(booking.bookingDate);
  const createdDate = new Date(booking.createdAt).toLocaleDateString();

  const canReview = booking.status === 'completed';
  const canContact = booking.status === 'confirmed';
  
  // Partner-specific permissions
  const canConfirm = userRole === 'partner' && booking.status === 'pending';
  const canReject = userRole === 'partner' && booking.status === 'pending';
  const canMarkComplete = userRole === 'partner' && booking.status === 'confirmed';
  
  // Customer-specific permissions
  const canCancelAsCustomer = userRole === 'customer' && (booking.status === 'pending' || booking.status === 'confirmed');

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 overflow-hidden">
      {/* Main Card Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-white">{booking.service?.name || 'Unknown Service'}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>
            
            {userRole === 'partner' && booking.customer && (
              <p className="text-gray-400 text-sm">Customer: {booking.customer.fullName}</p>
            )}
            
            {userRole === 'customer' && booking.partner?.user && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {booking.partner.user.fullName?.charAt(0) || 'P'}
                  </span>
                </div>
                <span className="text-gray-400 text-sm">{booking.partner.user.fullName}</span>
                {booking.partner.averageRating && (
                  <span className="text-yellow-400 text-sm">
                    ⭐ {booking.partner.averageRating.toFixed(1)}
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="text-right">
            <p className="text-xl font-bold text-white">{formatCurrency(booking.totalPrice)}</p>
            <p className={`text-xs ${booking.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
              {booking.paymentStatus === 'paid' ? '💳 Paid' : '⏳ Payment Pending'}
            </p>
          </div>
        </div>

        {/* Date and Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-700/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-blue-400">📅</span>
              <span className="text-sm font-medium text-gray-300">Scheduled</span>
            </div>
            <p className="text-white font-semibold">{date}</p>
            <p className="text-gray-400 text-sm">{time}</p>
          </div>
          
          <div className="bg-gray-700/50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-green-400">📍</span>
              <span className="text-sm font-medium text-gray-300">Location</span>
            </div>
            <p className="text-white text-sm">{booking.address.street}</p>
            <p className="text-gray-400 text-xs">{booking.address.city}, {booking.address.postalCode}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Partner Actions */}
          {canConfirm && onConfirmClick && (
            <Button
              size="sm"
              onClick={() => onConfirmClick(booking._id)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              ✅ Confirm Booking
            </Button>
          )}
          
          {canReject && onRejectClick && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRejectClick(booking._id)}
              className="border-red-600 text-red-400 hover:text-red-300 hover:border-red-500"
            >
              ❌ Reject Booking
            </Button>
          )}
          
          {canMarkComplete && onStatusUpdate && (
            <Button
              size="sm"
              onClick={() => onStatusUpdate(booking._id, 'completed')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              🏁 Mark Complete
            </Button>
          )}

          {/* Customer Actions */}
          {canReview && onReviewClick && (
            <Button
              size="sm"
              onClick={() => onReviewClick(booking._id)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              ⭐ Leave Review
            </Button>
          )}
          
          {canContact && onContactClick && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onContactClick(booking)}
              className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
            >
              💬 Contact {userRole === 'customer' ? 'Partner' : 'Customer'}
            </Button>
          )}
          
          {canCancelAsCustomer && onCancelClick && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCancelClick(booking._id)}
              className="border-red-600 text-red-400 hover:text-red-300 hover:border-red-500"
            >
              ❌ Cancel
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="border-gray-600 text-gray-400 hover:text-gray-300 hover:border-gray-500"
          >
            {isExpanded ? '👆 Less Details' : '👇 More Details'}
          </Button>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-gray-700 pt-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Booking ID:</span>
                <p className="text-white font-mono text-xs">{booking._id}</p>
              </div>
              <div>
                <span className="text-gray-400">Booked on:</span>
                <p className="text-white">{createdDate}</p>
              </div>
            </div>
            
            <div>
              <span className="text-gray-400 text-sm">Full Address:</span>
              <p className="text-white">
                {booking.address.street}, {booking.address.city}, {booking.address.postalCode}
              </p>
            </div>

            {/* Service Progress */}
            <div className="bg-gray-700/30 rounded-xl p-3">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Service Progress</h4>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${booking.status !== 'cancelled' ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                <span className="text-xs text-gray-400">Booked</span>
                <div className="flex-1 h-px bg-gray-600"></div>
                <div className={`w-3 h-3 rounded-full ${['confirmed', 'completed'].includes(booking.status) ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                <span className="text-xs text-gray-400">Confirmed</span>
                <div className="flex-1 h-px bg-gray-600"></div>
                <div className={`w-3 h-3 rounded-full ${booking.status === 'completed' ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                <span className="text-xs text-gray-400">Completed</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}