"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { HeroUIProvider } from "@heroui/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <AuthProvider>{children}</AuthProvider>
    </HeroUIProvider>
  );
}
