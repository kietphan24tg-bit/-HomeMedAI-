import { useAuthStore } from '@/src/stores/useAuthStore';
import { Redirect } from 'expo-router';
import { useShallow } from 'zustand/shallow';

const APP_TABS_ROUTE = '/(protected)/(app)/(tabs)' as const;

export default function Index() {
    const { initialized, hasSeenOnboarding, accessToken, postLoginCompleted } =
        useAuthStore(
            useShallow((state) => ({
                initialized: state.initialized,
                hasSeenOnboarding: state.hasSeenOnboarding,
                accessToken: state.accessToken,
                postLoginCompleted: state.postLoginCompleted,
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
        <Redirect href={postLoginCompleted ? APP_TABS_ROUTE : '/post-login'} />
    );
}
