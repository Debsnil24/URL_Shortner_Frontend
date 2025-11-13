import { memo } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

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

function StatsCards({
  totalLinks,
  totalClicks,
  activeLinks,
}: StatsCardsProps) {
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
      icon: "mdi:cursor-click",
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">{card.label}</p>
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

