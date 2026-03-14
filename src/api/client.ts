import axios from 'axios';

// Bạn có thể thay đổi baseURL này cho phù hợp với backend của mình
const BASE_URL = 'https://api.example.com';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Interceptor cho Request (ví dụ: thêm token vào header)
apiClient.interceptors.request.use(
    (config) => {
        // Bạn có thể lấy token từ storage (như AsyncStorage) ở đây
        // const token = await AsyncStorage.getItem('userToken');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

// Interceptor cho Response (ví dụ: xử lý lỗi tập trung)
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Server trả về response với status code nằm ngoài khoảng 2xx
            console.error('API Error:', error.response.data);

            // Xử lý các lỗi cụ thể như 401 (Unauthorized)
            if (error.response.status === 401) {
                // Ví dụ: Logout người dùng nếu token hết hạn
            }
        } else if (error.request) {
            // Request đã được gửi nhưng không nhận được response
            console.error('Network Error: No response received');
        } else {
            // Có lỗi gì đó xảy ra khi thiết lập request
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    },
);

export default apiClient;
