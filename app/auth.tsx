import { Redirect, useLocalSearchParams } from 'expo-router';
import { useShallow } from 'zustand/shallow';
import AuthScreen from '@/src/screens/auth/AuthScreen';
import { useAuthStore } from '@/src/stores/useAuthStore';

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
        return <Redirect href={postLoginCompleted ? '/(tabs)' : '/post-login'} />;
    }

    return <AuthScreen initialMode={initialMode} />;
}
