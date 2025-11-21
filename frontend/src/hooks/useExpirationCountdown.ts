import { formatExpirationTimeCompact } from "@/utils/dateUtils";
import { useEffect, useState } from "react";

/**
 * Hook for managing expiration countdown with live updates
 */
export function useExpirationCountdown(expiresAt: string | null | undefined) {
  const [expirationText, setExpirationText] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) {
      setExpirationText("");
      setIsExpired(false);
      return;
    }

    const updateCountdown = () => {
      const result = formatExpirationTimeCompact(expiresAt);
      setExpirationText(result.text);
      setIsExpired(result.isExpired);
    };

    // Update immediately
    updateCountdown();

    // Determine update interval based on time remaining
    let intervalMs: number;
    try {
      const expirationDate = new Date(expiresAt);
      const now = new Date();
      const diffMs = expirationDate.getTime() - now.getTime();
      const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
      const totalMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMs < 0) {
        // Already expired, no need to update
        return;
      } else if (totalHours < 1) {
        // Less than 1 hour: update every 1 minute for accurate reading
        intervalMs = 60 * 1000; // 1 minute
      } else if (totalHours < 24) {
        // Less than 1 day: update every 5 minutes
        intervalMs = 5 * 60 * 1000;
      } else {
        // More than 1 day: update every hour (or rely on re-renders from URL calls)
        intervalMs = 60 * 60 * 1000;
      }
    } catch {
      // If date parsing fails, don't set up interval
      return;
    }

    // Set up interval for live updates
    const intervalId = setInterval(updateCountdown, intervalMs);

    // Cleanup on unmount or when expires_at changes
    return () => {
      clearInterval(intervalId);
    };
  }, [expiresAt]);

  return { expirationText, isExpired };
}

