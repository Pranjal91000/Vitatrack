import { useMemo, useState } from 'react';
import { format, subMonths, subYears } from 'date-fns';
import { Minus, Pencil, Plus, Scale } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { Empty, ErrorState, Field, Input, Loading, SectionTitle, Segmented, Stat } from '@/components/ui/primitives';
import { useDeleteWeight, useSaveWeight, useWeightHistory } from '@/hooks/useBody';
import { useProfile } from '@/hooks/useProfile';
import { useSettings } from '@/store/settingsStore';
import { friendlyDate, fromKg, num, parseDate, todayISO, toISODate, toKg, weight } from '@/lib/format';
import { errorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { WeightEntry, WeightUnit } from '@/types/api';

type Range = '1M' | '3M' | '6M' | '1Y' | 'All';

const rangeStart = (r: Range): string | undefined => {
  const now = new Date();
  if (r === 'All') return undefined;
  const d = r === '1M' ? subMonths(now, 1) : r === '3M' ? subMonths(now, 3) : r === '6M' ? subMonths(now, 6) : subYears(now, 1);
  return toISODate(d);
};

/** 7-entry trailing average smooths out day-to-day water swings. */
function withTrend(entries: WeightEntry[], unit: WeightUnit) {
  return entries.map((e, i) => {
    const win = entries.slice(Math.max(0, i - 6), i + 1);
    const avg = win.reduce((a, b) => a + b.weight, 0) / win.length;
    return { date: e.recordedOn, weight: fromKg(e.weight, unit), trend: fromKg(avg, unit) };
  });
}

export default function BodyPage() {
  const unit = useSettings((s) => s.weightUnit);
  const [range, setRange] = useState<Range>('3M');
  const all = useWeightHistory();
  const { data: profile } = useProfile();
  const [logging, setLogging] = useState<WeightEntry | 'new' | null>(null);

  const entries = useMemo(() => all.data ?? [], [all.data]);
  const from = rangeStart(range);
  const visible = useMemo(() => entries.filter((e) => !from || e.recordedOn >= from), [entries, from]);
  const chart = useMemo(() => withTrend(visible, unit), [visible, unit]);

  const latest = entries[entries.length - 1];
  const changeSince = (days: number) => {
    if (!latest) return null;
    const cutoff = toISODate(new Date(parseDate(latest.recordedOn).getTime() - days * 86400000));
    const ref = [...entries].reverse().find((e) => e.recordedOn <= cutoff);
    return ref ? latest.weight - ref.weight : null;
  };
  const goal = profile?.weightGoalKg ?? null;

  const signed = (kg: number | null) => (kg == null ? '–' : `${kg > 0 ? '+' : kg < 0 ? '−' : ''}${num(Math.abs(fromKg(kg, unit) ?? 0))} ${unit}`);

  return (
    <>
      <PageHeader title="Body" actions={<Button size="sm" onClick={() => setLogging('new')}><Plus /> Log weight</Button>} />

      {all.isLoading ? (
        <Loading />
      ) : all.error ? (
        <ErrorState message={errorMessage(all.error)} onRetry={() => all.refetch()} />
      ) : !latest ? (
        <div className="card">
          <Empty
            icon={<Scale />}
            title="Log your first weigh-in"
            body="Weigh yourself in the morning, after the bathroom and before eating, for the most consistent trend."
            action={<Button size="lg" onClick={() => setLogging('new')}><Plus /> Log weight</Button>}
          />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6 items-start">
          {/* Left Column: Stats & Chart */}
          <div className="space-y-5 lg:col-span-7 xl:col-span-8">
            <div className="card p-6 shadow-sm">
              <div className="flex items-end justify-between">
                <div>
                  <div className="num font-display text-[54px] sm:text-[60px] font-bold leading-none tracking-tight">
                    {num(fromKg(latest.weight, unit))}
                    <span className="ml-1 text-2xl font-semibold text-muted">{unit}</span>
                  </div>
                  <div className="mt-2 text-sm text-muted font-medium">
                    {friendlyDate(latest.recordedOn)}
                    {latest.bodyFatPercent ? ` · ${num(latest.bodyFatPercent)}% body fat` : ''}
                  </div>
                </div>
                {goal && (
                  <div className="text-right">
                    <div className="num font-display text-3xl font-bold">{weight(goal, unit)}</div>
                    <div className="text-xs text-muted font-medium mt-0.5">goal · {signed(latest.weight - goal).replace(/^\+/, '')} to go</div>
                  </div>
                )}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-line/60 pt-4">
                <Stat label="7 days change" value={signed(changeSince(7))} />
                <Stat label="30 days change" value={signed(changeSince(30))} />
                <Stat label="90 days change" value={signed(changeSince(90))} />
              </div>
            </div>

            <div className="card p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-bold">Weight History & Trend</h3>
                <Segmented size="sm" value={range} onChange={setRange} options={(['1M', '3M', '6M', '1Y', 'All'] as Range[]).map((r) => ({ value: r, label: r }))} />
              </div>
              {chart.length > 1 ? (
                <div className="mt-4 h-64 sm:h-72 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chart} margin={{ top: 10, right: 10, left: -14, bottom: 0 }}>
                      <defs>
                        <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--blue))" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(var(--blue))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--line))" vertical={false} />
                      <XAxis dataKey="date" tickFormatter={(d) => format(parseDate(d), 'd MMM')} tick={{ fill: 'hsl(var(--muted))', fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={28} />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: 'hsl(var(--muted))', fontSize: 12 }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => num(Number(v), 0)} />
                      <Tooltip
                        contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--line))', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        labelFormatter={(d) => friendlyDate(String(d))}
                        formatter={(v, name) => [`${num(Number(v))} ${unit}`, name === 'trend' ? '7-entry trend' : 'Weight']}
                      />
                      {goal && <ReferenceLine y={fromKg(goal, unit) ?? undefined} stroke="hsl(var(--green))" strokeDasharray="6 4" label={{ value: 'Goal', fill: 'hsl(var(--green))', position: 'insideTopRight' }} />}
                      <Area type="monotone" dataKey="weight" stroke="hsl(var(--blue))" strokeWidth={2} fill="url(#wfill)" dot={{ r: 3, fill: 'hsl(var(--blue))' }} />
                      <Area type="monotone" dataKey="trend" stroke="hsl(var(--foreground))" strokeWidth={2.5} fill="none" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="py-12 text-center text-sm text-muted">Log at least two weigh-ins in this range to see a trend chart.</p>
              )}
            </div>
          </div>

          {/* Right Column: History List */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold">Past Weigh-ins</h3>
              <span className="text-xs text-muted font-medium">{entries.length} recorded</span>
            </div>
            <div className="card divide-y divide-line/40 overflow-hidden shadow-sm max-h-[640px] overflow-y-auto">
              {[...entries].reverse().map((e, i, arr) => {
                const prev = arr[i + 1];
                const diff = prev ? e.weight - prev.weight : null;
                return (
                  <button key={e.id} onClick={() => setLogging(e)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-raised/60 transition-colors">
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-foreground text-sm">{friendlyDate(e.recordedOn)}</span>
                      {e.notes && <span className="block truncate text-xs text-muted mt-0.5">{e.notes}</span>}
                    </span>
                    {diff != null && (
                      <span className={cn('num text-xs font-semibold px-2 py-0.5 rounded-full', diff > 0 ? 'bg-warning/15 text-warning' : diff < 0 ? 'bg-success/15 text-success' : 'text-muted')}>
                        {signed(diff)}
                      </span>
                    )}
                    <span className="num text-right font-display text-lg font-bold text-foreground pl-2">{weight(e.weight, unit)}</span>
                    <Pencil className="h-3.5 w-3.5 text-muted shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <WeightSheet entry={logging === 'new' ? null : logging} open={logging != null} onClose={() => setLogging(null)} lastKg={latest?.weight} />
    </>
  );
}

export function WeightSheet({ entry, open, onClose, lastKg }: { entry: WeightEntry | null; open: boolean; onClose: () => void; lastKg?: number }) {
  const unit = useSettings((s) => s.weightUnit);
  const save = useSaveWeight();
  const del = useDeleteWeight();
  const start = entry?.weight ?? lastKg;
  const [value, setValue] = useState('');
  const [date, setDate] = useState(todayISO());
  const [bodyFat, setBodyFat] = useState('');
  const [notes, setNotes] = useState('');
  const [initFor, setInitFor] = useState<string | null>(null);

  // Reset fields whenever the sheet opens for a different entry.
  const key = open ? `${entry?.id ?? 'new'}` : null;
  if (key !== initFor) {
    setInitFor(key);
    if (open) {
      setValue(start != null ? String(fromKg(start, unit)) : '');
      setDate(entry?.recordedOn ?? todayISO());
      setBodyFat(entry?.bodyFatPercent != null ? String(entry.bodyFatPercent) : '');
      setNotes(entry?.notes ?? '');
    }
  }

  const v = Number(value.replace(',', '.'));
  const step = (d: number) => setValue(String(Math.round(((Number.isFinite(v) ? v : 0) + d) * 10) / 10));

  const submit = async () => {
    await save.mutateAsync({
      id: entry?.id,
      recordedOn: date,
      weight: toKg(v, unit),
      bodyFatPercent: bodyFat ? Number(bodyFat.replace(',', '.')) : null,
      notes: notes.trim() || null,
    });
    onClose();
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={entry ? 'Edit weigh-in' : 'Log weight'}
      footer={
        <div className={cn('grid gap-2', entry ? 'grid-cols-2' : 'grid-cols-1')}>
          {entry && (
            <Button size="lg" variant="danger" loading={del.isPending} onClick={async () => { await del.mutateAsync(entry.id); onClose(); }}>Delete</Button>
          )}
          <Button size="lg" disabled={!(v > 0)} loading={save.isPending} onClick={submit}>Save</Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="secondary" onClick={() => step(-0.1)} aria-label="Decrease"><Minus /></Button>
          <div className="flex flex-1 items-baseline justify-center gap-1">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              inputMode="decimal"
              className="num w-36 bg-transparent text-center font-display text-6xl font-semibold focus:outline-none"
              aria-label={`Weight in ${unit}`}
              autoFocus={!entry}
              onFocus={(e) => e.target.select()}
            />
            <span className="text-xl text-muted">{unit}</span>
          </div>
          <Button size="icon" variant="secondary" onClick={() => step(0.1)} aria-label="Increase"><Plus /></Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date"><Input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Body fat % (optional)"><Input inputMode="decimal" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} /></Field>
        </div>
        <Field label="Note (optional)"><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. after a high-carb day" /></Field>
        {!entry && <p className="text-xs text-muted">Logging again on the same date replaces that day’s entry.</p>}
      </div>
    </Sheet>
  );
}
