import { Icon } from "@iconify/react/dist/iconify.js";
import { memo } from "react";

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

export default memo(function StatCard({
  label,
  value,
  icon,
  color,
}: StatCardProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 md:p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      {/* Mobile Layout: Compact vertical stack */}
      <div className="flex flex-col items-center gap-2 md:hidden">
        <Icon icon={icon} className={`w-7 h-7 ${color}`} />
        <p className="text-white text-xl md:text-2xl font-bold leading-tight">
          {value}
        </p>
        <p className="text-gray-400 text-sm font-medium text-center leading-tight">
          {label}
        </p>
      </div>

      {/* Desktop Layout: Horizontal with icon on right */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-gray-400 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <Icon icon={icon} className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );
});

