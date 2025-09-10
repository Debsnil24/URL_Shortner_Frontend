"use client";

import { apiService } from "@/services/api";
import { useStore } from "@/store/useStore";
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
      } else {
        console.log("AuthProvider: No valid authentication found");
        // No valid authentication, clear any stale data
        localStorage.removeItem("sniply_user");
        setAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("AuthProvider: Auth check failed:", error);
      // Clear any stale data on auth failure
      localStorage.removeItem("sniply_user");
      setAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setAuthenticated, setUser, setLoading]);

  // Run auth check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]); // Run only once on mount

  // Check auth when page becomes visible (useful for OAuth redirects)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, check auth in case OAuth just completed
        console.log("AuthProvider: Page became visible, checking auth...");
        // Add a small delay to ensure cookie is set after OAuth redirect
        setTimeout(() => {
          checkAuth();
        }, 100);
      }
    };

    const handleFocus = () => {
      // Window gained focus, check auth
      console.log("AuthProvider: Window gained focus, checking auth...");
      checkAuth();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
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

        return { success: true };
      } else {
        return {
          success: false,
          error: response.error?.message || "Login failed",
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

        return { success: true };
      } else {
        return {
          success: false,
          error: response.error?.message || "Signup failed",
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
      localStorage.removeItem("sniply_user");
      setAuthenticated(false);
      setUser(null);
    }
  };

  const handleGoogleAuth = () => {
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
