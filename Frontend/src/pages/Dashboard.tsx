import { useAuthStore } from '@/store/auth';
import { useDailyDashboard } from '@/hooks/useDashboard';
import { format } from 'date-fns';
import { useDateStore } from '@/store/dateStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import { Utensils, Dumbbell, Flame, Trophy, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { MealBuilder } from '@/components/trackers/MealBuilder';
import { WorkoutLogger } from '@/components/trackers/WorkoutLogger';

export function Dashboard() {
    const user = useAuthStore((state) => state.user);
    const { currentDate } = useDateStore();
    const { data, isLoading } = useDailyDashboard(currentDate);

    if (isLoading) {
        return <DashboardSkeleton />
    }

    const calories = data?.meals?.calories || 0;
    const calorieGoal = data?.calorieGoal || 2000;
    const protein = data?.meals?.proteinG || 0;
    const proteinGoal = 150;
    const workouts = data?.workoutsCompleted || 0;
    const streak = data?.wellnessStreak ?? 0;
    const mealsLogged = data?.mealsLoggedCount ?? 0;

    const stats = [
        {
            label: 'Calories',
            value: `${Math.round(calories)} / ${Math.round(calorieGoal)}`,
            icon: Flame,
            textColor: 'text-orange-500',
            bgColor: 'bg-orange-500',
            progress: Math.min((calories / calorieGoal) * 100, 100)
        },
        {
            label: 'Protein',
            value: `${Math.round(protein)}g / ${proteinGoal}g`,
            icon: Utensils,
            textColor: 'text-green-500',
            bgColor: 'bg-green-500',
            progress: Math.min((protein / proteinGoal) * 100, 100)
        },
        {
            label: 'Workouts',
            value: `${workouts} today`,
            icon: Dumbbell,
            textColor: 'text-blue-500',
            bgColor: 'bg-blue-500',
            progress: workouts > 0 ? 100 : 0
        },
        {
            label: 'Wellness streak',
            value: `${streak} days`,
            icon: Trophy,
            textColor: 'text-yellow-500',
            bgColor: 'bg-yellow-500',
            progress: streak > 0 ? 100 : 0
        },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Hello, {user?.name}</h1>
                    <p className="text-muted-foreground">
                        Overview for {format(new Date(currentDate + 'T12:00:00'), 'EEEE, MMMM do')}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <MealBuilder />
                    <WorkoutLogger />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.label}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.textColor}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="mt-3 h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${stat.bgColor}`}
                                    style={{ width: `${stat.progress}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Today&apos;s focus</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <Utensils className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Meals logged</p>
                                    <p className="text-sm text-muted-foreground">{mealsLogged} meal{mealsLogged === 1 ? '' : 's'} on this day</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <Dumbbell className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Workouts</p>
                                    <p className="text-sm text-muted-foreground">{workouts} session{workouts === 1 ? '' : 's'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <Target className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Streak</p>
                                    <p className="text-sm text-muted-foreground">Consecutive days with a meal or workout logged</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {data?.quickStats?.map((stat, i) => (
                                <div key={i} className="flex items-center justify-between gap-4">
                                    <p className="text-sm font-medium leading-none">{stat.label}</p>
                                    <p className="text-sm font-medium tabular-nums shrink-0">{stat.value}</p>
                                </div>
                            ))}
                            {!data?.quickStats?.length && (
                                <div className="text-center py-4 text-muted-foreground">
                                    Log meals or workouts to see more detail.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[120px]" />)}
            </div>
            <div className="grid gap-4 md:grid-cols-7">
                <Skeleton className="col-span-4 h-[300px]" />
                <Skeleton className="col-span-3 h-[300px]" />
            </div>
        </div>
    )
}
