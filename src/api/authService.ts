import apiClient from './client';

export const authService = {
    login: async (credentials: any) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    register: async (userData: any) => {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },

    getProfile: async () => {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    },

    logout: async () => {
        // Có thể gọi API logout nếu cần
        // const response = await apiClient.post('/auth/logout');
        // return response.data;
    },
};

export default authService;
