import { memo } from 'react';
import { Check } from 'lucide-react';
import { cn, vibrate } from '@/lib/utils';
import { SET_TYPES, setFields } from '@/lib/constants';
import type { ActiveExercise, ActiveSet } from '@/store/activeWorkoutStore';
import type { Placeholder } from './session';

interface Props {
  exercise: ActiveExercise;
  set: ActiveSet;
  number: number; // working-set number (warm-ups show "W")
  previous: string;
  placeholder: Placeholder;
  canComplete: boolean;
  onChange: (patch: Partial<ActiveSet>) => void;
  onToggleDone: () => void;
  onOpenMenu: () => void;
  onUsePrevious: () => void;
}

const cellInput =
  'num h-11 w-full min-w-0 rounded-lg bg-raised text-center text-[17px] font-semibold text-foreground placeholder:font-medium placeholder:text-muted/60 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary';

export const SetRow = memo(function SetRow({
  exercise, set, number, previous, placeholder, canComplete, onChange, onToggleDone, onOpenMenu, onUsePrevious,
}: Props) {
  const f = setFields(exercise.measurementType);
  const type = SET_TYPES[set.type];

  const sanitize = (v: string, decimal: boolean) => {
    const clean = v.replace(',', '.').replace(decimal ? /[^0-9.]/g : /[^0-9]/g, '');
    return decimal ? clean.replace(/(\..*)\./g, '$1') : clean;
  };

  return (
    <div
      className={cn(
        'grid items-center gap-2 rounded-xl px-1.5 py-1 transition-colors',
        'grid-cols-[2.5rem_minmax(0,1fr)_4.75rem_4.25rem_2.75rem]',
        set.done && 'bg-success/15',
      )}
    >
      <button
        onClick={onOpenMenu}
        className={cn('num h-11 rounded-lg font-display text-lg font-semibold', type.className || 'text-foreground', !set.done && 'bg-raised/60')}
        aria-label={`Set ${number} options`}
      >
        {type.short || number}
      </button>

      <button onClick={onUsePrevious} className="num truncate text-left text-sm text-muted" aria-label="Copy previous values">
        {previous}
      </button>

      {f.weight || f.distance ? (
        <input
          className={cellInput}
          inputMode="decimal"
          enterKeyHint="next"
          aria-label={f.weight ? 'Weight' : 'Distance in km'}
          placeholder={f.weight ? placeholder.weight : placeholder.distance}
          value={f.weight ? set.weight : set.distance}
          onChange={(e) => onChange(f.weight ? { weight: sanitize(e.target.value, true) } : { distance: sanitize(e.target.value, true) })}
          onFocus={(e) => e.target.select()}
        />
      ) : (
        <span />
      )}

      {f.reps || f.time ? (
        <input
          className={cellInput}
          inputMode={f.reps ? 'numeric' : 'decimal'}
          enterKeyHint="done"
          aria-label={f.reps ? 'Reps' : f.timeUnit === 'min' ? 'Minutes' : 'Seconds'}
          placeholder={f.reps ? placeholder.reps : placeholder.time}
          value={f.reps ? set.reps : set.time}
          onChange={(e) => onChange(f.reps ? { reps: sanitize(e.target.value, false) } : { time: sanitize(e.target.value, f.timeUnit === 'min') })}
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
        />
      ) : (
        <span />
      )}

      <button
        onClick={() => {
          if (!set.done && !canComplete) { vibrate([20, 40, 20]); }
          onToggleDone();
        }}
        aria-pressed={set.done}
        aria-label={set.done ? 'Mark set not done' : 'Complete set'}
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-lg transition-colors',
          set.done ? 'bg-success text-white' : canComplete ? 'bg-raised text-foreground' : 'bg-raised text-muted/50',
        )}
      >
        <Check className="h-6 w-6" strokeWidth={3} />
      </button>
    </div>
  );
});
