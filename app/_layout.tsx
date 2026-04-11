import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { appQueryClient } from '@/src/lib/query-client';
import { MOTION_PRESETS } from '@/src/navigation/motion';
import { useAuthStore } from '@/src/stores/useAuthStore';
import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
    useFonts,
} from '@expo-google-fonts/inter';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

void SplashScreen.preventAutoHideAsync().catch((error) => {
    console.error(error);
});

export const unstable_settings = {
    initialRouteName: 'onboarding',
};

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const bootstrap = useAuthStore((state) => state.bootstrap);
    const [appReady, setAppReady] = useState(false);
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
