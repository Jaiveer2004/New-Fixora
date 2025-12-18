"use client";

import { Button } from "@/components/ui/button";
import { getServiceById } from "@/services/apiService";
import { ServiceDetailSkeleton } from "@/components/services/ServiceDetailSkeleton";
import { Navbar } from "@/components/shared/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, use } from "react";


interface ServiceDetails {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  partner: {
    user: { fullName: string; };
    bio: string;
  }
}

// The page component receives `params` which contains the dynamic route segments
export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [service, setService] = useState<ServiceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use React.use() to unwrap the params Promise
  const resolvedParams = use(params);
  const serviceId = resolvedParams.id;

  // Redirect partners to their services page
  useEffect(() => {
    if (!authLoading && user?.role === 'partner') {
      router.push('/partner/services');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Only fetch service details for customers or non-authenticated users
    if (!authLoading && user?.role !== 'partner') {
      const fetchService = async () => {
        try {
          const response = await getServiceById(serviceId);
          setService(response.data);
        } catch (error) {
          console.error("Failed to fetch service details:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchService();
    }
  }, [serviceId, authLoading, user]);

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

  if (isLoading) return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="pt-24">
        <ServiceDetailSkeleton />
      </div>
    </div>
  );
  
  if (!service) return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="text-center py-10 pt-24 text-white">Service not found.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <main className="container mx-auto py-8 pt-24 px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <p className="text-sm text-gray-400">{service.category}</p>
            <h1 className="text-4xl font-bold mt-2 text-white">{service.name}</h1>
            <p className="text-lg mt-4 text-gray-300">{service.description}</p>
          </div>
          <div>
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-white">Offered by</h3>
              <p className="mt-2 font-medium text-white">{service.partner.user.fullName}</p>
              <p className="text-sm text-gray-400 mt-1">{service.partner.bio}</p>
              <hr className="my-4 border-gray-600" />
              <p className="text-3xl font-bold text-center text-blue-400">₹{service.price}</p>
              <Link href={`/book/${service._id}`}>
                <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}