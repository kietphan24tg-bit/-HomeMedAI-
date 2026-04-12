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

function getNotificationData(
    response: ExpoNotifications.NotificationResponse,
): Record<string, unknown> | undefined {
    const raw = response.notification.request.content.data;
    if (!raw || typeof raw !== 'object') {
        return undefined;
    }
    return raw as Record<string, unknown>;
}

function isMedicineScheduleTapData(
    data: Record<string, unknown> | undefined,
): data is { schedule_id: string; category: string } {
    if (!data) return false;
    const scheduleId = data.schedule_id;
    const category = data.category;
    return (
        typeof scheduleId === 'string' &&
        scheduleId.length > 0 &&
        category === 'MEDICINE'
    );
}

async function navigateToHealthForScheduleNotification(): Promise<void> {
    try {
        const { router } = await import('expo-router');
        router.push('/(protected)/(app)/(tabs)/health');
    } catch {
        // Router not ready or invalid route
    }
}

const handledNotificationIds = new Set<string>();

async function handleScheduleNotificationResponse(
    response: ExpoNotifications.NotificationResponse,
): Promise<void> {
    const data = getNotificationData(response);
    if (!isMedicineScheduleTapData(data)) {
        return;
    }
    const id = response.notification.request.identifier;
    if (id) {
        if (handledNotificationIds.has(id)) {
            return;
        }
        handledNotificationIds.add(id);
        setTimeout(() => handledNotificationIds.delete(id), 4000);
    }
    await navigateToHealthForScheduleNotification();
}

/**
 * Subscribe to notification opens (tap / cold start). Returns an unsubscribe
 * function. No-op in Expo Go / web / when expo-notifications is unavailable.
 */
export async function setupScheduleNotificationResponseListener(): Promise<
    () => void
> {
    if (Platform.OS === 'web' || isRunningInExpoGo()) {
        return () => {};
    }

    const Notifications = await loadNotificationsModule();
    if (!Notifications) {
        return () => {};
    }

    try {
        const last = await Notifications.getLastNotificationResponseAsync();
        if (last) {
            void handleScheduleNotificationResponse(last);
        }
    } catch {
        // ignore
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(
        (response) => {
            void handleScheduleNotificationResponse(response);
        },
    );

    return () => {
        try {
            subscription.remove();
        } catch {
            // ignore
        }
    };
}
