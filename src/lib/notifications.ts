import { isRunningInExpoGo } from 'expo';
import * as Device from 'expo-device';
import type * as ExpoNotifications from 'expo-notifications';
import { Platform } from 'react-native';

type NotificationsModule = typeof ExpoNotifications;

let notificationsModulePromise: Promise<NotificationsModule | null> | null =
    null;
let isHandlerConfigured = false;

async function loadNotificationsModule(): Promise<NotificationsModule | null> {
    if (isRunningInExpoGo()) {
        return null;
    }

    if (!notificationsModulePromise) {
        notificationsModulePromise = import('expo-notifications')
            .then((Notifications) => {
                if (!isHandlerConfigured) {
                    Notifications.setNotificationHandler({
                        handleNotification: async () => ({
                            shouldShowBanner: true,
                            shouldShowList: true,
                            shouldPlaySound: false,
                            shouldSetBadge: false,
                        }),
                    });
                    isHandlerConfigured = true;
                }
                return Notifications;
            })
            .catch((error) => {
                console.error(error);
                return null;
            });
    }

    return notificationsModulePromise;
}

export async function registerForPushNotificationsAsync(options?: {
    allowPrompt?: boolean;
}) {
    const allowPrompt = options?.allowPrompt ?? true;
    if (Platform.OS === 'web' || isRunningInExpoGo()) {
        return null;
    }

    if (!Device.isDevice) {
        return null;
    }

    try {
        const Notifications = await loadNotificationsModule();
        if (!Notifications) {
            return null;
        }

        const current = await Notifications.getPermissionsAsync();
        let status = current.status;

        if (status !== 'granted' && allowPrompt) {
            const request = await Notifications.requestPermissionsAsync();
            status = request.status;
        }

        if (status !== 'granted') {
            return null;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.DEFAULT,
            });
        }

        const token = await Notifications.getDevicePushTokenAsync();
        return token?.data ?? null;
    } catch (error) {
        console.error(error);
        return null;
    }
}
