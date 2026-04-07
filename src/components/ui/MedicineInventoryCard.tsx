import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import {
    Pressable,
    type StyleProp,
    StyleSheet,
    Switch,
    Text,
    View,
    type ViewStyle,
} from 'react-native';
import { moderateScale, scale, verticalScale } from '../../styles/responsive';
import { cardSystem, medicineCardSystem } from '../../styles/shared';
import { colors, typography } from '../../styles/tokens';

type IconRenderer = (size: number, color: string) => React.ReactNode;

interface MedicineInventoryCardProps {
    title: string;
    subtitle?: string;
    icon: IconRenderer;
    themeColor: string;
    themeLight: string;
    quantityLabel: string;
    hsdLabel: string;
    progress: number;
    onPress?: () => void;
    reminderText?: string;
    reminderOn?: boolean;
    reminderActiveColor?: string;
    onToggleReminder?: () => void;
    onClone?: () => void;
    onDelete?: () => void;
    cloneLabel?: string;
    deleteLabel?: string;
    style?: StyleProp<ViewStyle>;
}

export function MedicineInventoryCard({
    title,
    subtitle,
    icon,
    themeColor,
    themeLight,
    quantityLabel,
    hsdLabel,
    progress,
    onPress,
    reminderText,
    reminderOn,
    reminderActiveColor,
    onToggleReminder,
    onClone,
    onDelete,
    cloneLabel = 'Nhân bản',
    deleteLabel = 'Xóa',
    style,
}: MedicineInventoryCardProps): React.JSX.Element {
    const hasReminder = typeof reminderOn === 'boolean' && !!onToggleReminder;
    const hasActions = !!onClone || !!onDelete;
    const activeReminderColor = reminderActiveColor || colors.success;

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                style,
                pressed && onPress ? styles.cardPressed : null,
            ]}
            onPress={onPress}
        >
            <View style={styles.topRow}>
                <View style={[styles.iconBox, { backgroundColor: themeLight }]}>
                    {icon(medicineCardSystem.iconSize, themeColor)}
                </View>

                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>
                        {title}
                    </Text>
                    {!!subtitle && (
                        <Text style={styles.subtitle} numberOfLines={1}>
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.statusRow}>
                <Text style={[styles.remainingText, { color: themeColor }]}>
                    {quantityLabel}
                </Text>
                <View
                    style={[styles.hsdBadge, { backgroundColor: themeLight }]}
                >
                    <Text style={[styles.hsdText, { color: themeColor }]}>
                        {hsdLabel}
                    </Text>
                </View>
            </View>

            <View style={styles.progressTrack}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${Math.max(0, Math.min(100, progress))}%`,
                            backgroundColor: themeColor,
                        },
                    ]}
                />
            </View>

            {hasReminder && (
                <View style={styles.reminderRow}>
                    <View style={styles.reminderInfo}>
                        <MaterialCommunityIcons
                            name={
                                reminderOn ? 'bell-outline' : 'bell-off-outline'
                            }
                            size={14}
                            color={
                                reminderOn ? activeReminderColor : colors.text3
                            }
                        />
                        <Text
                            style={[
                                styles.reminderText,
                                {
                                    color: reminderOn
                                        ? colors.text2
                                        : colors.text3,
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {reminderText}
                        </Text>
                    </View>
                    <Switch
                        value={reminderOn}
                        onValueChange={onToggleReminder}
                        trackColor={{
                            false: '#E5E7EB',
                            true: activeReminderColor,
                        }}
                        thumbColor='#fff'
                        ios_backgroundColor='#E5E7EB'
                        style={styles.switch}
                    />
                </View>
            )}

            {hasActions && (
                <View style={styles.actionRow}>
                    <Pressable
                        style={styles.actionBtn}
                        onPress={onClone}
                        disabled={!onClone}
                    >
                        <Ionicons
                            name='copy-outline'
                            size={14}
                            color={colors.text2}
                        />
                        <Text style={styles.actionText}>{cloneLabel}</Text>
                    </Pressable>

                    <View style={styles.actionDivider} />

                    <Pressable
                        style={styles.actionBtn}
                        onPress={onDelete}
                        disabled={!onDelete}
                    >
                        <Ionicons
                            name='trash-outline'
                            size={14}
                            color={colors.danger}
                        />
                        <Text style={[styles.actionText, styles.deleteText]}>
                            {deleteLabel}
                        </Text>
                    </Pressable>
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        ...cardSystem.shell,
        borderRadius: medicineCardSystem.radius,
        borderColor: colors.border,
        backgroundColor: colors.card,
        paddingTop: medicineCardSystem.topPadding,
        overflow: 'hidden',
    },
    cardPressed: {
        opacity: 0.96,
        transform: [{ scale: 0.992 }],
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: medicineCardSystem.sidePadding,
        paddingBottom: verticalScale(7),
    },
    iconBox: {
        width: medicineCardSystem.iconBox,
        height: medicineCardSystem.iconBox,
        borderRadius: medicineCardSystem.iconRadius,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: medicineCardSystem.rowGap,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontFamily: typography.font.bold,
        fontSize: medicineCardSystem.titleSize,
        color: colors.text,
        lineHeight: medicineCardSystem.titleLineHeight,
    },
    subtitle: {
        fontFamily: typography.font.medium,
        fontSize: medicineCardSystem.subtitleSize,
        color: colors.text3,
        marginTop: verticalScale(2),
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: scale(8),
        paddingHorizontal: medicineCardSystem.sidePadding,
        marginBottom: verticalScale(8),
    },
    remainingText: {
        flex: 1,
        fontFamily: typography.font.bold,
        fontSize: medicineCardSystem.statusSize,
    },
    hsdBadge: {
        paddingHorizontal: medicineCardSystem.badgePaddingX,
        paddingVertical: medicineCardSystem.badgePaddingY,
        borderRadius: moderateScale(999),
    },
    hsdText: {
        fontFamily: typography.font.bold,
        fontSize: medicineCardSystem.badgeSize,
    },
    progressTrack: {
        height: medicineCardSystem.progressHeight,
        borderRadius: moderateScale(999),
        backgroundColor: colors.border,
        overflow: 'hidden',
        marginHorizontal: medicineCardSystem.sidePadding,
        marginBottom: verticalScale(10),
    },
    progressFill: {
        height: '100%',
        borderRadius: moderateScale(999),
    },
    reminderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: scale(8),
        paddingHorizontal: medicineCardSystem.sidePadding,
        paddingVertical: verticalScale(7),
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    reminderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
        flex: 1,
    },
    reminderText: {
        flex: 1,
        fontFamily: typography.font.medium,
        fontSize: medicineCardSystem.reminderSize,
    },
    switch: {
        transform: [{ scale: 0.68 }],
        marginRight: scale(-4),
    },
    actionRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(6),
        paddingVertical: medicineCardSystem.actionPaddingY,
    },
    actionDivider: {
        width: 1,
        backgroundColor: colors.border,
    },
    actionText: {
        fontFamily: typography.font.semiBold,
        fontSize: medicineCardSystem.actionSize,
        color: colors.text2,
    },
    deleteText: {
        color: colors.danger,
    },
});
