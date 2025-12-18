"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface BookingFilters {
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
}

interface BookingFiltersProps {
  filters: BookingFilters;
  onFiltersChange: (filters: BookingFilters) => void;
  bookingCounts: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
}

export function BookingFilters({ filters, onFiltersChange, bookingCounts }: BookingFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Bookings', count: bookingCounts.total, color: 'bg-gray-600' },
    { value: 'pending', label: 'Pending', count: bookingCounts.pending, color: 'bg-yellow-500' },
    { value: 'confirmed', label: 'Confirmed', count: bookingCounts.confirmed, color: 'bg-blue-500' },
    { value: 'completed', label: 'Completed', count: bookingCounts.completed, color: 'bg-green-500' },
    { value: 'cancelled', label: 'Cancelled', count: bookingCounts.cancelled, color: 'bg-red-500' },
  ];

  const sortOptions = [
    { value: 'bookingDate', label: 'Booking Date' },
    { value: 'createdAt', label: 'Date Created' },
    { value: 'totalPrice', label: 'Price' },
    { value: 'status', label: 'Status' },
  ];

  const handleStatusChange = (status: string) => {
    onFiltersChange({ ...filters, status });
  };

  const handleSearchChange = (searchQuery: string) => {
    onFiltersChange({ ...filters, searchQuery });
  };

  const handleSortChange = (field: string, value: string) => {
    if (field === 'sortBy') {
      onFiltersChange({ ...filters, sortBy: value });
    } else {
      onFiltersChange({ ...filters, sortOrder: value as 'asc' | 'desc' });
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      sortBy: 'bookingDate',
      sortOrder: 'desc',
      searchQuery: ''
    });
  };

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 mb-6">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search bookings by service name, location, or booking ID..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Filter by Status</h3>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                filters.status === option.value
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${option.color}`}></div>
              {option.label}
              <span className="bg-gray-600 text-xs px-2 py-1 rounded-full">{option.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-2 transition-colors"
        >
          {isExpanded ? '👆' : '👇'} {isExpanded ? 'Less' : 'More'} Filters
        </button>
        
        {(filters.searchQuery || filters.status !== 'all' || filters.sortBy !== 'bookingDate' || filters.sortOrder !== 'desc') && (
          <Button
            size="sm"
            variant="outline"
            onClick={clearFilters}
            className="border-gray-600 text-gray-400 hover:text-white hover:border-gray-500"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange('sortBy', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort Order</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleSortChange('sortOrder', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}