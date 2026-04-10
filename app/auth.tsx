import AuthScreen from '@/src/screens/auth/AuthScreen';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useShallow } from 'zustand/shallow';

const APP_TABS_ROUTE = '/(protected)/(app)/(tabs)' as const;

export default function AuthRoute() {
    const { accessToken, hasSeenOnboarding, initialized, postLoginCompleted } =
        useAuthStore(
            useShallow((state) => ({
                accessToken: state.accessToken,
                hasSeenOnboarding: state.hasSeenOnboarding,
                initialized: state.initialized,
                postLoginCompleted: state.postLoginCompleted,
            })),
        );
    const { mode } = useLocalSearchParams<{ mode?: string }>();
    const initialMode = mode === 'signup' ? 'signup' : 'signin';

    if (!initialized) {
        return null;
    }

    if (!hasSeenOnboarding) {
        return <Redirect href='/onboarding' />;
    }

    if (accessToken) {
        return (
            <Redirect
                href={postLoginCompleted ? APP_TABS_ROUTE : '/post-login'}
            />
        );
    }

    return <AuthScreen initialMode={initialMode} />;
}
