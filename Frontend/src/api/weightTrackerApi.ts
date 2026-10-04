
import api from '@/lib/api';
import type { WeightMeasurement, CreateWeightRequest, UpdateWeightRequest } from '@/types/api';

export const weightTrackerApi = {
    /**
     * GET /api/weight-tracker/weight-history
     * Returns all measurements optionally filtered by date range.
     * Response: [{ id, recordedOn, weight }]
     */
    getHistory: async (fromDate?: string, toDate?: string): Promise<WeightMeasurement[]> => {
        const params = new URLSearchParams();
        if (fromDate) params.set('fromDate', fromDate);
        if (toDate) params.set('toDate', toDate);

        const query = params.toString() ? `?${params.toString()}` : '';
        const { data } = await api.get<WeightMeasurement[]>(`/weight-tracker/weight-history${query}`);
        return Array.isArray(data) ? data : [];
    },

    /**
     * GET /api/weight-tracker/latest-record
     * Returns the most recent measurement, or null if none exists.
     */
    getLatest: async (): Promise<WeightMeasurement | null> => {
        try {
            const { data } = await api.get<WeightMeasurement>('/weight-tracker/latest-record');
            return data ?? null;
        } catch (err: any) {
            if (err?.response?.status === 404) return null;
            throw err;
        }
    },

    /**
     * POST /api/weight-tracker
     * Body: { recordedOn: "yyyy-MM-dd", weight: number }
     * Response: true
     */
    create: async (request: CreateWeightRequest): Promise<boolean> => {
        const { data } = await api.post<boolean>('/weight-tracker', request);
        return data;
    },

    /**
     * PUT /api/weight-tracker
     * Body: { id: number, recordedOn: "yyyy-MM-dd", weight: number }
     * Response: true
     */
    update: async (request: UpdateWeightRequest): Promise<boolean> => {
        const { data } = await api.put<boolean>('/weight-tracker', request);
        return data;
    },

    /**
     * DELETE /api/weight-tracker/{id}
     * Response: true
     */
    delete: async (id: number): Promise<boolean> => {
        const { data } = await api.delete<boolean>(`/weight-tracker/${id}`);
        return data;
    },
};
