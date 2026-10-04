import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronRight, Flame, Play, Plus, Settings } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ErrorState, Loading, SectionTitle } from '@/components/ui/primitives';
import { useDashboard } from '@/hooks/useProfile';
import { useRoutines } from '@/hooks/useWorkouts';
import { useAuthStore } from '@/store/authStore';
import { useActiveWorkout } from '@/store/activeWorkoutStore';
import { useSettings } from '@/store/settingsStore';
import { friendlyDate, fromKg, num, parseDate, todayISO, volume, weight } from '@/lib/format';
import { errorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { MacroSummary } from '@/features/nutrition/MacroSummary';
import { WorkoutCard } from '@/features/workout/WorkoutCard';
import { startEmptyWorkout, startFromTemplate } from '@/features/workout/startWorkout';
import { WeightSheet } from '@/features/body/BodyPage';

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Late session' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function TodayPage() {
  const navigate = useNavigate();
  const today = todayISO();
  const name = useAuthStore((s) => s.user?.name?.split(' ')[0]);
  const unit = useSettings((s) => s.weightUnit);
  const active = useActiveWorkout((s) => s.active);
  const { data, isLoading, error, refetch } = useDashboard(today);
  const routines = useRoutines();
  const [logWeight, setLogWeight] = useState(false);

  const start = (fn: () => boolean) => { if (fn()) navigate('/workout/active'); };
  const trainedToday = (data?.todayWorkouts.length ?? 0) > 0;

  return (
    <>
      <PageHeader
        title={name ? `${greeting()}, ${name}` : greeting()}
        className="[&_h1]:text-[28px]"
        subtitle={format(new Date(), 'EEEE d MMMM')}
        actions={
          <Link to="/settings" className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-raised" aria-label="Settings">
            <Settings className="h-6 w-6" />
          </Link>
        }
      />

      {/* Training call to action */}
      <section className="card p-4">
        {active ? (
          <Button size="lg" className="w-full" onClick={() => navigate('/workout/active')}><Play /> Resume {active.name}</Button>
        ) : (
          <>
            <p className="mb-3 text-[15px] text-muted">
              {trainedToday ? 'You already trained today. Going again?' : 'Ready when you are.'}
            </p>
            <Button size="lg" className="w-full" onClick={() => start(startEmptyWorkout)}><Play /> Start workout</Button>
            {!!routines.data?.length && (
              <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
                {routines.data.slice(0, 6).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => start(() => startFromTemplate(r, true))}
                    className="h-10 shrink-0 rounded-full bg-raised px-4 text-sm font-semibold"
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {isLoading ? (
        <Loading />
      ) : error || !data ? (
        <div className="mt-3"><ErrorState message={errorMessage(error)} onRetry={() => refetch()} /></div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6 items-start">
          {/* Main Training Column */}
          <div className="space-y-5 lg:col-span-7 xl:col-span-8">
            {/* Training call to action */}
            <section className="card p-5">
              {active ? (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Active Session</span>
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                  </div>
                  <Button size="lg" className="w-full text-base font-bold shadow-md" onClick={() => navigate('/workout/active')}>
                    <Play /> Resume {active.name}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Training</h2>
                    <span className="text-xs font-semibold text-muted">
                      {trainedToday ? 'Done for the day' : 'Workout pending'}
                    </span>
                  </div>
                  <p className="mb-4 text-[15px] text-muted leading-relaxed">
                    {trainedToday ? 'You already trained today. Ready for another session or recovery?' : 'Pick a routine to begin, or start an empty logger.'}
                  </p>
                  <Button size="lg" className="w-full shadow-sm" onClick={() => start(startEmptyWorkout)}>
                    <Play /> Start workout
                  </Button>
                  {!!routines.data?.length && (
                    <div className="mt-4 pt-3 border-t border-line/60">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2">Quick launch routine</span>
                      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                        {routines.data.slice(0, 6).map((r) => (
                          <button
                            key={r.id}
                            onClick={() => start(() => startFromTemplate(r, true))}
                            className="h-10 shrink-0 rounded-xl bg-raised hover:bg-raised/80 px-4 text-sm font-semibold transition-colors flex items-center gap-2 border border-line/30"
                          >
                            <Play className="h-3.5 w-3.5 text-primary" />
                            {r.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* This week */}
            <section className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">This week</h2>
                  <p className="text-xs text-muted mt-0.5">Workout consistency & volume</p>
                </div>
                {data.activeDayStreak > 1 && (
                  <span className="flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-bold text-warning border border-warning/20">
                    <Flame className="h-4 w-4" /> {data.activeDayStreak}-day streak
                  </span>
                )}
              </div>
              <div className="mt-4 grid grid-cols-7 gap-2">
                {data.week.map((d) => {
                  const isToday = d.date === today;
                  return (
                    <div key={d.date} className="flex flex-col items-center gap-2">
                      <span className={cn('text-xs font-semibold', isToday ? 'text-primary font-bold' : 'text-muted')}>{format(parseDate(d.date), 'EEEEE')}</span>
                      <span
                        className={cn(
                          'num flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl text-sm font-bold transition-transform hover:scale-105',
                          d.workouts ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-raised/70 text-muted border border-line/30',
                          isToday && !d.workouts && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                        )}
                      >
                        {format(parseDate(d.date), 'd')}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line/60 pt-4">
                <div className="rounded-xl bg-raised/40 p-3">
                  <span className="text-xs text-muted block">Workouts logged</span>
                  <span className="num font-display text-2xl font-bold text-foreground">{data.workoutsThisWeek}</span>
                </div>
                <div className="rounded-xl bg-raised/40 p-3">
                  <span className="text-xs text-muted block">Total volume</span>
                  <span className="num font-display text-2xl font-bold text-foreground">{volume(data.volumeThisWeek, unit)}</span>
                </div>
              </div>
            </section>

            {data.lastWorkout && (
              <section className="space-y-3">
                <SectionTitle>{data.lastWorkout.date === today ? 'Today’s workout' : 'Last workout'}</SectionTitle>
                <WorkoutCard w={data.lastWorkout} />
              </section>
            )}
          </div>

          {/* Side Nutrition & Body Column */}
          <div className="space-y-5 lg:col-span-5 xl:col-span-4">
            {/* Nutrition */}
            <Link to="/nutrition" className="card block p-5 hover:border-primary/40 transition-colors group">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold group-hover:text-primary transition-colors">Food today</h2>
                  <p className="text-xs text-muted mt-0.5">Daily macros & calorie balance</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-raised text-muted group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
              <MacroSummary consumed={data.consumed} goals={data.goals} compact />
            </Link>

            {/* Weight */}
            <section className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <Link to="/body" className="min-w-0 flex-1 group">
                  <h2 className="text-xl font-bold group-hover:text-primary transition-colors">Body weight</h2>
                  <p className="text-xs text-muted mt-0.5">Progress toward goal</p>
                </Link>
                <Button variant="secondary" size="icon-sm" onClick={() => setLogWeight(true)} aria-label="Log weight"><Plus className="h-4 w-4" /></Button>
              </div>

              {data.weight ? (
                <div className="mt-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="num font-display text-4xl font-bold leading-none">{num(fromKg(data.weight.latestKg, unit))}</span>
                    <span className="text-lg font-semibold text-muted">{unit}</span>
                  </div>
                  <div className="mt-2 text-xs text-muted flex items-center gap-2">
                    <span>{friendlyDate(data.weight.recordedOn)}</span>
                    {data.weight.changeKg30d != null && (
                      <>
                        <span>•</span>
                        <span className={cn('font-semibold', data.weight.changeKg30d <= 0 ? 'text-success' : 'text-primary')}>
                          {data.weight.changeKg30d > 0 ? '+' : ''}{weight(data.weight.changeKg30d, unit)} in 30d
                        </span>
                      </>
                    )}
                  </div>
                  {data.weight.goalKg && (
                    <div className="mt-4 pt-3 border-t border-line/60 flex justify-between text-xs">
                      <span className="text-muted">Target goal:</span>
                      <span className="font-semibold">{weight(data.weight.goalKg, unit)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted">No weigh-ins yet. Log one to begin tracking.</p>
              )}
            </section>
          </div>
        </div>
      )}

      <WeightSheet open={logWeight} entry={null} onClose={() => setLogWeight(false)} lastKg={data?.weight?.latestKg} />
    </>
  );
}
