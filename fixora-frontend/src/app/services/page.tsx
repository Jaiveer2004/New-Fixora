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
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <main className="container mx-auto py-8 pt-24 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-white">Explore Our Services</h1>
          <p className="text-gray-400 text-lg mb-6">Choose from our wide range of professional home services</p>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{services.length}</div>
              <div className="text-gray-400 text-sm">Services Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {services.reduce((sum, service) => sum + (service.providerCount || 0), 0)}
              </div>
              <div className="text-gray-400 text-sm">Total Providers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{categories.length - 1}</div>
              <div className="text-gray-400 text-sm">Categories</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 text-center py-12">
              <div className="text-gray-400 text-lg mb-4">
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
                  className="text-blue-400 hover:text-blue-300 underline"
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