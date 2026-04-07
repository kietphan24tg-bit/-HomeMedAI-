import axios from 'axios';
import * as SecureStore from '@/src/lib/secureStore';
import { appToast } from '@/src/lib/toast';
import { authService } from '@/src/services/auth.services';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { mockAdapter } from './mock-adapter';

const USE_MOCK = process.env.EXPO_PUBLIC_MOCK_API === 'true';
const BASE_URL = process.env.EXPO_PUBLIC_BE_URL;
const REFRESH_TOKEN = 'refresh_token';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    ...(USE_MOCK ? { adapter: mockAdapter } : {}),
});

// Interceptor cho Request (ví dụ: thêm token vào header)
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

// Interceptor cho Response (ví dụ: xử lý lỗi tập trung)
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        //những api ko cần check
        if (
            originalRequest.url.includes('/signin') ||
            originalRequest.url.includes('/signup') ||
            originalRequest.url.includes('/signout') ||
            originalRequest.url.includes('/rag/chat') ||
            originalRequest.url.includes('/auth/login') ||
            originalRequest.url.includes('/auth/register') ||
            originalRequest.url.includes('/auth/refresh') ||
            originalRequest.url.includes('/auth/google') ||
            originalRequest.url.includes('/auth/forgot-password') ||
            originalRequest.url.includes('/auth/reset-password')
        ) {
            return Promise.reject(error);
        }
        originalRequest._retry = originalRequest._retry || 0;
        if (error.response?.status === 403 && originalRequest._retry < 4) {
            originalRequest._retry += 1;
            try {
                const refreshToken =
                    await SecureStore.getItemAsync(REFRESH_TOKEN);

                if (!refreshToken) {
                    throw new Error('No refresh token found');
                }

                const res = await authService.refresh(refreshToken);
                const accessToken = res.access_token ?? res.accessToken;
                useAuthStore.getState().setAccessToken(accessToken);
                originalRequest.headers['Authorization'] =
                    `Bearer ${accessToken}`;
                await SecureStore.setItemAsync(
                    REFRESH_TOKEN,
                    res.refresh_token,
                );
                return apiClient(originalRequest);
            } catch (error) {
                useAuthStore.getState().clearStore();
                appToast.showError(
                    'Error',
                    'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!',
                );
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    },
);

export default apiClient;
