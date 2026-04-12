import apiClient from '../api/client';
import type {
    SignInParams,
    SignInWithGoogleParams,
} from '../types/useAuthStore.type';
import type { User } from '../types/user';
import { toVietnamE164 } from '../utils/phone';

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
        try {
            const res = await apiClient.post('/auth/logout');
            return res.data;
        } catch (error: any) {
            const status = error?.response?.status;

            if (status === 405) {
                try {
                    const res = await apiClient.get('/auth/logout');
                    return res.data;
                } catch {
                    return null;
                }
            }

            if (
                status === 401 ||
                status === 403 ||
                status === 404 ||
                status === 422
            ) {
                return null;
            }

            throw error;
        }
    },
    signOutWithDevice: async (payload: {
        refresh_token?: string | null;
        device_id?: string | null;
    }) => {
        try {
            const res = await apiClient.post('/auth/logout', payload);
            return res.data;
        } catch (error: any) {
            const status = error?.response?.status;

            if (status === 405) {
                try {
                    const res = await apiClient.get('/auth/logout');
                    return res.data;
                } catch {
                    return null;
                }
            }

            if ([401, 403, 404, 422].includes(status)) {
                return null;
            }

            throw error;
        }
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
        const res = await apiClient.get('/users/me');
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

        return res.data ?? { success: true };
    },
    changePassword: async (old_password: string, new_password: string) => {
        const res = await apiClient.post('/auth/change-password', {
            old_password,
            new_password,
        });
        return res.data;
    },
    updateDeviceToken: async (payload: {
        device_id: string;
        fcm_token?: string | null;
        device_name?: string | null;
        platform?: string | null;
    }) => {
        const res = await apiClient.post('/auth/device-token', payload);
        return res.data;
    },
};
