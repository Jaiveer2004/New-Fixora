"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BookingForm } from "@/components/booking/BookingForm";
import { BookingPageSkeleton } from "@/components/booking/BookingPageSkeleton";
import { getServiceById, getServiceProviders, createPaymentOrder, verifyPayment } from "@/services/apiService";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useState, use } from "react";
import { Navbar } from "@/components/shared/Navbar";
import toast from "react-hot-toast";

interface Service {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  duration?: number;
  partner: {
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
  };
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
  reviewCount?: number;
}

interface BookingDetails {
  bookingDate: string;
  bookingTime?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  notes?: string;
  serviceId?: string;
  providerId?: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string | undefined;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill: {
    name: string | undefined;
    email: string | undefined;
  };
  theme: {
    color: string;
  };
}

export default function BookServicePage({ params }: { params: Promise<{ serviceId: string }> }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProviders, setShowProviders] = useState(false);
  
  // Use React.use() to unwrap the params Promise
  const resolvedParams = use(params);
  const serviceId = resolvedParams.serviceId;

  // Redirect partners - they can't book services, only provide them
  useEffect(() => {
    if (!authLoading && user?.role === 'partner') {
      router.push('/partner/services');
      toast.error('Partners cannot book services. You can only provide services.');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!serviceId) {
      console.log("No serviceId provided");
      return;
    }

    // Wait for auth to load before making API calls
    if (authLoading) {
      console.log("Still loading authentication...");
      return;
    }

    // Only customers can book services
    if (user?.role === 'partner') {
      console.log("Partner detected, redirecting...");
      return;
    }

    console.log("User authentication status:", { user, authLoading });

    const fetchServiceData = async () => {
      try {
        console.log("Fetching service with ID:", serviceId);
        
        // First fetch service details
        const serviceResponse = await getServiceById(serviceId);
        console.log("Service fetched successfully:", serviceResponse.data);
        setService(serviceResponse.data);
        
        // Auto-select the service's original partner if available
        if (serviceResponse.data.partner) {
          setSelectedProvider(serviceResponse.data.partner);
          console.log("Auto-selected provider:", serviceResponse.data.partner);
        }

        // Then fetch providers using the service name
        try {
          console.log("Fetching providers for service:", serviceResponse.data.name);
          const providersResponse = await getServiceProviders(encodeURIComponent(serviceResponse.data.name));
          console.log("Providers fetched:", providersResponse.data);
          setProviders(providersResponse.data || []);
        } catch (providerError) {
          console.warn("Failed to fetch providers:", providerError);
          // Don't fail the whole page if providers can't be fetched
          // Just use the service's original partner
          setProviders(serviceResponse.data.partner ? [serviceResponse.data.partner] : []);
        }
      } catch (err) {
        console.error("Service fetch error:", err);
        
        // More detailed error logging
        if (err && typeof err === 'object' && 'response' in err) {
          const apiError = err as { response?: { status?: number; data?: unknown } };
          console.error("API Error Status:", apiError.response?.status);
          console.error("API Error Data:", apiError.response?.data);
          
          if (apiError.response?.status === 404) {
            toast.error("Service not found. It may have been removed or doesn't exist.");
          } else if (apiError.response?.status === 401) {
            toast.error("Please log in to view service details.");
          } else {
            const errorData = apiError.response?.data as { message?: string } | undefined;
            toast.error(`Failed to load service: ${errorData?.message || 'Unknown error'}`);
          }
        } else {
          toast.error("Failed to load service details. Please check your connection.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServiceData();
  }, [serviceId, user, authLoading]);

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

  const handleBookingSubmit = async (bookingDetails: BookingDetails) => {
    if (!service) return toast.error("Service details not loaded.");
    if (!selectedProvider) return toast.error("Please select a service provider.");

    const toastId = toast.loading("Preparing your booking...");

    try {
      // Step 1: Create the Razorpay order
      const orderResponse = await createPaymentOrder(serviceId);
      const order = orderResponse.data;
      toast.dismiss(toastId);

      // Step 2: Open Razorpay checkout
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Fixora",
        description: `Payment for ${service.name}`,
        order_id: order.id,
        handler: async function (response: RazorpayResponse) {
          // Step 3: Verify payment and create booking
          const verificationToast = toast.loading("Verifying payment...");
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingDetails: {
                ...bookingDetails,
                serviceId: serviceId,
                providerId: selectedProvider._id
              }
            });
            toast.success("Booking confirmed!", { id: verificationToast });
            router.push('/my-bookings');
          } catch (error) {
            console.error("Payment verification failed:", error);
            const errorMessage = error instanceof Error && 'response' in error && 
              error.response && typeof error.response === 'object' && 
              'data' in error.response && error.response.data && 
              typeof error.response.data === 'object' && 'message' in error.response.data
              ? String(error.response.data.message)
              : "Payment verification failed!";
            toast.error(errorMessage, { id: verificationToast });
          }
        },
        prefill: {
          name: user?.fullName,
          email: user?.email,
        },
        theme: {
          color: "#3399cc"
        }
      };

      const rzp = new (window as unknown as { Razorpay: new (options: RazorpayOptions) => { open: () => void } }).Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Failed to create order:", error);
      const errorMessage = error instanceof Error && 'response' in error && 
        error.response && typeof error.response === 'object' && 
        'data' in error.response && error.response.data && 
        typeof error.response.data === 'object' && 'message' in error.response.data
        ? String(error.response.data.message)
        : "Could not create payment order. Please try again.";
      toast.error(errorMessage, { id: toastId });
    }
  };

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

  if (isLoading) return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="pt-16">
          <BookingPageSkeleton />
        </div>
      </div>
    </ProtectedRoute>
  );
  
  if (!service) return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="min-h-screen bg-gray-900 text-center py-10 pt-24 text-white">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-4">Service Not Found</h2>
            <p className="text-gray-400 mb-6">The service you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <button 
              onClick={() => router.push('/services')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium"
            >
              Browse All Services
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />
        
        <main className="container mx-auto py-8 pt-24 px-4">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
              <button onClick={() => router.back()} className="hover:text-white">
                ← Back
              </button>
              <span>/</span>
              <span>{service.category}</span>
              <span>/</span>
              <span className="text-white">{service.name}</span>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Service Details */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 mb-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h1 className="text-4xl font-bold text-white mb-2">{service.name}</h1>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full border border-blue-600/30">
                          {service.category}
                        </span>
                        {service.duration && (
                          <span className="text-gray-400 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDuration(service.duration)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-400 mb-1">
                        {formatCurrency(service.price)}
                      </div>
                      <div className="text-gray-400 text-sm">per service</div>
                    </div>
                  </div>

                  {service.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Service Description</h3>
                      <p className="text-gray-300 leading-relaxed">{service.description}</p>
                    </div>
                  )}

                  {/* Provider Selection */}
                  {providers.length > 1 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Choose Your Service Provider</h3>
                        <button
                          onClick={() => setShowProviders(!showProviders)}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                        >
                          {showProviders ? 'Hide Options' : `View All ${providers.length} Providers`}
                        </button>
                      </div>

                      {showProviders && (
                        <div className="grid gap-4 mb-4">
                          {providers.map((provider) => (
                            <div
                              key={provider._id}
                              onClick={() => setSelectedProvider(provider)}
                              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                selectedProvider?._id === provider._id
                                  ? 'border-blue-500 bg-blue-500/10'
                                  : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    {provider.user.fullName.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-white">{provider.user.fullName}</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                      {provider.experienceYears && (
                                        <span>{provider.experienceYears} years exp.</span>
                                      )}
                                      {provider.averageRating && (
                                        <span className="flex items-center gap-1">
                                          <span className="text-yellow-400">★</span>
                                          {provider.averageRating.toFixed(1)}
                                        </span>
                                      )}
                                      <div className={`w-2 h-2 rounded-full ${provider.isOnline ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                                      <span>{provider.isOnline ? 'Online' : 'Offline'}</span>
                                    </div>
                                  </div>
                                </div>
                                {selectedProvider?._id === provider._id && (
                                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              {provider.bio && (
                                <p className="text-gray-400 text-sm mt-2 line-clamp-2">{provider.bio}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedProvider && (
                        <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {selectedProvider.user.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-white">Selected: {selectedProvider.user.fullName}</div>
                              <div className="text-sm text-gray-400">
                                {selectedProvider.experienceYears && `${selectedProvider.experienceYears} years experience • `}
                                {selectedProvider.averageRating ? `★ ${selectedProvider.averageRating.toFixed(1)}` : 'New provider'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Default provider info */}
                  {providers.length <= 1 && selectedProvider && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Your Service Provider</h3>
                      <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {selectedProvider.user.fullName.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-lg">{selectedProvider.user.fullName}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                              {selectedProvider.experienceYears && (
                                <span>{selectedProvider.experienceYears} years experience</span>
                              )}
                              {selectedProvider.averageRating && (
                                <span className="flex items-center gap-1">
                                  <span className="text-yellow-400">★</span>
                                  {selectedProvider.averageRating.toFixed(1)} rating
                                </span>
                              )}
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${selectedProvider.isOnline ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                                <span>{selectedProvider.isOnline ? 'Online now' : 'Offline'}</span>
                              </div>
                            </div>
                            {selectedProvider.bio && (
                              <p className="text-gray-300 text-sm">{selectedProvider.bio}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Form */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <BookingForm
                    service={service}
                    selectedProvider={selectedProvider}
                    onFormSubmit={handleBookingSubmit}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}