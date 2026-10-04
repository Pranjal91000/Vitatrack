
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { UserProfileDto, UpdateProfileCommand } from '@/types/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';

export const useProfile = () => {
    return useQuery<UserProfileDto>({
        queryKey: ['profile'],
        queryFn: async () => {
            const { data } = await api.get('/users/profile');
            return data;
        },
        staleTime: Infinity, // Profile data doesn't change often
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const setAuth = useAuthStore((state) => state.setAuth);
    const { user, token, refreshToken } = useAuthStore.getState();

    return useMutation({
        mutationFn: async (command: UpdateProfileCommand) => {
            const { data } = await api.put('/users/profile', command);
            return data;
        },
        onSuccess: (data: UserProfileDto) => {
            toast.success('Profile updated!');
            queryClient.setQueryData(['profile'], data);

            // Update auth store with new name if it changed
            if (user && token && refreshToken && data.name !== user.name) {
                setAuth({
                    token,
                    refreshToken,
                    userId: data.id,
                    email: data.email,
                    name: data.name
                });
            }
        },
        onError: () => {
            toast.error('Failed to update profile');
        }
    });
};
