import { Stack } from 'expo-router';
import { MOTION_PRESETS } from '@/src/navigation/motion';

export default function HealthLayout() {
    return (
        <Stack
            screenOptions={{
                ...MOTION_PRESETS.root,
                ...MOTION_PRESETS.drillDown,
            }}
        >
            <Stack.Screen name='index' options={{ headerShown: false }} />
            <Stack.Screen name='metrics' options={{ headerShown: false }} />
            <Stack.Screen
                name='metrics-input'
                options={{ headerShown: false }}
            />
        </Stack>
    );
}
