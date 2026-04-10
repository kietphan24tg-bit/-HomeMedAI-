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

type NextDoseChoice = 'completed' | 'pending';

export default function MemberVaxDetailRoute() {
    const [vaccineName, setVaccineName] = useState('COVID-19 (Pfizer)');
    const [doseCurrent, setDoseCurrent] = useState('3');
    const [doseTotal, setDoseTotal] = useState('3');
    const [injectionDate, setInjectionDate] = useState<Date | null>(new Date());
    const [place, setPlace] = useState('VNVC Quận 1');
    const [lotNumber, setLotNumber] = useState('');
    const [reaction, setReaction] = useState('Sốt nhẹ, đau tay 1 ngày');

    const [nextDose, setNextDose] = useState<NextDoseChoice>('pending');
    const [expectedDate, setExpectedDate] = useState<Date | null>(new Date());
    const [remindNext, setRemindNext] = useState(true);

    const handleSave = () => {
        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />

            {/* TOP BAR */}
            <View style={styles.topbar}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons
                        name='chevron-back'
                        size={17}
                        color={colors.text2}
                    />
                </Pressable>
                <Text style={styles.topbarTitle}>Thêm mũi tiêm</Text>
                <Pressable style={styles.topbarActionBtn} onPress={handleSave}>
                    <Ionicons
                        name='checkmark'
                        size={17}
                        color={colors.primary}
                    />
                </Pressable>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
            >
                <View style={styles.group}>
                    <Text style={styles.label}>
                        Tên vaccine{' '}
                        <Text style={{ color: colors.cDanger }}>*</Text>
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder='Tên vaccine'
                        placeholderTextColor={colors.text3}
                        value={vaccineName}
                        onChangeText={setVaccineName}
                    />
                </View>

                <View style={styles.group}>
                    <Text style={styles.label}>
                        Mũi thứ <Text style={{ color: colors.cDanger }}>*</Text>
                        {' / '}tổng{' '}
                        <Text style={{ color: colors.cDanger }}>*</Text> mũi
                    </Text>
                    <View style={styles.doseRow}>
                        <TextInput
                            style={[styles.input, styles.doseInput]}
                            placeholder='1'
                            placeholderTextColor={colors.text3}
                            keyboardType='number-pad'
                            value={doseCurrent}
                            onChangeText={setDoseCurrent}
                        />
                        <Text style={styles.doseSlash}>/</Text>
                        <TextInput
                            style={[styles.input, styles.doseInput]}
                            placeholder='1'
                            placeholderTextColor={colors.text3}
                            keyboardType='number-pad'
                            value={doseTotal}
                            onChangeText={setDoseTotal}
                        />
                        <Text style={styles.doseSuffix}>mũi</Text>
                    </View>
                </View>

                <View style={styles.group}>
                    <Text style={styles.label}>
                        Ngày tiêm{' '}
                        <Text style={{ color: colors.cDanger }}>*</Text>
                    </Text>
                    <DateField
                        value={injectionDate}
                        onChange={setInjectionDate}
                    />
                </View>

                <View style={styles.group}>
                    <Text style={styles.label}>Nơi tiêm</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='VD: VNVC Quận 1'
                        placeholderTextColor={colors.text3}
                        value={place}
                        onChangeText={setPlace}
                    />
                </View>

                <View style={styles.group}>
                    <Text style={styles.label}>Số lô vaccine</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='FN1234'
                        placeholderTextColor={colors.text3}
                        value={lotNumber}
                        onChangeText={setLotNumber}
                    />
                </View>

                <View style={styles.group}>
                    <Text style={styles.label}>Phản ứng sau tiêm</Text>
                    <TextInput
                        style={styles.textarea}
                        placeholder='Mô tả phản ứng (nếu có)'
                        placeholderTextColor={colors.text3}
                        value={reaction}
                        onChangeText={setReaction}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {/* Mũi tiếp theo */}
                <View style={styles.nextSection}>
                    <Text style={styles.labelGroup}>Mũi tiếp theo</Text>
                    <View style={styles.radioRow}>
                        <Pressable
                            style={[
                                styles.radioChip,
                                nextDose === 'completed' &&
                                    styles.radioChipActive,
                            ]}
                            onPress={() => setNextDose('completed')}
                        >
                            <View
                                style={[
                                    styles.radioDot,
                                    nextDose === 'completed' &&
                                        styles.radioDotActive,
                                ]}
                            />
                            <Text
                                style={[
                                    styles.radioLabel,
                                    nextDose === 'completed' &&
                                        styles.radioLabelActive,
                                ]}
                            >
                                Đã hoàn tất
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.radioChip,
                                nextDose === 'pending' &&
                                    styles.radioChipActiveHealth,
                            ]}
                            onPress={() => setNextDose('pending')}
                        >
                            <View
                                style={[
                                    styles.radioDot,
                                    nextDose === 'pending' &&
                                        styles.radioDotActiveHealth,
                                ]}
                            />
                            <Text
                                style={[
                                    styles.radioLabel,
                                    nextDose === 'pending' &&
                                        styles.radioLabelActiveHealth,
                                ]}
                            >
                                Còn mũi tiếp
                            </Text>
                        </Pressable>
                    </View>

                    {nextDose === 'pending' && (
                        <>
                            <View style={[styles.group, styles.groupNested]}>
                                <Text style={styles.label}>Ngày dự kiến</Text>
                                <DateField
                                    value={expectedDate}
                                    onChange={setExpectedDate}
                                />
                            </View>
                            <View style={styles.reminderRow}>
                                <Text style={styles.dropdownLabel}>
                                    Nhắc nhở
                                </Text>
                                <Switch
                                    value={remindNext}
                                    onValueChange={setRemindNext}
                                    trackColor={{
                                        false: '#E2E8F0',
                                        true: colors.cHealth,
                                    }}
                                    thumbColor='#fff'
                                />
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
                        onPress={handleSave}
                        style={{ width: '100%', alignItems: 'center' }}
                    >
                        <Text
                            style={{
                                fontFamily: typography.font.bold,
                                fontSize: 15,
                                color: '#fff',
                                letterSpacing: 0.2,
                            }}
                        >
                            Lưu
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
        paddingTop: 8,
        paddingBottom: 12,
        backgroundColor: colors.card,
        borderBottomWidth: 1.5,
        borderBottomColor: colors.border,
        gap: 8,
    },
    backBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.bg,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topbarTitle: {
        flex: 1,
        fontFamily: typography.font.black,
        fontSize: 17,
        color: colors.text,
        letterSpacing: -0.3,
    },
    topbarActionBtn: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: colors.bg,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    group: {
        marginBottom: 20,
    },
    groupNested: {
        marginBottom: 16,
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
        marginBottom: 12,
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
    doseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    doseInput: {
        flex: 1,
        textAlign: 'center',
    },
    doseSlash: {
        fontFamily: typography.font.medium,
        fontSize: 16,
        color: colors.text2,
    },
    doseSuffix: {
        fontFamily: typography.font.medium,
        fontSize: 14,
        color: colors.text2,
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
    nextSection: {
        backgroundColor: colors.cHealthBg,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    radioRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 4,
    },
    radioChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.card,
    },
    radioChipActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryBg,
    },
    radioChipActiveHealth: {
        borderColor: colors.cHealth,
        backgroundColor: colors.card,
    },
    radioDot: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: colors.text3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioDotActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },
    radioDotActiveHealth: {
        borderColor: colors.cHealth,
        backgroundColor: colors.cHealth,
    },
    radioLabel: {
        fontFamily: typography.font.medium,
        fontSize: 14,
        color: colors.text2,
    },
    radioLabelActive: {
        color: colors.primary,
    },
    radioLabelActiveHealth: {
        color: colors.cHealth,
    },
    reminderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        marginTop: 4,
    },
    dropdownLabel: {
        fontFamily: typography.font.medium,
        fontSize: 14,
        color: colors.text2,
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
