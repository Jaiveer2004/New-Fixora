"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getServiceProviders } from '@/services/apiService';
import { Navbar } from '@/components/shared/Navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

interface Provider {
  id: string;
  name: string;
  profilePicture?: string;
  bio: string;
  email: string;
  phone?: string;
  isOnline: boolean;
  averageRating: number;
  reviewCount: number;
  totalBookingsToday: number;
  isAvailable: boolean;
  nextAvailableSlot: string;
  recentReviews: Array<{
    _id: string;
    rating: number;
    comment: string;
    customer: {
      fullName: string;
    };
  }>;
}

interface ServiceProvider {
  serviceId: string;
  serviceName: string;
  description: string;
  price: number;
  duration: number;
  provider: Provider;
}

interface ServiceProvidersResponse {
  serviceName: string;
  totalProviders: number;
  availableProviders: number;
  providers: ServiceProvider[];
}

// Professional service provider placeholder images
const getProviderImage = (name: string, index: number) => {
  // Generate consistent placeholder images for service providers
  const colors = [
    "#6366f1", "#10b981", "#f59716", "#ec4899", 
    "#8b5cf6", "#06b6d4", "#ef4444", "#84cc16"
  ];
  
  const color = colors[index % colors.length];
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="75" cy="75" r="75" fill="${color}"/>
      <text x="75" y="85" font-family="Arial" font-size="36" font-weight="bold" fill="white" text-anchor="middle">${initials}</text>
    </svg>
  `)}`;
};

export default function ServiceProvidersPage({ params }: { params: Promise<{ serviceName: string }> }) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [serviceData, setServiceData] = useState<ServiceProvidersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);

  const resolvedParams = use(params);
  const serviceName = decodeURIComponent(resolvedParams.serviceName);

  // Redirect partners to their services page
  useEffect(() => {
    if (!authLoading && user?.role === 'partner') {
      router.push('/partner/services');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Only fetch providers for customers or non-authenticated users
    if (!authLoading && user?.role !== 'partner') {
      const fetchProviders = async () => {
        try {
          const response = await getServiceProviders(serviceName);
          setServiceData(response.data);
        } catch (error) {
          console.error("Failed to fetch service providers:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProviders();
    }
  }, [serviceName, authLoading, user]);

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

  const availableProviders = serviceData?.providers.filter(p => p.provider.isAvailable) || [];
  const offlineProviders = serviceData?.providers.filter(p => !p.provider.isAvailable) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 pt-24 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <p className="text-gray-600 mb-6">The service you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/services">
            <Button>Back to Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 pt-24">
          <div className="flex items-center gap-2 text-gray-500 mb-2 text-sm">
            <Link href="/services" className="hover:text-purple-600">Services</Link>
            <span>→</span>
            <span>{serviceName}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{serviceName}</h1>
              <p className="text-gray-600 mt-1">Choose from {serviceData.totalProviders} verified professionals</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Starting from</div>
              <div className="text-2xl font-bold text-green-600">
                ₹{Math.min(...serviceData.providers.map(p => p.price))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Available Now Section */}
            {availableProviders.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Available Now ({availableProviders.length})
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {availableProviders.map((service, index) => (
                    <div 
                      key={service.serviceId}
                      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 p-6"
                    >
                      <div className="flex items-start gap-4">
                        {/* Provider Image */}
                        <div className="relative">
                          <Image
                            src={getProviderImage(service.provider.name, index)}
                            alt={service.provider.name}
                            width={80}
                            height={80}
                            className="rounded-full object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>

                        {/* Provider Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{service.provider.name}</h3>
                              <p className="text-gray-600 text-sm">{service.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  {service.provider.averageRating.toFixed(1)}
                                </span>
                                <span>({service.provider.reviewCount} reviews)</span>
                                <span>{service.duration} min duration</span>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">₹{service.price}</div>
                              <div className="text-sm text-gray-500">per service</div>
                            </div>
                          </div>

                          {/* Recent Review */}
                          {service.provider.recentReviews.length > 0 && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <svg key={i} className={`w-3 h-3 ${
                                      i < service.provider.recentReviews[0].rating ? 'text-yellow-400' : 'text-gray-300'
                                    } fill-current`} viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-sm font-medium text-gray-700">{service.provider.recentReviews[0].customer.fullName}</span>
                              </div>
                              <p className="text-sm text-gray-600">{service.provider.recentReviews[0].comment}</p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-3 mt-4">
                            <Button 
                              className="bg-purple-600 hover:bg-purple-700 text-white px-6"
                              onClick={() => setSelectedProvider(service)}
                            >
                              View Details
                            </Button>
                            <Link href={`/book/${service.serviceId}`}>
                              <Button 
                                variant="outline" 
                                className="border-purple-600 text-purple-600 hover:bg-purple-50"
                              >
                                Book Now
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Offline Providers Section */}
            {offlineProviders.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  All Professionals ({offlineProviders.length})
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offlineProviders.map((service, index) => (
                    <div 
                      key={service.serviceId}
                      className="bg-white rounded-lg shadow-sm border p-4 opacity-75"
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={getProviderImage(service.provider.name, index + availableProviders.length)}
                          alt={service.provider.name}
                          width={60}
                          height={60}
                          className="rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{service.provider.name}</h3>
                          <p className="text-sm text-gray-600">{service.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-yellow-600">⭐ {service.provider.averageRating.toFixed(1)}</span>
                            <span className="text-sm text-gray-500">₹{service.price}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">Next: {service.provider.nextAvailableSlot}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Types of {serviceName}</h3>
              
              {/* Service Types */}
              <div className="space-y-3">
                {Array.from(new Set(serviceData.providers.map(p => p.serviceName))).slice(0, 6).map((serviceType, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{serviceType}</div>
                        <div className="text-sm text-gray-500">
                          {serviceData.providers.filter(p => p.serviceName === serviceType).length} professionals
                        </div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>

              {/* Quick Book Section */}
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Quick Book</h4>
                <p className="text-sm text-purple-700 mb-3">Get instant booking for available professionals</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Book Instantly
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Detail Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Image
                    src={getProviderImage(selectedProvider.provider.name, 0)}
                    alt={selectedProvider.provider.name}
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedProvider.provider.name}</h3>
                    <p className="text-gray-600">{selectedProvider.description}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-medium">{selectedProvider.provider.averageRating.toFixed(1)}</span>
                      <span className="text-gray-500">({selectedProvider.provider.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedProvider(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Provider Bio */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                <p className="text-gray-600">{selectedProvider.provider.bio}</p>
              </div>

              {/* Service Details */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Service Details</h4>
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium text-gray-900">{selectedProvider.serviceName}</h5>
                      <p className="text-sm text-gray-600">{selectedProvider.duration} minutes</p>
                    </div>
                    <span className="font-semibold text-gray-900">₹{selectedProvider.price}</span>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              {selectedProvider.provider.recentReviews.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Recent Reviews</h4>
                  <div className="space-y-3">
                    {selectedProvider.provider.recentReviews.slice(0, 3).map((review, index) => (
                      <div key={index} className="border-l-4 border-blue-200 pl-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{review.customer.fullName}</span>
                          <span className="text-yellow-500">⭐ {review.rating}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Link href={`/book/${selectedProvider.serviceId}`} className="flex-1">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Book This Professional
                  </Button>
                </Link>
                <Button variant="outline" className="border-purple-600 text-purple-600">
                  Contact
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}