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
import { appointmentRemindersService } from '@/src/services/appointmentReminders.services';
import {
    notificationsService,
    type NotificationApiItem,
} from '@/src/services/notifications.services';
import { scale, scaleFont, verticalScale } from '@/src/styles/responsive';
import { buttonSystem, cardSystem, formSystem } from '@/src/styles/shared';
import { colors, typography } from '@/src/styles/tokens';

type Reminder = {
    id: string;
    scheduleId?: string;
    category: 'medicine' | 'checkup' | 'vaccine';
    time: string;
    memberName: string;
    memberInitials: string;
    medicineName: string;
    dosageInfo: string;
    status: 'pending' | 'taken' | 'skipped';
    date?: string;
};

const AVATAR_COLORS = ['#0E8A7D', '#2563EB', '#7C3AED', '#EA580C', '#BE123C'];
const AVATAR_BG_COLORS = [
    '#E9F7F2',
    '#EFF6FF',
    '#F3E8FF',
    '#FFF7ED',
    '#FFF1F2',
];

function normalizeStatus(value: string | null | undefined): Reminder['status'] {
    const normalized = (value ?? '').toLowerCase();
    if (
        normalized === 'completed' ||
        normalized === 'taken' ||
        normalized === 'done'
    ) {
        return 'taken';
    }
    if (
        normalized === 'paused' ||
        normalized === 'skipped' ||
        normalized === 'missed' ||
        normalized === 'cancelled'
    ) {
        return 'skipped';
    }
    return 'pending';
}

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

function splitDateAndTime(value: string | Date | null | undefined): {
    date?: string;
    time: string;
} {
    if (!value) return { time: '--:--' };
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        return { time: '--:--' };
    }
    return {
        date: d.toLocaleDateString('vi-VN'),
        time: `${String(d.getHours()).padStart(2, '0')}:${String(
            d.getMinutes(),
        ).padStart(2, '0')}`,
    };
}

function toMedicineReminder(item: NotificationApiItem): Reminder {
    const memberName = item.profile_name?.trim() || 'Thanh vien gia dinh';
    const medicine =
        item.medicine_name?.trim() || item.body?.trim() || 'Nhac uong thuoc';
    const dosage = item.dosage_per_time
        ? `Lieu ${item.dosage_per_time}`
        : item.title?.trim() || 'Lich nhac thuoc';
    const dateTime = splitDateAndTime(item.scheduled_at);

    return {
        id: `med-${item.id}`,
        scheduleId: item.schedule_id || item.id,
        category: 'medicine',
        time: item.remind_time || dateTime.time,
        date: dateTime.date,
        memberName,
        memberInitials: getInitials(memberName),
        medicineName: medicine,
        dosageInfo: dosage,
        status: normalizeStatus(item.occurrence_status || item.status),
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

    const familyProfileIds = useMemo(() => {
        const fromProfiles = familyProfiles
            .map((it: Record<string, unknown>) => String(it.id ?? ''))
            .filter(Boolean);
        if (fromProfiles.length > 0) return fromProfiles;
        return (family?.members ?? [])
            .map((it) => String(it.healthProfileId ?? ''))
            .filter(Boolean);
    }, [family?.members, familyProfiles]);

    const profileNameMap = useMemo(() => {
        const map = new Map<string, string>();
        for (const member of family?.members ?? []) {
            const profileId = String(member.healthProfileId ?? '');
            if (profileId) {
                map.set(profileId, member.name || 'Thanh vien gia dinh');
            }
        }
        for (const profile of familyProfiles as Record<string, unknown>[]) {
            const profileId = String(profile.id ?? '');
            const fullName =
                String(
                    profile.full_name ??
                        profile.name ??
                        profile.profile_name ??
                        '',
                ).trim() || 'Thanh vien gia dinh';
            if (profileId && !map.has(profileId)) {
                map.set(profileId, fullName);
            }
        }
        return map;
    }, [family?.members, familyProfiles]);

    useEffect(() => {
        let active = true;

        const load = async () => {
            if (!family) return;
            try {
                const [notificationRes, ...appointmentRes] = await Promise.all([
                    notificationsService.getMyNotifications(),
                    ...familyProfileIds.map((profileId) =>
                        appointmentRemindersService.listForProfile(profileId),
                    ),
                ]);
                if (!active) return;

                const medItems = Array.isArray(notificationRes?.items)
                    ? notificationRes.items
                    : [];
                const medicineReminders = medItems
                    .filter((item) => {
                        if (item.category !== 'MEDICINE') return false;
                        if (familyProfileIds.length > 0) {
                            return familyProfileIds.includes(
                                String(item.profile_id),
                            );
                        }
                        return (
                            (item.family_name || '').trim() ===
                            (family.name || '').trim()
                        );
                    })
                    .map(toMedicineReminder);

                const appointmentReminders = appointmentRes.flatMap(
                    (items, index) => {
                        const profileId = familyProfileIds[index];
                        const memberName =
                            profileNameMap.get(profileId) ||
                            'Thanh vien gia dinh';
                        return items.map((item) => {
                            const dateTime = splitDateAndTime(
                                item.appointment_at,
                            );
                            const isVaccine = item.type === 'vaccine';
                            const title = isVaccine
                                ? item.vaccine_name?.trim() ||
                                  item.title?.trim() ||
                                  'Lich tiem'
                                : item.title?.trim() || 'Lich tai kham';
                            const detail = isVaccine
                                ? `Mui ${item.dose_number ?? '-'}`
                                : item.hospital_name?.trim() ||
                                  item.department?.trim() ||
                                  'Lich hen kham';
                            return {
                                id: `appt-${item.id}`,
                                category: isVaccine ? 'vaccine' : 'checkup',
                                time: dateTime.time,
                                date: dateTime.date,
                                memberName,
                                memberInitials: getInitials(memberName),
                                medicineName: title,
                                dosageInfo: detail,
                                status: normalizeStatus(item.status),
                            } as Reminder;
                        });
                    },
                );

                const combined = [
                    ...medicineReminders,
                    ...appointmentReminders,
                ].sort((a, b) => {
                    const aDate = new Date(
                        `${a.date ?? '1970-01-01'} ${a.time}`,
                    ).getTime();
                    const bDate = new Date(
                        `${b.date ?? '1970-01-01'} ${b.time}`,
                    ).getTime();
                    return bDate - aDate;
                });

                setReminders(combined);
            } catch (error) {
                console.error(error);
                if (active) {
                    appToast.showError('Khong tai duoc lich nhac gia dinh.');
                }
            }
        };

        void load();
        return () => {
            active = false;
        };
    }, [family, family?.name, familyProfileIds, profileNameMap]);

    if (!family) {
        return <View style={styles.container} />;
    }

    const handleAction = (id: string, action: 'taken' | 'skipped') => {
        const target = reminders.find((it) => it.id === id);
        if (!target || target.category !== 'medicine' || !target.scheduleId) {
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
                appToast.showError('Khong cap nhat duoc trang thai lich nhac.');
            });
    };

    return (
        <SafeAreaView style={styles.container}>
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
                    <Text style={styles.headerTitle}>Lich nhac gia dinh</Text>
                    <Text style={styles.headerSubtitle}>
                        {family?.name || 'Gia dinh'}
                    </Text>
                </View>
                <View style={styles.headerRightSpacer} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {reminders.length > 0 && (
                    <Text style={styles.sectionTitle}>Tat ca lich nhac</Text>
                )}

                {reminders.length === 0 && (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyTitle}>Chua co lich nhac</Text>
                        <Text style={styles.emptySubtitle}>
                            Lich thuoc, lich tiem va lich tai kham se hien thi
                            tai day.
                        </Text>
                    </View>
                )}

                {reminders.map((reminder) => {
                    const colorPair = getReminderColorPair(reminder);
                    return (
                        <View key={reminder.id} style={styles.card}>
                            <View style={styles.timePillRow}>
                                <View style={styles.timePill}>
                                    <Ionicons
                                        name='time-outline'
                                        size={12}
                                        color={colors.warning}
                                    />
                                    <Text style={styles.timePillText}>
                                        {reminder.date
                                            ? `${reminder.date} • ${reminder.time}`
                                            : reminder.time}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.statusPill,
                                        {
                                            backgroundColor:
                                                reminder.status === 'pending'
                                                    ? colors.warningBg
                                                    : reminder.status ===
                                                        'taken'
                                                      ? colors.successBg
                                                      : colors.dangerBg,
                                        },
                                    ]}
                                >
                                    <Text style={styles.statusPillText}>
                                        {reminder.status === 'pending'
                                            ? 'Dang cho'
                                            : reminder.status === 'taken'
                                              ? 'Da xu ly'
                                              : 'Da bo qua'}
                                    </Text>
                                </View>
                            </View>

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

                            {reminder.status === 'pending' &&
                            reminder.category === 'medicine' ? (
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
                                            Da uong
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
                                            Bo qua
                                        </Text>
                                    </Pressable>
                                </View>
                            ) : null}
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
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: scale(16),
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(40),
        gap: verticalScale(8),
    },
    sectionTitle: {
        ...formSystem.sectionTitle,
        letterSpacing: 0.4,
        marginTop: verticalScale(6),
        marginBottom: verticalScale(2),
    },
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
        color: colors.text2,
    },
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
