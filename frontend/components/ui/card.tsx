import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div
      className={`surface rounded-[var(--radius-lg)] ${padding ? 'p-5 md:p-5' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function CardHeader({ title, description, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="min-w-0">
        <h3 className="font-display font-700 text-[15px] tracking-tight text-[var(--text)] font-semibold">
          {title}
        </h3>
        {description && (
          <p className="text-[12px] text-[var(--text-muted)] mt-1 leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
