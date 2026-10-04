
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { WeightSummaryCards } from '@/components/weight/WeightSummaryCards';
import { WeightTrendChart } from '@/components/weight/WeightTrendChart';
import { RecentMeasurements } from '@/components/weight/RecentMeasurements';
import { WeightMeasurementModal } from '@/components/weight/WeightMeasurementModal';
import { useWeightHistory } from '@/hooks/useWeightTracker';
import type { WeightTimeRange } from '@/hooks/useWeightTracker';
import type { WeightMeasurement } from '@/types/api';

export function WeightTracker() {
    // ── Modal state ─────────────────────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMeasurement, setEditingMeasurement] = useState<WeightMeasurement | null>(null);

    // ── Time range state ────────────────────────────────────────────────────────
    const [chartRange, setChartRange] = useState<WeightTimeRange>('30D');

    // ── Data ────────────────────────────────────────────────────────────────────
    // We fetch "All" history once for summary cards + recent list (small dataset).
    // The chart fetches only the selected range for efficiency.
    const { data: allHistory = [], isLoading: historyLoading } = useWeightHistory('All');
    const { data: chartHistory = [], isLoading: chartLoading } = useWeightHistory(chartRange);

    // ── Handlers ────────────────────────────────────────────────────────────────
    const handleAddClick = () => {
        setEditingMeasurement(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (measurement: WeightMeasurement) => {
        setEditingMeasurement(measurement);
        setIsModalOpen(true);
    };

    const handleModalClose = (open: boolean) => {
        setIsModalOpen(open);
        if (!open) {
            // Small delay so the animation completes before clearing the editing state
            setTimeout(() => setEditingMeasurement(null), 200);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Header ──────────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-1"
                >
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-violet-500/15">
                            <Scale className="h-5 w-5 text-violet-500" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Weight</h1>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Track your body weight and monitor your progress over time.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                >
                    <Button
                        id="add-weight-btn"
                        onClick={handleAddClick}
                        className="gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/30 hover:-translate-y-0.5"
                    >
                        <Plus className="h-4 w-4" />
                        Add Weight
                    </Button>
                </motion.div>
            </div>

            {/* ── Summary Cards ───────────────────────────────────────────────── */}
            <WeightSummaryCards history={allHistory} isLoading={historyLoading} />

            {/* ── Trend Chart ─────────────────────────────────────────────────── */}
            <WeightTrendChart
                history={chartHistory}
                isLoading={chartLoading}
                range={chartRange}
                onRangeChange={setChartRange}
            />

            {/* ── Recent Measurements ─────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                {historyLoading ? (
                    <Skeleton className="h-[300px] rounded-xl" />
                ) : (
                    <RecentMeasurements
                        history={allHistory}
                        isLoading={historyLoading}
                        onAddClick={handleAddClick}
                        onEditClick={handleEditClick}
                    />
                )}
            </motion.div>

            {/* ── Modal ───────────────────────────────────────────────────────── */}
            <WeightMeasurementModal
                open={isModalOpen}
                onOpenChange={handleModalClose}
                editingMeasurement={editingMeasurement}
            />
        </div>
    );
}
