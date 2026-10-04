
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL + "/api/", // Use relative path if proxied, or env var
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response: any) => response,
    async (error: AxiosError & { config: any }) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const { refreshToken } = useAuthStore.getState();
                if (!refreshToken) throw new Error('No refresh token');

                // Call refresh endpoint directly to avoid interceptor loop
                const refreshUrl = `${import.meta.env.VITE_API_URL}/api/auth/refresh`;
                const { data } = await axios.post(refreshUrl, { refreshToken });

                useAuthStore.getState().setAuth({
                    token: data.token,
                    refreshToken: data.refreshToken,
                    // Keep existing user if not returned
                    userId: useAuthStore.getState().user?.id || '',
                    email: useAuthStore.getState().user?.email || '',
                    name: useAuthStore.getState().user?.name || ''
                });

                originalRequest.headers.Authorization = `Bearer ${data.token}`;
                return api(originalRequest);
            } catch (refreshError) {
                useAuthStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
