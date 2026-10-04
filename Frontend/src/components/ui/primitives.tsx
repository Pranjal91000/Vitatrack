import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn('field', className)} {...props} />,
);
Input.displayName = 'Input';

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn('field appearance-none bg-[length:16px] pr-9', className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

/** Segmented control for 2–5 mutually exclusive options. */
export function Segmented<T extends string | number>({
  value, onChange, options, className, size = 'md',
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode }[];
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div role="radiogroup" className={cn('flex rounded-xl bg-raised p-1', className)}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 rounded-lg font-semibold transition-colors',
            size === 'sm' ? 'h-8 text-sm' : 'h-10 text-[15px]',
            value === o.value ? 'bg-surface text-foreground shadow-sm' : 'text-muted',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-9 shrink-0 rounded-full border px-3.5 text-sm font-medium transition-colors',
        active ? 'border-primary bg-primary text-primary-foreground' : 'border-line bg-surface text-foreground',
      )}
    >
      {children}
    </button>
  );
}

export function Bar({ value, max, colorClass = 'bg-primary', className }: { value: number; max: number; colorClass?: string; className?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const over = max > 0 && value > max * 1.05;
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-raised', className)}>
      <div className={cn('h-full rounded-full transition-[width] duration-500', over ? 'bg-destructive' : colorClass)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span className={cn('inline-block h-6 w-6 animate-spin rounded-full border-[3px] border-primary border-r-transparent', className)} aria-label="Loading" />;
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted">
      <Spinner /> <span>{label}</span>
    </div>
  );
}

export function Empty({ icon, title, body, action }: { icon?: React.ReactNode; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {icon && <div className="mb-3 text-muted [&_svg]:h-10 [&_svg]:w-10">{icon}</div>}
      <p className="font-display text-xl font-semibold">{title}</p>
      {body && <p className="mt-1 max-w-xs text-sm text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card p-5 text-center">
      <p className="font-medium">Couldn’t load this</p>
      <p className="mt-1 text-sm text-muted">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 text-sm font-semibold text-primary">
          Try again
        </button>
      )}
    </div>
  );
}

export function Stat({ label, value, sub, className }: { label: string; value: React.ReactNode; sub?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="num truncate font-display text-[26px] font-semibold leading-none">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-2 mt-7 flex items-end justify-between px-1">
      <h2 className="text-xl">{children}</h2>
      {action}
    </div>
  );
}

export function MenuItem({ icon, label, onClick, danger, active }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-14 w-full items-center gap-3 px-4 text-left font-semibold [&_svg]:h-5 [&_svg]:w-5 ${danger ? 'text-destructive' : ''} ${active ? 'bg-primary/10' : ''}`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {active && <span className="text-sm text-primary">Current</span>}
    </button>
  );
}
