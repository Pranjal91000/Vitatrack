import { format } from 'date-fns';
import { History } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Empty, ErrorState, Loading } from '@/components/ui/primitives';
import { useWorkoutHistory } from '@/hooks/useWorkouts';
import { parseDate } from '@/lib/format';
import { errorMessage } from '@/lib/api';
import type { WorkoutSummary } from '@/types/api';
import { WorkoutCard } from './WorkoutCard';

export default function HistoryPage() {
  const q = useWorkoutHistory();
  const items = q.data?.pages.flatMap((p) => p.data) ?? [];
  const total = q.data?.pages[0]?.meta?.total ?? 0;

  const groups: { month: string; items: WorkoutSummary[] }[] = [];
  for (const w of items) {
    const month = format(parseDate(w.date), 'MMMM yyyy');
    const g = groups[groups.length - 1];
    if (g?.month === month) g.items.push(w);
    else groups.push({ month, items: [w] });
  }

  return (
    <>
      <PageHeader back="/workout" title="History" subtitle={total ? `${total} workouts logged` : undefined} />
      {q.isLoading ? (
        <Loading />
      ) : q.error ? (
        <ErrorState message={errorMessage(q.error)} onRetry={() => q.refetch()} />
      ) : !items.length ? (
        <Empty icon={<History />} title="No workouts yet" body="Finished workouts show up here with every set you logged." />
      ) : (
        <>
          {groups.map((g) => (
            <section key={g.month}>
              <h2 className="mb-3 mt-6 px-1 text-xl font-bold text-foreground">{g.month}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {g.items.map((w) => <WorkoutCard key={w.id} w={w} />)}
              </div>
            </section>
          ))}
          {q.hasNextPage && (
            <Button variant="secondary" className="mt-4 w-full" loading={q.isFetchingNextPage} onClick={() => q.fetchNextPage()}>
              Load older workouts
            </Button>
          )}
        </>
      )}
    </>
  );
}
