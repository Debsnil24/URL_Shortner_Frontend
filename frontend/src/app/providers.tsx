"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { HeroUIProvider, ToastProvider } from "@heroui/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <ToastProvider />
      <AuthProvider>{children}</AuthProvider>
    </HeroUIProvider>
  );
}
