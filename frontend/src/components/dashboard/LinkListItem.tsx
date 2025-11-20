import { ShortUrl, UrlStats } from "@/services/api";
import { resolveShortUrl } from "@/utils/urlUtils";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { memo, useMemo } from "react";
import LinkStatsPanel from "./LinkStatsPanel";

function formatExpirationTime(expiresAt: string | null | undefined): string {
  if (!expiresAt) return "";

  try {
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    const diffMs = expirationDate.getTime() - now.getTime();

    if (diffMs < 0) {
      return "Expired";
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 365) {
      const years = Math.floor(diffDays / 365);
      return `Expires in ${years} year${years !== 1 ? "s" : ""}`;
    } else if (diffDays > 30) {
      const months = Math.floor(diffDays / 30);
      return `Expires in ${months} month${months !== 1 ? "s" : ""}`;
    } else if (diffDays > 0) {
      return `Expires in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    } else if (diffHours > 0) {
      return `Expires in ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
    } else if (diffMinutes > 0) {
      return `Expires in ${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
    } else {
      return "Expires soon";
    }
  } catch (error) {
    return "";
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
  const expirationText = useMemo(
    () => formatExpirationTime(link.expires_at),
    [link.expires_at]
  );

  const isExpired = useMemo(() => {
    if (!link.expires_at) return false;
    try {
      return new Date(link.expires_at).getTime() < new Date().getTime();
    } catch {
      return false;
    }
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
