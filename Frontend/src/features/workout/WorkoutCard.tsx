import { Link } from 'react-router-dom';
import { Clock, Weight } from 'lucide-react';
import { duration, friendlyDate, num, volume, weight } from '@/lib/format';
import { useSettings } from '@/store/settingsStore';
import type { WorkoutSummary } from '@/types/api';

export function WorkoutCard({ w }: { w: WorkoutSummary }) {
  const unit = useSettings((s) => s.weightUnit);
  const shown = w.exercises.slice(0, 4);
  const more = w.exercises.length - shown.length;

  return (
    <Link to={`/workout/history/${w.id}`} className="card block p-4 transition-colors hover:bg-raised/50">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="truncate text-xl">{w.name || 'Workout'}</h3>
        <span className="shrink-0 text-sm text-muted">{friendlyDate(w.date)}</span>
      </div>
      <div className="mt-1 flex gap-4 text-sm text-muted">
        <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{duration(w.durationMinutes)}</span>
        <span className="flex items-center gap-1"><Weight className="h-4 w-4" />{volume(w.volume, unit)}</span>
        <span>{w.totalSets} sets</span>
      </div>
      <ul className="mt-3 space-y-1 text-[15px]">
        {shown.map((e) => (
          <li key={e.exerciseId} className="flex justify-between gap-3">
            <span className="truncate">
              <span className="num text-muted">{e.setCount} × </span>{e.exerciseName}
            </span>
            <span className="num shrink-0 text-muted">
              {e.bestWeightKg ? `${weight(e.bestWeightKg, unit)} × ${e.bestReps ?? 0}` : e.bestReps ? `${num(e.bestReps, 0)} reps` : ''}
            </span>
          </li>
        ))}
        {more > 0 && <li className="text-sm text-muted">+{more} more</li>}
      </ul>
    </Link>
  );
}
