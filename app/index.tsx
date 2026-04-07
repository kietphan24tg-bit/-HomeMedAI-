import { Redirect } from 'expo-router';
import { useShallow } from 'zustand/shallow';
import { useAuthStore } from '@/src/stores/useAuthStore';

export default function Index() {
    const { initialized, hasSeenOnboarding, accessToken } = useAuthStore(
        useShallow((state) => ({
            initialized: state.initialized,
            hasSeenOnboarding: state.hasSeenOnboarding,
            accessToken: state.accessToken,
        })),
    );

    if (!initialized) {
        return null;
    }

    if (!hasSeenOnboarding) {
        return <Redirect href='/onboarding' />;
    }
    return <Redirect href={accessToken ? '/(tabs)' : '/auth'} />;
}
