"use client";

import { apiService } from "@/services/api";
import { useStore } from "@/store/useStore";
import { toastBus } from "@/utils/toastUtils";
import { createContext, useCallback, useContext, useEffect } from "react";

// Create AuthContext
interface AuthContextType {
  isAuthenticated: boolean;
  user: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  handleGoogleAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    isAuthenticated,
    user,
    setAuthenticated,
    setUser,
    setLoading,
    isLoading,
  } = useStore();

  // Auth check function
  const checkAuth = useCallback(async () => {
    setLoading(true);
    console.log("AuthProvider: Checking authentication...");

    try {
      // Always check authentication by calling /auth/me
      // This will work with both localStorage user data and HttpOnly cookies
      const response = await apiService.getCurrentUser();

      if (response.success && response.data) {
        console.log(
          "AuthProvider: Authentication successful",
          response.data.email
        );
        setAuthenticated(true);
        setUser(response.data);
        // Update stored user data with fresh data from server
        localStorage.setItem("sniply_user", JSON.stringify(response.data));

        // If we were in an OAuth flow but didn't get explicit ?oauth=success, still show success
        if (toastBus.popPendingOauth()) {
          toastBus.setAuthSuccess("oauth");
        }
      } else {
        console.log("AuthProvider: No valid authentication found");
        // No valid authentication, clear any stale data
        if (isAuthenticated) {
          // Treat as session expired if we were previously authenticated
          toastBus.setSessionExpired();
        }
        localStorage.removeItem("sniply_user");
        setAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("AuthProvider: Auth check failed:", error);
      // Clear any stale data on auth failure
      if (isAuthenticated) {
        // mark session expired; Landing page will show toast
        toastBus.setSessionExpired();
      }
      localStorage.removeItem("sniply_user");
      setAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setAuthenticated, setUser, setLoading, isAuthenticated]);

  // Run auth check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]); // Run only once on mount

  // Periodic revalidation every 5 minutes, paused when tab hidden
  useEffect(() => {
    let intervalId: number | undefined;

    const start = () => {
      // Run immediately once when (re)starting
      checkAuth();
      // Then schedule every 5 minutes
      intervalId = window.setInterval(() => {
        if (document.visibilityState === "visible") {
          checkAuth();
        }
      }, 5 * 60 * 1000);
    };

    const stop = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        start();
      } else {
        stop();
      }
    };

    // Initialize depending on current visibility
    if (document.visibilityState === "visible") {
      start();
    }

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      stop();
    };
  }, [checkAuth]);

  // Listen for user data changes (for cross-tab authentication)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sniply_user") {
        if (e.newValue) {
          // User data was added/updated, re-validate
          checkAuth();
        } else {
          // User data was removed, clear auth state
          setAuthenticated(false);
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [checkAuth, setAuthenticated, setUser]);

  // Auth methods
  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      const response = await apiService.login({ email, password });

      if (response.success && response.data) {
        // Set authentication state
        console.log(
          "Login successful, setting auth state:",
          response.data.user
        );
        setAuthenticated(true);
        setUser(response.data.user);
        console.log("Auth state set, isAuthenticated should be true now");

        // Emit success to be consumed on Dashboard
        toastBus.setAuthSuccess("login");

        return { success: true };
      } else {
        // Graceful failure: return structured error without throwing
        return {
          success: false,
          error: response.error?.message || response.message || "Login failed",
        };
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => {
    setLoading(true);

    try {
      const response = await apiService.register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });

      if (response.success && response.data) {
        // Set authentication state
        setAuthenticated(true);
        setUser(response.data.user);

        // Emit success to be consumed on Dashboard
        const firstName =
          response.data.user?.first_name || response.data.user?.name || "";
        toastBus.setAuthSuccess("signup", firstName);

        return { success: true };
      } else {
        return {
          success: false,
          error: response.error?.message || response.message || "Signup failed",
        };
      }
    } catch (error: unknown) {
      console.error("Signup error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Signup failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Emit logout success to be consumed on Landing page
      toastBus.setLogoutSuccess();
      localStorage.removeItem("sniply_user");
      setAuthenticated(false);
      setUser(null);
    }
  };

  const handleGoogleAuth = () => {
    // Mark pending OAuth so we can decide later if success toast should fire
    toastBus.setPendingOauth();
    window.location.href = apiService.getGoogleAuthUrl();
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    login,
    signup,
    logout,
    handleGoogleAuth,
  };

  // Debug logging to see if context values are updating
  console.log("AuthProvider context values:", {
    isAuthenticated,
    user: user?.email,
    isLoading,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
