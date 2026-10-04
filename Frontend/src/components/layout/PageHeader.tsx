import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  back?: boolean | string;
  actions?: ReactNode;
  large?: boolean;
  className?: string;
}

export function PageHeader({ title, subtitle, back, actions, large = true, className }: Props) {
  const navigate = useNavigate();
  return (
    <header
      className={cn(
        'sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 mb-3 lg:mb-6 bg-background/90 px-4 sm:px-6 lg:px-8 pb-3 pt-[calc(var(--safe-top)+0.75rem)] lg:pt-2 backdrop-blur border-b border-transparent lg:border-line/40 transition-colors',
        className,
      )}
    >
      <div className="flex min-h-11 items-center gap-2">
        {back && (
          <button
            onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-xl hover:bg-raised transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className={cn('truncate font-display font-bold tracking-tight leading-tight', large ? 'text-[28px] sm:text-3xl lg:text-4xl' : 'text-xl sm:text-2xl lg:text-3xl')}>{title}</h1>
          {subtitle && <p className="truncate text-sm lg:text-[15px] text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
