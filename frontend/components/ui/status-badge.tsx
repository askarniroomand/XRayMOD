interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

const variants = {
  default: 'bg-white/[0.04] text-[var(--text-muted)] border border-[var(--stroke)]',
  success: 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[rgba(61,214,140,0.2)]',
  warning: 'bg-[rgba(230,180,80,0.1)] text-[var(--warn)] border border-[rgba(230,180,80,0.2)]',
  error: 'bg-[rgba(240,113,120,0.1)] text-[var(--danger)] border border-[rgba(240,113,120,0.2)]',
  info: 'bg-[rgba(108,182,255,0.1)] text-[var(--info)] border border-[rgba(108,182,255,0.2)]',
};

function getVariant(status: string): keyof typeof variants {
  const s = status.toLowerCase();
  if (s === 'active' || s === 'online' || s === 'connected') return 'success';
  if (s === 'expired' || s === 'offline' || s === 'disconnected') return 'error';
  if (s === 'pending' || s === 'warning') return 'warning';
  if (s === 'disabled' || s === 'paused') return 'default';
  return 'info';
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const v = variant || getVariant(status);
  return (
    <span
      className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide ${variants[v]}`}
    >
      {status}
    </span>
  );
}
