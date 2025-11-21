import { Icon } from "@iconify/react/dist/iconify.js";

interface StatusBadgeProps {
  isPaused: boolean;
  isExpired: boolean;
}

export default function StatusBadge({ isPaused, isExpired }: StatusBadgeProps) {
  if (isExpired) return null;

  return (
    <span
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isPaused
          ? "bg-gray-500/20 text-gray-400 border border-gray-500/30"
          : "bg-green-500/20 text-green-400 border border-green-500/30"
      }`}
    >
      <Icon
        icon={isPaused ? "mdi:pause-circle" : "mdi:play-circle"}
        className="w-3.5 h-3.5"
      />
      {isPaused ? "Paused" : "Active"}
    </span>
  );
}

