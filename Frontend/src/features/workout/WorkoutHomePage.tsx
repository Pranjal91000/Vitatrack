import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, History, Play, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Empty, ErrorState, Loading, SectionTitle } from '@/components/ui/primitives';
import { useRoutines, useWorkoutHistory } from '@/hooks/useWorkouts';
import { useActiveWorkout } from '@/store/activeWorkoutStore';
import { errorMessage } from '@/lib/api';
import type { WorkoutDto } from '@/types/api';
import { startEmptyWorkout, startFromTemplate } from './startWorkout';
import { WorkoutCard } from './WorkoutCard';

export default function WorkoutHomePage() {
  const navigate = useNavigate();
  const active = useActiveWorkout((s) => s.active);
  const routines = useRoutines();
  const history = useWorkoutHistory();
  const recent = history.data?.pages[0]?.data.slice(0, 3) ?? [];

  const start = (fn: () => boolean) => { if (fn()) navigate('/workout/active'); };

  return (
    <>
      <PageHeader title="Workout" />

      {/* Top Action Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-1">
          {active ? (
            <Button size="lg" className="w-full h-full min-h-[64px] font-bold shadow-sm" onClick={() => navigate('/workout/active')}>
              <Play /> Resume {active.name}
            </Button>
          ) : (
            <Button size="lg" className="w-full h-full min-h-[64px] font-bold shadow-sm" onClick={() => start(startEmptyWorkout)}>
              <Play /> Start empty workout
            </Button>
          )}
        </div>
        <Link to="/workout/history" className="card flex items-center gap-4 p-4 font-semibold hover:border-primary/40 hover:bg-raised/40 transition-all group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
            <History className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-base font-bold text-foreground">Workout History</span>
            <span className="text-xs text-muted">Review past logged sessions & sets</span>
          </div>
        </Link>
        <Link to="/workout/exercises" className="card flex items-center gap-4 p-4 font-semibold hover:border-primary/40 hover:bg-raised/40 transition-all group">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-base font-bold text-foreground">Exercise Library</span>
            <span className="text-xs text-muted">Browse instructions & 1RM history</span>
          </div>
        </Link>
      </div>

      <SectionTitle
        action={
          <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/10" onClick={() => navigate('/workout/routines/new')}>
            <Plus className="h-4 w-4" /> New routine
          </Button>
        }
      >
        Saved Routines
      </SectionTitle>

      {routines.isLoading ? (
        <Loading />
      ) : routines.error ? (
        <ErrorState message={errorMessage(routines.error)} onRetry={() => routines.refetch()} />
      ) : !routines.data?.length ? (
        <div className="card">
          <Empty
            title="No routines yet"
            body="Save your usual split — Push, Pull, Legs — and start it with one tap. Last session’s weights fill in automatically."
            action={<Button variant="secondary" onClick={() => navigate('/workout/routines/new')}><Plus /> Create routine</Button>}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {routines.data.map((r) => (
            <RoutineCard key={r.id} r={r} onStart={() => start(() => startFromTemplate(r, true))} />
          ))}
        </div>
      )}

      {recent.length > 0 && (
        <div className="mt-8">
          <SectionTitle action={<Link to="/workout/history" className="text-sm font-semibold text-primary hover:underline">See all ({history.data?.pages[0]?.meta?.total ?? recent.length})</Link>}>
            Recent Sessions
          </SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recent.map((w) => <WorkoutCard key={w.id} w={w} />)}
          </div>
        </div>
      )}
    </>
  );
}

function RoutineCard({ r, onStart }: { r: WorkoutDto; onStart: () => void }) {
  return (
    <div className="card flex flex-col p-4">
      <Link to={`/workout/routines/${r.id}`} className="flex items-start justify-between gap-2">
        <h3 className="truncate text-xl">{r.name}</h3>
        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted" />
      </Link>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted">{r.exercises.map((e) => e.exerciseName).join(', ')}</p>
      <Button variant="secondary" className="mt-3 w-full text-primary" onClick={onStart}>
        <Play /> Start
      </Button>
    </div>
  );
}
