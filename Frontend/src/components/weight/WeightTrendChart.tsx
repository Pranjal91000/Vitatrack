
import { motion } from 'framer-motion';
import {
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    Area,
    AreaChart,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { WeightMeasurement } from '@/types/api';
import type { WeightTimeRange } from '@/hooks/useWeightTracker';

interface WeightTrendChartProps {
    history: WeightMeasurement[];
    isLoading: boolean;
    range: WeightTimeRange;
    onRangeChange: (range: WeightTimeRange) => void;
}

const TIME_RANGES: WeightTimeRange[] = ['7D', '30D', '3M', '6M', '1Y', 'All'];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { date: string; weight: number; fullDate: string } }> }) {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload as { date: string; weight: number; fullDate: string };
    return (
        <div className="bg-popover border border-border rounded-lg shadow-xl px-4 py-3 text-sm">
            <p className="font-semibold text-foreground">{point.fullDate}</p>
            <p className="text-violet-500 font-bold text-lg mt-0.5">{point.weight.toFixed(1)} kg</p>
        </div>
    );
}

export function WeightTrendChart({ history, isLoading, range, onRangeChange }: WeightTrendChartProps) {
    const chartData = [...history]
        .sort((a, b) => new Date(a.recordedOn).getTime() - new Date(b.recordedOn).getTime())
        .map((m) => ({
            date: format(parseISO(m.recordedOn), range === '7D' || range === '30D' ? 'MMM d' : 'MMM d'),
            fullDate: format(parseISO(m.recordedOn), 'MMMM d, yyyy'),
            weight: m.weight,
        }));

    const weights = chartData.map((d) => d.weight);
    const minWeight = weights.length > 0 ? Math.min(...weights) : 0;
    const maxWeight = weights.length > 0 ? Math.max(...weights) : 100;
    const padding = (maxWeight - minWeight) * 0.15 || 2;
    const yMin = Math.max(0, Math.floor(minWeight - padding));
    const yMax = Math.ceil(maxWeight + padding);
    const avgWeight = weights.length > 0 ? weights.reduce((s, w) => s + w, 0) / weights.length : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <Card className="border border-violet-500/10 bg-gradient-to-br from-violet-500/5 to-indigo-500/5">
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-base font-semibold">Weight Trend</CardTitle>
                        <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1 w-fit">
                            {TIME_RANGES.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => onRangeChange(r)}
                                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200 ${
                                        range === r
                                            ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/30'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-[280px] w-full rounded-lg" />
                    ) : chartData.length === 0 ? (
                        <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                            <div className="text-4xl opacity-30">📈</div>
                            <p className="text-sm">No data for this time range</p>
                            <p className="text-xs opacity-70">Log your first measurement to see trends</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="currentColor"
                                    strokeOpacity={0.06}
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }}
                                    axisLine={false}
                                    tickLine={false}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    domain={[yMin, yMax]}
                                    tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `${v}`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#7c3aed', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                {avgWeight !== null && (
                                    <ReferenceLine
                                        y={avgWeight}
                                        stroke="#7c3aed"
                                        strokeDasharray="4 4"
                                        strokeOpacity={0.4}
                                        label={{ value: `Avg ${avgWeight.toFixed(1)}`, fill: '#7c3aed', fontSize: 10, opacity: 0.7 }}
                                    />
                                )}
                                <Area
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="#7c3aed"
                                    strokeWidth={2.5}
                                    fill="url(#weightGradient)"
                                    dot={chartData.length <= 20 ? { r: 4, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 } : false}
                                    activeDot={{ r: 6, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
