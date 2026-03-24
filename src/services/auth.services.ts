import apiClient from '../api/client';
import type {
    SignInParams,
    SignInWithGoogleParams,
} from '../types/useAuthStore.type';
import type { User } from '../types/user';

export const authService = {
    signUp: async ({ email, password }: Pick<User, 'email' | 'password'>) => {
        const res = await apiClient.post('/auth/register', {
            email,
            password_hash: password,
        });
        return res.data;
    },
    signIn: async ({
        email,
        password,
        device_id,
        device_name,
        platform,
        fcm_token,
    }: SignInParams) => {
        const res = await apiClient.post('/auth/login', {
            email,
            password,
            device_id,
            device_name,
            platform,
            fcm_token,
        });
        return res.data;
    },
    signInWithGoogle: async ({
        google_token,
        device_id,
        device_name,
        platform,
        fcm_token,
    }: SignInWithGoogleParams) => {
        const res = await apiClient.post('/auth/google', {
            google_token,
            device_id,
            device_name,
            platform,
            fcm_token,
        });
        return res.data;
    },
    signOut: async () => {
        const res = await apiClient.get('/auth/logout');
        return res.data;
    },
    fetchMe: async () => {
        const res = await apiClient.get('/users/me');
        return res.data;
    },
    refresh: async (refreshToken: string) => {
        const res = await apiClient.post('/auth/refresh', {
            refresh_token: refreshToken,
        });
        return res.data;
    },
    profile: async () => {
        const res = await apiClient.get('/user/profile');
        return res.data;
    },
    forgotPassword: async (email: string) => {
        const res = await apiClient.post('/auth/forgot-password', {
            email,
        });
        return res.data;
    },
    resetPassword: async (
        reset_token: string,
        email: string,
        otp_code: string,
        new_password: string,
    ) => {
        const res = await apiClient.post(
            '/auth/reset-password',
            {
                email,
                otp_code,
                new_password,
            },
            {
                params: {
                    reset_token,
                },
            },
        );

        return res.data;
    },
    changePassword: async (old_password: string, new_password: string) => {
        const res = await apiClient.put('/user/change-password', {
            old_password,
            new_password,
        });
        return res.data;
    },
};
