import apiClient from '../api/client';

export interface SendNotificationPayload {
    title: string;
    body: string;
    data?: Record<string, any>;
}

export interface SendDeviceNotificationPayload extends SendNotificationPayload {
    fcm_token: string;
}

export const notificationsServices = {
    // Send notification to all user devices
    sendNotification: async (payload: SendNotificationPayload) => {
        const res = await apiClient.post('/notifications/send', payload);
        return res.data;
    },

    // Send notification to specific device
    sendDeviceNotification: async (payload: SendDeviceNotificationPayload) => {
        const res = await apiClient.post('/notifications/send-device', payload);
        return res.data;
    },
};
