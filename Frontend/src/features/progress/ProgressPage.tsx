import { useState } from 'react';
import { Link } from 'react-router-dom';
import { addDays, format, subDays } from 'date-fns';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Bar as RBar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader } from '@/components/layout/PageHeader';
import { Bar, ErrorState, Loading, SectionTitle, Segmented, Stat } from '@/components/ui/primitives';
import { useDashboard, useProgressReport } from '@/hooks/useProfile';
import { useHeatmap } from '@/hooks/useWorkouts';
import { useNutritionReport } from '@/hooks/useNutrition';
import { useSettings } from '@/store/settingsStore';
import { duration, fromKg, num, parseDate, todayISO, toISODate, volume } from '@/lib/format';
import { errorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';

const tooltipStyle = { background: 'hsl(var(--surface))', border: '1px solid hsl(var(--line))', borderRadius: 12 };
const axisTick = { fill: 'hsl(var(--muted))', fontSize: 12 };

export default function ProgressPage() {
  const unit = useSettings((s) => s.weightUnit);
  const [weeks, setWeeks] = useState(12);
  const report = useProgressReport(weeks);

  const data = report.data;
  const weekly = (data?.weeks ?? []).map((w) => ({
    label: format(parseDate(w.weekStart), 'd MMM'),
    workouts: w.workouts,
    volume: fromKg(w.volume, unit) ?? 0,
  }));
  const maxMuscle = Math.max(1, ...(data?.muscles.map((m) => m.sets) ?? [1]));

  return (
    <>
      <PageHeader title="Progress" />
      <Segmented value={weeks} onChange={setWeeks} options={[{ value: 4, label: '4 weeks' }, { value: 12, label: '12 weeks' }, { value: 26, label: '6 months' }]} />

      {report.isLoading ? (
        <Loading />
      ) : report.error ? (
        <div className="mt-3"><ErrorState message={errorMessage(report.error)} onRetry={() => report.refetch()} /></div>
      ) : data ? (
        <div className="space-y-6 mt-4">
          <div className="card grid grid-cols-3 gap-3 p-5 shadow-sm">
            <Stat label="Workouts" value={data.totalWorkouts} sub={`${num(data.totalWorkouts / weeks, 1)} per week`} />
            <Stat label="Volume" value={volume(data.totalVolume, unit)} />
            <Stat label="Time" value={duration(data.totalDurationMinutes)} />
          </div>

          {/* 2-column grid for Weekly Volume and Workouts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <SectionTitle>Training volume per week</SectionTitle>
              <div className="card p-5 shadow-sm">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekly} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                      <CartesianGrid stroke="hsl(var(--line))" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} minTickGap={16} />
                      <YAxis tick={axisTick} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => (v >= 1000 ? `${num(v / 1000, 0)}k` : String(v))} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--raised))' }} formatter={(v) => [`${num(Number(v), 0)} ${unit}`, 'Volume']} />
                      <RBar dataKey="volume" fill="hsl(var(--blue))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div>
              <SectionTitle>Workouts per week</SectionTitle>
              <div className="card p-5 shadow-sm">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekly} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                      <CartesianGrid stroke="hsl(var(--line))" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} minTickGap={16} />
                      <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} width={40} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--raised))' }} formatter={(v) => [String(v), 'Workouts']} />
                      <RBar dataKey="workouts" fill="hsl(var(--green))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* 2-column grid for Muscle Groups & Consistency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            <div>
              <SectionTitle>Sets per muscle, last 4 weeks</SectionTitle>
              <div className="card p-5 shadow-sm">
                {data.muscles.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted">Log a few workouts to see how your training is split.</p>
                ) : (
                  <ul className="space-y-3.5">
                    {data.muscles.map((m) => (
                      <li key={m.muscle}>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-foreground">{m.muscle}</span>
                          <span className="num text-muted font-medium">{num(m.sets / 4, 1)} sets/week</span>
                        </div>
                        <Bar value={m.sets} max={maxMuscle} className="mt-1.5" />
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-5 text-xs text-muted border-t border-line/40 pt-3">Main muscle counts a full set, secondary muscles half. 10–20 hard sets per muscle per week is a common hypertrophy target.</p>
              </div>
            </div>

            <div className="space-y-5">
              <ConsistencyHeatmap />
              <Link to="/workout/exercises" className="card flex items-center gap-4 p-5 font-semibold hover:border-primary/40 hover:bg-raised/40 transition-all group shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <span className="block text-base font-bold text-foreground">Exercise Records & 1RM Charts</span>
                  <span className="text-xs text-muted">Track all-time best lifts and volume records</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <NutritionTrend />
      </div>
    </>
  );
}

function ConsistencyHeatmap() {
  const WEEKS = 16;
  const today = new Date();
  const endOfWeek = addDays(today, 6 - ((today.getDay() + 6) % 7));
  const start = subDays(endOfWeek, WEEKS * 7 - 1);
  const { data } = useHeatmap(toISODate(start), toISODate(endOfWeek));
  const counts = new Map((data ?? []).map((d) => [d.date, d.count]));
  const todayIso = todayISO();
  const total = (data ?? []).reduce((a, d) => a + (d.count > 0 ? 1 : 0), 0);

  return (
    <>
      <SectionTitle>Consistency</SectionTitle>
      <div className="card p-4">
        <div className="grid grid-flow-col grid-rows-7 gap-1" style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }}>
          {Array.from({ length: WEEKS * 7 }, (_, i) => {
            const d = toISODate(addDays(start, i));
            const c = counts.get(d) ?? 0;
            return (
              <div
                key={d}
                title={`${d}: ${c} workout${c === 1 ? '' : 's'}`}
                className={cn('aspect-square rounded-[3px]', d > todayIso ? 'bg-transparent' : c ? (c > 1 ? 'bg-primary' : 'bg-primary/65') : 'bg-raised')}
              />
            );
          })}
        </div>
        <p className="mt-3 text-sm text-muted">{total} training days in the last {WEEKS} weeks</p>
      </div>
    </>
  );
}

function NutritionTrend() {
  const to = todayISO();
  const from = toISODate(subDays(new Date(), 13));
  const { data } = useNutritionReport(from, to);
  const { data: dash } = useDashboard(to);
  const goal = dash?.goals.calories ?? 0;

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = toISODate(addDays(parseDate(from), i));
    const item = data?.dailyItems.find((x) => x.date === d);
    return { label: format(parseDate(d), 'EEEEE'), date: d, calories: Math.round(item?.calories ?? 0), protein: Math.round(item?.proteinG ?? 0) };
  });
  const logged = days.filter((d) => d.calories > 0);
  const avg = (k: 'calories' | 'protein') => (logged.length ? logged.reduce((a, d) => a + d[k], 0) / logged.length : 0);

  return (
    <>
      <SectionTitle>Nutrition, last 14 days</SectionTitle>
      <div className="card p-4">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Avg kcal" value={num(avg('calories'), 0)} />
          <Stat label="Avg protein" value={`${num(avg('protein'), 0)} g`} />
          <Stat label="Days logged" value={`${logged.length}/14`} />
        </div>
        <div className="mt-4 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
              <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} interval={0} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => (v >= 1000 ? `${num(v / 1000, 1)}k` : String(v))} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--raised))' }} labelFormatter={(_, p) => p?.[0]?.payload?.date ?? ''} formatter={(v) => [`${v} kcal`, 'Eaten']} />
              {goal > 0 && <ReferenceLine y={goal} stroke="hsl(var(--yellow))" strokeDasharray="6 4" />}
              <RBar dataKey="calories" fill="hsl(var(--red))" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
