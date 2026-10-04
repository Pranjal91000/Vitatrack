import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import type { AuthResponse } from '@/types/api';

const configuredOrigin = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
// Production is deployed separately from the API. Keep a fallback so a missing/stale
// Railway build variable cannot silently send API requests to the frontend host.
const origin = import.meta.env.PROD
  ? 'https://vitatrack-backend-production.up.railway.app'
  : configuredOrigin;
export const API_BASE = `${origin}/api/`;

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// One refresh in flight at a time; parallel 401s wait for the same promise.
let refreshing: Promise<string> | null = null;

async function refreshToken(): Promise<string> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) throw new Error('No refresh token');
  const { data } = await axios.post<AuthResponse>(`${API_BASE}auth/refresh`, { refreshToken });
  useAuthStore.getState().setAuth(data);
  return data.token;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError & { config?: InternalAxiosRequestConfig & { _retry?: boolean } }) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        refreshing ??= refreshToken().finally(() => { refreshing = null; });
        const token = await refreshing;
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        if (!location.pathname.startsWith('/login')) location.assign('/login');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

/** Human-readable message from a ProblemDetails / validation / plain-string error response. */
export function errorMessage(err: unknown, fallback = 'Something went wrong. Check your connection and try again.'): string {
  const e = err as AxiosError<{ errors?: Record<string, string[]>; error?: string; title?: string } | string>;
  const data = e?.response?.data;
  if (!e?.response) return e?.code === 'ECONNABORTED' ? 'The server took too long to respond.' : 'Can’t reach the server. Check your connection.';
  if (typeof data === 'string' && data.length < 200) return data;
  if (data && typeof data === 'object' && data.errors) {
    const first = Object.values(data.errors)[0];
    if (first?.[0]) return first[0];
  }
  if (data && typeof data === 'object') {
    if (data.error) return data.error;
    if (data.title) return data.title;
  }
  return fallback;
}

export default api;
