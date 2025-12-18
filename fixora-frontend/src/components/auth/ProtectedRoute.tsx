// Enhanced protected route component with better UX and loading states

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({children}: {children: React.ReactNode}) {
  const {user, isLoading} = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login
    if (!isLoading && !user) {
      setIsRedirecting(true);
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // While loading, user checking, or redirecting, show loading screen
  if (isLoading || isRedirecting || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white">
            {isLoading ? 'Loading...' : 
             !user ? 'Redirecting to login...' : 
             'Authenticating...'}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}