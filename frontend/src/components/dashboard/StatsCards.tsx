import { Icon } from "@iconify/react/dist/iconify.js";
import { memo } from "react";

interface StatsCard {
  label: string;
  value: number;
  icon: string;
  color: string;
}

interface StatsCardsProps {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
}

function StatsCards({ totalLinks, totalClicks, activeLinks }: StatsCardsProps) {
  const cards: StatsCard[] = [
    {
      label: "Total Links",
      value: totalLinks,
      icon: "mdi:link",
      color: "text-blue-500",
    },
    {
      label: "Total Clicks",
      value: totalClicks,
      icon: "mdi:gesture-tap",
      color: "text-green-500",
    },
    {
      label: "Active Links",
      value: activeLinks,
      icon: "mdi:check-circle",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-gray-800/50 rounded-lg p-3 md:p-6 border border-gray-700 hover:border-gray-600 transition-colors"
        >
          {/* Mobile Layout: Compact vertical stack */}
          <div className="flex flex-col items-center gap-2 md:hidden">
            <Icon icon={card.icon} className={`w-7 h-7 ${card.color}`} />
            <p className="text-white text-xl md:text-2xl font-bold leading-tight">
              {card.value}
            </p>
            <p className="text-gray-400 text-sm font-medium text-center leading-tight">
              {card.label}
            </p>
          </div>

          {/* Desktop Layout: Horizontal with icon on right */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-gray-400 text-sm font-medium">{card.label}</p>
              <p className="text-2xl font-bold text-white">{card.value}</p>
            </div>
            <Icon icon={card.icon} className={`w-8 h-8 ${card.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(StatsCards);
