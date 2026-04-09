import { Redirect, Stack } from 'expo-router';
import { useShallow } from 'zustand/shallow';
import { MOTION_PRESETS } from '@/src/navigation/motion';
import { useAuthStore } from '@/src/stores/useAuthStore';

export default function ProtectedLayout() {
    const { accessToken, hasSeenOnboarding, initialized } = useAuthStore(
        useShallow((state) => ({
            accessToken: state.accessToken,
            hasSeenOnboarding: state.hasSeenOnboarding,
            initialized: state.initialized,
        })),
    );

    if (!initialized) {
        return null;
    }

    if (!hasSeenOnboarding) {
        return <Redirect href='/onboarding' />;
    }

    if (!accessToken) {
        return <Redirect href='/auth' />;
    }

    return (
        <Stack screenOptions={MOTION_PRESETS.root}>
            <Stack.Screen name='(setup)' options={MOTION_PRESETS.flowEntry} />
            <Stack.Screen
                name='join-family-code'
                options={MOTION_PRESETS.drillDown}
            />
            <Stack.Screen name='(app)' options={MOTION_PRESETS.tabEntry} />
        </Stack>
    );
}
