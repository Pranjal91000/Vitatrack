
import { MealBuilder } from '@/components/trackers/MealBuilder';
import { DailyMeals } from '@/components/trackers/DailyMeals';

export function Meals() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Meals</h1>
                    <p className="text-muted-foreground">Log your nutrition and track macros.</p>
                </div>
                <div className="shrink-0">
                    <MealBuilder />
                </div>
            </div>
            <DailyMeals />
        </div>
    );
}
