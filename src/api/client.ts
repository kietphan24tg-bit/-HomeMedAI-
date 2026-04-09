import axios, { type InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from '@/src/lib/secureStore';
import { appToast } from '@/src/lib/toast';
import { authService } from '@/src/services/auth.services';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { mockAdapter } from './mock-adapter';

const USE_MOCK = process.env.EXPO_PUBLIC_MOCK_API === 'true';
const BASE_URL = process.env.EXPO_PUBLIC_BE_URL;
const REFRESH_TOKEN = 'refresh_token';
const EXCLUDED_REFRESH_PATHS = [
    '/signin',
    '/signup',
    '/signout',
    '/rag/chat',
    '/auth/login',
    '/auth/register',
    '/auth/logout',
    '/auth/refresh',
    '/auth/google',
    '/auth/forgot-password',
    '/auth/reset-password',
] as const;

type RetriableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

let refreshAccessTokenPromise: Promise<string> | null = null;

function shouldSkipRefresh(url?: string) {
    return !url || EXCLUDED_REFRESH_PATHS.some((path) => url.includes(path));
}

async function refreshAccessToken() {
    if (!refreshAccessTokenPromise) {
        refreshAccessTokenPromise = (async () => {
            const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN);

            if (!refreshToken) {
                throw new Error('No refresh token found');
            }

            const res = await authService.refresh(refreshToken);
            const accessToken = res.access_token ?? res.accessToken ?? null;

            if (!accessToken) {
                throw new Error('No access token returned');
            }

            useAuthStore.getState().setAccessToken(accessToken);
            await SecureStore.setItemAsync(REFRESH_TOKEN, res.refresh_token);

            return accessToken;
        })()
            .catch(async (error) => {
                await useAuthStore.getState().clearSession();
                appToast.showError(
                    'Error',
                    'PhiÃªn Ä‘Äƒng nháº­p Ä‘Ã£ háº¿t háº¡n. Vui lÃ²ng Ä‘Äƒng nháº­p láº¡i!',
                );
                throw error;
            })
            .finally(() => {
                refreshAccessTokenPromise = null;
            });
    }

    return refreshAccessTokenPromise;
}

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    ...(USE_MOCK ? { adapter: mockAdapter } : {}),
});

apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as RetriableRequestConfig | undefined;

        if (!originalRequest || shouldSkipRefresh(originalRequest.url)) {
            return Promise.reject(error);
        }

        if (error.response?.status !== 403 || originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const accessToken = await refreshAccessToken();

            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            return apiClient(originalRequest);
        } catch (refreshError) {
            return Promise.reject(refreshError);
        }
    },
);

export default apiClient;
