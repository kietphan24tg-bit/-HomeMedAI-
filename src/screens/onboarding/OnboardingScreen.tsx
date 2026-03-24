// src/screens/onboarding/OnboardingScreen.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    ScrollView,
    StatusBar,
    useWindowDimensions,
    View,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthPage from './AuthPage';
import FeaturesPage from './FeaturesPage';
import PermissionPage from './PermissionPage';
import { styles } from './styles';
import WelcomePage from './WelcomePage';
import { colors } from '../../styles/tokens';

const TOTAL_PAGES = 4;

export default function OnboardingScreen(): React.JSX.Element {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const scrollRef = useRef<ScrollView>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const goMain = (): void => {
        router.replace('/(tabs)');
    };

    const goTo = (page: number): void => {
        scrollRef.current?.scrollTo({ x: page * width, animated: true });
        setCurrentPage(page);
    };

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>): void => {
        const page = Math.round(e.nativeEvent.contentOffset.x / width);
        if (page !== currentPage) setCurrentPage(page);
    };

    const renderDots = (): React.JSX.Element => (
        <View style={styles.dotsWrap}>
            {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.dot,
                        i === currentPage && styles.dotActive,
                        i < currentPage && styles.dotDone,
                    ]}
                />
            ))}
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />
            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={onScroll}
                    scrollEventThrottle={16}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    <WelcomePage
                        width={width}
                        currentPage={currentPage}
                        totalPages={TOTAL_PAGES}
                        goTo={goTo}
                        setAuthTab={setAuthTab}
                        renderDots={renderDots}
                    />
                    <FeaturesPage
                        width={width}
                        goTo={goTo}
                        renderDots={renderDots}
                    />
                    <PermissionPage
                        width={width}
                        goTo={goTo}
                        renderDots={renderDots}
                    />
                    <AuthPage
                        width={width}
                        authTab={authTab}
                        setAuthTab={setAuthTab}
                        renderDots={renderDots}
                    />
                </ScrollView>
            </Animated.View>
        </SafeAreaView>
    );
}
