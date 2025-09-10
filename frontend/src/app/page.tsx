"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Dashboard from "@/components/dashboard/Dashboard";
import { apiService } from "@/services/api";
import { useStore } from "@/store/useStore";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

// Landing page component for unauthenticated users
function LandingPage() {
  const { setAuthDialogOpen } = useStore();

  return (
    <div
      className="font-sans flex flex-col items-center justify-center min-h-screen md:min-h-[calc(100vh-85px)]"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="flex flex-col gap-[32px] items-center sm:items-start">
        <div className="relative">
          <Image
            src="/SNIPLY.svg"
            alt="Sniply Logo"
            width={150}
            height={150}
            className="invert-100"
          />
        </div>
        <div className="font-mono text-sm/6 text-center sm:text-left">
          <p
            className="mb-2 tracking-[-.01em]"
            style={{ color: "var(--text-primary)" }}
          >
            Smarter links for a faster web.
          </p>
          <p
            className="tracking-[-.01em]"
            style={{ color: "var(--text-secondary)" }}
          >
            Create a link, share it, and track your clicks.
          </p>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Button
            variant="bordered"
            radius="full"
            className="border-1 text-gray-300 font-light text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
          >
            Learn More
          </Button>
          <Button
            variant="solid"
            color="primary"
            onPress={() => setAuthDialogOpen(true)}
            radius="full"
            endContent={
              <Icon icon="mingcute:arrow-right-fill" className="mt-0.5" />
            }
            className=" text-white gap-2 font-light text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}

// Component that handles OAuth token processing
function HomeContent() {
  const searchParams = useSearchParams();

  // Handle OAuth token and errors from URL
  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (token) {
      // Set token in localStorage and clear URL
      apiService.setToken(token);
      // Clear the token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      // Handle OAuth errors
      console.error("OAuth error:", error, errorDescription);
      // Clear the error from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // You could show a toast notification here
    }
  }, [searchParams]);

  return (
    <ProtectedRoute fallback={<LandingPage />}>
      <Dashboard />
    </ProtectedRoute>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
