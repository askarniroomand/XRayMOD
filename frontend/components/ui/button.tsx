import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variants = {
  primary:
    'bg-[var(--accent)] hover:brightness-110 text-[#06140e] font-semibold shadow-[0_8px_24px_-12px_rgba(61,214,140,0.55)]',
  secondary:
    'border border-[var(--stroke-strong)] bg-white/[0.02] text-[var(--text)] hover:bg-white/[0.05]',
  danger: 'bg-[var(--danger)]/90 hover:bg-[var(--danger)] text-white font-semibold',
  ghost: 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.04]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-[0.8rem]',
  lg: 'px-6 py-3 text-sm rounded-[0.9rem]',
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
