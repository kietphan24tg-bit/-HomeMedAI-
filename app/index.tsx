import { Redirect } from 'expo-router';

export default function Index() {
    // const { initialized, hasSeenOnboarding, accessToken } = useAuthStore(
    //     useShallow((state) => ({
    //         initialized: state.initialized,
    //         hasSeenOnboarding: state.hasSeenOnboarding,
    //         accessToken: state.accessToken,
    //     })),
    // );

    // if (!initialized) {
    //     return null;
    // }

    // if (!hasSeenOnboarding) {
    //     return <Redirect href='/onboarding' />;
    // }

    // return <Redirect href={accessToken ? '/(tabs)' : '/auth'} />;
    return <Redirect href='/(tabs)/family' />;
}
