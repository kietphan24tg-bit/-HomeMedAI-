import { Redirect } from 'expo-router';
import { useShallow } from 'zustand/shallow';
import { useAuthStore } from '@/src/stores/useAuthStore';

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

    return <Redirect href={postLoginCompleted ? '/' : '/post-login'} />;
}
