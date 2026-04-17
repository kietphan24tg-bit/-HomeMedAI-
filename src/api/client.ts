import axios, { type InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from '@/src/lib/secureStore';
import { appToast } from '@/src/lib/toast';
import { authService } from '@/src/services/auth.services';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { mockAdapter } from './mock-adapter';
import {
    createRefreshCoordinator,
    shouldAttemptRefresh,
    shouldSkipRefresh,
} from './refresh-core';

const USE_MOCK = process.env.EXPO_PUBLIC_MOCK_API === 'true';
//__DEV__ &&
const BASE_URL = process.env.EXPO_PUBLIC_BE_URL;
const REFRESH_TOKEN = 'refresh_token';

type RetriableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

const refreshCoordinator = createRefreshCoordinator({
    getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN),
    refresh: (refreshToken) => authService.refresh(refreshToken),
    setAccessToken: (accessToken) =>
        useAuthStore.getState().setAccessToken(accessToken),
    persistRefreshToken: (refreshToken) =>
        SecureStore.setItemAsync(REFRESH_TOKEN, refreshToken),
    clearSession: () => useAuthStore.getState().clearSession(),
    showSessionExpiredToast: () => {
        appToast.showError(
            'Error',
            'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!',
        );
    },
});

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
        const originalRequest = error.config as
            | RetriableRequestConfig
            | undefined;

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
            const accessToken = await refreshCoordinator.refreshAccessToken();

            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            return apiClient(originalRequest);
        } catch (refreshError) {
            return Promise.reject(refreshError);
        }
    },
);

export default apiClient;
