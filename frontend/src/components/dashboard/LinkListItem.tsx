import { ShortUrl, UrlStats } from "@/services/api";
import { resolveShortUrl } from "@/utils/urlUtils";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { memo, useEffect, useState } from "react";
import LinkStatsPanel from "./LinkStatsPanel";

function formatExpirationTimeCompact(expiresAt: string | null | undefined): {
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
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
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

interface LinkListItemProps {
  link: ShortUrl;
  stats?: {
    loading: boolean;
    error?: string;
    data?: UrlStats;
  };
  isExpanded: boolean;
  isDeleting: boolean;
  onCopy: (code: string) => void;
  onToggleStats: (code: string) => void;
  onDelete: (code: string) => void;
}

function LinkListItem({
  link,
  stats,
  isExpanded,
  isDeleting,
  onCopy,
  onToggleStats,
  onDelete,
}: LinkListItemProps) {
  const [expirationText, setExpirationText] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!link.expires_at) {
      setExpirationText("");
      setIsExpired(false);
      return;
    }

    const updateCountdown = () => {
      const result = formatExpirationTimeCompact(link.expires_at);
      setExpirationText(result.text);
      setIsExpired(result.isExpired);
    };

    // Update immediately
    updateCountdown();

    // Determine update interval based on time remaining
    let intervalMs: number;
    try {
      const expirationDate = new Date(link.expires_at);
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
  }, [link.expires_at]);

  return (
    <div className="py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm text-primary">
            <a
              href={resolveShortUrl(link.short_code)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-primary underline break-all"
            >
              {resolveShortUrl(link.short_code)}
            </a>
            <span className="bg-gray-700/60 px-2 py-0.5 rounded-full text-xs text-gray-300">
              {link.short_code}
            </span>
          </div>
          <p className="text-sm text-gray-400 truncate mt-1">
            {link.original_url}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-2">
            <span className="flex items-center gap-1">
              <Icon icon="mdi:cursor-default-click" className="w-3.5 h-3.5" />
              {link.click_count} clicks
            </span>
            {expirationText && (
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  isExpired
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                }`}
              >
                <Icon icon="mdi:clock-outline" className="w-3.5 h-3.5" />
                {expirationText}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="bordered"
            className="bg-white/5 text-gray-200 border-gray-600 hover:bg-white/10"
            startContent={<Icon icon="mdi:content-copy" className="w-4 h-4" />}
            onPress={() => onCopy(link.short_code)}
          >
            Copy
          </Button>
          <Button
            size="sm"
            variant="bordered"
            color="primary"
            startContent={<Icon icon="mdi:chart-line" className="w-4 h-4" />}
            onPress={() => onToggleStats(link.short_code)}
          >
            {isExpanded ? "Hide stats" : "View stats"}
          </Button>
          <Button
            size="sm"
            color="danger"
            variant="flat"
            isLoading={isDeleting}
            onPress={() => onDelete(link.short_code)}
            startContent={<Icon icon="mdi:trash-can" className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 rounded-lg border border-gray-700 bg-gray-900/50 p-4">
          <LinkStatsPanel
            loading={stats?.loading ?? false}
            error={stats?.error}
            data={stats?.data}
          />
        </div>
      )}
    </div>
  );
}

export default memo(LinkListItem);
