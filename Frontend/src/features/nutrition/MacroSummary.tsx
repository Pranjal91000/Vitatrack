import { Bar } from '@/components/ui/primitives';
import { num } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Nutrients, NutritionGoals } from '@/types/api';

/** Calories remaining as the hero number, macros as three plate-coloured bars. */
export function MacroSummary({ consumed, goals, compact }: { consumed: Nutrients; goals: NutritionGoals; compact?: boolean }) {
  const remaining = goals.calories - consumed.calories;
  const over = remaining < 0;
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className={cn('num font-display font-semibold leading-none', compact ? 'text-[40px]' : 'text-[52px]', over && 'text-destructive')}>
            {num(Math.abs(remaining), 0)}
          </div>
          <div className="mt-1 text-sm text-muted">{over ? 'kcal over goal' : 'kcal remaining'}</div>
        </div>
        <div className="num text-right text-sm text-muted">
          <div><span className="font-semibold text-foreground">{num(consumed.calories, 0)}</span> eaten</div>
          <div>{num(goals.calories, 0)} goal</div>
        </div>
      </div>
      <Bar value={consumed.calories} max={goals.calories} className="mt-3 h-2.5" />
      <div className="mt-4 grid grid-cols-3 gap-4">
        <Macro label="Protein" value={consumed.proteinG} goal={goals.proteinG} color="bg-protein" />
        <Macro label="Carbs" value={consumed.carbsG} goal={goals.carbsG} color="bg-carbs" />
        <Macro label="Fat" value={consumed.fatG} goal={goals.fatG} color="bg-fat" />
      </div>
    </div>
  );
}

function Macro({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold">{label}</span>
      </div>
      <Bar value={value} max={goal} colorClass={color} className="mt-1.5" />
      <div className="num mt-1 text-xs text-muted">{num(value, 0)} / {num(goal, 0)} g</div>
    </div>
  );
}
