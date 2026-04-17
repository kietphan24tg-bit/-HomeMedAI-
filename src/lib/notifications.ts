import { isRunningInExpoGo } from 'expo';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import type * as ExpoNotifications from 'expo-notifications';
import { Platform } from 'react-native';

const MEDICINE_REMINDER_ACTIONS_CATEGORY = 'MEDICINE_REMINDER_ACTIONS';
const ACTION_MARK_TAKEN = 'MARK_TAKEN';
const ACTION_MARK_SKIPPED = 'MARK_SKIPPED';

type NotificationsModule = typeof ExpoNotifications;
export type PushRegistrationStatus =
    | 'granted'
    | 'denied'
    | 'undetermined'
    | 'unavailable';

export type PushRegistrationResult = {
    status: PushRegistrationStatus;
    token: string | null;
};

let notificationsModulePromise: Promise<NotificationsModule | null> | null =
    null;
let isHandlerConfigured = false;

function resolveExpoProjectId(): string | undefined {
    const extra = Constants.expoConfig?.extra as
        | { eas?: { projectId?: string } }
        | undefined;
    const fromConfig = extra?.eas?.projectId;
    const fromEas = (Constants as { easConfig?: { projectId?: string } })
        .easConfig?.projectId;
    const fromEnv = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
    const v = fromConfig || fromEas || fromEnv;
    return typeof v === 'string' && v.trim().length > 0 ? v.trim() : undefined;
}

async function loadNotificationsModule(): Promise<NotificationsModule | null> {
    if (Platform.OS === 'web') {
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

                    // Enables action buttons on reminder push notifications.
                    void Notifications.setNotificationCategoryAsync(
                        MEDICINE_REMINDER_ACTIONS_CATEGORY,
                        [
                            {
                                identifier: ACTION_MARK_TAKEN,
                                buttonTitle: 'Đã uống',
                                options: {
                                    opensAppToForeground: false,
                                },
                            },
                            {
                                identifier: ACTION_MARK_SKIPPED,
                                buttonTitle: 'Bỏ qua',
                                options: {
                                    isDestructive: true,
                                    opensAppToForeground: false,
                                },
                            },
                        ],
                    ).catch((error) => {
                        console.error(error);
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

function unavailablePushRegistration(): PushRegistrationResult {
    return {
        status: 'unavailable',
        token: null,
    };
}

function normalizePushStatus(
    status: string | null | undefined,
): PushRegistrationStatus {
    if (status === 'granted') {
        return 'granted';
    }
    if (status === 'denied') {
        return 'denied';
    }
    if (status === 'undetermined') {
        return 'undetermined';
    }
    return 'unavailable';
}

export async function registerForPushNotificationsAsync(options?: {
    allowPrompt?: boolean;
}): Promise<PushRegistrationResult> {
    const allowPrompt = options?.allowPrompt ?? true;
    if (Platform.OS === 'web') {
        return unavailablePushRegistration();
    }

    if (!Device.isDevice) {
        return unavailablePushRegistration();
    }

    try {
        const Notifications = await loadNotificationsModule();
        if (!Notifications) {
            return unavailablePushRegistration();
        }

        const current = await Notifications.getPermissionsAsync();
        let status = current.status;

        if (status !== 'granted' && allowPrompt) {
            const request = await Notifications.requestPermissionsAsync();
            status = request.status;
        }

        if (status !== 'granted') {
            return {
                status: normalizePushStatus(status),
                token: null,
            };
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.DEFAULT,
            });
            await Notifications.setNotificationChannelAsync(
                'medicine_reminders',
                {
                    name: 'Nhắc uống thuốc',
                    importance: Notifications.AndroidImportance.HIGH,
                },
            );
            await Notifications.setNotificationChannelAsync(
                'appointment_reminders',
                {
                    name: 'Lịch hẹn & Tiêm chủng',
                    importance: Notifications.AndroidImportance.HIGH,
                },
            );
        }

        if (isRunningInExpoGo()) {
            const projectId = resolveExpoProjectId();
            if (!projectId) {
                console.warn(
                    '[push] Set expo.extra.eas.projectId in app.json or EXPO_PUBLIC_EAS_PROJECT_ID',
                );
            }

            const expoToken = await Notifications.getExpoPushTokenAsync(
                projectId ? { projectId } : undefined,
            );

            const normalizedExpoToken =
                typeof expoToken?.data === 'string'
                    ? expoToken.data
                    : expoToken?.data !== undefined && expoToken?.data !== null
                      ? String(expoToken.data)
                      : null;

            // Backend hybrid notification service supports ExponentPushToken[...] via Expo Push API,
            // so we can safely sync this token even when running in Expo Go.
            return {
                status: 'granted',
                token: normalizedExpoToken,
            };
        }

        const projectId = resolveExpoProjectId();
        if (projectId) {
            try {
                const expoToken = await Notifications.getExpoPushTokenAsync({
                    projectId,
                });
                const normalizedExpoToken =
                    typeof expoToken?.data === 'string'
                        ? expoToken.data
                        : expoToken?.data !== undefined &&
                            expoToken?.data !== null
                          ? String(expoToken.data)
                          : null;

                if (normalizedExpoToken) {
                    return {
                        status: 'granted',
                        token: normalizedExpoToken,
                    };
                }
            } catch (error) {
                console.error(error);
            }
        }

        // Fallback when Expo token is unavailable: still keep native push token.
        const token = await Notifications.getDevicePushTokenAsync();
        return {
            status: 'granted',
            token:
                typeof token?.data === 'string'
                    ? token.data
                    : token?.data !== undefined && token?.data !== null
                      ? String(token.data)
                      : null,
        };
    } catch (error) {
        console.error(error);
        return unavailablePushRegistration();
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

function getScheduleIdFromNotificationData(
    data: Record<string, unknown> | undefined,
): string | null {
    if (!data) {
        return null;
    }

    const scheduleId = data.schedule_id;
    if (typeof scheduleId !== 'string' || scheduleId.trim().length === 0) {
        return null;
    }

    return scheduleId;
}

async function handleScheduleActionFromNotification(
    response: ExpoNotifications.NotificationResponse,
): Promise<boolean> {
    const actionId = response.actionIdentifier;
    if (actionId !== ACTION_MARK_TAKEN && actionId !== ACTION_MARK_SKIPPED) {
        return false;
    }

    const data = getNotificationData(response);
    const scheduleId = getScheduleIdFromNotificationData(data);
    if (!scheduleId) {
        return true;
    }

    try {
        const { notificationsService } =
            await import('@/src/services/notifications.services');
        await notificationsService.logScheduleCompliance(
            scheduleId,
            actionId === ACTION_MARK_TAKEN ? 'taken' : 'skipped',
            { source: 'notification_action' },
        );
    } catch (error) {
        console.error(error);
    }

    return true;
}

function isScheduleTapData(
    data: Record<string, unknown> | undefined,
): data is { schedule_id?: string; category?: string } {
    if (!data) return false;
    const category = data.category;
    return (
        typeof category === 'string' &&
        ['MEDICINE', 'CHECKUP', 'VACCINE'].includes(category)
    );
}

async function navigateForNotificationCategory(
    category: string | undefined,
): Promise<void> {
    try {
        const { router } = await import('expo-router');
        if (category === 'MEDICINE' || !category) {
            router.push('/(protected)/(app)/(tabs)/health');
            return;
        }
        if (category === 'VACCINE' || category === 'CHECKUP') {
            router.push('/(protected)/(app)/(tabs)/health');
        }
    } catch {
        // Router not ready or invalid route
    }
}

const handledNotificationIds = new Set<string>();

async function handleScheduleNotificationResponse(
    response: ExpoNotifications.NotificationResponse,
): Promise<void> {
    const handledByAction =
        await handleScheduleActionFromNotification(response);
    if (handledByAction) {
        return;
    }

    const data = getNotificationData(response);
    if (!isScheduleTapData(data)) {
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
    const cat = typeof data.category === 'string' ? data.category : undefined;
    await navigateForNotificationCategory(cat);
}

/**
 * Subscribe to notification opens (tap / cold start). Returns an unsubscribe
 * function. No-op on web / when expo-notifications is unavailable.
 */
export async function setupScheduleNotificationResponseListener(): Promise<
    () => void
> {
    if (Platform.OS === 'web') {
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
