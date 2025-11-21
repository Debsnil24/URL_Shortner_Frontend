interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

export default function CharacterCounter({
  current,
  max,
  className = "",
}: CharacterCounterProps) {
  const getColorClass = () => {
    if (current > max) {
      return "text-red-500";
    } else if (current > max * 0.9) {
      return "text-yellow-500";
    }
    return "text-gray-400";
  };

  return (
    <div className={`flex justify-end ${className}`}>
      <span className={`text-xs ml-1 ${getColorClass()}`}>
        {current}/{max}
      </span>
    </div>
  );
}

