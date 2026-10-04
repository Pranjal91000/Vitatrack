import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ConfirmSheet } from '@/components/ui/sheet';
import { Empty, ErrorState, Loading, SectionTitle, Segmented, Stat } from '@/components/ui/primitives';
import { useDeleteExercise, useExerciseDetail } from '@/hooks/useWorkouts';
import { useSettings } from '@/store/settingsStore';
import { friendlyDate, fromKg, num, parseDate, volume, weight } from '@/lib/format';
import { setFields } from '@/lib/constants';
import { errorMessage } from '@/lib/api';
import { ExerciseFormSheet } from './ExerciseSheets';
import { formatSet } from './session';

type Metric = 'oneRepMax' | 'maxWeight' | 'volume';

export default function ExerciseDetailPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const unit = useSettings((s) => s.weightUnit);
  const { data, isLoading, error, refetch } = useExerciseDetail(id);
  const del = useDeleteExercise();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [metric, setMetric] = useState<Metric>('oneRepMax');

  if (isLoading) return <Loading />;
  if (error || !data) return <><PageHeader back title="Exercise" /><ErrorState message={errorMessage(error)} onRetry={() => refetch()} /></>;

  const ex = data.exercise;
  const f = setFields(ex.measurementType);
  const weighted = f.weight;

  const chart = [...data.sessions]
    .reverse()
    .map((s) => ({
      date: s.date,
      value:
        metric === 'oneRepMax' ? fromKg(s.bestOneRepMax, unit) : metric === 'maxWeight' ? fromKg(s.maxWeightKg, unit) : fromKg(s.volume, unit),
    }))
    .filter((p) => p.value != null && p.value > 0);

  return (
    <>
      <PageHeader
        back
        large={false}
        title={ex.name}
        subtitle={[ex.muscleGroups.join(', '), ex.equipment].filter(Boolean).join(' · ')}
        actions={ex.isCustom && <Button size="icon-sm" variant="ghost" onClick={() => setEditing(true)} aria-label="Edit exercise"><Pencil /></Button>}
      />

      {data.sessionCount === 0 ? (
        <div className="card"><Empty title="Not logged yet" body="Your bests and a progress chart appear here after the first session." /></div>
      ) : (
        <>
          <div className="card grid grid-cols-2 gap-4 p-4">
            {weighted ? (
              <>
                <Stat label="Estimated 1RM" value={weight(data.bestOneRepMax, unit)} />
                <Stat label="Heaviest weight" value={weight(data.maxWeightKg, unit)} />
                <Stat label="Best set volume" value={volume(data.bestSetVolume ?? 0, unit)} />
              </>
            ) : (
              <Stat label="Most reps in a set" value={data.maxReps ?? '–'} />
            )}
            <Stat label="Sessions" value={data.sessionCount} />
          </div>

          {weighted && chart.length > 1 && (
            <div className="card mt-3 p-4">
              <Segmented
                size="sm"
                value={metric}
                onChange={setMetric}
                options={[{ value: 'oneRepMax', label: 'Est. 1RM' }, { value: 'maxWeight', label: 'Heaviest' }, { value: 'volume', label: 'Volume' }]}
              />
              <div className="mt-4 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chart} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--line))" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={(d) => format(parseDate(d), 'd MMM')} tick={{ fill: 'hsl(var(--muted))', fontSize: 12 }} axisLine={false} tickLine={false} minTickGap={24} />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: 'hsl(var(--muted))', fontSize: 12 }} axisLine={false} tickLine={false} width={44} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--line))', borderRadius: 12 }}
                      labelFormatter={(d) => friendlyDate(String(d))}
                      formatter={(v) => [`${num(Number(v))} ${unit}`, '']}
                    />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--blue))" strokeWidth={3} dot={{ r: 3, fill: 'hsl(var(--blue))' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <SectionTitle>History</SectionTitle>
          <div className="space-y-3">
            {data.sessions.map((s) => (
              <button key={s.workoutId} onClick={() => navigate(`/workout/history/${s.workoutId}`)} className="card block w-full p-4 text-left hover:bg-raised/50">
                <div className="flex justify-between">
                  <span className="font-semibold">{friendlyDate(s.date)}</span>
                  <span className="text-sm text-muted">{s.workoutName}</span>
                </div>
                <ul className="num mt-1 space-y-0.5 text-[15px] text-muted">
                  {s.sets.filter((x) => x.isCompleted).map((x) => (
                    <li key={x.id}>{x.setType === 1 ? 'W  ' : ''}{formatSet(x, ex.measurementType, unit)}</li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </>
      )}

      {ex.isCustom && (
        <Button variant="danger" className="mt-6 w-full" onClick={() => setConfirmDelete(true)}><Trash2 /> Delete exercise</Button>
      )}

      <ExerciseFormSheet open={editing} onOpenChange={setEditing} exercise={ex} onSaved={() => refetch()} />
      <ConfirmSheet
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${ex.name}?`}
        description="It disappears from the library. Past workouts keep their sets."
        confirmLabel="Delete exercise"
        destructive
        onConfirm={async () => { await del.mutateAsync(ex.id); navigate('/workout/exercises', { replace: true }); }}
      />
    </>
  );
}
