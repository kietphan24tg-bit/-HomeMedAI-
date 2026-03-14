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
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/src/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
    initialRouteName: 'onboarding',
};

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded, error] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
        Inter_900Black,
    });

    useEffect(() => {
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <ThemeProvider
            value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name='onboarding' />
                <Stack.Screen name='(tabs)' />
            </Stack>
            <StatusBar style='auto' />
        </ThemeProvider>
    );
}
