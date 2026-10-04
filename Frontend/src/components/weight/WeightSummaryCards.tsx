
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus, Scale, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { WeightMeasurement } from '@/types/api';
import { format, parseISO, subDays } from 'date-fns';

interface WeightSummaryCardsProps {
    history: WeightMeasurement[];
    isLoading: boolean;
}

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
    }),
};

export function WeightSummaryCards({ history, isLoading }: WeightSummaryCardsProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-[110px] rounded-xl" />
                ))}
            </div>
        );
    }

    // Sort descending by recordedOn
    const sorted = [...history].sort(
        (a, b) => new Date(b.recordedOn).getTime() - new Date(a.recordedOn).getTime()
    );

    const latest = sorted[0];
    const thirtyDaysAgo = subDays(new Date(), 30);

    // Find the oldest measurement within the last 30 days as the baseline for change
    const oldMeasurement = [...sorted].reverse().find(
        (m) => new Date(m.recordedOn) <= thirtyDaysAgo
    );

    const change = latest && oldMeasurement ? latest.weight - oldMeasurement.weight : null;
    const lowest = history.length > 0 ? Math.min(...history.map((m) => m.weight)) : null;
    const highest = history.length > 0 ? Math.max(...history.map((m) => m.weight)) : null;

    const cards = [
        {
            title: 'Current Weight',
            icon: Scale,
            iconColor: 'text-violet-500',
            bgColor: 'from-violet-500/10 to-violet-500/5',
            borderColor: 'border-violet-500/20',
            content: latest ? (
                <div>
                    <p className="text-3xl font-bold tracking-tight">
                        {latest.weight.toFixed(1)}
                        <span className="text-lg font-medium text-muted-foreground ml-1">kg</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {format(parseISO(latest.recordedOn), 'MMM d, yyyy')}
                    </p>
                </div>
            ) : (
                <p className="text-muted-foreground text-sm">No measurements yet</p>
            ),
        },
        {
            title: 'Change (30 Days)',
            icon: change !== null && change < 0 ? TrendingDown : change !== null && change > 0 ? TrendingUp : Minus,
            iconColor:
                change === null ? 'text-muted-foreground'
                    : change < 0 ? 'text-emerald-500'
                    : change > 0 ? 'text-rose-500'
                    : 'text-muted-foreground',
            bgColor:
                change === null ? 'from-muted/20 to-muted/10'
                    : change < 0 ? 'from-emerald-500/10 to-emerald-500/5'
                    : change > 0 ? 'from-rose-500/10 to-rose-500/5'
                    : 'from-muted/20 to-muted/10',
            borderColor:
                change === null ? 'border-border'
                    : change < 0 ? 'border-emerald-500/20'
                    : change > 0 ? 'border-rose-500/20'
                    : 'border-border',
            content:
                change !== null ? (
                    <div>
                        <p
                            className={`text-3xl font-bold tracking-tight ${
                                change < 0 ? 'text-emerald-500' : change > 0 ? 'text-rose-500' : ''
                            }`}
                        >
                            {change > 0 ? '+' : ''}
                            {change.toFixed(1)}
                            <span className="text-lg font-medium text-muted-foreground ml-1">kg</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">vs 30 days ago</p>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm">Not enough data</p>
                ),
        },
        {
            title: 'All-Time Range',
            icon: Activity,
            iconColor: 'text-indigo-500',
            bgColor: 'from-indigo-500/10 to-indigo-500/5',
            borderColor: 'border-indigo-500/20',
            content:
                lowest !== null && highest !== null ? (
                    <div className="space-y-1">
                        <div className="flex items-end gap-3">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Lowest</p>
                                <p className="text-xl font-bold text-emerald-500">
                                    {lowest.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">kg</span>
                                </p>
                            </div>
                            <div className="h-7 w-px bg-border mx-1" />
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Highest</p>
                                <p className="text-xl font-bold text-rose-500">
                                    {highest.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">kg</span>
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm">No data yet</p>
                ),
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {cards.map((card, i) => (
                <motion.div key={card.title} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                    <Card className={`border bg-gradient-to-br ${card.bgColor} ${card.borderColor} overflow-hidden`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                        </CardHeader>
                        <CardContent>{card.content}</CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
