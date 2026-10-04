import { useState } from 'react';
import { useExerciseMonthlyReport } from '@/hooks/useReports';
import type { ExerciseDailySummaryDto } from '@/types/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths, addMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ExerciseMonthlyViewDialog({ exerciseId, exerciseName, open, onOpenChange }: { exerciseId: number | null, exerciseName: string, open: boolean, onOpenChange: (open: boolean) => void }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const monthStr = format(currentMonth, 'yyyy-MM');

    // We only fetch if exerciseId is not null
    const { data: report, isLoading } = useExerciseMonthlyReport(exerciseId ?? 0, monthStr);

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    if (!exerciseId) return null;

    const isCardio = report?.dailySummaries.some((s: ExerciseDailySummaryDto) => s.totalDistanceKm > 0 || s.averagePaceMinPerKm > 0);

    const aggregates = isCardio ? {
        totalDistance: report?.dailySummaries.reduce((sum: number, s: ExerciseDailySummaryDto) => sum + s.totalDistanceKm, 0) || 0,
        totalTime: report?.dailySummaries.reduce((sum: number, s: ExerciseDailySummaryDto) => sum + s.totalDurationSeconds, 0) || 0,
        bestPace: report?.dailySummaries.filter((s: ExerciseDailySummaryDto) => s.averagePaceMinPerKm > 0).reduce((min: number, s: ExerciseDailySummaryDto) => Math.min(min, s.averagePaceMinPerKm), Infinity) || 0,
        totalVolume: 0, maxWeight: 0, totalReps: 0
    } : {
        totalDistance: 0, totalTime: 0, bestPace: 0,
        totalVolume: report?.dailySummaries.reduce((sum: number, s: ExerciseDailySummaryDto) => sum + s.totalVolume, 0) || 0,
        maxWeight: report?.dailySummaries.reduce((max: number, s: ExerciseDailySummaryDto) => Math.max(max, s.maxWeight), 0) || 0,
        totalReps: report?.dailySummaries.reduce((sum: number, s: ExerciseDailySummaryDto) => sum + s.totalReps, 0) || 0,
    };


    if (aggregates.bestPace === Infinity) aggregates.bestPace = 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] h-[85vh] flex flex-col p-6">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl">{exerciseName}</DialogTitle>
                            <DialogDescription>Monthly Performance Trends</DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="icon" onClick={handlePrevMonth} aria-label="Previous month">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium w-28 text-center">{format(currentMonth, 'MMMM yyyy')}</span>
                            <Button type="button" variant="outline" size="icon" onClick={handleNextMonth} aria-label="Next month">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-6 pt-4 pr-2">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground animate-pulse">Loading data...</div>
                    ) : !report?.dailySummaries.length ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground flex-col">
                            <p className="text-lg mb-2">No logging data found for {format(currentMonth, 'MMMM yyyy')}</p>
                            <p className="text-sm opacity-70">Log this exercise to see your trends here.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-3 gap-4">
                                {isCardio ? (
                                    <>
                                        <MetricCard title="Total Distance" value={`${aggregates.totalDistance.toFixed(2)} km`} />
                                        <MetricCard title="Total Time" value={`${Math.round(aggregates.totalTime / 60)} min`} />
                                        <MetricCard title="Best Pace" value={`${aggregates.bestPace ? aggregates.bestPace.toFixed(2) : '-'} /km`} />
                                    </>
                                ) : (
                                    <>
                                        <MetricCard title="Total Volume" value={`${Math.round(aggregates.totalVolume)} kg`} />
                                        <MetricCard title="Max Weight" value={`${aggregates.maxWeight} kg`} />
                                        <MetricCard title="Total Reps" value={`${aggregates.totalReps}`} />
                                    </>
                                )}
                            </div>

                            <Card className="shadow-none border border-muted">
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{isCardio ? 'Distance per Day (km)' : 'Volume per Day (kg)'}</CardTitle></CardHeader>
                                <CardContent className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={report.dailySummaries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
                                            <XAxis dataKey="date" tickFormatter={(val) => format(new Date(val), 'd MMM')} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                            <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} labelFormatter={(val) => format(new Date(val), 'd MMMM yyyy')} />
                                            <Bar dataKey={isCardio ? "totalDistanceKm" : "totalVolume"} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={32} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="shadow-none border border-muted">
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{isCardio ? 'Average Pace Trend (/km)' : 'Max Weight Trend (kg)'}</CardTitle></CardHeader>
                                <CardContent className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={report.dailySummaries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
                                            <XAxis dataKey="date" tickFormatter={(val) => format(new Date(val), 'd MMM')} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} labelFormatter={(val) => format(new Date(val), 'd MMMM yyyy')} />
                                            <Line type="monotone" dataKey={isCardio ? "averagePaceMinPerKm" : "maxWeight"} stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'var(--background)' }} activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function MetricCard({ title, value }: { title: string, value: string }) {
    return (
        <Card className="shadow-sm border-muted/50">
            <CardHeader className="p-4 pb-1"><CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</CardTitle></CardHeader>
            <CardContent className="p-4 pt-0"><p className="text-3xl font-bold tracking-tight">{value}</p></CardContent>
        </Card>
    );
}
