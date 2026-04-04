import LaunchScreen from '@/src/components/LaunchScreen';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
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
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import { MOTION_PRESETS } from '@/src/navigation/motion';
import { useAuthStore } from '@/src/stores/useAuthStore';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
    initialRouteName: 'onboarding',
};

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const bootstrap = useAuthStore((state) => state.bootstrap);
    const [showLaunchScreen, setShowLaunchScreen] = useState(true);
    const [loaded, error] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
        Inter_900Black,
    });

    useEffect(() => {
        if (!loaded && !error) {
            return;
        }

        let active = true;

        const initializeApp = async () => {
            await SplashScreen.hideAsync();
            await bootstrap();
            await new Promise((resolve) => setTimeout(resolve, 2000));

            if (active) {
                setShowLaunchScreen(false);
            }
        };

        initializeApp();

        return () => {
            active = false;
        };
    }, [bootstrap, loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ThemeProvider
                    value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
                >
                    {showLaunchScreen ? (
                        <LaunchScreen />
                    ) : (
                        <Stack screenOptions={MOTION_PRESETS.root}>
                            <Stack.Screen
                                name='onboarding'
                                options={MOTION_PRESETS.launch}
                            />
                            <Stack.Screen
                                name='(tabs)'
                                options={MOTION_PRESETS.tabEntry}
                            />
                            <Stack.Screen
                                name='auth'
                                options={MOTION_PRESETS.flowEntry}
                            />
                            <Stack.Screen
                                name='personal-info'
                                options={MOTION_PRESETS.drillDown}
                            />
                            <Stack.Screen
                                name='post-login'
                                options={MOTION_PRESETS.flowEntry}
                            />
                            <Stack.Screen
                                name='join-family-code'
                                options={MOTION_PRESETS.drillDown}
                            />
                            <Stack.Screen
                                name='medical-dictionary/[entryType]/[itemId]'
                                options={MOTION_PRESETS.drillDown}
                            />
                        </Stack>
                    )}
                    <StatusBar style='auto' />
                </ThemeProvider>
            </SafeAreaProvider>
            <Toaster />
        </GestureHandlerRootView>
    );
}
