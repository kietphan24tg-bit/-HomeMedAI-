import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

const HAS_SEEN_ONBOARDING = 'has_seen_onboarding';

export default function Index() {
    const [targetRoute, setTargetRoute] = useState<string | null>(null);

    useEffect(() => {
        const loadInitialRoute = async () => {
            const hasSeenOnboarding =
                await SecureStore.getItemAsync(HAS_SEEN_ONBOARDING);
            setTargetRoute(hasSeenOnboarding ? '/(tabs)' : '/onboarding');
        };

        loadInitialRoute();
    }, []);

    if (!targetRoute) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <ActivityIndicator size='large' />
            </View>
        );
    }

    return <Redirect href={targetRoute as '/onboarding' | '/(tabs)'} />;
}
