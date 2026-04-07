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
import { colors } from '@/src/styles/tokens';

export default function MemberFollowupNewRoute() {
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState('');
    const [hospital, setHospital] = useState('');
    const [department, setDepartment] = useState('');
    const [doctor, setDoctor] = useState('');
    const [purpose, setPurpose] = useState('');
    const [prep, setPrep] = useState('');

    // Reminders
    const [remindActive, setRemindActive] = useState(true);
    const [remindBefore, setRemindBefore] = useState('1 ngày');
    const [remindExtra, setRemindExtra] = useState('Sáng hôm đó');

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
                                <View style={styles.dropdownFake}>
                                    <Text style={styles.dropdownFakeText}>
                                        {remindBefore}
                                    </Text>
                                    <Ionicons
                                        name='chevron-down'
                                        size={16}
                                        color={colors.text3}
                                    />
                                </View>
                            </View>
                            <View style={styles.dropdownWrapLine}>
                                <Text style={styles.dropdownLabel}>
                                    Nhắc thêm
                                </Text>
                                <View style={styles.dropdownFake}>
                                    <Text style={styles.dropdownFakeText}>
                                        {remindExtra}
                                    </Text>
                                    <Ionicons
                                        name='chevron-down'
                                        size={16}
                                        color={colors.text3}
                                    />
                                </View>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

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
                        onPress={() => router.back()}
                        style={{ width: '100%', alignItems: 'center' }}
                    >
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
