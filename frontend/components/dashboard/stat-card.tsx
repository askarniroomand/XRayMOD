import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'emerald' | 'blue' | 'amber' | 'rose' | 'violet';
  trend?: { value: string; positive: boolean };
}

const colorMap = {
  emerald: {
    text: 'text-emerald-400',
    light: 'bg-emerald-500/10',
    bar: 'bg-emerald-500',
    glow: 'shadow-emerald-500/10',
  },
  blue: {
    text: 'text-blue-400',
    light: 'bg-blue-500/10',
    bar: 'bg-blue-500',
    glow: 'shadow-blue-500/10',
  },
  amber: {
    text: 'text-amber-400',
    light: 'bg-amber-500/10',
    bar: 'bg-amber-500',
    glow: 'shadow-amber-500/10',
  },
  rose: {
    text: 'text-rose-400',
    light: 'bg-rose-500/10',
    bar: 'bg-rose-500',
    glow: 'shadow-rose-500/10',
  },
  violet: {
    text: 'text-violet-400',
    light: 'bg-violet-500/10',
    bar: 'bg-violet-500',
    glow: 'shadow-violet-500/10',
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'emerald',
  trend,
}: StatCardProps) {
  const c = colorMap[color];
  return (
    <div
      className={`glass rounded-2xl p-5 relative overflow-hidden shadow-xl ${c.glow} transition-transform hover:-translate-y-0.5`}
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${c.bar}`} />
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-zinc-400 font-medium">{title}</span>
        <div className={`p-2 rounded-xl ${c.light}`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
      </div>
      <div className="text-2xl font-black tracking-tight tabular-nums">{value}</div>
      <div className="flex items-center gap-2 mt-1.5">
        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
        {trend && (
          <span
            className={`text-[10px] font-bold ${
              trend.positive ? 'text-emerald-400' : 'text-rose-400'
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
