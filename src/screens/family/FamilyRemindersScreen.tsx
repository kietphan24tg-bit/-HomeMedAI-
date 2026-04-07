import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFamilyQuery } from '@/src/features/family/queries';
import { scale, scaleFont, verticalScale } from '@/src/styles/responsive';
import { buttonSystem, cardSystem, formSystem } from '@/src/styles/shared';
import { colors, typography } from '@/src/styles/tokens';

type Reminder = {
    id: string;
    time: string;
    memberName: string;
    memberInitials: string;
    medicineName: string;
    dosageInfo: string;
    status: 'pending' | 'taken' | 'skipped';
};

const MOCK_REMINDERS: Reminder[] = [
    {
        id: '1',
        time: '07:00',
        memberName: 'Nguyễn Bình',
        memberInitials: 'NB',
        medicineName: 'Amlodipine 5mg',
        dosageInfo: 'Buổi sáng • Sau ăn',
        status: 'pending',
    },
    {
        id: '2',
        time: '10:00',
        memberName: 'Phạm Cường',
        memberInitials: 'PC',
        medicineName: 'Vitamin C',
        dosageInfo: '1 viên sủi',
        status: 'pending',
    },
    {
        id: '3',
        time: '20:00',
        memberName: 'Bùi An',
        memberInitials: 'BA',
        medicineName: 'Paracetamol 500mg',
        dosageInfo: 'T3/T5 • Cách 2 tuần',
        status: 'pending',
    },
];

const AVATAR_COLORS = ['#0E8A7D', '#2563EB', '#7C3AED', '#EA580C', '#BE123C'];
const AVATAR_BG_COLORS = [
    '#E9F7F2',
    '#EFF6FF',
    '#F3E8FF',
    '#FFF7ED',
    '#FFF1F2',
];

function getReminderColorPair(reminder: Reminder): {
    bg: string;
    text: string;
} {
    const numericId = Number(reminder.id);
    const seed = !Number.isNaN(numericId)
        ? Math.abs(numericId)
        : reminder.memberInitials
              .split('')
              .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const idx = seed % AVATAR_COLORS.length;
    return { bg: AVATAR_BG_COLORS[idx], text: AVATAR_COLORS[idx] };
}

export default function FamilyRemindersScreen({
    familyId,
}: {
    familyId: string;
}): React.JSX.Element {
    const { data: family } = useFamilyQuery(familyId);
    const [reminders, setReminders] = useState<Reminder[]>(MOCK_REMINDERS);

    if (!family) {
        return <View style={styles.container} />;
    }

    const handleAction = (id: string, action: 'taken' | 'skipped') => {
        setReminders((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: action } : r)),
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* ── HEADER ── */}
            <View style={styles.header}>
                <Pressable
                    style={styles.headerBackBtn}
                    onPress={() => router.back()}
                    hitSlop={10}
                >
                    <Ionicons
                        name='chevron-back'
                        size={18}
                        color={colors.text2}
                    />
                </Pressable>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Lịch nhắc gia đình</Text>
                    <Text style={styles.headerSubtitle}>
                        {family?.name || 'Gia đình'}
                    </Text>
                </View>
                <View style={styles.headerRightSpacer} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── SECTION TITLE ── */}
                <Text style={styles.sectionTitle}>Ngày 07/04/2026</Text>

                {/* ── REMINDER CARDS ── */}
                {reminders.map((reminder) => {
                    const colorPair = getReminderColorPair(reminder);
                    return (
                        <View key={reminder.id} style={styles.card}>
                            {/* Time pill */}
                            <View style={styles.timePillRow}>
                                <View style={styles.timePill}>
                                    <Ionicons
                                        name='time-outline'
                                        size={12}
                                        color={colors.warning}
                                    />
                                    <Text style={styles.timePillText}>
                                        {reminder.time}
                                    </Text>
                                </View>
                                {reminder.status !== 'pending' && (
                                    <View
                                        style={[
                                            styles.statusPill,
                                            {
                                                backgroundColor:
                                                    reminder.status === 'taken'
                                                        ? colors.successBg
                                                        : colors.dangerBg,
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={
                                                reminder.status === 'taken'
                                                    ? 'checkmark-circle'
                                                    : 'close-circle'
                                            }
                                            size={13}
                                            color={
                                                reminder.status === 'taken'
                                                    ? colors.success
                                                    : colors.danger
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.statusPillText,
                                                {
                                                    color:
                                                        reminder.status ===
                                                        'taken'
                                                            ? colors.success
                                                            : colors.danger,
                                                },
                                            ]}
                                        >
                                            {reminder.status === 'taken'
                                                ? 'Đã uống'
                                                : 'Đã bỏ qua'}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Card body */}
                            <View style={styles.cardBody}>
                                <View
                                    style={[
                                        styles.memberAvatar,
                                        { backgroundColor: colorPair.bg },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.memberAvatarText,
                                            { color: colorPair.text },
                                        ]}
                                    >
                                        {reminder.memberInitials}
                                    </Text>
                                </View>
                                <View style={styles.medicineDetailContainer}>
                                    <Text style={styles.memberNameText}>
                                        {reminder.memberName}
                                    </Text>
                                    <Text style={styles.medicineName}>
                                        {reminder.medicineName}
                                    </Text>
                                    <View style={styles.dosageRow}>
                                        <Ionicons
                                            name='calendar-outline'
                                            size={11}
                                            color={colors.text3}
                                        />
                                        <Text style={styles.dosageInfo}>
                                            {reminder.dosageInfo}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Actions */}
                            {reminder.status === 'pending' && (
                                <View style={styles.actions}>
                                    <Pressable
                                        style={styles.takenBtn}
                                        onPress={() =>
                                            handleAction(reminder.id, 'taken')
                                        }
                                    >
                                        <Ionicons
                                            name='checkmark-circle-outline'
                                            size={15}
                                            color='#fff'
                                        />
                                        <Text style={styles.takenBtnText}>
                                            Đã uống
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        style={styles.skipBtn}
                                        onPress={() =>
                                            handleAction(reminder.id, 'skipped')
                                        }
                                    >
                                        <Ionicons
                                            name='close-circle-outline'
                                            size={15}
                                            color={colors.text2}
                                        />
                                        <Text style={styles.skipBtnText}>
                                            Bỏ qua
                                        </Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    );
                })}

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },

    /* ── Header ── */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(16),
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(6),
        backgroundColor: 'transparent',
    },
    headerBackBtn: {
        width: scale(28),
        height: scale(28),
        borderRadius: scale(14),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    headerRightSpacer: {
        width: scale(28),
        height: scale(28),
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(17),
        color: colors.text,
    },
    headerSubtitle: {
        marginTop: verticalScale(1),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text2,
    },

    /* ── Scroll ── */
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: scale(16),
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(40),
        gap: verticalScale(8),
    },

    /* ── Summary Card ── */
    summaryCard: {
        ...cardSystem.shell,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: scale(16),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(12),
    },
    summaryIconWrap: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(12),
        backgroundColor: colors.warningBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(10),
    },
    summaryBody: {
        flex: 1,
    },
    summaryTitle: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(14),
        color: colors.text,
    },
    summarySub: {
        marginTop: verticalScale(1),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11.5),
        color: colors.text3,
    },
    summaryCountWrap: {
        alignItems: 'center',
        minWidth: scale(40),
    },
    summaryCount: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(20),
        color: colors.warning,
    },
    summaryCountLabel: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(10),
        color: colors.text3,
        marginTop: verticalScale(-2),
    },

    /* ── Section Title ── */
    sectionTitle: {
        ...formSystem.sectionTitle,
        letterSpacing: 0.4,
        marginTop: verticalScale(6),
        marginBottom: verticalScale(2),
    },

    /* ── Reminder Card ── */
    card: {
        ...cardSystem.shell,
        borderRadius: scale(16),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(10),
        gap: verticalScale(8),
    },
    timePillRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
        backgroundColor: colors.warningBg,
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(3),
        borderRadius: scale(999),
    },
    timePillText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11.5),
        color: colors.warning,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(3),
        borderRadius: scale(999),
    },
    statusPillText: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(11),
        color: colors.success,
    },

    /* ── Card Body ── */
    cardBody: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
    },
    memberAvatar: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    memberAvatarText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: '#FFFFFF',
    },
    medicineDetailContainer: {
        flex: 1,
        gap: verticalScale(1),
        justifyContent: 'center',
    },
    memberNameText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11.5),
        color: colors.primary,
    },
    medicineName: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(14),
        color: colors.text,
    },
    dosageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
        marginTop: verticalScale(1),
    },
    dosageInfo: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11),
        color: colors.text3,
    },

    /* ── Actions ── */
    actions: {
        flexDirection: 'row',
        gap: scale(8),
        marginTop: verticalScale(2),
    },
    takenBtn: {
        flex: 1,
        ...buttonSystem.primary,
        backgroundColor: colors.primary,
        minHeight: verticalScale(36),
        borderRadius: scale(10),
        alignItems: 'center',
    },
    takenBtnText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12.5),
        color: '#fff',
    },
    skipBtn: {
        flex: 1,
        ...buttonSystem.outline,
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        minHeight: verticalScale(36),
        borderRadius: scale(10),
        alignItems: 'center',
    },
    skipBtnText: {
        ...buttonSystem.textOutline,
        fontSize: scaleFont(12.5),
    },

    /* ── Spacer ── */
    bottomSpacer: {
        height: verticalScale(28),
    },
});
