interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'emerald' | 'blue' | 'amber' | 'rose';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const colorMap = {
  emerald: 'bg-[var(--accent)]',
  blue: 'bg-[var(--info)]',
  amber: 'bg-[var(--warn)]',
  rose: 'bg-[var(--danger)]',
};

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-2.5',
};

export function ProgressBar({
  value,
  max = 100,
  color = 'emerald',
  size = 'sm',
  showLabel,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const barColor =
    percentage > 90 ? 'bg-[var(--danger)]' : percentage > 70 ? 'bg-[var(--warn)]' : colorMap[color];

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-[10px] font-mono text-[var(--text-faint)] mb-1">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
      <div className={`w-full bg-white/[0.06] rounded-md overflow-hidden ${sizeMap[size]}`}>
        <div
          className={`h-full ${barColor} rounded-md transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
