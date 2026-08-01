import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-[11px] font-semibold text-[var(--text-faint)] uppercase tracking-[0.12em]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 bg-[var(--bg)] border border-[var(--stroke-strong)] rounded-[0.85rem] text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/15 transition-all ${error ? 'border-[var(--danger)]' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
