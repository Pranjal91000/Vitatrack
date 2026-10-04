import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Empty, ErrorState, Input, Loading } from '@/components/ui/primitives';
import { errorMessage } from '@/lib/api';
import { ExerciseFormSheet, ExerciseRow, MuscleFilter } from './ExerciseSheets';
import { useFilteredExercises } from './useFilteredExercises';

export default function ExerciseLibraryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const { list, isLoading, error, refetch, all } = useFilteredExercises(search, muscle);

  return (
    <>
      <PageHeader
        back="/workout"
        title="Exercises"
        subtitle={all.length ? `${all.length} in your library` : undefined}
        actions={<Button size="icon-sm" variant="secondary" onClick={() => setCreating(true)} aria-label="New exercise"><Plus /></Button>}
      />
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exercises" className="pl-11" />
      </div>
      <div className="mb-3 px-1"><MuscleFilter value={muscle} onChange={setMuscle} /></div>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
      ) : !list.length ? (
        <Empty title="Nothing matches" body="Create it as a custom exercise." action={<Button variant="secondary" onClick={() => setCreating(true)}><Plus /> New exercise</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {list.map((e) => (
            <div key={e.id} className="card p-1.5 hover:border-primary/40 transition-colors">
              <ExerciseRow e={e} onClick={() => navigate(`/workout/exercises/${e.id}`)} />
            </div>
          ))}
        </div>
      )}
      <ExerciseFormSheet open={creating} onOpenChange={setCreating} initialName={search} onSaved={(e) => navigate(`/workout/exercises/${e.id}`)} />
    </>
  );
}
