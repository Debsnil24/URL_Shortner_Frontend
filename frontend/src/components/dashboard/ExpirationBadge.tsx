import { Icon } from "@iconify/react/dist/iconify.js";

interface ExpirationBadgeProps {
  text: string;
  isExpired: boolean;
}

export default function ExpirationBadge({ text, isExpired }: ExpirationBadgeProps) {
  if (!text) return null;

  return (
    <span
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isExpired
          ? "bg-red-500/20 text-red-400 border border-red-500/30"
          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
      }`}
    >
      <Icon icon="mdi:clock-outline" className="w-3.5 h-3.5" />
      {text}
    </span>
  );
}

