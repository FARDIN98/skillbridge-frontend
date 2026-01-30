'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/**
 * Protected Route component to guard routes based on authentication and role
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load
    if (loading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check role if specified
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // User doesn't have required role - redirect to home
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, loading, allowedRoles, redirectTo, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Not authenticated or wrong role - don't render children
  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null;
  }

  // Authenticated and has correct role - render children
  return <>{children}</>;
}
