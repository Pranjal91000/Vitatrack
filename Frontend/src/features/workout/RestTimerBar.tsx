import { useActiveWorkout } from '@/store/activeWorkoutStore';
import { clock } from '@/lib/format';
import { useRestRemaining } from './useTimers';

/** The bar that drains while you rest — the one bold element on the logging screen. */
export function RestTimerBar() {
  const rest = useActiveWorkout((s) => s.rest);
  const adjust = useActiveWorkout((s) => s.adjustRest);
  const stop = useActiveWorkout((s) => s.stopRest);
  const remaining = useRestRemaining();
  if (!rest || remaining == null) return null;

  const pct = Math.max(0, Math.min(100, (remaining / rest.total) * 100));

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 animate-pop-in pb-[var(--safe-bottom)]" role="timer" aria-live="off">
      <div className="mx-auto max-w-2xl px-3 pb-3">
        <div className="relative overflow-hidden rounded-2xl bg-surface shadow-2xl ring-1 ring-line">
          <div className="absolute inset-y-0 left-0 bg-primary/20 transition-[width] duration-300 ease-linear" style={{ width: `${pct}%` }} />
          <div className="relative flex items-center gap-2 px-3 py-2.5">
            <button onClick={() => adjust(-15)} className="h-11 rounded-xl bg-raised px-3 font-semibold">−15</button>
            <div className="min-w-0 flex-1 text-center">
              <div className="num font-display text-[34px] font-semibold leading-none">{clock(remaining)}</div>
              <div className="truncate text-xs text-muted">Rest · next: {rest.label}</div>
            </div>
            <button onClick={() => adjust(15)} className="h-11 rounded-xl bg-raised px-3 font-semibold">+15</button>
            <button onClick={stop} className="h-11 rounded-xl bg-primary px-4 font-semibold text-primary-foreground">Skip</button>
          </div>
        </div>
      </div>
    </div>
  );
}
