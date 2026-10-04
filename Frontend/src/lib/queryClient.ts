import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: (count, error) => count < 2 && ((error as { response?: { status?: number } })?.response?.status ?? 500) >= 500,
      refetchOnWindowFocus: true, // coming back to the app after a set refreshes data
    },
    mutations: { retry: 0 },
  },
});
