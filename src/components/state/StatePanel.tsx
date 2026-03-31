import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { scale, scaleFont, verticalScale } from '@/src/styles/responsive';
import { colors, shadows, typography } from '@/src/styles/tokens';

type Variant = 'loading' | 'empty' | 'error';

type Props = {
    variant: Variant;
    title: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
    compact?: boolean;
    flat?: boolean;
};

const variantConfig = {
    loading: {
        iconName: 'sync-outline',
        iconColor: colors.primary,
        iconBg: colors.primaryBg,
    },
    empty: {
        iconName: 'people-outline',
        iconColor: colors.primary,
        iconBg: colors.primaryBg,
    },
    error: {
        iconName: 'cloud-offline-outline',
        iconColor: '#EA580C',
        iconBg: '#FFF7ED',
    },
} as const;

export default function StatePanel({
    variant,
    title,
    message,
    actionLabel,
    onAction,
    compact = false,
    flat = false,
}: Props): React.JSX.Element {
    const config = variantConfig[variant];

    return (
        <View
            style={[
                styles.container,
                compact && styles.containerCompact,
                flat && styles.containerFlat,
            ]}
        >
            <View
                style={[
                    styles.iconWrap,
                    { backgroundColor: config.iconBg },
                    compact && styles.iconWrapCompact,
                ]}
            >
                {variant === 'loading' ? (
                    <ActivityIndicator size='small' color={config.iconColor} />
                ) : (
                    <Ionicons
                        name={config.iconName}
                        size={compact ? 26 : 30}
                        color={config.iconColor}
                    />
                )}
            </View>

            <Text style={[styles.title, compact && styles.titleCompact]}>
                {title}
            </Text>

            {message ? <Text style={styles.message}>{message}</Text> : null}

            {actionLabel && onAction ? (
                <Pressable
                    style={({ pressed }) => [
                        styles.action,
                        variant === 'error'
                            ? styles.actionPrimary
                            : styles.actionSecondary,
                        pressed && styles.actionPressed,
                    ]}
                    onPress={onAction}
                >
                    <Text
                        style={[
                            styles.actionText,
                            variant === 'error'
                                ? styles.actionPrimaryText
                                : styles.actionSecondaryText,
                        ]}
                    >
                        {actionLabel}
                    </Text>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: scale(20),
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: scale(24),
        paddingHorizontal: scale(24),
        paddingTop: verticalScale(28),
        paddingBottom: verticalScale(20),
        alignItems: 'center',
        ...shadows.card,
    },
    containerCompact: {
        marginHorizontal: 0,
        borderRadius: scale(20),
    },
    containerFlat: {
        marginHorizontal: 0,
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderRadius: 0,
        paddingHorizontal: 0,
        paddingTop: 0,
        paddingBottom: 0,
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    iconWrap: {
        width: scale(72),
        height: scale(72),
        borderRadius: scale(24),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(18),
    },
    iconWrapCompact: {
        marginBottom: verticalScale(16),
    },
    title: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(18),
        color: colors.text,
        textAlign: 'center',
        marginBottom: verticalScale(8),
    },
    titleCompact: {
        fontSize: scaleFont(17),
    },
    message: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(13),
        color: colors.text3,
        lineHeight: verticalScale(20),
        textAlign: 'center',
        marginBottom: verticalScale(20),
    },
    action: {
        width: '100%',
        borderRadius: scale(16),
        paddingVertical: verticalScale(14),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
    },
    actionPrimary: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    actionSecondary: {
        backgroundColor: '#F8FBFF',
        borderColor: '#DBEAFE',
    },
    actionText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
    },
    actionPrimaryText: {
        color: '#fff',
    },
    actionSecondaryText: {
        color: colors.primary,
    },
    actionPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.99 }],
    },
});
