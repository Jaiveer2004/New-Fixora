// Enhanced partner route protection with better user experience
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function PartnerRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not logged in - redirect to login
        router.push('/login');
      } else if (user.role !== 'partner') {
        // Logged in but not a partner - redirect to onboarding
        router.push('/partner/onboard');
      } else {
        // User is a partner, allow access
        setIsChecking(false);
      }
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth or redirecting
  if (isLoading || isChecking || !user || user.role !== 'partner') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white">
            {isLoading ? 'Loading...' : 
             !user ? 'Redirecting to login...' : 
             'Checking partner access...'}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}