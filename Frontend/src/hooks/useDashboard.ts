
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { DashboardDailyDto } from '@/types/api';

export const useDailyDashboard = (date: string) => {
    return useQuery<DashboardDailyDto>({
        queryKey: ['dashboard', date],
        queryFn: async () => {
            const { data } = await api.get(`/dashboard/daily?date=${date}`);
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 mins
    });
};
