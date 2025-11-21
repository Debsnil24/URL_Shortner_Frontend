import { memo } from "react";
import StatCard from "./StatCard";

interface StatsCardsProps {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
}

function StatsCards({ totalLinks, totalClicks, activeLinks }: StatsCardsProps) {
  const cards = [
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
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          icon={card.icon}
          color={card.color}
        />
      ))}
    </div>
  );
}

export default memo(StatsCards);
