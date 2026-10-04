
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '@/types/api';

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: { id: string; email: string; name: string } | null;
    setAuth: (auth: AuthResponse) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            refreshToken: null,
            user: null,
            setAuth: (auth) => set({
                token: auth.token,
                refreshToken: auth.refreshToken,
                user: { id: auth.userId, email: auth.email, name: auth.name }
            }),
            logout: () => set({ token: null, refreshToken: null, user: null }),
        }),
        { name: 'auth-storage' }
    )
);
