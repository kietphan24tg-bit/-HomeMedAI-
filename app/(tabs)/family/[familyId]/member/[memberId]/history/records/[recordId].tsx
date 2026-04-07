import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
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
import { colors, typography } from '@/src/styles/tokens';

const MOCK = {
    visitDate: '15/03/2026',
    hospital: 'BV Đại học Y Dược',
    department: 'Tim mạch',
    doctor: 'BS. Lê Văn Hùng',
    diagnosis: 'Tăng huyết áp giai đoạn 1',
    symptoms: 'Đau đầu, Chóng mặt',
    labResults: 'Cholesterol 5.8 mmol/L',
    advice: 'Giảm muối, tập thể dục 30p/ngày',
    rx1: 'Amlodipine 5mg - 1 viên/ngày, sáng',
    rx2: 'Candesartan 8mg - 1 viên/ngày, tối',
    followupDate: '15/04/2026',
    followupReminder: true,
};

function FieldRow({
    label,
    value,
    editing,
    onChangeText,
    multiline,
}: {
    label: string;
    value: string;
    editing: boolean;
    onChangeText: (t: string) => void;
    multiline?: boolean;
}) {
    return (
        <View style={styles.group}>
            <Text style={styles.label}>{label}</Text>
            {editing ? (
                <TextInput
                    style={multiline ? styles.textarea : styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholderTextColor={colors.text3}
                    multiline={!!multiline}
                    numberOfLines={multiline ? 3 : 1}
                />
            ) : (
                <View style={styles.readonlyBox}>
                    <Text style={styles.readonlyText}>{value}</Text>
                </View>
            )}
        </View>
    );
}

export default function MemberRecordDetailRoute() {
    const { recordId } = useLocalSearchParams<{ recordId: string }>();
    const [editing, setEditing] = useState(false);

    const [visitDate, setVisitDate] = useState(MOCK.visitDate);
    const [hospital, setHospital] = useState(MOCK.hospital);
    const [department, setDepartment] = useState(MOCK.department);
    const [doctor, setDoctor] = useState(MOCK.doctor);
    const [diagnosis, setDiagnosis] = useState(MOCK.diagnosis);
    const [symptoms, setSymptoms] = useState(MOCK.symptoms);
    const [labResults, setLabResults] = useState(MOCK.labResults);
    const [advice, setAdvice] = useState(MOCK.advice);
    const [rx1, setRx1] = useState(MOCK.rx1);
    const [rx2, setRx2] = useState(MOCK.rx2);
    const [followupDate, setFollowupDate] = useState(MOCK.followupDate);
    const [followupReminder, setFollowupReminder] = useState(
        MOCK.followupReminder,
    );

    const toggleEdit = () => setEditing((v) => !v);

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
                <Text style={styles.topbarTitle}>Hồ sơ khám bệnh</Text>
                <Pressable
                    style={styles.iconBtn}
                    onPress={toggleEdit}
                    hitSlop={8}
                >
                    <Ionicons
                        name={editing ? 'checkmark' : 'create-outline'}
                        size={20}
                        color={colors.primary}
                    />
                </Pressable>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
            >
                {recordId ? (
                    <Text style={styles.recordMeta}>Mã hồ sơ: {recordId}</Text>
                ) : null}

                <Text style={styles.sectionTitle}>THÔNG TIN KHÁM</Text>
                <FieldRow
                    label='Ngày khám'
                    value={visitDate}
                    editing={editing}
                    onChangeText={setVisitDate}
                />
                <FieldRow
                    label='Bệnh viện'
                    value={hospital}
                    editing={editing}
                    onChangeText={setHospital}
                />
                <FieldRow
                    label='Khoa'
                    value={department}
                    editing={editing}
                    onChangeText={setDepartment}
                />
                <FieldRow
                    label='Bác sĩ'
                    value={doctor}
                    editing={editing}
                    onChangeText={setDoctor}
                />

                <Text style={styles.sectionTitle}>KẾT QUẢ KHÁM</Text>
                <FieldRow
                    label='Chẩn đoán'
                    value={diagnosis}
                    editing={editing}
                    onChangeText={setDiagnosis}
                />
                <FieldRow
                    label='Triệu chứng'
                    value={symptoms}
                    editing={editing}
                    onChangeText={setSymptoms}
                />
                <FieldRow
                    label='Kết quả XN'
                    value={labResults}
                    editing={editing}
                    onChangeText={setLabResults}
                />
                <FieldRow
                    label='Lời dặn'
                    value={advice}
                    editing={editing}
                    onChangeText={setAdvice}
                    multiline
                />

                <Text style={styles.sectionTitle}>ĐƠN THUỐC KÊ</Text>
                <View style={styles.group}>
                    <Text style={styles.label}>1.</Text>
                    {editing ? (
                        <TextInput
                            style={[styles.input, { marginTop: 8 }]}
                            value={rx1}
                            onChangeText={setRx1}
                            placeholderTextColor={colors.text3}
                        />
                    ) : (
                        <View style={[styles.readonlyBox, { marginTop: 8 }]}>
                            <Text style={styles.readonlyText}>{rx1}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.group}>
                    <Text style={styles.label}>2.</Text>
                    {editing ? (
                        <TextInput
                            style={[styles.input, { marginTop: 8 }]}
                            value={rx2}
                            onChangeText={setRx2}
                            placeholderTextColor={colors.text3}
                        />
                    ) : (
                        <View style={[styles.readonlyBox, { marginTop: 8 }]}>
                            <Text style={styles.readonlyText}>{rx2}</Text>
                        </View>
                    )}
                </View>
                <Pressable style={styles.addMedBtn} onPress={() => {}}>
                    <Ionicons
                        name='medkit-outline'
                        size={18}
                        color={colors.primary}
                    />
                    <Text style={styles.addMedBtnText}>
                        Thêm vào tủ thuốc gia đình
                    </Text>
                </Pressable>

                <Text style={styles.sectionTitle}>HẸN TÁI KHÁM</Text>
                {!editing ? (
                    <View style={styles.group}>
                        <View style={styles.readonlyBox}>
                            <Text style={styles.readonlyText}>
                                {followupDate} - Nhắc nhở{' '}
                                {followupReminder ? 'ON' : 'OFF'}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <>
                        <View style={styles.group}>
                            <Text style={styles.label}>Ngày tái khám</Text>
                            <TextInput
                                style={styles.input}
                                value={followupDate}
                                onChangeText={setFollowupDate}
                                placeholderTextColor={colors.text3}
                            />
                        </View>
                        <View style={styles.reminderCard}>
                            <View style={styles.reminderHeader}>
                                <Text style={styles.labelGroup}>Nhắc nhở</Text>
                                <Switch
                                    value={followupReminder}
                                    onValueChange={setFollowupReminder}
                                    trackColor={{
                                        false: '#E2E8F0',
                                        true: colors.primary,
                                    }}
                                    thumbColor='#fff'
                                />
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
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
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
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
    recordMeta: {
        fontFamily: typography.font.medium,
        fontSize: 12,
        color: colors.text2,
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: typography.font.bold,
        fontSize: 12,
        color: colors.text3,
        letterSpacing: 0.6,
        marginBottom: 12,
        marginTop: 4,
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
    readonlyBox: {
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    readonlyText: {
        fontFamily: typography.font.regular,
        fontSize: 15,
        color: colors.text,
        lineHeight: 22,
    },
    addMedBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.primary,
        backgroundColor: colors.primaryBg,
        marginBottom: 24,
    },
    addMedBtnText: {
        fontFamily: typography.font.semiBold,
        fontSize: 14,
        color: colors.primary,
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
});
