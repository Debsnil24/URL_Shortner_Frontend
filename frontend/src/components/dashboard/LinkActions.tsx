import { ShortUrl } from "@/services/api";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

interface LinkActionsProps {
  link: ShortUrl;
  isExpired: boolean;
  isPaused: boolean;
  isExpanded: boolean;
  isDeleting: boolean;
  isUpdatingStatus: boolean;
  onCopy: (code: string) => void;
  onToggleStats: (code: string) => void;
  onEdit: (link: ShortUrl) => void;
  onPauseResume: (code: string, status: "active" | "paused") => void;
  onDelete: (code: string) => void;
  onOpenQR: () => void;
  variant?: "desktop" | "mobile";
}

export default function LinkActions({
  link,
  isExpired,
  isPaused,
  isExpanded,
  isDeleting,
  isUpdatingStatus,
  onCopy,
  onToggleStats,
  onEdit,
  onPauseResume,
  onDelete,
  onOpenQR,
  variant = "desktop",
}: LinkActionsProps) {
  const isMobile = variant === "mobile";
  const buttonSize = "sm" as const;
  const baseButtonClass =
    "bg-white/5 text-gray-200 border-gray-600 hover:bg-white/10";

  return (
    <div
      className={
        isMobile
          ? "flex items-center justify-center gap-4 md:hidden"
          : "hidden gap-2 md:flex"
      }
    >
      <Button
        size={buttonSize}
        variant="bordered"
        isIconOnly={isMobile}
        className={baseButtonClass}
        startContent={
          !isMobile ? (
            <Icon icon="mdi:content-copy" className="w-4 h-4" />
          ) : undefined
        }
        onPress={() => onCopy(link.short_code)}
      >
        {!isMobile ? (
          "Copy"
        ) : (
          <Icon icon="mdi:content-copy" className="w-4 h-4" />
        )}
      </Button>
      <Button
        size={buttonSize}
        variant="bordered"
        color="primary"
        isIconOnly={isMobile}
        startContent={
          !isMobile ? (
            <Icon icon="mdi:chart-line" className="w-4 h-4" />
          ) : undefined
        }
        onPress={() => onToggleStats(link.short_code)}
      >
        {!isMobile ? (
          isExpanded ? (
            "Hide stats"
          ) : (
            "View stats"
          )
        ) : (
          <Icon icon="mdi:chart-line" className="w-4 h-4" />
        )}
      </Button>
      {!isExpired && (
        <Button
          size={buttonSize}
          variant="bordered"
          isIconOnly
          className={baseButtonClass}
          onPress={onOpenQR}
        >
          <Icon icon="mdi:qrcode" className="w-4 h-4" />
        </Button>
      )}
      <Button
        size={buttonSize}
        color="warning"
        variant="bordered"
        isIconOnly={isMobile}
        startContent={
          !isMobile ? <Icon icon="mdi:pencil" className="w-4 h-4" /> : undefined
        }
        onPress={() => onEdit(link)}
      >
        {!isMobile ? "Edit" : <Icon icon="mdi:pencil" className="w-4 h-4" />}
      </Button>
      {!isExpired && (
        <Button
          size={buttonSize}
          color={isPaused ? "success" : "secondary"}
          variant="bordered"
          isIconOnly
          isLoading={isUpdatingStatus}
          isDisabled={isUpdatingStatus}
          onPress={() =>
            onPauseResume(link.short_code, isPaused ? "active" : "paused")
          }
        >
          <Icon
            icon={isPaused ? "mdi:play" : "mdi:pause"}
            className="w-4 h-4"
          />
        </Button>
      )}
      <Button
        size={buttonSize}
        color="danger"
        variant="flat"
        isIconOnly={isMobile}
        isLoading={isDeleting}
        startContent={
          !isMobile ? (
            <Icon icon="mdi:trash-can" className="w-4 h-4" />
          ) : undefined
        }
        onPress={() => onDelete(link.short_code)}
      >
        {!isMobile ? (
          "Delete"
        ) : (
          <Icon icon="mdi:trash-can" className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
