// Component to redirect users based on their role and current page access

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface RoleRedirectProps {
  allowedRoles: string[];
  redirectPath?: string;
  children: React.ReactNode;
}

export function RoleRedirect({ 
  allowedRoles, 
  redirectPath = '/dashboard', 
  children 
}: RoleRedirectProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      if (!allowedRoles.includes(user.role)) {
        setIsRedirecting(true);
        // Redirect based on user role
        if (user.role === 'partner') {
          router.push('/dashboard');
        } else if (user.role === 'customer') {
          router.push('/services');
        } else {
          router.push(redirectPath);
        }
      }
    }
  }, [user, isLoading, allowedRoles, redirectPath, router]);

  // Show loading while checking or redirecting
  if (isLoading || isRedirecting || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white">
            {isLoading ? 'Loading...' : 
             !user ? 'Authenticating...' : 
             'Redirecting...'}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}