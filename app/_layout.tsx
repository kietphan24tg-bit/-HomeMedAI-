import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
    useFonts,
} from '@expo-google-fonts/inter';
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { getDeviceMetadata } from '@/src/lib/device';
import {
    registerForPushNotificationsAsync,
    setupScheduleNotificationResponseListener,
} from '@/src/lib/notifications';
import { appQueryClient } from '@/src/lib/query-client';
import * as SecureStore from '@/src/lib/secureStore';
import { MOTION_PRESETS } from '@/src/navigation/motion';
import { authService } from '@/src/services/auth.services';
import { useAuthStore } from '@/src/stores/useAuthStore';

void SplashScreen.preventAutoHideAsync().catch((error) => {
    console.error(error);
});

export const unstable_settings = {
    initialRouteName: 'onboarding',
};

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const bootstrap = useAuthStore((state) => state.bootstrap);
    const accessToken = useAuthStore((state) => state.accessToken);
    const [appReady, setAppReady] = useState(false);
    const syncInFlight = useRef(false);
    const lastSyncedToken = useRef<string | null>(null);
    const PUSH_PERMISSION_GRANTED = 'push_permission_granted';
    const [loaded, error] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
        Inter_900Black,
        ...MaterialCommunityIcons.font,
    });

    useEffect(() => {
        if (!loaded && !error) {
            return;
        }

        let active = true;

        const initializeApp = async () => {
            try {
                await bootstrap();
            } finally {
                if (active) {
                    setAppReady(true);
                }
            }
        };

        void initializeApp();

        return () => {
            active = false;
        };
    }, [bootstrap, loaded, error]);

    useEffect(() => {
        if (!appReady) {
            return;
        }

        void SplashScreen.hideAsync().catch((hideError) => {
            console.error(hideError);
        });
    }, [appReady]);

    useEffect(() => {
        if (!appReady || !accessToken) {
            return;
        }

        let active = true;

        const syncDeviceToken = async () => {
            if (syncInFlight.current) {
                return;
            }

            syncInFlight.current = true;

            try {
                const granted = await SecureStore.getItemAsync(
                    PUSH_PERMISSION_GRANTED,
                );

                if (!active || granted !== 'true') {
                    return;
                }

                const token = await registerForPushNotificationsAsync({
                    allowPrompt: false,
                });
                if (!active || !token) {
                    await SecureStore.setItemAsync(
                        PUSH_PERMISSION_GRANTED,
                        'false',
                    );
                    return;
                }

                if (lastSyncedToken.current === token) {
                    return;
                }

                const { device_id, device_name, platform } =
                    await getDeviceMetadata();

                await authService.updateDeviceToken({
                    device_id,
                    fcm_token: token,
                    device_name,
                    platform,
                });

                lastSyncedToken.current = token;
            } catch (error) {
                console.error(error);
            } finally {
                syncInFlight.current = false;
            }
        };

        void syncDeviceToken();

        return () => {
            active = false;
        };
    }, [accessToken, appReady]);

    useEffect(() => {
        if (!appReady) {
            return;
        }
        let unsubscribe: (() => void) | undefined;
        void setupScheduleNotificationResponseListener().then((remove) => {
            unsubscribe = remove;
        });
        return () => {
            unsubscribe?.();
        };
    }, [appReady]);

    if ((!loaded && !error) || !appReady) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={appQueryClient}>
                <SafeAreaProvider>
                    <ThemeProvider
                        value={
                            colorScheme === 'dark' ? DarkTheme : DefaultTheme
                        }
                    >
                        <Stack screenOptions={MOTION_PRESETS.root}>
                            <Stack.Screen
                                name='onboarding'
                                options={MOTION_PRESETS.launch}
                            />
                            <Stack.Screen
                                name='auth'
                                options={MOTION_PRESETS.flowEntry}
                            />
                            <Stack.Screen name='(protected)' />
                        </Stack>
                        <StatusBar style='auto' />
                    </ThemeProvider>
                </SafeAreaProvider>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}
