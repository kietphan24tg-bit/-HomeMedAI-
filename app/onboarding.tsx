import { OnboardingScreen } from '@/src/screens';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { Redirect } from 'expo-router';
import { useShallow } from 'zustand/shallow';

const APP_TABS_ROUTE = '/(protected)/(app)/(tabs)' as const;

export default function OnboardingRoute() {
    const { accessToken, hasSeenOnboarding, initialized, postLoginCompleted } =
        useAuthStore(
            useShallow((state) => ({
                accessToken: state.accessToken,
                hasSeenOnboarding: state.hasSeenOnboarding,
                initialized: state.initialized,
                postLoginCompleted: state.postLoginCompleted,
            })),
        );

    if (!initialized) {
        return null;
    }

    if (hasSeenOnboarding) {
        if (!accessToken) {
            return <Redirect href='/auth' />;
        }

        return (
            <Redirect
                href={postLoginCompleted ? APP_TABS_ROUTE : '/post-login'}
            />
        );
    }

    return <OnboardingScreen />;
}
