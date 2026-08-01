import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variants = {
  primary:
    'bg-[var(--coral)] hover:brightness-110 text-white font-semibold shadow-[0_10px_28px_-14px_rgba(255,92,69,0.7)]',
  secondary:
    'border border-[var(--stroke-strong)] bg-[var(--bg-panel)] text-[var(--text)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)]',
  danger: 'bg-[var(--danger)]/90 hover:bg-[var(--danger)] text-white font-semibold',
  ghost: 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.04]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-[var(--radius)]',
  md: 'px-4 py-2.5 text-sm rounded-[var(--radius)]',
  lg: 'px-6 py-3 text-sm rounded-[var(--radius-lg)]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-45 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
