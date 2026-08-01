import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'emerald' | 'blue' | 'amber' | 'rose' | 'violet';
  trend?: { value: string; positive: boolean };
}

const tone: Record<NonNullable<StatCardProps['color']>, { icon: string; wash: string }> = {
  emerald: { icon: 'text-[var(--accent)]', wash: 'bg-[var(--accent-soft)]' },
  blue: { icon: 'text-[var(--info)]', wash: 'bg-[rgba(108,182,255,0.12)]' },
  amber: { icon: 'text-[var(--warn)]', wash: 'bg-[rgba(230,180,80,0.12)]' },
  rose: { icon: 'text-[var(--danger)]', wash: 'bg-[rgba(240,113,120,0.12)]' },
  violet: { icon: 'text-[#b4a0ff]', wash: 'bg-[rgba(180,160,255,0.12)]' },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'emerald',
  trend,
}: StatCardProps) {
  const c = tone[color];
  return (
    <div className="stat-tile">
      <div className="flex items-start justify-between gap-3 mb-4">
        <span className="text-[12px] font-medium text-[var(--text-muted)] tracking-wide">{title}</span>
        <div className={`p-2 rounded-xl ${c.wash}`}>
          <Icon className={`w-4 h-4 ${c.icon}`} strokeWidth={1.75} />
        </div>
      </div>
      <div className="font-display text-[1.65rem] font-bold tracking-tight tabular leading-none">
        {value}
      </div>
      <div className="flex items-center gap-2 mt-2.5">
        {subtitle && <p className="text-[11px] text-[var(--text-faint)]">{subtitle}</p>}
        {trend && (
          <span
            className={`text-[10px] font-semibold ${
              trend.positive ? 'text-[var(--accent)]' : 'text-[var(--danger)]'
            }`}
          >
            {trend.positive ? '+' : ''}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
