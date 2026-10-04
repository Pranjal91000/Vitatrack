
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subDays, subMonths, subYears, format } from 'date-fns';
import { toast } from 'sonner';
import { weightTrackerApi } from '@/api/weightTrackerApi';
import type { CreateWeightRequest, UpdateWeightRequest } from '@/types/api';

// ─── Query Key Factory ─────────────────────────────────────────────────────────
export const weightKeys = {
    all: ['weight'] as const,
    history: (range?: string) => ['weight', 'history', range ?? 'all'] as const,
    latest: () => ['weight', 'latest'] as const,
};

// ─── Time Range Helpers ────────────────────────────────────────────────────────
export type WeightTimeRange = '7D' | '30D' | '3M' | '6M' | '1Y' | 'All';

/** Returns fromDate / toDate as plain date strings (yyyy-MM-dd) for the API. */
export function getDateRange(range: WeightTimeRange): { fromDate?: string; toDate?: string } {
    const now = new Date();
    const toDate = format(now, 'yyyy-MM-dd');

    if (range === 'All') return {};

    const fromDate = (() => {
        switch (range) {
            case '7D': return subDays(now, 7);
            case '30D': return subDays(now, 30);
            case '3M': return subMonths(now, 3);
            case '6M': return subMonths(now, 6);
            case '1Y': return subYears(now, 1);
        }
    })();

    return { fromDate: format(fromDate, 'yyyy-MM-dd'), toDate };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Fetches weight history for the given time range from /weight-history. */
export const useWeightHistory = (range: WeightTimeRange = 'All') => {
    const { fromDate, toDate } = getDateRange(range);
    return useQuery({
        queryKey: weightKeys.history(range),
        queryFn: () => weightTrackerApi.getHistory(fromDate, toDate),
        staleTime: 1000 * 60 * 5,
    });
};

/** Fetches the latest measurement from /latest-record. */
export const useLatestWeight = () => {
    return useQuery({
        queryKey: weightKeys.latest(),
        queryFn: () => weightTrackerApi.getLatest(),
        staleTime: 1000 * 60 * 5,
    });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useCreateWeight = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (req: CreateWeightRequest) => weightTrackerApi.create(req),
        onSuccess: () => {
            toast.success('Weight logged!');
            queryClient.invalidateQueries({ queryKey: weightKeys.all });
        },
        onError: () => {
            toast.error('Failed to log weight. Please try again.');
        },
    });
};

export const useUpdateWeight = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (req: UpdateWeightRequest) => weightTrackerApi.update(req),
        onSuccess: () => {
            toast.success('Measurement updated');
            queryClient.invalidateQueries({ queryKey: weightKeys.all });
        },
        onError: () => {
            toast.error('Failed to update measurement.');
        },
    });
};

export const useDeleteWeight = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => weightTrackerApi.delete(id),
        onSuccess: () => {
            toast.success('Measurement deleted');
            queryClient.invalidateQueries({ queryKey: weightKeys.all });
        },
        onError: () => {
            toast.error('Failed to delete measurement.');
        },
    });
};
