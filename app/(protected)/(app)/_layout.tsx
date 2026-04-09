import { Redirect, Stack } from 'expo-router';
import { useShallow } from 'zustand/shallow';
import { MOTION_PRESETS } from '@/src/navigation/motion';
import { useAuthStore } from '@/src/stores/useAuthStore';

export default function AppFlowLayout() {
    const { initialized, postLoginCompleted } = useAuthStore(
        useShallow((state) => ({
            initialized: state.initialized,
            postLoginCompleted: state.postLoginCompleted,
        })),
    );

    if (!initialized) {
        return null;
    }

    if (!postLoginCompleted) {
        return <Redirect href='/post-login' />;
    }

    return (
        <Stack screenOptions={MOTION_PRESETS.root}>
            <Stack.Screen name='(tabs)' options={MOTION_PRESETS.tabEntry} />
            <Stack.Screen
                name='medical-dictionary/[entryType]/[itemId]'
                options={MOTION_PRESETS.drillDown}
            />
        </Stack>
    );
}
