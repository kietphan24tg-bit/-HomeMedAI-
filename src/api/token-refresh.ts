/**
 * Module nhẹ chỉ chứa logic gọi API refresh token.
 * Được tách riêng để tránh circular dependency:
 *   client.ts -> auth.services.ts -> client.ts
 *
 * client.ts import từ đây thay vì từ auth.services.ts.
 * auth.services.ts vẫn có hàm refresh() riêng nhưng để public dùng bên ngoài.
 */

import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_BE_URL;

/**
 * Gọi thẳng axios (không dùng apiClient) để tránh vòng lặp import.
 * Trả về access_token và refresh_token mới.
 */
export async function callRefreshTokenApi(refreshToken: string): Promise<{
    access_token?: string;
    accessToken?: string;
    refresh_token?: string;
}> {
    const res = await axios.post(
        `${BASE_URL}/auth/refresh`,
        { refresh_token: refreshToken },
        {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            timeout: 10000,
        },
    );
    return res.data;
}
