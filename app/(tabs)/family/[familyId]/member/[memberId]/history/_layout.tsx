import { Stack } from 'expo-router';
import { MOTION_PRESETS } from '@/src/navigation/motion';

export default function MemberHistoryLayout() {
    return (
        <Stack
            screenOptions={{
                ...MOTION_PRESETS.root,
                ...MOTION_PRESETS.drillDown,
            }}
        >
            <Stack.Screen name='index' options={{ headerShown: false }} />
            <Stack.Screen
                name='records/index'
                options={{ headerShown: false }}
            />
            <Stack.Screen name='records/new' options={{ headerShown: false }} />
            <Stack.Screen
                name='records/[recordId]'
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name='vaccines/index'
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name='vaccines/[vaxId]'
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name='metrics/index'
                options={{ headerShown: false }}
            />
            <Stack.Screen name='metrics/new' options={{ headerShown: false }} />

            <Stack.Screen
                name='followups/index'
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name='followups/new'
                options={{ headerShown: false }}
            />
        </Stack>
    );
}
