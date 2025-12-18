"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Service {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  duration?: number;
}

interface Provider {
  _id: string;
  user: {
    fullName: string;
    email?: string;
  };
  bio?: string;
  skillsAndExpertise?: string[];
  experienceYears?: number;
  averageRating?: number;
  isOnline?: boolean;
}

interface BookingDetails {
  bookingDate: string;
  bookingTime: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  notes?: string;
}

interface BookingFormProps {
  service: Service;
  selectedProvider: Provider | null;
  onFormSubmit: (details: BookingDetails) => void;
}

export function BookingForm({ service, selectedProvider, onFormSubmit }: BookingFormProps) {
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (duration: number) => {
    if (duration >= 60) {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${duration}m`;
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  // Generate time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProvider) {
      alert('Please select a service provider');
      return;
    }

    setIsLoading(true);
    try {
      await onFormSubmit({
        bookingDate: `${bookingDate}T${bookingTime}:00.000Z`,
        bookingTime,
        address: { street, city, postalCode },
        notes
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Book This Service</h2>
        <p className="text-blue-100">Fill in your details to proceed with booking</p>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Service Summary */}
        <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">{service.name}</h3>
            <span className="text-2xl font-bold text-green-400">{formatCurrency(service.price)}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded border border-blue-600/30">
              {service.category}
            </span>
            {service.duration && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDuration(service.duration)}
              </span>
            )}
          </div>
          {selectedProvider && (
            <div className="mt-3 pt-3 border-t border-gray-600">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {selectedProvider.user.fullName.charAt(0)}
                </div>
                <span className="text-gray-300">Provider: {selectedProvider.user.fullName}</span>
                {selectedProvider.isOnline && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-xs">Online</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Date
          </label>
          <Input 
            type="date" 
            value={bookingDate} 
            onChange={e => setBookingDate(e.target.value)} 
            min={today}
            required 
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Preferred Time
          </label>
          <select 
            value={bookingTime} 
            onChange={e => setBookingTime(e.target.value)} 
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a time</option>
            {timeSlots.map(time => (
              <option key={time} value={time}>
                {time} ({new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
              </option>
            ))}
          </select>
        </div>

        {/* Address Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Service Address</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Street Address
            </label>
            <Input 
              placeholder="Enter your full address" 
              value={street} 
              onChange={e => setStreet(e.target.value)} 
              required 
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City
              </label>
              <Input 
                placeholder="City" 
                value={city} 
                onChange={e => setCity(e.target.value)} 
                required 
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Postal Code
              </label>
              <Input 
                placeholder="Postal Code" 
                value={postalCode} 
                onChange={e => setPostalCode(e.target.value)} 
                required 
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Additional Notes (Optional)
          </label>
          <Textarea 
            placeholder="Any specific requirements or instructions for the service provider..."
            value={notes} 
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Pricing Summary */}
        <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-300">
              <span>Service Cost</span>
              <span>{formatCurrency(service.price)}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Platform Fee</span>
              <span>Free</span>
            </div>
            <div className="border-t border-gray-600 pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold text-white">
                <span>Total Amount</span>
                <span className="text-green-400">{formatCurrency(service.price)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          disabled={isLoading || !selectedProvider} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Processing...
            </div>
          ) : (
            `Pay ${formatCurrency(service.price)} & Book Service`
          )}
        </Button>

        {!selectedProvider && (
          <p className="text-red-400 text-sm text-center">
            Please select a service provider to proceed with booking
          </p>
        )}

        {/* Security Notice */}
        <div className="text-center text-xs text-gray-400">
          <div className="flex items-center justify-center gap-1 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure Payment</span>
          </div>
          <p>Your payment information is encrypted and secure</p>
        </div>
      </form>
    </div>
  );
}