import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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
import { DateField } from '@/src/components/ui';
import { colors, typography } from '@/src/styles/tokens';

export default function MemberRecordNewRoute() {
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
                <Text style={styles.topbarTitle}>Thêm hồ sơ khám</Text>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
            >
                <Text style={styles.sectionHeading}>THÔNG TIN KHÁM</Text>

                <View style={styles.group}>
                    <Text style={styles.label}>
                        Ngày khám{' '}
                        <Text style={{ color: colors.cDanger }}>*</Text>
                    </Text>
                    <DateField value={visitDate} onChange={setVisitDate} />
                </View>
                <View style={styles.group}>
                    <Text style={styles.label}>
                        Bệnh viện / Phòng khám{' '}
                        <Text style={{ color: colors.cDanger }}>*</Text>
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
                    <Text style={styles.label}>Bác sĩ điều trị</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='VD: BS. Lê Văn Hùng'
                        placeholderTextColor={colors.text3}
                        value={doctor}
                        onChangeText={setDoctor}
                    />
                </View>

                <Text
                    style={[styles.sectionHeading, styles.sectionHeadingSpaced]}
                >
                    KẾT QUẢ KHÁM
                </Text>

                <View style={styles.group}>
                    <Text style={styles.label}>
                        Chẩn đoán{' '}
                        <Text style={{ color: colors.cDanger }}>*</Text>
                    </Text>
                    <TextInput
                        style={styles.textarea}
                        placeholder='Mô tả chẩn đoán...'
                        placeholderTextColor={colors.text3}
                        value={diagnosis}
                        onChangeText={setDiagnosis}
                        multiline
                        numberOfLines={4}
                    />
                </View>
                <View style={styles.group}>
                    <Text style={styles.label}>Triệu chứng</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='Đau đầu, Chóng mặt...'
                        placeholderTextColor={colors.text3}
                        value={symptoms}
                        onChangeText={setSymptoms}
                    />
                </View>
                <View style={styles.group}>
                    <Text style={styles.label}>Kết quả xét nghiệm</Text>
                    <TextInput
                        style={styles.textarea}
                        placeholder='Ghi kết quả xét nghiệm (nếu có)...'
                        placeholderTextColor={colors.text3}
                        value={labResults}
                        onChangeText={setLabResults}
                        multiline
                        numberOfLines={4}
                    />
                </View>
                <View style={styles.group}>
                    <Text style={styles.label}>Lời dặn bác sĩ</Text>
                    <TextInput
                        style={styles.textarea}
                        placeholder='Lời dặn, thuốc dùng, lịch tái khám...'
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
                    ĐƠN THUỐC KÊ
                </Text>

                <View style={styles.group}>
                    <View style={styles.prescriptionBox}>
                        <Text style={styles.prescriptionPlaceholder}>
                            Chưa có đơn thuốc
                        </Text>
                    </View>
                    <Pressable style={styles.outlineBtn} onPress={() => {}}>
                        <Text style={styles.outlineBtnText}>
                            Thêm vào tủ thuốc gia đình
                        </Text>
                    </Pressable>
                </View>

                <Text
                    style={[styles.sectionHeading, styles.sectionHeadingSpaced]}
                >
                    HẸN TÁI KHÁM
                </Text>

                <View style={styles.group}>
                    <Text style={styles.label}>Ngày tái khám</Text>
                    <DateField
                        value={followupDate}
                        onChange={setFollowupDate}
                    />
                </View>
                <View style={styles.reminderCard}>
                    <View style={styles.reminderHeader}>
                        <Text style={styles.labelGroup}>Nhắc nhở</Text>
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
                        onPress={() => router.back()}
                        style={{ width: '100%', alignItems: 'center' }}
                    >
                        <Text
                            style={{
                                fontFamily: typography.font.black,
                                fontSize: 15,
                                color: '#fff',
                                letterSpacing: 0.2,
                            }}
                        >
                            Lưu hồ sơ
                        </Text>
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
        fontFamily: typography.font.regular,
        fontSize: 15,
        color: colors.text,
    },
    prescriptionBox: {
        minHeight: 120,
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 12,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        marginBottom: 12,
    },
    prescriptionPlaceholder: {
        fontFamily: typography.font.regular,
        fontSize: 14,
        color: colors.text3,
        textAlign: 'center',
    },
    outlineBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.primary,
        backgroundColor: colors.card,
    },
    outlineBtnText: {
        fontFamily: typography.font.medium,
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
