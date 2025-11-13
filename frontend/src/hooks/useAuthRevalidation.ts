import { useEffect, useRef } from "react";

interface UseAuthRevalidationOptions {
  /**
   * Interval in milliseconds between auth checks when the tab is visible.
   * Defaults to 5 minutes.
   */
  intervalMs?: number;
  /**
   * Whether the revalidation loop should run. Defaults to true.
   */
  enabled?: boolean;
  /**
   * Run a check immediately on mount before the interval kicks in.
   * Defaults to true.
   */
  runOnMount?: boolean;
}

/**
 * Periodically invokes the provided `checkAuth` callback while the document is visible.
 * Uses visibility events to avoid running in the background and ensures that only a single
 * interval is active even if visibility toggles rapidly.
 */
export function useAuthRevalidation(
  checkAuth: () => void | Promise<void>,
  options?: UseAuthRevalidationOptions
) {
  const { intervalMs = 5 * 60 * 1000, enabled = true, runOnMount = true } =
    options ?? {};

  const checkAuthRef = useRef(checkAuth);
  const hasRunInitiallyRef = useRef(false);
  const lastCheckTimeRef = useRef<number | null>(null);

  useEffect(() => {
    checkAuthRef.current = checkAuth;
  }, [checkAuth]);

  useEffect(() => {
    if (!enabled || typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    let intervalId: number | null = null;

    const runCheck = () => {
      checkAuthRef.current?.();
      lastCheckTimeRef.current = Date.now();
    };

    const startInterval = () => {
      if (intervalId !== null) {
        return;
      }
      intervalId = window.setInterval(() => {
        if (document.visibilityState === "visible") {
          runCheck();
        }
      }, intervalMs);
    };

    const stopInterval = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Only run check if significant time has passed since last check
        const now = Date.now();
        const timeSinceLastCheck = lastCheckTimeRef.current
          ? now - lastCheckTimeRef.current
          : Infinity;

        // Only refresh if at least the interval time has passed
        if (timeSinceLastCheck >= intervalMs) {
          runCheck();
        }
        hasRunInitiallyRef.current = true;
        startInterval();
      } else {
        stopInterval();
      }
    };

    if (runOnMount && !hasRunInitiallyRef.current) {
      hasRunInitiallyRef.current = true;
      runCheck();
    }

    if (document.visibilityState === "visible") {
      if (!hasRunInitiallyRef.current && !runOnMount) {
        hasRunInitiallyRef.current = true;
        runCheck();
      }
      startInterval();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopInterval();
    };
  }, [enabled, intervalMs, runOnMount]);
}

