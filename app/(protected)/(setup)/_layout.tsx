import { Redirect, Stack } from 'expo-router';
import { useShallow } from 'zustand/shallow';
import { MOTION_PRESETS } from '@/src/navigation/motion';
import { useAuthStore } from '@/src/stores/useAuthStore';

const APP_TABS_ROUTE = '/(protected)/(app)/(tabs)' as const;

export default function SetupFlowLayout() {
    const { initialized, postLoginCompleted } = useAuthStore(
        useShallow((state) => ({
            initialized: state.initialized,
            postLoginCompleted: state.postLoginCompleted,
        })),
    );

    if (!initialized) {
        return null;
    }

    if (postLoginCompleted) {
        return <Redirect href={APP_TABS_ROUTE} />;
    }

    return (
        <Stack screenOptions={MOTION_PRESETS.root}>
            <Stack.Screen
                name='post-login'
                options={MOTION_PRESETS.flowEntry}
            />
            <Stack.Screen
                name='personal-info'
                options={MOTION_PRESETS.drillDown}
            />
        </Stack>
    );
}
