import apiClient from '../api/client';
import { getDeviceMetadata } from '../lib/device';
import * as SecureStore from '../lib/secureStore';
import type {
    SignInParams,
    SignInWithGoogleParams,
} from '../types/useAuthStore.type';
import type { User } from '../types/user';
import { toVietnamE164 } from '../utils/phone';

const REFRESH_TOKEN_KEY = 'refresh_token';

export const authService = {
    signUp: async ({
        email,
        password,
        phone_number,
    }: Pick<User, 'email' | 'password' | 'phone_number'>) => {
        const normalizedPhoneNumber = toVietnamE164(phone_number);

        const res = await apiClient.post('/auth/register', {
            email,
            phone_number: normalizedPhoneNumber ?? phone_number,
            password,
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
        const refresh_token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        const { device_id } = await getDeviceMetadata();
        if (!refresh_token) {
            return;
        }
        await apiClient.post('/auth/logout', {
            refresh_token,
            device_id,
        });
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
    /** Same bundle as the app home/health cache — GET /users/me */
    profile: async () => authService.fetchMe(),
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

        return res.data ?? { success: true };
    },
    changePassword: async (old_password: string, new_password: string) => {
        await apiClient.post('/auth/change-password', {
            old_password,
            new_password,
        });
    },
};
