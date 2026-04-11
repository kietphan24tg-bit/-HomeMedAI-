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
            <Stack.Screen name='records' options={{ headerShown: false }} />
            <Stack.Screen name='records/new' options={{ headerShown: false }} />
            <Stack.Screen
                name='records/[recordId]'
                options={{ headerShown: false }}
            />

            <Stack.Screen name='vaccines' options={{ headerShown: false }} />
            <Stack.Screen
                name='vaccines/[vaxId]'
                options={{ headerShown: false }}
            />

            <Stack.Screen name='metrics' options={{ headerShown: false }} />
            <Stack.Screen name='metrics/new' options={{ headerShown: false }} />

            <Stack.Screen name='followups' options={{ headerShown: false }} />
            <Stack.Screen
                name='followups/new'
                options={{ headerShown: false }}
            />
        </Stack>
    );
}
