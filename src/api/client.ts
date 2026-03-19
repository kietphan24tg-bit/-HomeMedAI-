import axios from 'axios';
import { useAuthStore } from '@/src/stores/useAuthStore';

const BASE_URL = process.env.BE_URL;

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json', // send data as json
        Accept: 'application/json', // expect json response
    },
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
            originalRequest.url.includes('/signout')
        ) {
            return Promise.reject(error);
        }
        originalRequest._retry = originalRequest._retry || 0;
        if (error.response.status === 403 && originalRequest._retry < 4) {
            originalRequest._retry += 1;
            try {
                const res = await authService.refresh();
                const accessToken = res.accessToken;
                useAuthStore.getState().setAccessToken(accessToken);
                originalRequest.headers['Authorization'] =
                    `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (error) {
                useAuthStore.getState().clearStore();
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    },
);

export default apiClient;
