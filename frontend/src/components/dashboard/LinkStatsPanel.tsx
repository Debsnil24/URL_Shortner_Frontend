import { UrlStats } from "@/services/api";
import { Spinner } from "@heroui/react";
import { memo } from "react";
import StatItem from "./StatItem";

interface LinkStatsPanelProps {
  loading: boolean;
  error?: string;
  data?: UrlStats;
}

function LinkStatsPanel({ loading, error, data }: LinkStatsPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Spinner size="sm" color="primary" />
        <span>Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  if (!data) {
    return <p className="text-gray-400 text-sm">No analytics available yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
      <StatItem label="Short code" value={data.short_code} />
      <StatItem
        label="Original URL"
        value={data.original_url}
        isLink
        href={data.original_url}
      />
      <StatItem label="Total clicks" value={data.click_count} />
      <StatItem label="Unique visits" value={data.unique_visitors} />
      <StatItem
        label="Last visit at"
        value={
          data.last_visit_at
            ? new Date(data.last_visit_at).toLocaleString()
            : "No visits recorded"
        }
      />
      <StatItem
        label="Last visitor agent"
        value={data.last_visit_user_agent || "Unknown"}
      />
    </div>
  );
}

export default memo(LinkStatsPanel);
