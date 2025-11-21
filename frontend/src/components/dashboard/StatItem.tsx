import { memo } from "react";

interface StatItemProps {
  label: string;
  value: string | number;
  isLink?: boolean;
  href?: string;
}

export default memo(function StatItem({
  label,
  value,
  isLink = false,
  href,
}: StatItemProps) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      {isLink && href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline break-all"
        >
          {value}
        </a>
      ) : (
        <p className="font-semibold text-white break-words">{value}</p>
      )}
    </div>
  );
});

