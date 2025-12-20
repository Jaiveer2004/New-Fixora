"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAllServices } from '@/services/apiService';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceCardSkeleton } from '@/components/services/ServiceCardSkeleton';
import { Navbar } from '@/components/shared/Navbar';

// Updated Service interface for grouped services
interface Service {
  _id: string;
  name: string;
  category: string;
  price: number;
  duration?: number;
  providerCount?: number;
  reviewCount?: number;
  averageRating?: number;
  sampleProvider?: {
    name: string;
    rating: number;
  };
}

export default function ServicesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Redirect partners to their services page
  useEffect(() => {
    if (!authLoading && user?.role === 'partner') {
      router.push('/partner/services');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Only fetch services for customers or non-authenticated users
    if (!authLoading && user?.role !== 'partner') {
      const fetchAllServices = async () => {
        try {
          const response = await getAllServices();
          setServices(response.data);
        } catch (error) {
          console.error("Failed to fetch services:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAllServices();
    }
  }, [authLoading, user]);

  // Show loading while checking auth or if partner is being redirected
  if (authLoading || (user?.role === 'partner')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white">
            {authLoading ? 'Loading...' : 'Redirecting to your services...'}
          </div>
        </div>
      </div>
    );
  }

  // Get unique categories
  const categories = ['All', ...new Set(services.map(service => service.category))];

  // Filter services based on search and category
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <main className="container mx-auto py-6 sm:py-8 pt-20 sm:pt-24 px-4">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 text-white">Explore Our Services</h1>
          <p className="text-gray-500 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">Choose from our wide range of professional home services</p>
          
          {/* Search and Filter - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-800 bg-black text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-700 text-base"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-800 bg-black text-white focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-gray-700 text-base appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats - Mobile Optimized */}
          <div className="flex flex-wrap gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex-1 min-w-[100px] text-center bg-black/50 rounded-lg p-3 sm:p-4 border border-gray-900">
              <div className="text-xl sm:text-2xl font-bold text-white">{services.length}</div>
              <div className="text-gray-500 text-xs sm:text-sm">Services Available</div>
            </div>
            <div className="flex-1 min-w-[100px] text-center bg-black/50 rounded-lg p-3 sm:p-4 border border-gray-900">
              <div className="text-xl sm:text-2xl font-bold text-white">
                {services.reduce((sum, service) => sum + (service.providerCount || 0), 0)}
              </div>
              <div className="text-gray-500 text-xs sm:text-sm">Total Providers</div>
            </div>
            <div className="flex-1 min-w-[100px] text-center bg-black/50 rounded-lg p-3 sm:p-4 border border-gray-900">
              <div className="text-xl sm:text-2xl font-bold text-white">{categories.length - 1}</div>
              <div className="text-gray-500 text-xs sm:text-sm">Categories</div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            // Show 8 skeleton cards while loading
            Array.from({ length: 8 }).map((_, i) => <ServiceCardSkeleton key={i} />)
          ) : filteredServices.length > 0 ? (
            // Show the real service cards once loaded
            filteredServices.map(service => (
              <ServiceCard key={service._id} service={service} />
            ))
          ) : (
            // Show a helpful message if no services are found
            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 text-center py-12">
              <div className="text-gray-400 text-base sm:text-lg mb-4">
                {searchTerm || selectedCategory !== 'All' 
                  ? 'No services match your criteria' 
                  : 'No services available at the moment'
                }
              </div>
              {(searchTerm || selectedCategory !== 'All') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                  }}
                  className="text-blue-400 hover:text-blue-300 underline text-base touch-feedback"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}