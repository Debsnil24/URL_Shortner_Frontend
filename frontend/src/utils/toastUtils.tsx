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
    const normalized = typeof firstName === "string" ? firstName.trim() : "";
    const hasName = normalized.length > 0;
    addToast({
      title: "Account Created!",
      color: "success",
      description: hasName
        ? `Welcome ${normalized}! Your account has been created successfully.`
        : "Welcome! Your account has been created successfully.",
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
// Toast bus helpers (BroadcastChannel + sessionStorage fallback)
// ================================

const AUTH_SUCCESS_KEY = "toast:authSuccess"; // value: { type: "login"|"signup"|"oauth", firstName?: string }
const LOGOUT_SUCCESS_KEY = "toast:logoutSuccess"; // value: "true"
const SESSION_EXPIRED_KEY = "toast:sessionExpired"; // value: "true"
const PENDING_OAUTH_KEY = "toast:pendingOauth"; // value: "true"

type AuthSuccessType = "login" | "signup" | "oauth";

type ToastBusEvent =
  | {
      type: "authSuccess";
      payload: { variant: AuthSuccessType; firstName?: string };
    }
  | { type: "logoutSuccess" }
  | { type: "sessionExpired" };

type ToastBusListener = (event: ToastBusEvent) => void;

const listeners = new Set<ToastBusListener>();
const CHANNEL_NAME = "sniply:toast-bus";
const CLIENT_ID =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

type BroadcastPayload = ToastBusEvent & { __origin?: string };

const getBroadcastChannel = () => {
  if (typeof window === "undefined") return null;
  if (!("BroadcastChannel" in window)) return null;
  return new BroadcastChannel(CHANNEL_NAME);
};

const broadcastChannel = getBroadcastChannel();

const emitEvent = (event: ToastBusEvent, skipBroadcast = false) => {
  listeners.forEach((listener) => listener(event));
  if (!skipBroadcast && broadcastChannel) {
    const payload: BroadcastPayload = { ...event, __origin: CLIENT_ID };
    broadcastChannel.postMessage(payload);
  }
};

broadcastChannel?.addEventListener(
  "message",
  (event: MessageEvent<BroadcastPayload>) => {
    const payload = event.data;
    if (!payload || payload.__origin === CLIENT_ID) {
      return;
    }
    const { __origin: _origin, ...rest } = payload;
    emitEvent(rest, true);
  }
);

const persistAuthSuccess = (type: AuthSuccessType, firstName?: string) => {
  if (typeof window === "undefined") return;
  const payload = { type, firstName };
  sessionStorage.setItem(AUTH_SUCCESS_KEY, JSON.stringify(payload));
};

const persistFlag = (key: string) => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, "true");
};

const clearFlag = (key: string) => {
  if (typeof window === "undefined") return false;
  const exists = sessionStorage.getItem(key) === "true";
  if (exists) {
    sessionStorage.removeItem(key);
  }
  return exists;
};

export const toastBus = {
  // Setters
  setAuthSuccess: (type: AuthSuccessType, firstName?: string) => {
    persistAuthSuccess(type, firstName);
    emitEvent({ type: "authSuccess", payload: { variant: type, firstName } });
  },
  setLogoutSuccess: () => {
    persistFlag(LOGOUT_SUCCESS_KEY);
    emitEvent({ type: "logoutSuccess" });
  },
  setSessionExpired: () => {
    persistFlag(SESSION_EXPIRED_KEY);
    emitEvent({ type: "sessionExpired" });
  },

  // Listener management
  subscribe: (listener: ToastBusListener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
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
    return clearFlag(LOGOUT_SUCCESS_KEY);
  },
  popSessionExpired: (): boolean => {
    return clearFlag(SESSION_EXPIRED_KEY);
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
