"use client";

import { useAuthSimple as useAuth } from "@/hooks/useAuthSimple";
import { Spinner } from "@heroui/react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  // If not authenticated, show fallback or redirect
  if (!isAuthenticated) {
    return fallback || null;
  }

  // If authenticated, render children
  return <>{children}</>;
}
