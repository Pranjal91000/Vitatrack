import { addDays, format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { friendlyDate, parseDate, todayISO, toISODate } from '@/lib/format';

export function DateSwitcher({ date, onChange }: { date: string; onChange: (d: string) => void }) {
  const isToday = date === todayISO();
  const shift = (n: number) => onChange(toISODate(addDays(parseDate(date), n)));
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface p-1">
      <button onClick={() => shift(-1)} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-raised" aria-label="Previous day">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <label className="relative flex-1 cursor-pointer text-center">
        <span className="font-semibold">{friendlyDate(date)}</span>
        {!isToday && <span className="ml-2 text-sm text-muted">{format(parseDate(date), 'd MMM')}</span>}
        <input
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="absolute inset-0 opacity-0"
          aria-label="Pick a date"
        />
      </label>
      <button
        onClick={() => shift(1)}
        disabled={isToday}
        className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-raised disabled:opacity-30"
        aria-label="Next day"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
