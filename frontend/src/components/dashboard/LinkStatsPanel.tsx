import { memo } from "react";
import { Spinner } from "@heroui/react";
import { UrlStats } from "@/services/api";

interface LinkStatsPanelProps {
  loading: boolean;
  error?: string;
  data?: UrlStats;
}

function LinkStatsPanel({
  loading,
  error,
  data,
}: LinkStatsPanelProps) {
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
    return (
      <p className="text-gray-400 text-sm">No analytics available yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
      <div>
        <p className="text-gray-500">Short code</p>
        <p className="font-semibold text-white">{data.short_code}</p>
      </div>
      <div>
        <p className="text-gray-500">Original URL</p>
        <a
          href={data.original_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline break-all"
        >
          {data.original_url}
        </a>
      </div>
      <div>
        <p className="text-gray-500">Total clicks</p>
        <p className="font-semibold text-white">{data.click_count}</p>
      </div>
      <div>
        <p className="text-gray-500">Unique visits</p>
        <p className="font-semibold text-white">{data.total_visits}</p>
      </div>
      <div>
        <p className="text-gray-500">Last visit at</p>
        <p className="font-semibold text-white">
          {data.last_visit_at
            ? new Date(data.last_visit_at).toLocaleString()
            : "No visits recorded"}
        </p>
      </div>
      <div>
        <p className="text-gray-500">Last visitor agent</p>
        <p className="font-semibold text-white break-words">
          {data.last_visit_user_agent || "Unknown"}
        </p>
      </div>
    </div>
  );
}

export default memo(LinkStatsPanel);

