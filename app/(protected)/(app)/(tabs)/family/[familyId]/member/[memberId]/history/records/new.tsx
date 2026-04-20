import Ionicons from '@expo/vector-icons/Ionicons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
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
import { appointmentRemindersService } from '@/src/services/appointmentReminders.services';
import { medicalRecordsService } from '@/src/services/medicalRecords.services';
import { colors, typography } from '@/src/styles/tokens';

function normalizeParam(value: string | string[] | undefined): string {
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && value.length > 0) return value[0] ?? '';
    return '';
}

export default function MemberRecordNewRoute() {
    const queryClient = useQueryClient();
    const { familyId, memberId } = useLocalSearchParams<{
        familyId?: string | string[];
        memberId?: string | string[];
    }>();
    const normalizedFamilyId = normalizeParam(familyId);
    const normalizedMemberId = normalizeParam(memberId);
    const { data: family } = useFamilyQuery(normalizedFamilyId);
    const member = useMemo(
        () =>
            family?.members.find(
                (item) => String(item.id) === String(normalizedMemberId),
            ),
        [family?.members, normalizedMemberId],
    );
    const profileId = member?.healthProfileId ?? '';

    const [visitDate, setVisitDate] = useState(new Date());
    const [hospital, setHospital] = useState('');
    const [department, setDepartment] = useState('');
    const [doctor, setDoctor] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [labResults, setLabResults] = useState('');
    const [doctorAdvice, setDoctorAdvice] = useState('');
    const [followupDate, setFollowupDate] = useState<Date | null>(null);
    const [followupRemind, setFollowupRemind] = useState(false);

    const createMutation = useMutation({
        mutationFn: async () => {
            const symptomList = symptoms
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
            await medicalRecordsService.create(profileId, {
                title: diagnosis.trim() || null,
                diagnosis_name: diagnosis.trim() || null,
                doctor_name: doctor.trim() || null,
                hospital_name: hospital.trim() || null,
                visit_date: visitDate.toISOString().slice(0, 10),
                specialty: department.trim() || null,
                symptoms: symptomList.length > 0 ? symptomList : null,
                test_results: labResults.trim() || null,
                doctor_advice: doctorAdvice.trim() || null,
                notes: null,
            });

            if (followupDate) {
                const appointmentAt = new Date(followupDate);
                appointmentAt.setHours(8, 0, 0, 0);
                await appointmentRemindersService.create(profileId, {
                    type: 'checkup',
                    title: diagnosis.trim() || 'Tai kham dinh ky',
                    appointment_at: appointmentAt.toISOString(),
                    hospital_name: hospital.trim() || null,
                    department: department.trim() || null,
                    note: doctorAdvice.trim() || null,
                    reminder_enabled: followupRemind,
                    remind_before_value: followupRemind ? 1 : undefined,
                    remind_before_unit: followupRemind ? 'DAYS' : undefined,
                });
            }
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['medical-records', profileId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['appointment-reminders', profileId],
                }),
            ]);
            appToast.showSuccess('Da luu ho so kham');
            router.back();
        },
        onError: () => {
            appToast.showError('Khong the luu ho so kham');
        },
    });

    const onSave = () => {
        if (!profileId) {
            appToast.showError('Khong xac dinh duoc ho so suc khoe');
            return;
        }
        if (!hospital.trim()) {
            appToast.showWarning('Vui long nhap benh vien hoac phong kham');
            return;
        }
        if (!diagnosis.trim()) {
            appToast.showWarning('Vui long nhap chan doan');
            return;
        }
        createMutation.mutate();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />
            <View style={styles.topbar}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons
                        name='chevron-back'
                        size={16}
                        color={colors.text2}
                    />
                </Pressable>
                <Text style={styles.topbarTitle}>Them ho so kham</Text>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
            >
                <Text style={styles.sectionHeading}>THONG TIN KHAM</Text>
                <View style={styles.group}>
                    <Text style={styles.label}>Ngay kham</Text>
                    <DateField value={visitDate} onChange={setVisitDate} />
                </View>
                <View style={styles.group}>
                    <Text style={styles.label}>Benh vien / Phong kham *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='VD: BV Dai hoc Y Duoc'
                        placeholderTextColor={colors.text3}
                        value={hospital}
                        onChangeText={setHospital}
                    />
                </View>
                <View style={styles.group}>
                    <Text style={styles.label}>Khoa / Chuyen khoa</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='VD: Tim mach'
                        placeholderTextColor={colors.text3}
                        value={department}
                        onChangeText={setDepartment}
                    />
                </View>
                <View style={styles.group}>
                    <Text style={styles.label}>Bac si dieu tri</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='VD: BS Nguyen Van A'
                        placeholderTextColor={colors.text3}
                        value={doctor}
                        onChangeText={setDoctor}
                    />
                </View>

                <Text
                    style={[styles.sectionHeading, styles.sectionHeadingSpaced]}
                >
                    KET QUA KHAM
                </Text>
                <View style={styles.group}>
                    <Text style={styles.label}>Chan doan *</Text>
                    <TextInput
                        style={styles.textarea}
                        placeholder='Mo ta chan doan...'
                        placeholderTextColor={colors.text3}
                        value={diagnosis}
                        onChangeText={setDiagnosis}
                        multiline
                        numberOfLines={4}
                    />
                </View>
                <View style={styles.group}>
                    <Text style={styles.label}>Trieu chung</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='Cach nhau boi dau phay'
                        placeholderTextColor={colors.text3}
                        value={symptoms}
                        onChangeText={setSymptoms}
                    />
                </View>
                <View style={styles.group}>
                    <Text style={styles.label}>Ket qua xet nghiem</Text>
                    <TextInput
                        style={styles.textarea}
                        placeholder='Nhap ket qua xet nghiem...'
                        placeholderTextColor={colors.text3}
                        value={labResults}
                        onChangeText={setLabResults}
                        multiline
                        numberOfLines={4}
                    />
                </View>
                <View style={styles.group}>
                    <Text style={styles.label}>Loi dan bac si</Text>
                    <TextInput
                        style={styles.textarea}
                        placeholder='Loi dan, huong dan dieu tri...'
                        placeholderTextColor={colors.text3}
                        value={doctorAdvice}
                        onChangeText={setDoctorAdvice}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <Text
                    style={[styles.sectionHeading, styles.sectionHeadingSpaced]}
                >
                    HEN TAI KHAM
                </Text>
                <View style={styles.group}>
                    <Text style={styles.label}>Ngay tai kham</Text>
                    <DateField
                        value={followupDate}
                        onChange={setFollowupDate}
                    />
                </View>
                <View style={styles.reminderCard}>
                    <View style={styles.reminderHeader}>
                        <Text style={styles.labelGroup}>Nhac nho</Text>
                        <Switch
                            value={followupRemind}
                            onValueChange={setFollowupRemind}
                            trackColor={{
                                false: '#E2E8F0',
                                true: colors.primary,
                            }}
                            thumbColor='#fff'
                        />
                    </View>
                </View>
            </ScrollView>

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
                            <Text style={styles.saveText}>Luu ho so</Text>
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
        fontFamily: typography.font.black,
        fontSize: 18,
        color: colors.text,
        letterSpacing: -0.3,
    },
    sectionHeading: {
        fontFamily: typography.font.black,
        fontSize: 12,
        color: colors.text2,
        letterSpacing: 0.6,
        marginBottom: 16,
    },
    sectionHeadingSpaced: {
        marginTop: 8,
    },
    group: {
        marginBottom: 20,
    },
    label: {
        fontFamily: typography.font.bold,
        fontSize: 13,
        color: colors.text,
        marginBottom: 8,
    },
    labelGroup: {
        fontFamily: typography.font.bold,
        fontSize: 14,
        color: colors.text,
    },
    input: {
        fontFamily: typography.font.regular,
        fontSize: 15,
        color: colors.text,
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    textarea: {
        fontFamily: typography.font.regular,
        fontSize: 15,
        color: colors.text,
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 100,
        textAlignVertical: 'top',
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
    saveText: {
        fontFamily: typography.font.black,
        fontSize: 15,
        color: '#fff',
        letterSpacing: 0.2,
    },
});
