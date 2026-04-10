import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { colors, gradients, typography } from '@/src/styles/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function LaunchScreen() {
    // Shared values for animations helps run in UI smoothly
    const ringScale = useSharedValue(1);
    const ringOpacity = useSharedValue(0.45);
    const logoScale = useSharedValue(0.6);
    const logoOpacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(8);
    const ecgOffset = useSharedValue(60);
    const progressWidth = useSharedValue(0);

    useEffect(() => {
        // Ring animation (pulse)
        ringScale.value = withRepeat(
            withTiming(1.9, { duration: 2000 }), //run smoothly
            -1, //lặp vô hạn
            false,
        );
        ringOpacity.value = withRepeat(
            withTiming(0, { duration: 2000 }),
            -1,
            false,
        );

        // Logo animations
        logoOpacity.value = withTiming(1, { duration: 500 });
        logoScale.value = withSequence(
            withTiming(1, { duration: 500 }),
            withRepeat(
                withSequence(
                    withTiming(1.08, { duration: 600 }),
                    withTiming(0.97, { duration: 600 }),
                    withTiming(1, { duration: 600 }),
                ),
                -1,
                false,
            ),
        );

        // ECG animation
        ecgOffset.value = withDelay(300, withTiming(0, { duration: 600 }));

        // Text animations
        textOpacity.value = withDelay(400, withTiming(1, { duration: 350 }));
        textTranslateY.value = withDelay(400, withTiming(0, { duration: 350 }));

        // Progress bar animation
        progressWidth.value = withDelay(
            500,
            withTiming(0.88, { duration: 2000 }),
        );
    }, [
        ecgOffset,
        logoOpacity,
        logoScale,
        progressWidth,
        ringOpacity,
        ringScale,
        textOpacity,
        textTranslateY,
    ]);

    const ringStyle = useAnimatedStyle(() => ({
        transform: [{ scale: ringScale.value }],
        opacity: ringOpacity.value,
    }));

    const logoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }],
        opacity: logoOpacity.value,
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }],
    }));

    const taglineStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value, // Reusing textOpacity for simplicity or can add separate
        transform: [{ translateY: textTranslateY.value }],
    }));

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progressWidth.value * 100}%`,
    }));

    const ecgProps = useAnimatedProps(() => ({
        strokeDashoffset: ecgOffset.value,
    }));

    return (
        <LinearGradient
            colors={gradients.brand}
            locations={[0, 1]}
            style={styles.container}
        >
            {/* Decorative Circles */}
            <View style={styles.deco1} />
            <View style={styles.deco2} />

            {/* Logo Section */}
            <View style={styles.logoContainer}>
                {/* Pulsing Ring */}
                <Animated.View style={[styles.csRing, ringStyle]} />

                {/* Logo Box */}
                <Animated.View style={[styles.csLogoBox, logoStyle]}>
                    <Svg
                        width='38'
                        height='38'
                        viewBox='0 0 24 24'
                        fill='none'
                        style={{ backgroundColor: 'transparent' }}
                    >
                        <AnimatedPath
                            d='M22 12h-4l-3 9L9 3l-3 9H2'
                            stroke='white'
                            strokeWidth='2.2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeDasharray='60'
                            fill='none'
                            animatedProps={ecgProps}
                        />
                    </Svg>
                </Animated.View>
            </View>

            {/* App Info Section */}
            <Animated.Text style={[styles.csName, textStyle]}>
                HomeMedAI
            </Animated.Text>
            <Animated.Text style={[styles.csTagline, taglineStyle]}>
                Chăm sóc sức khoẻ gia đình
            </Animated.Text>

            {/* Progress Bar Section */}
            <View style={styles.csProgTrack}>
                <Animated.View style={[styles.csProgFill, progressStyle]} />
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: gradients.brand[0],
    },
    deco1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        top: -100,
        right: -80,
    },
    deco2: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        bottom: -60,
        left: -60,
    },
    logoContainer: {
        position: 'relative',
        width: 140,
        height: 140,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    csRing: {
        position: 'absolute',
        width: 90,
        height: 90,
        borderRadius: 28,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    csLogoBox: {
        width: 84,
        height: 84,
        borderRadius: 26,
        backgroundColor: 'rgba(255,255,255,0.16)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        // Removed elevation as it can cause dark shadow artifacts on semi-transparent Views in Android
        overflow: 'visible',
    },
    csName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: -0.4,
        fontFamily: typography.font.black, // fallback if font not loaded yet
    },
    csTagline: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.65)',
        marginTop: 4,
        marginBottom: 18,
        fontWeight: '500',
        fontFamily: typography.font.medium,
    },
    csProgTrack: {
        width: 120,
        height: 2.5,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 99,
        overflow: 'hidden',
    },
    csProgFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 99,
    },
});
