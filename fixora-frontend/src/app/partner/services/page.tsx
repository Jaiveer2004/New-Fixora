"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PartnerRoute } from "@/components/auth/PartnerRoutes";
import { useAuth } from "@/context/AuthContext";
import { getPartnerServices, deleteService, updateService } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { PartnerServiceCardSkeleton } from "@/components/partner/PartnerServiceCardSkeleton";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

// Define a type for our service object
interface Service {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  duration?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  bookingCount?: number;
  rating?: number;
  reviews?: number;
}

export default function PartnerServicePage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getPartnerServices();
        setServices(response.data);
      } catch (error) {
        console.error('Failed to fetch services:', error);
        const errorMessage = error instanceof Error && 'response' in error && 
          error.response && typeof error.response === 'object' && 
          'data' in error.response && error.response.data && 
          typeof error.response.data === 'object' && 'message' in error.response.data
          ? String(error.response.data.message)
          : 'Failed to load services';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchServices();
    } else if (!user && !isLoading) {
      setIsLoading(false);
    }
  }, [user, isLoading]);

  const handleToggleStatus = async (serviceId: string, currentStatus: boolean) => {
    setActionLoading(serviceId);
    try {
      await updateService(serviceId, { isActive: !currentStatus } as Partial<{
        name: string;
        description: string;
        category: string;
        price: number;
        duration: number;
        isActive?: boolean;
      }>);
      setServices(prev => prev.map(service => 
        service._id === serviceId 
          ? { ...service, isActive: !currentStatus }
          : service
      ));
    } catch (error) {
      console.error('Failed to toggle service status:', error);
      alert('Failed to update service status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteService = async (serviceId: string, serviceName: string) => {
    if (!confirm(`Are you sure you want to delete "${serviceName}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(serviceId);
    try {
      await deleteService(serviceId);
      setServices(prev => prev.filter(service => service._id !== serviceId));
    } catch (error) {
      console.error('Failed to delete service:', error);
      alert('Failed to delete service');
    } finally {
      setActionLoading(null);
    }
  };

  // Get unique categories
  const categories = ['All', ...new Set(services.map(service => service.category))];

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || 
                         (selectedStatus === 'Active' && service.isActive !== false) ||
                         (selectedStatus === 'Inactive' && service.isActive === false);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (error) {
    return (
      <PartnerRoute>
        <DashboardLayout>
          <div className="container mx-auto py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4 text-white">Your Services</h1>
              {error.includes('Partner profile not found') ? (
                <div>
                  <p className="text-gray-400 mb-4">You need to complete your partner onboarding first.</p>
                  <Link href="/partner/onboard">
                    <Button>Complete Partner Onboarding</Button>
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-red-400 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
              )}
            </div>
          </div>
        </DashboardLayout>
      </PartnerRoute>
    );
  }

  return (
    <PartnerRoute>
      <DashboardLayout>
        <div className="container mx-auto py-8 px-4 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Services</h1>
              <p className="text-gray-400 text-lg">
                Manage your service offerings and track performance
              </p>
            </div>
            <Link href="/partner/services/create">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Service
              </Button>
            </Link>
          </div>

          {/* Stats Overview */}
          {!isLoading && services.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl">📊</div>
                  <div className="text-2xl font-bold text-white">{services.length}</div>
                </div>
                <div className="text-gray-400 text-sm">Total Services</div>
              </div>
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl">✅</div>
                  <div className="text-2xl font-bold text-green-400">
                    {services.filter(s => s.isActive !== false).length}
                  </div>
                </div>
                <div className="text-gray-400 text-sm">Active Services</div>
              </div>
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl">📈</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {formatCurrency(Math.max(...services.map(s => s.price)))}
                  </div>
                </div>
                <div className="text-gray-400 text-sm">Highest Price</div>
              </div>
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl">🎯</div>
                  <div className="text-2xl font-bold text-purple-400">{categories.length - 1}</div>
                </div>
                <div className="text-gray-400 text-sm">Categories</div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          {!isLoading && services.length > 0 && (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="md:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="md:w-40">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Services Grid */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <PartnerServiceCardSkeleton key={i} />)}
            </div>
          ) : services.length > 0 ? (
            filteredServices.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map((service) => (
                  <div key={service._id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl group">
                    {/* Service Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-blue-400 transition-colors">
                          {service.name}
                        </h3>
                        <span className="text-sm text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full inline-block">
                          {service.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Edit Button */}
                        <button 
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                          title="Edit Service"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        {/* Delete Button */}
                        <button 
                          onClick={() => handleDeleteService(service._id, service.name)}
                          disabled={actionLoading === service._id}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all disabled:opacity-50"
                          title="Delete Service"
                        >
                          {actionLoading === service._id ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-400 border-t-red-400"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Service Description */}
                    {service.description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    
                    {/* Price and Duration */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-green-400">
                        {formatCurrency(service.price)}
                      </span>
                      {service.duration && (
                        <span className="text-gray-400 text-sm bg-gray-700 px-3 py-1 rounded-full">
                          {service.duration >= 60 
                            ? `${Math.floor(service.duration / 60)}h ${service.duration % 60 ? service.duration % 60 + 'm' : ''}`
                            : `${service.duration}m`
                          }
                        </span>
                      )}
                    </div>

                    {/* Service Stats */}
                    <div className="flex items-center justify-between mb-4 text-sm">
                      <div className="flex items-center gap-4">
                        {service.bookingCount !== undefined && (
                          <span className="text-gray-400">
                            📅 {service.bookingCount} bookings
                          </span>
                        )}
                        {service.rating && (
                          <span className="text-yellow-400">
                            ⭐ {service.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Status and Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${service.isActive !== false ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className={`text-sm font-medium ${service.isActive !== false ? 'text-green-400' : 'text-red-400'}`}>
                          {service.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleToggleStatus(service._id, service.isActive !== false)}
                        disabled={actionLoading === service._id}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          service.isActive !== false
                            ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30'
                            : 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/30'
                        } disabled:opacity-50`}
                      >
                        {service.isActive !== false ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>

                    {/* Created Date */}
                    {service.createdAt && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <span className="text-gray-500 text-xs">
                          Created {formatDate(service.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">
                  No services match your filters
                </div>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setSelectedStatus('All');
                  }}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Clear filters
                </button>
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🚀</div>
              <h3 className="text-2xl font-bold text-white mb-4">Ready to start earning?</h3>
              <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                Create your first service and start accepting bookings from customers in your area.
              </p>
              <Link href="/partner/services/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg">
                  Create Your First Service
                </Button>
              </Link>
            </div>
          )}
        </div>
      </DashboardLayout>
    </PartnerRoute>
  );
}