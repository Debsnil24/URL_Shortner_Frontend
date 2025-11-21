/**
 * Date and time utility functions
 */

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

