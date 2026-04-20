/**
 * Module nhẹ chỉ chứa logic gọi API refresh token.
 * Được tách riêng để tránh circular dependency:
 *   client.ts -> auth.services.ts -> client.ts
 *
 * client.ts import từ đây thay vì từ auth.services.ts.
 * auth.services.ts vẫn có hàm refresh() riêng nhưng để public dùng bên ngoài.
 */

import axios from 'axios';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import {
    resolveAndroidLoopbackFallbackUrl,
    resolveApiBaseUrl,
} from './base-url';

const BASE_URL = resolveApiBaseUrl();

/**
 * Gọi thẳng axios (không dùng apiClient) để tránh vòng lặp import.
 * Trả về access_token và refresh_token mới.
 */
export async function callRefreshTokenApi(refreshToken: string): Promise<{
    access_token?: string;
    accessToken?: string;
    refresh_token?: string;
}> {
    const requestConfig = {
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        timeout: 90000,
    };

    try {
        const res = await axios.post(
            `${BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken },
            requestConfig,
        );
        return res.data;
    } catch (error: any) {
        if (Platform.OS === 'android' && !Device.isDevice && !error?.response) {
            const fallbackBaseUrl = resolveAndroidLoopbackFallbackUrl(BASE_URL);
            if (fallbackBaseUrl) {
                if (__DEV__) {
                    console.warn(
                        '[api] Refresh Network Error. Retrying with Android emulator loopback baseURL:',
                        fallbackBaseUrl,
                    );
                }
                const retryRes = await axios.post(
                    `${fallbackBaseUrl}/auth/refresh`,
                    { refresh_token: refreshToken },
                    requestConfig,
                );
                return retryRes.data;
            }
        }

        throw error;
    }
}
