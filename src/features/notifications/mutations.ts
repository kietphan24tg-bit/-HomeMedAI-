import { useMutation } from '@tanstack/react-query';
import { appToast } from '../../lib/toast';
import {
    notificationsServices,
    type SendDeviceNotificationPayload,
    type SendNotificationPayload,
} from '../../services/notifications.services';

export function useSendNotificationMutation() {
    return useMutation({
        mutationFn: (payload: SendNotificationPayload) =>
            notificationsServices.sendNotification(payload),
        onSuccess: () => {
            appToast.showSuccess('Thành công', 'Thông báo đã được gửi');
        },
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail || 'Không thể gửi thông báo',
            );
        },
    });
}

export function useSendDeviceNotificationMutation() {
    return useMutation({
        mutationFn: (payload: SendDeviceNotificationPayload) =>
            notificationsServices.sendDeviceNotification(payload),
        onSuccess: () => {
            appToast.showSuccess('Thành công', 'Thông báo đã được gửi');
        },
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail || 'Không thể gửi thông báo',
            );
        },
    });
}
