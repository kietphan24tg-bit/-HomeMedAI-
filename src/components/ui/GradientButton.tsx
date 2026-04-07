import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
    type StyleProp,
    type TextStyle,
    type ViewStyle,
} from 'react-native';
import { scale, scaleFont, verticalScale } from '@/src/styles/responsive';
import { buttonSystem } from '@/src/styles/shared';
import { colors, gradients, radius, typography } from '@/src/styles/tokens';

interface GradientButtonProps {
    label: string;
    loadingLabel?: string;
    loading?: boolean;
    disabled?: boolean;
    onPress: () => void;
    gradient?: readonly [string, string, ...string[]];
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    icon?: React.ReactNode;
}

export function GradientButton({
    label,
    loadingLabel,
    loading = false,
    disabled = false,
    onPress,
    gradient = gradients.brandDuo,
    style,
    textStyle,
    icon,
}: GradientButtonProps) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const overlayAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (loading) {
            overlayAnim.setValue(0);
            Animated.timing(overlayAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }).start();

            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 0.55,
                        duration: 900,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 900,
                        useNativeDriver: true,
                    }),
                ]),
            );
            pulse.start();
            return () => pulse.stop();
        }

        Animated.timing(overlayAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
        pulseAnim.setValue(1);
    }, [loading, pulseAnim, overlayAnim]);

    return (
        <Pressable
            onPress={onPress}
            disabled={loading || disabled}
            style={({ pressed }) => [
                pressed && !loading && s.pressed,
                disabled && !loading && s.disabled,
            ]}
        >
            <LinearGradient
                colors={gradient as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[s.btn, loading && s.btnLoading, style]}
            >
                {loading && (
                    <Animated.View
                        style={[s.overlay, { opacity: overlayAnim }]}
                    >
                        <Animated.View
                            style={[s.overlayInner, { opacity: pulseAnim }]}
                        />
                    </Animated.View>
                )}

                <View style={s.content}>
                    {loading ? (
                        <ActivityIndicator size='small' color='#fff' />
                    ) : (
                        icon
                    )}
                    <Text style={[s.text, textStyle]}>
                        {loading ? (loadingLabel ?? label) : label}
                    </Text>
                </View>
            </LinearGradient>
        </Pressable>
    );
}

const s = StyleSheet.create({
    btn: {
        ...buttonSystem.primary,
        width: '100%',
        minHeight: verticalScale(52),
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 6,
    },
    btnLoading: {
        shadowOpacity: 0.12,
        elevation: 2,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
    },
    text: {
        color: '#fff',
        fontFamily: typography.font.bold,
        fontSize: scaleFont(15),
        letterSpacing: 0.1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlayInner: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.18)',
    },
    pressed: {
        opacity: 0.85,
        transform: [{ scale: 0.97 }],
    },
    disabled: {
        opacity: 0.5,
    },
});
