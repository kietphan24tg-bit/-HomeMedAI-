import type { ReactNode } from 'react';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { toast } from 'sonner-native';
import { moderateScale, verticalScale } from '@/src/styles/responsive';
import { radius, shadows, typography } from '@/src/styles/tokens';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

type ShowToastParams = {
    title: string;
    description?: string;
    duration?: number;
};

type ToastPalette = {
    background: string;
    border: string;
    iconBg: string;
    title: string;
    description: string;
    icon: ReactNode;
};

const toastPalettes: Record<ToastVariant, ToastPalette> = {
    success: {
        background: '#F0FDF4',
        border: '#BBF7D0',
        iconBg: '#22C55E',
        title: '#15803D',
        description: '#166534',
        icon: (
            <Svg width={14} height={14} viewBox='0 0 14 14' fill='none'>
                <Path
                    d='M3 7l3 3 5-5'
                    stroke='#fff'
                    strokeWidth={1.8}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                />
            </Svg>
        ),
    },
    error: {
        background: '#FFF1F2',
        border: '#FECDD3',
        iconBg: '#E11D48',
        title: '#BE123C',
        description: '#9F1239',
        icon: (
            <Svg width={14} height={14} viewBox='0 0 14 14' fill='none'>
                <Line
                    x1={10}
                    y1={4}
                    x2={4}
                    y2={10}
                    stroke='#fff'
                    strokeWidth={1.8}
                    strokeLinecap='round'
                />
                <Line
                    x1={4}
                    y1={4}
                    x2={10}
                    y2={10}
                    stroke='#fff'
                    strokeWidth={1.8}
                    strokeLinecap='round'
                />
            </Svg>
        ),
    },
    warning: {
        background: '#FFFBEB',
        border: '#FDE68A',
        iconBg: '#F59E0B',
        title: '#B45309',
        description: '#92400E',
        icon: (
            <Svg width={14} height={14} viewBox='0 0 14 14' fill='none'>
                <Path
                    d='M7 4v4'
                    stroke='#fff'
                    strokeWidth={1.8}
                    strokeLinecap='round'
                />
                <Circle cx={7} cy={10} r={1} fill='#fff' />
            </Svg>
        ),
    },
    info: {
        background: '#EFF6FF',
        border: '#BFDBFE',
        iconBg: '#2563EB',
        title: '#1D4ED8',
        description: '#1E40AF',
        icon: (
            <Svg width={14} height={14} viewBox='0 0 14 14' fill='none'>
                <Circle cx={7} cy={4} r={1} fill='#fff' />
                <Path
                    d='M7 7v4'
                    stroke='#fff'
                    strokeWidth={1.8}
                    strokeLinecap='round'
                />
            </Svg>
        ),
    },
};

function ToastCard({
    variant,
    title,
    description,
    onClose,
}: {
    variant: ToastVariant;
    title: string;
    description?: string;
    onClose: () => void;
}) {
    const palette = toastPalettes[variant];

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: palette.background,
                    borderColor: palette.border,
                },
            ]}
        >
            <View
                style={[
                    styles.iconWrap,
                    {
                        backgroundColor: palette.iconBg,
                    },
                ]}
            >
                {palette.icon}
            </View>
            <View style={styles.body}>
                <Text style={[styles.title, { color: palette.title }]}>
                    {title}
                </Text>
                {description ? (
                    <Text
                        style={[
                            styles.description,
                            { color: palette.description },
                        ]}
                    >
                        {description}
                    </Text>
                ) : null}
            </View>
            <Pressable
                onPress={onClose}
                hitSlop={10}
                style={({ pressed }) => [
                    styles.closeButton,
                    pressed && styles.closeButtonPressed,
                ]}
            >
                <Svg width={12} height={12} viewBox='0 0 12 12' fill='none'>
                    <Line
                        x1={9}
                        y1={3}
                        x2={3}
                        y2={9}
                        stroke={palette.description}
                        strokeWidth={1.8}
                        strokeLinecap='round'
                    />
                    <Line
                        x1={3}
                        y1={3}
                        x2={9}
                        y2={9}
                        stroke={palette.description}
                        strokeWidth={1.8}
                        strokeLinecap='round'
                    />
                </Svg>
            </Pressable>
        </View>
    );
}

function show(variant: ToastVariant, params: ShowToastParams) {
    const { title, description, duration = 3000 } = params;

    let toastId: string | number;

    toastId = toast.custom(
        <ToastCard
            variant={variant}
            title={title}
            description={description}
            onClose={() => toast.dismiss(toastId)}
        />,
        {
            duration,
            unstyled: true,
        },
    );

    return toastId;
}

export const appToast = {
    showSuccess: (title: string, description?: string, duration?: number) =>
        show('success', { title, description, duration }),
    showError: (title: string, description?: string, duration?: number) =>
        show('error', { title, description, duration }),
    showWarning: (title: string, description?: string, duration?: number) =>
        show('warning', { title, description, duration }),
    showInfo: (title: string, description?: string, duration?: number) =>
        show('info', { title, description, duration }),
};

const styles = StyleSheet.create({
    card: {
        width: moderateScale(320),
        maxWidth: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(12),
        borderWidth: 1,
        borderRadius: radius.md,
        paddingHorizontal: moderateScale(14),
        paddingVertical: verticalScale(12),
        ...shadows.card,
    },
    iconWrap: {
        width: moderateScale(28),
        height: moderateScale(28),
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    body: {
        flex: 1,
        gap: verticalScale(2),
    },
    closeButton: {
        width: moderateScale(24),
        height: moderateScale(24),
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    closeButtonPressed: {
        opacity: 0.65,
    },
    title: {
        fontFamily: typography.font.bold,
        fontSize: moderateScale(14),
        lineHeight: moderateScale(18),
    },
    description: {
        fontFamily: typography.font.medium,
        fontSize: moderateScale(13),
        lineHeight: moderateScale(18),
    },
});
