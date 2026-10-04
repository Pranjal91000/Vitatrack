import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type CalendarHeatmapProps = {
  getData: (from: Date, to: Date) => { date: string; count: number }[];
  /** Optional accent (hex). If omitted, uses theme primary. */
  color?: string;
  yearChangeAllowed?: boolean;
  year?: number;
  onYearChange?: (year: number) => void;
};

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function CalendarHeatmap({
  getData,
  color,
  yearChangeAllowed = true,
  year: yearProp,
  onYearChange,
}: CalendarHeatmapProps) {
  const now = new Date();
  const [localYear, setLocalYear] = useState(now.getFullYear());
  const currentYear = yearProp ?? localYear;
  const setCurrentYear = onYearChange ?? setLocalYear;

  const countByDay = useMemo(() => {
    const from = new Date(currentYear, 0, 1);
    const to = new Date(currentYear, 11, 31, 23, 59, 59, 999);
    const rows = getData(from, to);
    const m = new Map<string, number>();
    for (const r of rows) m.set(r.date, r.count);
    return m;
  }, [currentYear, getData]);

  const { columns, maxCount } = useMemo(() => {
    const jan1 = new Date(currentYear, 0, 1);
    const gridStart = new Date(jan1);
    gridStart.setDate(jan1.getDate() - jan1.getDay());

    const dec31 = new Date(currentYear, 11, 31);
    const gridEnd = new Date(dec31);
    gridEnd.setDate(dec31.getDate() + (6 - dec31.getDay()));

    const cols: { ymd: string; count: number; inYear: boolean }[][] = [];

    let max = 0;
    for (let weekStart = new Date(gridStart); weekStart <= gridEnd; weekStart.setDate(weekStart.getDate() + 7)) {
      const col: { ymd: string; count: number; inYear: boolean }[] = [];
      for (let i = 0; i < 7; i++) {
        const dt = new Date(weekStart);
        dt.setDate(weekStart.getDate() + i);
        const ymd = toYmd(dt);
        const inYear = dt.getFullYear() === currentYear;
        const c = countByDay.get(ymd) ?? 0;
        if (c > max) max = c;
        col.push({ ymd, count: c, inYear });
      }
      cols.push(col);
    }

    return { columns: cols, maxCount: max };
  }, [currentYear, countByDay]);

  const monthLabels = useMemo(() => {
    const labels = columns.map(() => '');
    for (let month = 0; month < 12; month++) {
      const first = new Date(currentYear, month, 1);
      const key = toYmd(first);
      for (let wi = 0; wi < columns.length; wi++) {
        if (columns[wi].some((c) => c.ymd === key && c.inYear)) {
          labels[wi] = format(first, 'MMM');
          break;
        }
      }
    }
    return labels;
  }, [columns, currentYear]);

  const cellBg = useMemo(() => {
    return (count: number, inYear: boolean) => {
      if (!inYear) return 'transparent';
      if (!count || maxCount === 0) return 'hsl(var(--muted))';
      const intensity = Math.pow(count / maxCount, 0.62);
      const minO = 0.14;
      const maxO = 0.95;
      const opacity = minO + intensity * (maxO - minO);
      if (color) {
        const { r, g, b } = hexToRgb(color);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      return `hsl(var(--primary) / ${opacity})`;
    };
  }, [color, maxCount]);

  const yearOptions = useMemo(
    () => Array.from({ length: 6 }, (_, i) => now.getFullYear() - i),
    [now]
  );

  const cellClass =
    'rounded-[3px] border border-border/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background shrink-0 disabled:pointer-events-none disabled:opacity-25';

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Year at a glance</p>
          <p className="text-xs text-muted-foreground">Each square is a day; darker means more sessions.</p>
        </div>
        {yearChangeAllowed ? (
          <div className="flex items-center gap-2 sm:w-[200px]">
            <Label htmlFor="heatmap-year" className="text-xs text-muted-foreground shrink-0">
              Year
            </Label>
            <Select value={String(currentYear)} onValueChange={(v) => setCurrentYear(Number(v))}>
              <SelectTrigger id="heatmap-year" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      <div className="flex gap-3 sm:gap-4">
        <div className="flex w-8 shrink-0 flex-col gap-1 pt-[22px] text-[10px] font-medium leading-none text-muted-foreground select-none sm:w-9 sm:text-[11px]">
          {WEEKDAYS.map((d) => (
            <span key={d} className="flex h-3 items-center sm:h-3.5">
              {d}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto pb-1">
          <div className="inline-flex min-w-max flex-col gap-2">
            <div className="flex h-[22px] items-end gap-1">
              {columns.map((_, wi) => (
                <div key={`m-${wi}`} className="flex w-3 flex-col items-center justify-end sm:w-3.5">
                  <span
                    className={cn(
                      'text-[10px] font-medium leading-none text-muted-foreground',
                      !monthLabels[wi] && 'invisible'
                    )}
                  >
                    {monthLabels[wi] || '·'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-1">
              {columns.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((cell) => {
                    const label = cell.inYear
                      ? `${cell.ymd}: ${cell.count} session${cell.count === 1 ? '' : 's'}`
                      : '';
                    return (
                      <button
                        key={cell.ymd}
                        type="button"
                        aria-label={label || cell.ymd}
                        title={label}
                        disabled={!cell.inYear}
                        className={cn(cellClass, 'h-3 w-3 sm:h-3.5 sm:w-3.5')}
                        style={{
                          backgroundColor: cellBg(cell.count, cell.inYear),
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-3 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-0.5">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <div
              key={t}
              className="h-3 w-3 rounded-[2px] border border-border/40 sm:h-3.5 sm:w-3.5"
              style={{
                backgroundColor:
                  maxCount === 0
                    ? 'hsl(var(--muted))'
                    : color
                      ? (() => {
                          const { r, g, b } = hexToRgb(color);
                          const opacity = 0.14 + t * 0.8;
                          return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                        })()
                      : `hsl(var(--primary) / ${0.14 + t * 0.8})`,
              }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
