
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { MoreHorizontal, Pencil, Trash2, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteWeight } from '@/hooks/useWeightTracker';
import type { WeightMeasurement } from '@/types/api';

interface RecentMeasurementsProps {
    history: WeightMeasurement[];
    isLoading: boolean;
    onAddClick: () => void;
    onEditClick: (measurement: WeightMeasurement) => void;
}

function formatMeasurementDate(dateStr: string): string {
    // recordedOn is "yyyy-MM-dd" — parse as local date
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
}

export function RecentMeasurements({ history, isLoading, onAddClick, onEditClick }: RecentMeasurementsProps) {
    const deleteMutation = useDeleteWeight();

    const sorted = [...history]
        .sort((a, b) => new Date(b.recordedOn).getTime() - new Date(a.recordedOn).getTime())
        .slice(0, 10);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Recent Measurements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-12 rounded-lg" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (sorted.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center">
                        <Scale className="w-8 h-8 text-violet-500" />
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">No weight measurements yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Start tracking your progress by recording your first measurement.
                        </p>
                    </div>
                    <Button
                        id="empty-state-add-weight"
                        onClick={onAddClick}
                        className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
                    >
                        + Add Weight
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Recent Measurements</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <AnimatePresence initial={false}>
                    {sorted.map((measurement, i) => {
                        const prev = sorted[i + 1];
                        const delta = prev ? measurement.weight - prev.weight : null;

                        return (
                            <motion.div
                                key={measurement.id}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12 }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-center justify-between px-6 py-4 border-b last:border-0 hover:bg-muted/30 transition-colors group"
                            >
                                {/* Date */}
                                <p className="text-sm font-medium">
                                    {formatMeasurementDate(measurement.recordedOn)}
                                </p>

                                {/* Weight + delta + actions */}
                                <div className="flex items-center gap-3 shrink-0">
                                    {delta !== null && (
                                        <span
                                            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                                delta < 0
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : delta > 0
                                                    ? 'bg-rose-500/10 text-rose-600'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                                        </span>
                                    )}
                                    <span className="text-sm font-bold tabular-nums">
                                        {measurement.weight.toFixed(1)}{' '}
                                        <span className="text-muted-foreground font-normal text-xs">kg</span>
                                    </span>

                                    {/* Edit & Delete actions */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                id={`weight-row-menu-${measurement.id}`}
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-36">
                                            <DropdownMenuItem
                                                id={`edit-weight-${measurement.id}`}
                                                onClick={() => onEditClick(measurement)}
                                                className="gap-2 cursor-pointer"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                id={`delete-weight-${measurement.id}`}
                                                onClick={() => deleteMutation.mutate(measurement.id)}
                                                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
