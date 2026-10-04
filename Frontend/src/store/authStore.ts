import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '@/types/api';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: { id: number; email: string; name: string } | null;
  setAuth: (auth: AuthResponse) => void;
  setName: (name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      setAuth: (auth) =>
        set((s) => ({
          token: auth.token,
          refreshToken: auth.refreshToken,
          user: { id: auth.userId ?? s.user?.id, email: auth.email ?? s.user?.email, name: auth.name ?? s.user?.name },
        })),
      setName: (name) => set((s) => (s.user ? { user: { ...s.user, name } } : s)),
      logout: () => set({ token: null, refreshToken: null, user: null }),
    }),
    { name: 'vt-auth' },
  ),
);
