import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useNutritionReport, useWorkoutReport } from '@/hooks/useReports';
import { Skeleton } from '@/components/ui/skeleton';
import { subDays, format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

function rollingAverage(values: number[], windowSize: number): number[] {
  if (values.length === 0) return [];
  return values.map((_, i) => {
    const start = Math.max(0, i - windowSize + 1);
    const slice = values.slice(start, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

export function Reports() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 13),
    to: new Date(),
  });

  const fromStr = date?.from ? format(date.from, 'yyyy-MM-dd') : '';
  const toStr = date?.to ? format(date.to, 'yyyy-MM-dd') : '';

  const { data: nutritionData, isLoading: isNutritionLoading } = useNutritionReport(fromStr, toStr);
  const { data: workoutData, isLoading: isWorkoutLoading } = useWorkoutReport(fromStr, toStr);

  const isLoading = isNutritionLoading || isWorkoutLoading;

  const nutritionChartData = useMemo(() => {
    const daily = nutritionData?.dailyItems ?? [];
    const cals = daily.map((d) => d.calories);
    const roll = rollingAverage(
      cals.map((c) => Number(c)),
      Math.min(7, Math.max(1, cals.length))
    );
    return daily.map((d, i) => ({
      ...d,
      calories7d: Math.round(roll[i] ?? d.calories),
    }));
  }, [nutritionData]);

  const slotChartData = useMemo(
    () =>
      (nutritionData?.slotAggregates ?? []).map((s) => ({
        name: s.mealSlotName,
        calories: Math.round(s.totalCalories),
        protein: Math.round(s.proteinG),
      })),
    [nutritionData]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Nutrition and workout trends for the selected range.</p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                'w-full sm:w-[280px] justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, 'LLL dd, y')} – {format(date.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(date.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              autoFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 2}
              className="rounded-md"
            />
          </PopoverContent>
        </Popover>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          <Skeleton className="h-[320px] w-full rounded-xl" />
          <Skeleton className="h-[320px] w-full rounded-xl" />
        </div>
      ) : (
        <Tabs defaultValue="nutrition" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-10">
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
          </TabsList>

          <TabsContent value="nutrition" className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg protein % of calories</CardTitle>
                  <CardDescription>Days with calories logged</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {nutritionData?.avgProteinCaloriePercent?.toFixed(1) ?? '—'}%
                  </p>
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Macros by meal slot</CardTitle>
                  <CardDescription>Total protein (g) per Breakfast, Lunch, etc.</CardDescription>
                </CardHeader>
                <CardContent className="h-[220px]">
                  {slotChartData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={slotChartData} layout="vertical" margin={{ left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={88} tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            background: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)',
                          }}
                        />
                        <Bar dataKey="protein" fill="#10b981" radius={[0, 4, 4, 0]} name="Protein (g)" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      No nutrition data in this range
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Daily calories & 7-day trend</CardTitle>
                <CardDescription>Raw calories vs rolling average</CardDescription>
              </CardHeader>
              <CardContent className="pl-0 pr-2 h-[min(400px,50vh)] w-full">
                {nutritionChartData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={nutritionChartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                      <XAxis dataKey="date" stroke="#888" fontSize={11} tickLine={false} />
                      <YAxis stroke="#888" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="calories"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                        name="Calories"
                      />
                      <Line
                        type="monotone"
                        dataKey="calories7d"
                        stroke="#a855f7"
                        strokeWidth={2}
                        dot={false}
                        name="7-day avg"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No nutrition data for selected period
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workouts" className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{workoutData?.totalSessions ?? 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Training minutes</CardTitle>
                  <CardDescription>Sum of set durations</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{workoutData?.totalDurationMinutes ?? 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Distance (km)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {(workoutData?.totalDistanceKm ?? 0).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Volume by exercise</CardTitle>
                <CardDescription>Approx. weight × reps where logged</CardDescription>
              </CardHeader>
              <CardContent className="h-[min(400px,50vh)] w-full pr-2">
                {workoutData?.items?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workoutData.items}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                      <XAxis
                        dataKey="exerciseName"
                        stroke="#888"
                        fontSize={11}
                        tickLine={false}
                        interval={0}
                        angle={-28}
                        textAnchor="end"
                        height={72}
                      />
                      <YAxis stroke="#888" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                        }}
                      />
                      <Bar dataKey="totalVolume" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Volume" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[280px] items-center justify-center text-muted-foreground">
                    No workouts in this range
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
