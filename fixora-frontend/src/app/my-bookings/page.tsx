"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getUserBookings, cancelBooking, confirmBooking, rejectBooking, updateBookingStatus } from "@/services/apiService";
import { createChatRoom, getChatRooms } from "@/services/chatService";
import { useEffect, useState, useMemo } from "react";
import { ReviewModal } from "@/components/reviews/ReviewModal";
import { BookingCardSkeleton } from "@/components/booking/BookingCardSkeleton";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { EnhancedBookingCard } from "@/components/booking/EnhancedBookingCard";
import { BookingFilters } from "@/components/booking/BookingFilters";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Booking {
  _id: string;
  service: {
    name: string;
    _id: string;
  };
  partner?: {
    _id?: string;
    user: {
      _id?: string;
      fullName: string;
      profilePicture?: string;
    };
    averageRating?: number;
  };
  customer?: {
    _id?: string;
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

interface BookingFilters {
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
}

export default function MyBookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedChatRoom, setSelectedChatRoom] = useState<{
    roomId: string;
    bookingId: string;
    partnerName: string;
    customerName: string;
  } | null>(null);
  
  const [filters, setFilters] = useState<BookingFilters>({
    status: 'all',
    sortBy: 'bookingDate',
    sortOrder: 'desc',
    searchQuery: ''
  });

  const fetchBookings = async () => {
    try {
      const response = await getUserBookings();
      setBookings(response.data);
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter and sort bookings
  const filteredAndSortedBookings = useMemo(() => {
    let filtered = [...bookings];

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.service.name.toLowerCase().includes(query) ||
        booking.address.city.toLowerCase().includes(query) ||
        booking.address.street.toLowerCase().includes(query) ||
        booking._id.toLowerCase().includes(query) ||
        (booking.partner?.user.fullName.toLowerCase().includes(query)) ||
        (booking.customer?.fullName.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[filters.sortBy as keyof Booking];
      const bValue = b[filters.sortBy as keyof Booking];

      if (filters.sortBy === 'bookingDate' || filters.sortBy === 'createdAt') {
        const aTime = new Date(aValue as string).getTime();
        const bTime = new Date(bValue as string).getTime();
        return filters.sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
      }

      if (filters.sortBy === 'totalPrice') {
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        return filters.sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
      }

      if (filters.sortOrder === 'asc') {
        return (aValue ?? '') > (bValue ?? '') ? 1 : -1;
      } else {
        return (aValue ?? '') < (bValue ?? '') ? 1 : -1;
      }
    });

    return filtered;
  }, [bookings, filters]);

  // Calculate booking counts for filters
  const bookingCounts = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }), [bookings]);

  const handleOpenModal = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setSelectedBookingId(null);
    setIsModalOpen(false);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(bookingId);
        toast.success('Booking cancelled successfully');
        fetchBookings();
      } catch (error) {
        toast.error('Failed to cancel booking');
      }
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to confirm this booking?')) {
      try {
        await confirmBooking(bookingId);
        toast.success('Booking confirmed successfully');
        fetchBookings();
      } catch (error) {
        toast.error('Failed to confirm booking');
        toast.error('Failed to confirm booking');
      }
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    const reason = window.prompt('Please provide a reason for rejecting this booking (optional):');
    if (window.confirm('Are you sure you want to reject this booking?')) {
      try {
        await rejectBooking(bookingId, reason || undefined);
        toast.success('Booking rejected successfully');
        fetchBookings();
      } catch (error) {
        toast.error('Failed to reject booking');
      }
    }
  };

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    const confirmMessage = `Are you sure you want to mark this booking as ${status}?`;
    if (window.confirm(confirmMessage)) {
      try {
        await updateBookingStatus(bookingId, status);
        toast.success(`Booking status updated to ${status} successfully`);
        fetchBookings();
      } catch (error) {
        toast.error('Failed to update booking status');
      }
    }
  };

  const handleContactClick = async (booking: Booking) => {
    try {
      // Check if a chat room already exists for this booking
      const roomsResponse = await getChatRooms();
      const existingRoom = roomsResponse.data.chatRooms?.find(
        (room: { bookingId: { _id: string } }) => room.bookingId._id === booking._id
      );

      if (existingRoom) {
        // Open existing chat room
        const partner = existingRoom.participants.find((p: { role: string }) => p.role === 'partner');
        const customer = existingRoom.participants.find((p: { role: string }) => p.role === 'customer');
        
        setSelectedChatRoom({
          roomId: existingRoom._id,
          bookingId: booking._id,
          partnerName: partner?.userId?.fullName || 'Partner',
          customerName: customer?.userId?.fullName || 'Customer',
        });
      } else {
        // Create new chat room - backend will automatically add participants from booking
        const createResponse = await createChatRoom({
          bookingId: booking._id,
          participants: [], // Not used by backend, but required by interface
        });

        const newRoom = createResponse.data.chatRoom;
        const partner = newRoom.participants.find((p: { role: string }) => p.role === 'partner');
        const customer = newRoom.participants.find((p: { role: string }) => p.role === 'customer');

        setSelectedChatRoom({
          roomId: newRoom._id,
          bookingId: booking._id,
          partnerName: partner?.userId?.fullName || 'Partner',
          customerName: customer?.userId?.fullName || 'Customer',
        });
      }
    } catch (error: unknown) {
      // Type guard for axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; debug?: unknown } } };
        toast.error(axiosError.response?.data?.message || 'Failed to open chat. Please try again.');
      } else {
        toast.error('Failed to open chat. Please try again.');
      }
    }
  };

  const handleFiltersChange = (newFilters: BookingFilters) => {
    setFilters(newFilters);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="container mx-auto py-8 px-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">My Bookings</h1>
              <p className="text-gray-400 mt-1">
                {isLoading ? 'Loading...' : `${filteredAndSortedBookings.length} of ${bookings.length} bookings`}
              </p>
            </div>
            
            {!isLoading && bookings.length > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-400">Last updated</p>
                <p className="text-white font-medium">{new Date().toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {isLoading ? (
            <>
              {/* Loading Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-2xl p-4 border border-gray-700 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-6 bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
              
              {/* Loading Filters */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 animate-pulse">
                <div className="h-12 bg-gray-700 rounded-xl mb-4"></div>
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 w-20 bg-gray-700 rounded-xl"></div>
                  ))}
                </div>
              </div>

              {/* Loading Cards */}
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <BookingCardSkeleton key={i} />
                ))}
              </div>
            </>
          ) : bookings.length === 0 ? (
            // Empty State
            <div className="text-center py-16">
              <div className="bg-gray-800 rounded-2xl p-12 border border-gray-700 max-w-md mx-auto">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-xl font-semibold text-white mb-2">No Bookings Yet</h2>
                <p className="text-gray-400 mb-6">
                  {user?.role === 'customer' 
                    ? "You haven't made any bookings yet. Start by exploring our services!"
                    : "You haven't received any bookings yet. Make sure your services are active and visible."
                  }
                </p>
                <button 
                  onClick={() => window.location.href = user?.role === 'customer' ? '/services' : '/partner/services'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                >
                  {user?.role === 'customer' ? 'Browse Services' : 'Manage Services'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <BookingSummary bookings={bookings} userRole={user?.role} />

              {/* Filters */}
              <BookingFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                bookingCounts={bookingCounts}
              />

              {/* Results */}
              {filteredAndSortedBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 max-w-md mx-auto">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-white mb-2">No Results Found</h3>
                    <p className="text-gray-400 mb-4">
                      No bookings match your current filters. Try adjusting your search criteria.
                    </p>
                    <button 
                      onClick={() => setFilters({
                        status: 'all',
                        sortBy: 'bookingDate',
                        sortOrder: 'desc',
                        searchQuery: ''
                      })}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedBookings.map(booking => (
                    <EnhancedBookingCard
                      key={booking._id}
                      booking={booking}
                      userRole={user?.role}
                      onReviewClick={handleOpenModal}
                      onCancelClick={handleCancelBooking}
                      onContactClick={handleContactClick}
                      onConfirmClick={handleConfirmBooking}
                      onRejectClick={handleRejectBooking}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </DashboardLayout>

      {isModalOpen && selectedBookingId && (
        <ReviewModal
          bookingId={selectedBookingId}
          onClose={handleCloseModal}
          onReviewSubmit={() => {
            fetchBookings();
            handleCloseModal();
          }}
        />
      )}

      {selectedChatRoom && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            <ChatRoom
              roomId={selectedChatRoom.roomId}
              bookingId={selectedChatRoom.bookingId}
              partnerName={selectedChatRoom.partnerName}
              customerName={selectedChatRoom.customerName}
              onClose={() => setSelectedChatRoom(null)}
            />
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}