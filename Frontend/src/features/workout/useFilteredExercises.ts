import { useMemo } from 'react';
import { useExerciseLibrary } from '@/hooks/useWorkouts';

export function useFilteredExercises(search: string, muscle: string | null) {
  const { data, isLoading, error, refetch } = useExerciseLibrary();
  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    return (data ?? []).filter((e) => {
      if (muscle === 'Custom' ? !e.isCustom : muscle && !e.muscleGroups.includes(muscle)) return false;
      if (!words.length) return true;
      const hay = `${e.name} ${e.equipment ?? ''} ${e.muscleGroups.join(' ')}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [data, search, muscle]);
  return { list, isLoading, error, refetch, all: data ?? [] };
}
