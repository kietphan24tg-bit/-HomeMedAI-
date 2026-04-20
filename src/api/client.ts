import axios, { type InternalAxiosRequestConfig } from 'axios';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import * as SecureStore from '@/src/lib/secureStore';
import { appToast } from '@/src/lib/toast';
import { useAuthStore } from '@/src/stores/useAuthStore';
import {
    resolveAndroidLoopbackFallbackUrl,
    resolveApiBaseUrl,
} from './base-url';
import { mockAdapter } from './mock-adapter';
import { shouldAttemptRefresh, shouldSkipRefresh } from './refresh-core';
import { callRefreshTokenApi } from './token-refresh';

const USE_MOCK = __DEV__ && process.env.EXPO_PUBLIC_MOCK_API === 'true';
const BASE_URL = resolveApiBaseUrl();
const REFRESH_TOKEN = 'refresh_token';

type RetriableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
    _networkRetryWithLoopback?: boolean;
};

let refreshAccessTokenPromise: Promise<string> | null = null;

function isNetworkError(error: unknown) {
    const candidate = error as
        | { message?: string; code?: string; response?: unknown }
        | undefined;

    return (
        candidate?.message === 'Network Error' ||
        (!candidate?.response && candidate?.code === 'ERR_NETWORK')
    );
}

async function refreshAccessToken() {
    if (!refreshAccessTokenPromise) {
        refreshAccessTokenPromise = (async () => {
            const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN);

            if (!refreshToken) {
                throw new Error('No refresh token found');
            }

            const res = await callRefreshTokenApi(refreshToken);
            const rawAccess = res.access_token ?? res.accessToken ?? null;
            const accessToken =
                typeof rawAccess === 'string' ? rawAccess.trim() : null;
            const rawRefresh = res.refresh_token ?? null;
            const nextRefreshToken =
                typeof rawRefresh === 'string' ? rawRefresh.trim() : null;

            if (!accessToken) {
                throw new Error('No access token returned');
            }

            if (!nextRefreshToken) {
                throw new Error('No refresh token returned');
            }

            useAuthStore.getState().setAccessToken(accessToken);
            await SecureStore.setItemAsync(REFRESH_TOKEN, nextRefreshToken);

            return accessToken;
        })()
            .catch(async (error) => {
                if (isNetworkError(error)) {
                    throw error;
                }
                await useAuthStore.getState().clearSession();
                appToast.showError(
                    'Error',
                    'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!',
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
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    ...(USE_MOCK ? { adapter: mockAdapter } : {}),
});

apiClient.interceptors.request.use(
    (config) => {
        const raw = useAuthStore.getState().accessToken;
        const token = typeof raw === 'string' ? raw.trim() : null;
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
        const originalRequest = error.config as
            | RetriableRequestConfig
            | undefined;

        if (
            Platform.OS === 'android' &&
            !Device.isDevice &&
            originalRequest &&
            !error.response &&
            !originalRequest._networkRetryWithLoopback
        ) {
            const currentBaseUrl =
                originalRequest.baseURL ??
                apiClient.defaults.baseURL ??
                BASE_URL;
            const fallbackBaseUrl = currentBaseUrl
                ? resolveAndroidLoopbackFallbackUrl(currentBaseUrl)
                : null;

            if (fallbackBaseUrl) {
                originalRequest._networkRetryWithLoopback = true;
                originalRequest.baseURL = fallbackBaseUrl;
                if (__DEV__) {
                    console.warn(
                        '[api] Network Error. Retrying with Android emulator loopback baseURL:',
                        fallbackBaseUrl,
                    );
                }
                return apiClient(originalRequest);
            }
        }

        if (
            Platform.OS === 'android' &&
            Device.isDevice &&
            originalRequest &&
            !error.response &&
            __DEV__
        ) {
            const currentBaseUrl =
                originalRequest.baseURL ??
                apiClient.defaults.baseURL ??
                BASE_URL;
            console.warn(
                '[api] Network Error on physical Android. baseURL=',
                currentBaseUrl,
                'path=',
                originalRequest.url,
            );
        }

        if (!originalRequest || shouldSkipRefresh(originalRequest.url)) {
            return Promise.reject(error);
        }

        if (
            !shouldAttemptRefresh(error.response?.status) ||
            originalRequest._retry
        ) {
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
