import { useCallback, useState } from 'react';
import { WorkoutLogger } from '@/components/trackers/WorkoutLogger';
import { CalendarHeatmap } from '@/components/trackers/CalendarHeatMap';
import { DailyWorkouts } from '@/components/trackers/DailyWorkouts';
import { useGetWorkoutHeatmapData } from '@/hooks/useWorkouts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function localMidnightMs(ymd: string) {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, m - 1, d).setHours(0, 0, 0, 0);
}

export function Workouts() {
    const [heatmapYear, setHeatmapYear] = useState(() => new Date().getFullYear());
    const fromDate = `${heatmapYear}-01-01`;
    const toDate = `${heatmapYear}-12-31`;
    const { data: heatmapDays = [] } = useGetWorkoutHeatmapData(fromDate, toDate);

    const getData = useCallback(
        (from: Date, to: Date) => {
            const fromMs = new Date(from).setHours(0, 0, 0, 0);
            const toMs = new Date(to).setHours(23, 59, 59, 999);
            return heatmapDays.filter((row) => {
                const t = localMidnightMs(row.date);
                return t >= fromMs && t <= toMs;
            });
        },
        [heatmapDays]
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
                    <p className="text-muted-foreground">Log sessions and track consistency.</p>
                </div>
                <div className="shrink-0">
                    <WorkoutLogger />
                </div>
            </div>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Workout consistency</CardTitle>
                    <CardDescription>Sessions logged per day for the selected year</CardDescription>
                </CardHeader>
                <CardContent>
                    <CalendarHeatmap
                        getData={getData}
                        color="#3b82f6"
                        yearChangeAllowed
                        year={heatmapYear}
                        onYearChange={setHeatmapYear}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Sessions on selected date</CardTitle>
                    <CardDescription>Use the date control in the header to view another day.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DailyWorkouts />
                </CardContent>
            </Card>
        </div>
    );
}
