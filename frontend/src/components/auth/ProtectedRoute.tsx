"use client";

import { useAuth } from "@/components/auth/AuthProvider";
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

  // Debug logging to see what ProtectedRoute is receiving
  console.log("ProtectedRoute values:", { isAuthenticated, isLoading });

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
