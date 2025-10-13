import { addToast } from "@heroui/react";

// Toast utility functions for different authentication scenarios
export const authToasts = {
  // Success toasts (shown on dashboard)
  loginSuccess: () => {
    addToast({
      title: "Welcome Back!",
      color: "success",
      description: "You have successfully signed in.",
    });
  },

  signupSuccess: (firstName: string) => {
    addToast({
      title: "Account Created!",
      color: "success",
      description: `Welcome ${firstName}! Your account has been created successfully.`,
    });
  },

  googleAuthSuccess: () => {
    addToast({
      title: "Welcome!",
      color: "success",
      description: "You have successfully signed in with Google.",
    });
  },

  // Error toasts (shown on main landing page)
  loginFailed: (error: string) => {
    addToast({
      title: "Login Failed",
      color: "danger",
      description: error,
    });
  },

  signupFailed: (error: string) => {
    addToast({
      title: "Signup Failed",
      color: "danger",
      description: error,
    });
  },

  // Session timeout (shown on main landing page)
  sessionExpired: () => {
    addToast({
      title: "Session Expired",
      color: "secondary",
      description: "Your session has expired. Please sign in again.",
    });
  },

  // Logout success (shown on main landing page)
  logoutSuccess: () => {
    addToast({
      title: "Logged Out",
      color: "danger",
      description: "You have been successfully logged out.",
    });
  },

  logoutError: () => {
    addToast({
      title: "Logout Error",
      color: "danger",
      description:
        "There was an issue logging out, but you have been signed out locally.",
    });
  },

  // Google auth redirect
  googleAuthRedirect: () => {
    addToast({
      title: "Redirecting to Google",
      color: "primary",
      description: "Please complete authentication with Google.",
    });
  },
};

// ================================
// Toast bus helpers (sessionStorage)
// ================================

// Keys
const AUTH_SUCCESS_KEY = "toast:authSuccess"; // value: { type: "login"|"signup"|"oauth", firstName?: string }
const LOGOUT_SUCCESS_KEY = "toast:logoutSuccess"; // value: "true"
const SESSION_EXPIRED_KEY = "toast:sessionExpired"; // value: "true"
const PENDING_OAUTH_KEY = "toast:pendingOauth"; // value: "true"

type AuthSuccessType = "login" | "signup" | "oauth";

export const toastBus = {
  // Setters
  setAuthSuccess: (type: AuthSuccessType, firstName?: string) => {
    if (typeof window === "undefined") return;
    const payload = { type, firstName };
    sessionStorage.setItem(AUTH_SUCCESS_KEY, JSON.stringify(payload));
  },
  setLogoutSuccess: () => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(LOGOUT_SUCCESS_KEY, "true");
  },
  setSessionExpired: () => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(SESSION_EXPIRED_KEY, "true");
  },

  // Poppers (read-once semantics)
  popAuthSuccess: (): { type: AuthSuccessType; firstName?: string } | null => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(AUTH_SUCCESS_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(AUTH_SUCCESS_KEY);
    try {
      return JSON.parse(raw) as { type: AuthSuccessType; firstName?: string };
    } catch {
      return null;
    }
  },
  popLogoutSuccess: (): boolean => {
    if (typeof window === "undefined") return false;
    const exists = sessionStorage.getItem(LOGOUT_SUCCESS_KEY) === "true";
    if (exists) sessionStorage.removeItem(LOGOUT_SUCCESS_KEY);
    return exists;
  },
  popSessionExpired: (): boolean => {
    if (typeof window === "undefined") return false;
    const exists = sessionStorage.getItem(SESSION_EXPIRED_KEY) === "true";
    if (exists) sessionStorage.removeItem(SESSION_EXPIRED_KEY);
    return exists;
  },
  // Pending OAuth helpers
  setPendingOauth: () => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(PENDING_OAUTH_KEY, "true");
  },
  popPendingOauth: (): boolean => {
    if (typeof window === "undefined") return false;
    const exists = sessionStorage.getItem(PENDING_OAUTH_KEY) === "true";
    if (exists) sessionStorage.removeItem(PENDING_OAUTH_KEY);
    return exists;
  },
  clearPendingOauth: () => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(PENDING_OAUTH_KEY);
  },
};
