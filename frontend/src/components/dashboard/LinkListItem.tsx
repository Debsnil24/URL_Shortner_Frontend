import { memo } from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { ShortUrl, UrlStats } from "@/services/api";
import { resolveShortUrl } from "@/utils/urlUtils";
import LinkStatsPanel from "./LinkStatsPanel";

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
              <Icon
                icon="mdi:cursor-default-click"
                className="w-3.5 h-3.5"
              />
              {link.click_count} clicks
            </span>
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

