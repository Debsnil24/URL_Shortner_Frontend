"use client";

import { useAuthSimple as useAuth } from "@/hooks/useAuthSimple";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({
  children,
  requireAuth = true,
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Redirect to home page if authentication is required but user is not authenticated
        router.push("/");
      } else if (!requireAuth && isAuthenticated) {
        // Redirect to dashboard if user is authenticated but trying to access public pages
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router]);

  // Don't render anything while checking authentication
  if (isLoading) {
    return null;
  }

  // Don't render if auth state doesn't match requirements
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
