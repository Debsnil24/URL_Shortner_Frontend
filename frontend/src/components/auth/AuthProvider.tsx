"use client";

import { apiService } from "@/services/api";
import { useStore } from "@/store/useStore";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    setAuthenticated,
    setUser,
    setLoading,
  } = useStore();

  // Run auth check only once at the app level
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      try {
        // Check localStorage for stored auth data
        const storedAuth = localStorage.getItem("sniply_auth");

        if (storedAuth) {
          const authData = JSON.parse(storedAuth);

          if (authData.token) {
            try {
              const response = await apiService.getCurrentUser();

              if (response.success && response.data) {
                setAuthenticated(true);
                setUser(response.data);
              } else {
                localStorage.removeItem("sniply_auth");
                localStorage.removeItem("sniply_user");
                setAuthenticated(false);
                setUser(null);
              }
            } catch (error) {
              console.error("Token validation failed:", error);
              localStorage.removeItem("sniply_auth");
              localStorage.removeItem("sniply_user");
              setAuthenticated(false);
              setUser(null);
            }
          } else {
            setAuthenticated(false);
            setUser(null);
          }
        } else {
          setAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setAuthenticated, setLoading, setUser]); // Run only once on mount

  return <>{children}</>;
}
