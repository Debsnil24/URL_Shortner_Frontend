import { ShortUrl } from "@/services/api";
import { resolveShortUrl } from "@/utils/urlUtils";
import { Icon } from "@iconify/react/dist/iconify.js";
import ExpirationBadge from "./ExpirationBadge";
import StatusBadge from "./StatusBadge";

interface LinkInfoProps {
  link: ShortUrl;
  expirationText: string;
  isExpired: boolean;
  isPaused: boolean;
}

export default function LinkInfo({
  link,
  expirationText,
  isExpired,
  isPaused,
}: LinkInfoProps) {
  return (
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
      <p className="text-sm text-gray-400 truncate mt-1">{link.original_url}</p>
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-2">
        <span className="flex items-center gap-1">
          <Icon icon="mdi:cursor-default-click" className="w-3.5 h-3.5" />
          {link.click_count} clicks
        </span>
        <ExpirationBadge text={expirationText} isExpired={isExpired} />
        <StatusBadge isPaused={isPaused} isExpired={isExpired} />
      </div>
    </div>
  );
}

