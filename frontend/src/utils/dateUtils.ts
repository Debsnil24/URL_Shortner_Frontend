/**
 * Date and time utility functions
 */

import { CustomTimeInputs } from "@/components/dashboard/CustomTimeInputs";
import { EMPTY_CUSTOM_TIME, ExpirationPreset } from "./expirationConstants";

export function formatExpirationTimeCompact(expiresAt: string | null | undefined): {
  text: string;
  isExpired: boolean;
} {
  if (!expiresAt) {
    return { text: "", isExpired: false };
  }

  try {
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    const diffMs = expirationDate.getTime() - now.getTime();

    if (diffMs < 0) {
      return { text: "Expired", isExpired: true };
    }

    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    const years = Math.floor(totalDays / 365);
    const remainingDaysAfterYears = totalDays % 365;
    const months = Math.floor(remainingDaysAfterYears / 30);
    const days = remainingDaysAfterYears % 30;
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    // Format: 4y:3M:20D, 3M:20D, 1D:12H, 1H:20min, 20min
    const parts: string[] = [];

    // If >= 30 days (approximately 1 month), show years, months, days (no hours/minutes)
    if (totalDays >= 30) {
      if (years > 0) {
        parts.push(`${years}y`);
      }
      if (months > 0) {
        parts.push(`${months}M`);
      }
      if (days > 0) {
        parts.push(`${days}D`);
      }
    }
    // If >= 1 day but < 30 days, show days and hours (1D:12H)
    else if (totalDays >= 1) {
      parts.push(`${totalDays}D`);
      if (hours > 0) {
        parts.push(`${hours}H`);
      }
    }
    // If >= 1 hour but < 1 day, show hours and minutes (1H:20min)
    else if (totalHours >= 1) {
      parts.push(`${totalHours}H`);
      if (minutes > 0) {
        parts.push(`${minutes}min`);
      }
    }
    // If < 1 hour, show only minutes (20min)
    else if (totalMinutes > 0) {
      parts.push(`${totalMinutes}min`);
    }

    // If no parts, it's expiring very soon
    if (parts.length === 0) {
      return { text: "Expires soon", isExpired: false };
    }

    return { text: parts.join(":"), isExpired: false };
  } catch (error) {
    return { text: "", isExpired: false };
  }
}

/**
 * Calculate expiration preset and custom time from expires_at date
 */
export function calculateExpirationFromDate(
  expiresAt: string | null | undefined
): {
  preset: ExpirationPreset;
  customTime: CustomTimeInputs;
} {
  if (!expiresAt) {
    return { preset: "default", customTime: EMPTY_CUSTOM_TIME };
  }

  try {
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    const diffMs = expirationDate.getTime() - now.getTime();

    if (diffMs < 0) {
      // Already expired, return default
      return { preset: "default", customTime: EMPTY_CUSTOM_TIME };
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // Check if it matches a preset
    const fiveYearsMs = 5 * 365 * 24 * 60 * 60 * 1000;
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;
    const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const oneDayMs = 24 * 60 * 60 * 1000;
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    const oneHourMs = 60 * 60 * 1000;

    // Check with some tolerance (within 1 hour)
    const tolerance = 60 * 60 * 1000;
    if (Math.abs(diffMs - fiveYearsMs) < tolerance) {
      return { preset: "default", customTime: EMPTY_CUSTOM_TIME };
    } else if (Math.abs(diffMs - oneYearMs) < tolerance) {
      return { preset: "1year", customTime: EMPTY_CUSTOM_TIME };
    } else if (Math.abs(diffMs - sixMonthsMs) < tolerance) {
      return { preset: "6months", customTime: EMPTY_CUSTOM_TIME };
    } else if (Math.abs(diffMs - oneMonthMs) < tolerance) {
      return { preset: "1month", customTime: EMPTY_CUSTOM_TIME };
    } else if (Math.abs(diffMs - sevenDaysMs) < tolerance) {
      return { preset: "7days", customTime: EMPTY_CUSTOM_TIME };
    } else if (Math.abs(diffMs - oneDayMs) < tolerance) {
      return { preset: "1day", customTime: EMPTY_CUSTOM_TIME };
    } else if (Math.abs(diffMs - twelveHoursMs) < tolerance) {
      return { preset: "12hours", customTime: EMPTY_CUSTOM_TIME };
    } else if (Math.abs(diffMs - oneHourMs) < tolerance) {
      return { preset: "1hour", customTime: EMPTY_CUSTOM_TIME };
    } else {
      // Calculate custom time
      const years = Math.floor(diffDays / 365);
      const remainingDaysAfterYears = diffDays % 365;
      const months = Math.floor(remainingDaysAfterYears / 30);
      const days = remainingDaysAfterYears % 30;
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      return {
        preset: "custom",
        customTime: {
          years: years > 4 ? "4" : years.toString(),
          months: months.toString(),
          days: days.toString(),
          hours: hours.toString(),
          minutes: minutes.toString(),
        },
      };
    }
  } catch {
    return { preset: "default", customTime: EMPTY_CUSTOM_TIME };
  }
}

