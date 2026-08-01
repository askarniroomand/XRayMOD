import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'emerald' | 'blue' | 'amber' | 'rose' | 'violet';
  trend?: { value: string; positive: boolean };
}

const toneMap: Record<
  NonNullable<StatCardProps['color']>,
  { icon: string; wash: string; data: string }
> = {
  emerald: { icon: 'text-[var(--accent)]', wash: 'bg-[var(--accent-soft)]', data: 'cyan' },
  blue: { icon: 'text-[var(--info)]', wash: 'bg-[rgba(94,176,255,0.12)]', data: 'info' },
  amber: { icon: 'text-[var(--warn)]', wash: 'bg-[rgba(232,184,74,0.12)]', data: 'warn' },
  rose: { icon: 'text-[var(--coral)]', wash: 'bg-[var(--coral-soft)]', data: 'coral' },
  violet: { icon: 'text-[var(--accent)]', wash: 'bg-[var(--accent-soft)]', data: 'cyan' },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'emerald',
  trend,
}: StatCardProps) {
  const c = toneMap[color];
  return (
    <div className="stat-tile" data-tone={c.data}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
          {title}
        </span>
        <div className={`p-1.5 rounded-md ${c.wash}`}>
          <Icon className={`w-3.5 h-3.5 ${c.icon}`} strokeWidth={2} />
        </div>
      </div>
      <div className="font-display text-[1.7rem] font-bold tracking-tight tabular leading-none">
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
