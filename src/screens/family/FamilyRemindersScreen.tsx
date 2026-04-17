import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    useFamilyProfilesQuery,
    useFamilyQuery,
} from '@/src/features/family/queries';
import { appToast } from '@/src/lib/toast';
import {
    notificationsService,
    type NotificationApiItem,
} from '@/src/services/notifications.services';
import { scale, scaleFont, verticalScale } from '@/src/styles/responsive';
import { buttonSystem, cardSystem, formSystem } from '@/src/styles/shared';
import { colors, typography } from '@/src/styles/tokens';

type Reminder = {
    id: string;
    scheduleId: string;
    time: string;
    memberName: string;
    memberInitials: string;
    medicineName: string;
    dosageInfo: string;
    status: 'pending' | 'taken' | 'skipped';
};

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

function getInitials(name: string): string {
    const tokens = name
        .split(' ')
        .map((it) => it.trim())
        .filter(Boolean);

    if (tokens.length === 0) return '??';
    if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
    return `${tokens[0][0] ?? ''}${tokens[tokens.length - 1][0] ?? ''}`.toUpperCase();
}

function mapApiStatusToReminderStatus(
    value: string | null | undefined,
): Reminder['status'] {
    if (value === 'COMPLETED' || value === 'TAKEN') {
        return 'taken';
    }
    if (value === 'PAUSED' || value === 'SKIPPED') {
        return 'skipped';
    }
    return 'pending';
}

function toReminder(item: NotificationApiItem): Reminder {
    const memberName = item.profile_name?.trim() || 'Thành viên gia đình';
    const medicine =
        item.medicine_name?.trim() || item.body?.trim() || 'Nhắc uống thuốc';
    const dosage = item.dosage_per_time
        ? `Liều ${item.dosage_per_time}`
        : item.title?.trim() || 'Lịch nhắc thuốc';

    return {
        id: item.id,
        scheduleId: item.schedule_id || item.id,
        time: item.remind_time || '--:--',
        memberName,
        memberInitials: getInitials(memberName),
        medicineName: medicine,
        dosageInfo: dosage,
        status: mapApiStatusToReminderStatus(
            item.occurrence_status || item.status,
        ),
    };
}

export default function FamilyRemindersScreen({
    familyId,
}: {
    familyId: string;
}): React.JSX.Element {
    const { data: family } = useFamilyQuery(familyId);
    const { data: familyProfiles = [] } = useFamilyProfilesQuery(familyId);
    const [reminders, setReminders] = useState<Reminder[]>([]);

    const familyProfileIds = useMemo(
        () =>
            new Set(
                familyProfiles
                    .map((it: Record<string, unknown>) => String(it.id ?? ''))
                    .filter(Boolean),
            ),
        [familyProfiles],
    );

    useEffect(() => {
        let active = true;

        const load = async () => {
            if (!family) {
                return;
            }

            try {
                const res = await notificationsService.getMyNotifications();
                if (!active) {
                    return;
                }

                const list = Array.isArray(res?.items) ? res.items : [];
                const mapped = list
                    .filter((item) => {
                        if (item.category !== 'MEDICINE') {
                            return false;
                        }
                        if (familyProfileIds.size > 0) {
                            return familyProfileIds.has(
                                String(item.profile_id),
                            );
                        }
                        return (
                            (item.family_name || '').trim() ===
                            (family.name || '').trim()
                        );
                    })
                    .map(toReminder);

                setReminders(mapped);
            } catch (error) {
                console.error(error);
                if (active) {
                    appToast.showError('Không tải được lịch nhắc gia đình.');
                }
            }
        };

        void load();

        return () => {
            active = false;
        };
    }, [family, familyProfileIds]);

    if (!family) {
        return <View style={styles.container} />;
    }

    const handleAction = (id: string, action: 'taken' | 'skipped') => {
        const target = reminders.find((it) => it.id === id);
        if (!target) {
            return;
        }

        const prev = reminders;
        setReminders((items) =>
            items.map((r) => (r.id === id ? { ...r, status: action } : r)),
        );

        void notificationsService
            .logScheduleCompliance(
                target.scheduleId,
                action === 'taken' ? 'taken' : 'skipped',
                { source: 'in_app' },
            )
            .catch((error) => {
                console.error(error);
                setReminders(prev);
                appToast.showError('Không cập nhật được trạng thái lịch nhắc.');
            });
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
                {reminders.length === 0 && (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyTitle}>Chưa có lịch nhắc</Text>
                        <Text style={styles.emptySubtitle}>
                            Lịch nhắc thuốc của gia đình sẽ hiển thị tại đây.
                        </Text>
                    </View>
                )}

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
    emptyCard: {
        ...cardSystem.shell,
        borderRadius: scale(14),
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(14),
        alignItems: 'center',
        gap: verticalScale(4),
    },
    emptyTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: colors.text,
    },
    emptySubtitle: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text3,
        textAlign: 'center',
    },
});
