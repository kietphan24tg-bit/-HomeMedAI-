import Ionicons from '@expo/vector-icons/Ionicons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { DateField } from '@/src/components/ui';
import { useFamilyQuery } from '@/src/features/family/queries';
import { appToast } from '@/src/lib/toast';
import { CustomReminderModal } from '@/src/screens/health/CustomReminderModal';
import { appointmentRemindersService } from '@/src/services/appointmentReminders.services';
import { colors } from '@/src/styles/tokens';
import { reminderLabelToPayload } from '@/src/utils/reminder-label';

const FOLLOWUP_REMINDER_OPTIONS = [
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

function combineDateAndTime(date: Date, time: string): Date {
    const next = new Date(date);
    const matched = time.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!matched) {
        next.setHours(8, 0, 0, 0);
        return next;
    }

    const hours = Number(matched[1]);
    const minutes = Number(matched[2]);
    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        next.setHours(8, 0, 0, 0);
        return next;
    }

    next.setHours(hours, minutes, 0, 0);
    return next;
}

function mapReminderToPayload(remindActive: boolean, reminderLabel: string) {
    if (!remindActive) {
        return {
            reminder_enabled: false as const,
        };
    }

    return reminderLabelToPayload(reminderLabel);
}

export default function MemberFollowupNewRoute() {
    const queryClient = useQueryClient();
    const { familyId, memberId } = useLocalSearchParams<{
        familyId?: string | string[];
        memberId?: string | string[];
    }>();
    const normalizedFamilyId = normalizeParam(familyId);
    const normalizedMemberId = normalizeParam(memberId);
    const { data: family } = useFamilyQuery(normalizedFamilyId);

    const member = family?.members.find(
        (item) => String(item.id) === String(normalizedMemberId),
    );
    const profileId = member?.healthProfileId ?? '';

    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState('');
    const [hospital, setHospital] = useState('');
    const [department, setDepartment] = useState('');
    const [doctor, setDoctor] = useState('');
    const [purpose, setPurpose] = useState('');
    const [prep, setPrep] = useState('');

    // Reminders
    const [remindActive, setRemindActive] = useState(true);
    const [remindBefore, setRemindBefore] = useState('1 ngày trước');
    const [showReminderOptions, setShowReminderOptions] = useState(false);
    const [showCustomReminder, setShowCustomReminder] = useState(false);

    const createMutation = useMutation({
        mutationFn: async () => {
            const appointmentAt = combineDateAndTime(date, time);
            const payload = mapReminderToPayload(remindActive, remindBefore);

            return appointmentRemindersService.create(profileId, {
                type: 'checkup',
                title: purpose.trim() || 'Tái khám định kỳ',
                appointment_at: appointmentAt.toISOString(),
                hospital_name: hospital.trim() || null,
                department: department.trim() || null,
                note:
                    [doctor.trim(), prep.trim()].filter(Boolean).join(' • ') ||
                    null,
                ...payload,
            });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['appointment-reminders', profileId],
            });
            appToast.showSuccess('Đã lưu lịch tái khám');
            router.back();
        },
        onError: () => {
            appToast.showError('Không thể lưu lịch tái khám');
        },
    });

    const onSave = () => {
        if (!profileId) {
            appToast.showError('Không xác định được hồ sơ sức khỏe');
            return;
        }

        if (!hospital.trim()) {
            appToast.showWarning('Vui lòng nhập bệnh viện hoặc phòng khám');
            return;
        }

        if (time.trim()) {
            const validTime = /^(\d{1,2}):(\d{2})$/.test(time.trim());
            if (!validTime) {
                appToast.showWarning('Giờ hẹn cần đúng định dạng HH:mm');
                return;
            }
        }

        const appointmentAt = combineDateAndTime(date, time);
        if (appointmentAt.getTime() < Date.now()) {
            appToast.showWarning('Không thể đặt lịch trong quá khứ');
            return;
        }

        createMutation.mutate();
    };

    const onSelectReminder = (value: string) => {
        setShowReminderOptions(false);
        if (value === 'Tùy chỉnh') {
            setShowCustomReminder(true);
            return;
        }
        setRemindBefore(value);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />

            {/* TOP BAR */}
            <View style={styles.topbar}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons
                        name='chevron-back'
                        size={16}
                        color={colors.text2}
                    />
                </Pressable>
                <Text style={styles.topbarTitle}>Thêm lịch tái khám</Text>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
            >
                {/* Ngày & Giờ */}
                <View style={styles.group}>
                    <Text style={styles.label}>
                        Ngày tái khám{' '}
                        <Text style={{ color: '#E11D48' }}>*</Text>
                    </Text>
                    <DateField value={date} onChange={setDate} />
                </View>
                <View style={styles.group}>
                    <Text style={styles.label}>Giờ hẹn</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='08:30'
                        placeholderTextColor={colors.text3}
                        value={time}
                        onChangeText={setTime}
                    />
                </View>

                {/* Khám */}
                <View style={styles.group}>
                    <Text style={styles.label}>
                        Bệnh viện / Phòng khám{' '}
                        <Text style={{ color: '#E11D48' }}>*</Text>
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder='VD: BV Đại học Y Dược'
                        placeholderTextColor={colors.text3}
                        value={hospital}
                        onChangeText={setHospital}
                    />
                </View>
                <View style={styles.group}>
                    <Text style={styles.label}>Khoa / Chuyên khoa</Text>
                    <View style={styles.dropdownWrap}>
                        <TextInput
                            style={[styles.inputFlex, { padding: 0 }]}
                            placeholder='VD: Tim mạch'
                            placeholderTextColor={colors.text3}
                            value={department}
                            onChangeText={setDepartment}
                        />
                        <Ionicons
                            name='chevron-down'
                            size={16}
                            color={colors.text3}
                        />
                    </View>
                </View>
                <View style={styles.group}>
                    <Text style={styles.label}>Bác sĩ</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='VD: BS. Lê Văn Hùng'
                        placeholderTextColor={colors.text3}
                        value={doctor}
                        onChangeText={setDoctor}
                    />
                </View>

                {/* Chi tiết */}
                <View style={styles.group}>
                    <Text style={styles.label}>Mục đích tái khám</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='VD: Kiểm tra huyết áp định kỳ'
                        placeholderTextColor={colors.text3}
                        value={purpose}
                        onChangeText={setPurpose}
                    />
                </View>
                <View style={styles.group}>
                    <Text style={styles.label}>Cần chuẩn bị</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='VD: Nhịn ăn 8h nếu xét nghiệm'
                        placeholderTextColor={colors.text3}
                        value={prep}
                        onChangeText={setPrep}
                    />
                </View>

                {/* Nhắc nhở */}
                <View style={styles.reminderCard}>
                    <View style={styles.reminderHeader}>
                        <Text style={styles.labelGroup}>Nhắc nhở</Text>
                        <Switch
                            value={remindActive}
                            onValueChange={setRemindActive}
                            trackColor={{
                                false: '#E2E8F0',
                                true: colors.primary,
                            }}
                            thumbColor='#fff'
                        />
                    </View>
                    {remindActive && (
                        <>
                            <View style={styles.dropdownWrapLine}>
                                <Text style={styles.dropdownLabel}>
                                    Nhắc trước
                                </Text>
                                <Pressable
                                    style={styles.dropdownFake}
                                    onPress={() =>
                                        setShowReminderOptions((prev) => !prev)
                                    }
                                >
                                    <Text style={styles.dropdownFakeText}>
                                        {remindBefore}
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
                            </View>
                            {showReminderOptions ? (
                                <View style={styles.reminderOptionWrap}>
                                    {FOLLOWUP_REMINDER_OPTIONS.map((option) => (
                                        <Pressable
                                            key={option}
                                            style={[
                                                styles.reminderOption,
                                                remindBefore === option &&
                                                    styles.reminderOptionActive,
                                            ]}
                                            onPress={() =>
                                                onSelectReminder(option)
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.reminderOptionText,
                                                    remindBefore === option &&
                                                        styles.reminderOptionTextActive,
                                                ]}
                                            >
                                                {option}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ) : null}
                        </>
                    )}
                </View>
            </ScrollView>

            <CustomReminderModal
                visible={showCustomReminder}
                onClose={() => setShowCustomReminder(false)}
                onSave={setRemindBefore}
            />

            {/* SAVE BUTTON */}
            <View style={styles.saveWrap}>
                <LinearGradient
                    colors={[colors.primary, '#0D9488']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        borderRadius: 18,
                        paddingVertical: 15,
                        alignItems: 'center',
                        shadowColor: colors.primary,
                        shadowOpacity: 0.28,
                        shadowRadius: 20,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 5,
                    }}
                >
                    <Pressable
                        onPress={onSave}
                        disabled={createMutation.isPending}
                        style={{ width: '100%', alignItems: 'center' }}
                    >
                        {createMutation.isPending ? (
                            <ActivityIndicator size='small' color='#fff' />
                        ) : (
                            <Text
                                style={{
                                    fontSize: 15,
                                    fontWeight: '800',
                                    color: '#fff',
                                    letterSpacing: 0.2,
                                }}
                            >
                                Lưu lịch tái khám
                            </Text>
                        )}
                    </Pressable>
                </LinearGradient>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    topbar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: colors.card,
        borderBottomWidth: 1.5,
        borderBottomColor: colors.border,
        gap: 10,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.bg,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topbarTitle: {
        flex: 1,
        fontFamily: 'Inter-Black',
        fontSize: 18,
        color: colors.text,
        letterSpacing: -0.3,
    },
    group: {
        marginBottom: 20,
    },
    label: {
        fontFamily: 'Inter-Bold',
        fontSize: 13,
        color: colors.text,
        marginBottom: 8,
    },
    input: {
        fontFamily: 'Inter-Regular',
        fontSize: 15,
        color: colors.text,
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dropdownWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    inputFlex: {
        flex: 1,
        fontFamily: 'Inter-Regular',
        fontSize: 15,
        color: colors.text,
    },
    reminderCard: {
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    reminderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    labelGroup: {
        fontFamily: 'Inter-Bold',
        fontSize: 14,
        color: colors.text,
    },
    dropdownWrapLine: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    dropdownLabel: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: colors.text2,
    },
    dropdownFake: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dropdownFakeText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 14,
        color: colors.primary,
    },
    reminderOptionWrap: {
        marginTop: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    reminderOption: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.card,
    },
    reminderOptionActive: {
        backgroundColor: colors.primaryBg,
    },
    reminderOptionText: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: colors.text2,
    },
    reminderOptionTextActive: {
        color: colors.primary,
        fontFamily: 'Inter-Bold',
    },
    saveWrap: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.bg,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});
