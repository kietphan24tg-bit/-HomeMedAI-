import Ionicons from '@expo/vector-icons/Ionicons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { DateField } from '@/src/components/ui';
import { useFamilyQuery } from '@/src/features/family/queries';
import { appToast } from '@/src/lib/toast';
import { CustomReminderModal } from '@/src/screens/health/CustomReminderModal';
import {
    appointmentRemindersService,
    type AppointmentReminderType,
} from '@/src/services/appointmentReminders.services';
import { colors } from '@/src/styles/tokens';
import {
    reminderLabelToPayload,
    reminderPayloadToLabel,
} from '@/src/utils/reminder-label';

const REMINDER_OPTIONS = [
    'Không nhắc',
    '2 giờ trước',
    '1 ngày trước',
    '3 ngày trước',
    '1 tuần trước',
    'Tùy chỉnh',
] as const;

function normalizeParam(value: string | string[] | undefined): string {
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && value.length > 0) return value[0] ?? '';
    return '';
}

function formatDateText(value: string): string {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('vi-VN');
}

function formatReminderLabel(
    reminderEnabled?: boolean,
    value?: number | null,
    unit?: AppointmentReminderType['remind_before_unit'] | null,
): string {
    if (reminderEnabled === false) {
        return 'Không nhắc';
    }
    if (!value || !unit) {
        return 'Không nhắc';
    }
    return reminderPayloadToLabel(value, unit);
}

function sortByAppointmentDate(
    a: AppointmentReminderType,
    b: AppointmentReminderType,
): number {
    return (
        new Date(a.appointment_at).getTime() -
        new Date(b.appointment_at).getTime()
    );
}

function toReminderDisplayLabel(item: AppointmentReminderType): string {
    if (item.reminder_enabled === false) {
        return 'Không nhắc';
    }
    if (!item.remind_before_value || !item.remind_before_unit) {
        return 'Không nhắc';
    }
    return `${reminderPayloadToLabel(item.remind_before_value, item.remind_before_unit)} trước`;
}

function combineDateAndTime(date: Date, time: Date): Date {
    const next = new Date(date);
    next.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return next;
}

export default function MemberFollowupsRoute() {
    const queryClient = useQueryClient();
    const { familyId, memberId } = useLocalSearchParams<{
        familyId?: string | string[];
        memberId?: string | string[];
    }>();
    const normalizedFamilyId = normalizeParam(familyId);
    const normalizedMemberId = normalizeParam(memberId);

    const { data: family, isLoading: isFamilyLoading } =
        useFamilyQuery(normalizedFamilyId);

    const member = useMemo(
        () =>
            family?.members.find(
                (item) => String(item.id) === String(normalizedMemberId),
            ),
        [family?.members, normalizedMemberId],
    );

    const memberName = member?.name ?? 'Thành viên';
    const profileId = member?.healthProfileId ?? '';
    const [editingReminder, setEditingReminder] =
        useState<AppointmentReminderType | null>(null);
    const [editDate, setEditDate] = useState(new Date());
    const [editTime, setEditTime] = useState(new Date());
    const [editReminder, setEditReminder] = useState('1 ngày trước');
    const [showReminderOptions, setShowReminderOptions] = useState(false);
    const [showCustomReminder, setShowCustomReminder] = useState(false);

    const {
        data: reminders = [],
        isLoading: isRemindersLoading,
        isRefetching,
    } = useQuery({
        queryKey: ['appointment-reminders', profileId],
        queryFn: () => appointmentRemindersService.listForProfile(profileId),
        enabled: !!profileId,
    });

    const cancelMutation = useMutation({
        mutationFn: (reminderId: string) =>
            appointmentRemindersService.delete(reminderId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['appointment-reminders', profileId],
            });
            appToast.showSuccess('Đã hủy lịch tái khám');
        },
        onError: () => {
            appToast.showError('Không thể hủy lịch tái khám');
        },
    });

    const completeMutation = useMutation({
        mutationFn: (reminderId: string) =>
            appointmentRemindersService.patch(reminderId, { status: 'done' }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['appointment-reminders', profileId],
            });
            appToast.showSuccess('Đã đánh dấu hoàn thành');
        },
        onError: () => {
            appToast.showError('Không thể cập nhật trạng thái lịch');
        },
    });

    const editMutation = useMutation({
        mutationFn: async (payload: {
            reminderId: string;
            appointmentAt: string;
            reminderLabel: string;
        }) => {
            const remindPayload = reminderLabelToPayload(payload.reminderLabel);
            return appointmentRemindersService.patch(payload.reminderId, {
                appointment_at: payload.appointmentAt,
                ...remindPayload,
            });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['appointment-reminders', profileId],
            });
            setEditingReminder(null);
            setShowReminderOptions(false);
            appToast.showSuccess('Đã cập nhật lịch tái khám');
        },
        onError: () => {
            appToast.showError('Không thể cập nhật lịch tái khám');
        },
    });

    const openEditModal = (item: AppointmentReminderType) => {
        const dt = new Date(item.appointment_at);
        setEditingReminder(item);
        setEditDate(dt);
        setEditTime(dt);
        setEditReminder(toReminderDisplayLabel(item));
        setShowReminderOptions(false);
    };

    const onSaveEdit = () => {
        if (!editingReminder) {
            return;
        }
        const appointmentAt = combineDateAndTime(editDate, editTime);
        if (appointmentAt.getTime() < Date.now()) {
            appToast.showWarning('Không thể đặt lịch trong quá khứ');
            return;
        }

        editMutation.mutate({
            reminderId: editingReminder.id,
            appointmentAt: appointmentAt.toISOString(),
            reminderLabel: editReminder,
        });
    };

    const checkupReminders = useMemo(
        () => reminders.filter((item) => item.type === 'checkup'),
        [reminders],
    );

    const now = Date.now();

    const upcoming = useMemo(
        () =>
            checkupReminders
                .filter(
                    (item) =>
                        item.status === 'pending' &&
                        new Date(item.appointment_at).getTime() >= now,
                )
                .sort(sortByAppointmentDate),
        [checkupReminders, now],
    );

    const past = useMemo(
        () =>
            checkupReminders
                .filter(
                    (item) =>
                        item.status !== 'pending' ||
                        new Date(item.appointment_at).getTime() < now,
                )
                .sort(sortByAppointmentDate)
                .reverse(),
        [checkupReminders, now],
    );

    const isBusy =
        isFamilyLoading ||
        isRemindersLoading ||
        cancelMutation.isPending ||
        completeMutation.isPending ||
        editMutation.isPending;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgHealth }}>
            <StatusBar
                barStyle='dark-content'
                backgroundColor={colors.bgHealth}
            />

            {/* TOP BAR */}
            <View style={styles.topbar}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons
                        name='chevron-back'
                        size={16}
                        color={colors.text2}
                    />
                </Pressable>
                <View style={{ flex: 1 }}>
                    <Text style={styles.topbarTitle}>Lịch tái khám</Text>
                    <Text style={styles.topbarSubtitle}>{memberName}</Text>
                </View>
                <Pressable
                    style={styles.topbarAction}
                    onPress={() => router.push('./new')}
                >
                    <Ionicons name='add' size={20} color={colors.primary} />
                </Pressable>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {isBusy ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator
                            size='small'
                            color={colors.primary}
                        />
                        <Text style={styles.loadingText}>
                            Đang tải lịch tái khám...
                        </Text>
                    </View>
                ) : null}

                {/* SẮP TỚI */}
                <Text style={styles.sectionHeader}>SẮP TỚI</Text>
                {upcoming.map((item) => (
                    <View key={item.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons
                                name='calendar-outline'
                                size={18}
                                color={colors.primary}
                            />
                            <Text style={styles.cardDate}>
                                {formatDateText(item.appointment_at)}
                            </Text>
                        </View>
                        <View style={styles.cardBody}>
                            <Text style={styles.cardHospital}>
                                {item.hospital_name || 'Chưa cập nhật cơ sở'}
                            </Text>
                            <Text style={styles.cardDetail}>
                                {item.department || 'Chưa cập nhật chuyên khoa'}
                            </Text>
                            <Text style={styles.cardDetail}>{item.title}</Text>

                            <View style={styles.reminderRow}>
                                <Text style={styles.reminderText}>
                                    Nhắc trước
                                </Text>
                                <View style={styles.reminderPill}>
                                    <Text style={styles.reminderPillText}>
                                        {formatReminderLabel(
                                            item.reminder_enabled,
                                            item.remind_before_value,
                                            item.remind_before_unit,
                                        )}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.cardActions}>
                            <Pressable
                                style={styles.actionBtn}
                                onPress={() => openEditModal(item)}
                                disabled={editMutation.isPending}
                            >
                                <Text
                                    style={[
                                        styles.actionBtnText,
                                        { color: colors.primary },
                                    ]}
                                >
                                    Sửa
                                </Text>
                            </Pressable>
                            <View style={styles.actionDivider} />
                            <Pressable
                                style={styles.actionBtn}
                                onPress={() => completeMutation.mutate(item.id)}
                                disabled={completeMutation.isPending}
                            >
                                <Text
                                    style={[
                                        styles.actionBtnText,
                                        { color: '#0A8F74' },
                                    ]}
                                >
                                    Hoàn thành
                                </Text>
                            </Pressable>
                            <View style={styles.actionDivider} />
                            <Pressable
                                style={styles.actionBtn}
                                onPress={() => cancelMutation.mutate(item.id)}
                                disabled={cancelMutation.isPending}
                            >
                                <Text
                                    style={[
                                        styles.actionBtnText,
                                        { color: '#E11D48' },
                                    ]}
                                >
                                    Hủy lịch
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                ))}

                {/* ĐÃ KHÁM */}
                <Text style={[styles.sectionHeader, { marginTop: 16 }]}>
                    ĐÃ KHÁM
                </Text>
                {past.map((item) => (
                    <View
                        key={item.id}
                        style={[
                            styles.card,
                            {
                                padding: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 12,
                            },
                        ]}
                    >
                        <View style={styles.checkWrap}>
                            <Ionicons name='checkmark' size={16} color='#fff' />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.pastDate}>
                                {formatDateText(item.appointment_at)}
                            </Text>
                            <Text style={styles.pastHospital}>
                                {item.hospital_name || 'Chưa cập nhật cơ sở'}
                            </Text>
                            <Text style={styles.pastSummary}>
                                {(item.department || 'Tái khám') +
                                    ` • ${
                                        item.status === 'done'
                                            ? 'Đã đi khám'
                                            : item.status === 'missed'
                                              ? 'Đã bỏ lỡ'
                                              : 'Đã hủy'
                                    }`}
                            </Text>
                        </View>
                    </View>
                ))}

                {!isBusy && !profileId ? (
                    <View style={styles.emptyWrap}>
                        <Text style={styles.emptyTitle}>
                            Khong xac dinh duoc ho so suc khoe
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            Vui long quay lai danh sach thanh vien roi mo lai
                            man hinh.
                        </Text>
                    </View>
                ) : null}

                {!isBusy &&
                !!profileId &&
                upcoming.length === 0 &&
                past.length === 0 ? (
                    <View style={styles.emptyWrap}>
                        <Text style={styles.emptyTitle}>
                            Chưa có lịch tái khám
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            Hãy thêm lịch tái khám để nhận nhắc nhở đúng hẹn.
                        </Text>
                    </View>
                ) : null}

                {isRefetching ? (
                    <Text style={styles.refreshText}>
                        Đang làm mới dữ liệu...
                    </Text>
                ) : null}

                <Pressable
                    style={styles.addBtn}
                    onPress={() => router.push('./new')}
                >
                    <Ionicons
                        name='add-circle-outline'
                        size={18}
                        color={colors.primary}
                    />
                    <Text style={styles.addBtnText}>Thêm lịch tái khám</Text>
                </Pressable>
            </ScrollView>

            <Modal
                visible={!!editingReminder}
                transparent
                animationType='fade'
                onRequestClose={() => setEditingReminder(null)}
            >
                <Pressable
                    style={styles.editModalBackdrop}
                    onPress={() => setEditingReminder(null)}
                >
                    <Pressable
                        style={styles.editModalCard}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text style={styles.editModalTitle}>
                            Sửa lịch tái khám
                        </Text>

                        <View style={styles.editGroup}>
                            <Text style={styles.editLabel}>Ngày tái khám</Text>
                            <DateField
                                value={editDate}
                                onChange={setEditDate}
                            />
                        </View>

                        <View style={styles.editGroup}>
                            <Text style={styles.editLabel}>Giờ hẹn</Text>
                            <DateField
                                value={editTime}
                                onChange={setEditTime}
                                mode='time'
                            />
                        </View>

                        <View style={styles.editGroup}>
                            <Text style={styles.editLabel}>Nhắc trước</Text>
                            <Pressable
                                style={styles.editReminderSelect}
                                onPress={() =>
                                    setShowReminderOptions((prev) => !prev)
                                }
                            >
                                <Text style={styles.editReminderSelectText}>
                                    {editReminder}
                                </Text>
                                <Ionicons
                                    name={
                                        showReminderOptions
                                            ? 'chevron-up'
                                            : 'chevron-down'
                                    }
                                    size={16}
                                    color={colors.text3}
                                />
                            </Pressable>
                            {showReminderOptions ? (
                                <View style={styles.editReminderOptionsWrap}>
                                    {REMINDER_OPTIONS.map((option) => (
                                        <Pressable
                                            key={option}
                                            style={[
                                                styles.editReminderOption,
                                                editReminder === option &&
                                                    styles.editReminderOptionActive,
                                            ]}
                                            onPress={() => {
                                                setShowReminderOptions(false);
                                                if (option === 'Tùy chỉnh') {
                                                    setShowCustomReminder(true);
                                                    return;
                                                }
                                                setEditReminder(option);
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.editReminderOptionText,
                                                    editReminder === option &&
                                                        styles.editReminderOptionTextActive,
                                                ]}
                                            >
                                                {option}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ) : null}
                        </View>

                        <View style={styles.editActions}>
                            <Pressable
                                style={styles.editCancelBtn}
                                onPress={() => setEditingReminder(null)}
                                disabled={editMutation.isPending}
                            >
                                <Text style={styles.editCancelText}>Hủy</Text>
                            </Pressable>
                            <Pressable
                                style={styles.editSaveBtn}
                                onPress={onSaveEdit}
                                disabled={editMutation.isPending}
                            >
                                {editMutation.isPending ? (
                                    <ActivityIndicator
                                        size='small'
                                        color='#fff'
                                    />
                                ) : (
                                    <Text style={styles.editSaveText}>Lưu</Text>
                                )}
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            <CustomReminderModal
                visible={showCustomReminder}
                onClose={() => setShowCustomReminder(false)}
                onSave={setEditReminder}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    topbar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
        backgroundColor: colors.bgHealth,
        gap: 12,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    topbarTitle: {
        fontFamily: 'Inter-Black',
        fontSize: 18,
        color: colors.text,
        letterSpacing: -0.3,
    },
    topbarSubtitle: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: colors.text2,
    },
    topbarAction: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    loadingText: {
        fontFamily: 'Inter-Medium',
        fontSize: 13,
        color: colors.text2,
    },
    sectionHeader: {
        fontFamily: 'Inter-Black',
        fontSize: 13,
        color: colors.text2,
        letterSpacing: 0.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 12,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: '#F8FAFC',
    },
    cardDate: {
        fontFamily: 'Inter-Bold',
        fontSize: 15,
        color: colors.primary,
    },
    cardBody: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    cardHospital: {
        fontFamily: 'Inter-Bold',
        fontSize: 16,
        color: colors.text,
        marginBottom: 4,
    },
    cardDetail: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: colors.text2,
        marginBottom: 2,
    },
    reminderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 8,
    },
    reminderText: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: colors.text2,
    },
    reminderPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    reminderPillText: {
        fontFamily: 'Inter-Medium',
        fontSize: 13,
        color: colors.text,
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
    },
    actionBtnText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 14,
    },
    actionDivider: {
        width: 1,
        height: 24,
        backgroundColor: colors.border,
    },
    checkWrap: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pastDate: {
        fontFamily: 'Inter-Bold',
        fontSize: 14,
        color: colors.text,
        marginBottom: 2,
    },
    pastHospital: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: colors.text2,
    },
    pastSummary: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: colors.text3,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.card,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
        marginTop: 8,
    },
    addBtnText: {
        fontFamily: 'Inter-Bold',
        fontSize: 14,
        color: colors.primary,
    },
    emptyWrap: {
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        marginBottom: 12,
    },
    emptyTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 15,
        color: colors.text,
    },
    emptySubtitle: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: colors.text2,
        marginTop: 6,
        lineHeight: 18,
    },
    refreshText: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: colors.text3,
        marginBottom: 8,
        marginLeft: 4,
    },
    editModalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(2,6,23,0.45)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    editModalCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
    },
    editModalTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 16,
        color: colors.text,
        marginBottom: 12,
    },
    editGroup: {
        marginBottom: 12,
    },
    editLabel: {
        fontFamily: 'Inter-Medium',
        fontSize: 13,
        color: colors.text2,
        marginBottom: 6,
    },
    editReminderSelect: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    editReminderSelectText: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: colors.text,
    },
    editReminderOptionsWrap: {
        marginTop: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    editReminderOption: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.card,
    },
    editReminderOptionActive: {
        backgroundColor: colors.primaryBg,
    },
    editReminderOptionText: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: colors.text2,
    },
    editReminderOptionTextActive: {
        fontFamily: 'Inter-Bold',
        color: colors.primary,
    },
    editActions: {
        marginTop: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    editCancelBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: colors.bg,
    },
    editCancelText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 14,
        color: colors.text2,
    },
    editSaveBtn: {
        flex: 1,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: colors.primary,
    },
    editSaveText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 14,
        color: '#fff',
    },
});
