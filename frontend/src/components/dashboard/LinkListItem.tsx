import { useExpirationCountdown } from "@/hooks/useExpirationCountdown";
import { ShortUrl, UrlStats } from "@/services/api";
import { memo, useState } from "react";
import LinkActions from "./LinkActions";
import LinkInfo from "./LinkInfo";
import LinkStatsPanel from "./LinkStatsPanel";
import QRCodeModal from "./QRCodeModal";

interface LinkListItemProps {
  link: ShortUrl;
  stats?: {
    loading: boolean;
    error?: string;
    data?: UrlStats;
  };
  isExpanded: boolean;
  isDeleting: boolean;
  isUpdatingStatus?: boolean;
  onCopy: (code: string) => void;
  onToggleStats: (code: string) => void;
  onEdit: (link: ShortUrl) => void;
  onPauseResume: (code: string, status: "active" | "paused") => void;
  onDelete: (code: string) => void;
}

function LinkListItem({
  link,
  stats,
  isExpanded,
  isDeleting,
  isUpdatingStatus = false,
  onCopy,
  onToggleStats,
  onEdit,
  onPauseResume,
  onDelete,
}: LinkListItemProps) {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Get status from link, default to "active" if not provided
  const linkStatus = link.status || "active";
  const isPaused = linkStatus === "paused";

  // Use expiration countdown hook
  const { expirationText, isExpired } = useExpirationCountdown(link.expires_at);

  return (
    <div className="py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <LinkInfo
          link={link}
          expirationText={expirationText}
          isExpired={isExpired}
          isPaused={isPaused}
        />
        <LinkActions
          link={link}
          isExpired={isExpired}
          isPaused={isPaused}
          isExpanded={isExpanded}
          isDeleting={isDeleting}
          isUpdatingStatus={isUpdatingStatus}
          onCopy={onCopy}
          onToggleStats={onToggleStats}
          onEdit={onEdit}
          onPauseResume={onPauseResume}
          onDelete={onDelete}
          onOpenQR={() => setIsQRModalOpen(true)}
          variant="desktop"
        />
        <LinkActions
          link={link}
          isExpired={isExpired}
          isPaused={isPaused}
          isExpanded={isExpanded}
          isDeleting={isDeleting}
          isUpdatingStatus={isUpdatingStatus}
          onCopy={onCopy}
          onToggleStats={onToggleStats}
          onEdit={onEdit}
          onPauseResume={onPauseResume}
          onDelete={onDelete}
          onOpenQR={() => setIsQRModalOpen(true)}
          variant="mobile"
        />
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

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        link={link}
      />
    </div>
  );
}

export default memo(LinkListItem);
