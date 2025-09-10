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
  }, [setAuthenticated, setUser, setLoading]);

  // Run auth check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]); // Run only once on mount

  // Listen for localStorage changes (for cross-tab authentication)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sniply_auth") {
        // Token was added/updated, re-validate
        checkAuth();
      } else if (e.key === "sniply_auth" && !e.newValue) {
        // Token was removed, clear auth state
        setAuthenticated(false);
        setUser(null);
      }
    };

    // Listen for custom auth token set event (for OAuth flow)
    const handleAuthTokenSet = () => {
      console.log("Auth token set event received, re-checking authentication");
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-token-set", handleAuthTokenSet);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-token-set", handleAuthTokenSet);
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
      localStorage.removeItem("sniply_auth");
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
