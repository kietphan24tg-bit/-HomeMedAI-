import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { DateField } from '@/src/components/ui';
import { colors } from '@/src/styles/tokens';

const METRIC_TYPES = [
    { label: 'Huyết áp', value: 'bp' },
    { label: 'Cân nặng', value: 'weight' },
    { label: 'Đường huyết', value: 'glucose' },
];

export default function MemberMetricNewRoute() {
    const params = useLocalSearchParams<{ metric?: string }>();
    const initialType =
        params.metric === 'weight' || params.metric === 'glucose'
            ? params.metric
            : 'bp';
    const [type, setType] = useState(initialType);
    const typeLabel =
        METRIC_TYPES.find((item) => item.value === type)?.label ??
        METRIC_TYPES[0].label;
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState('08:00');
    const [note, setNote] = useState('');

    // BP
    const [sys, setSys] = useState('');
    const [dia, setDia] = useState('');
    const [hr, setHr] = useState('');

    // Weight
    const [weight, setWeight] = useState('');

    // Glucose
    const [glucose, setGlucose] = useState('');

    const renderInputs = () => {
        switch (type) {
            case 'bp':
                return (
                    <>
                        <View style={styles.group}>
                            <Text style={styles.label}>
                                Tâm thu (systolic){' '}
                                <Text style={{ color: '#E11D48' }}>*</Text>
                            </Text>
                            <View style={styles.inputWithSuffix}>
                                <TextInput
                                    style={styles.inputFlex}
                                    placeholder='130'
                                    placeholderTextColor={colors.text3}
                                    keyboardType='numeric'
                                    value={sys}
                                    onChangeText={setSys}
                                />
                                <Text style={styles.suffix}>mmHg</Text>
                            </View>
                        </View>
                        <View style={styles.group}>
                            <Text style={styles.label}>
                                Tâm trương (diastolic){' '}
                                <Text style={{ color: '#E11D48' }}>*</Text>
                            </Text>
                            <View style={styles.inputWithSuffix}>
                                <TextInput
                                    style={styles.inputFlex}
                                    placeholder='85'
                                    placeholderTextColor={colors.text3}
                                    keyboardType='numeric'
                                    value={dia}
                                    onChangeText={setDia}
                                />
                                <Text style={styles.suffix}>mmHg</Text>
                            </View>
                        </View>
                        <View style={styles.group}>
                            <Text style={styles.label}>Nhịp tim</Text>
                            <View style={styles.inputWithSuffix}>
                                <TextInput
                                    style={styles.inputFlex}
                                    placeholder='72'
                                    placeholderTextColor={colors.text3}
                                    keyboardType='numeric'
                                    value={hr}
                                    onChangeText={setHr}
                                />
                                <Text style={styles.suffix}>bpm</Text>
                            </View>
                        </View>
                    </>
                );
            case 'weight':
                return (
                    <View style={styles.group}>
                        <Text style={styles.label}>
                            Cân nặng <Text style={{ color: '#E11D48' }}>*</Text>
                        </Text>
                        <View style={styles.inputWithSuffix}>
                            <TextInput
                                style={styles.inputFlex}
                                placeholder='55'
                                placeholderTextColor={colors.text3}
                                keyboardType='numeric'
                                value={weight}
                                onChangeText={setWeight}
                            />
                            <Text style={styles.suffix}>kg</Text>
                        </View>
                    </View>
                );
            case 'glucose':
                return (
                    <View style={styles.group}>
                        <Text style={styles.label}>
                            Đường huyết{' '}
                            <Text style={{ color: '#E11D48' }}>*</Text>
                        </Text>
                        <View style={styles.inputWithSuffix}>
                            <TextInput
                                style={styles.inputFlex}
                                placeholder='5.6'
                                placeholderTextColor={colors.text3}
                                keyboardType='numeric'
                                value={glucose}
                                onChangeText={setGlucose}
                            />
                            <Text style={styles.suffix}>mmol/L</Text>
                        </View>
                    </View>
                );
            default:
                return null;
        }
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
                <Text style={styles.topbarTitle}>
                    Thêm {typeLabel.toLowerCase()}
                </Text>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
            >
                {/* Loại chỉ số */}
                <View style={styles.group}>
                    <Text style={styles.label}>Loại chỉ số</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {METRIC_TYPES.map((t) => (
                            <Pressable
                                key={t.value}
                                style={[
                                    styles.typeChip,
                                    type === t.value && styles.typeChipActive,
                                ]}
                                onPress={() => setType(t.value)}
                            >
                                <Text
                                    style={[
                                        styles.typeChipText,
                                        type === t.value &&
                                            styles.typeChipTextActive,
                                    ]}
                                >
                                    {t.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {renderInputs()}

                {/* Ngày đo */}
                <View style={styles.group}>
                    <Text style={styles.label}>
                        Ngày đo <Text style={{ color: '#E11D48' }}>*</Text>
                    </Text>
                    <DateField value={date} onChange={setDate} />
                </View>

                {/* Giờ đo */}
                <View style={styles.group}>
                    <Text style={styles.label}>Giờ đo</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='08:00'
                        placeholderTextColor={colors.text3}
                        value={time}
                        onChangeText={setTime}
                    />
                </View>

                {/* Ghi chú */}
                <View style={styles.group}>
                    <Text style={styles.label}>Ghi chú</Text>
                    <TextInput
                        style={styles.textarea}
                        placeholder='VD: Đo sau khi ngủ dậy...'
                        placeholderTextColor={colors.text3}
                        value={note}
                        onChangeText={setNote}
                        multiline
                        numberOfLines={3}
                    />
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
                            Lưu chỉ số
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
    inputWithSuffix: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    inputFlex: {
        flex: 1,
        fontFamily: 'Inter-Regular',
        fontSize: 15,
        color: colors.text,
        paddingVertical: 12,
    },
    suffix: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 13,
        color: colors.text3,
        marginLeft: 10,
    },
    textarea: {
        fontFamily: 'Inter-Regular',
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
    typeChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.card,
    },
    typeChipActive: {
        backgroundColor: colors.primaryBg,
        borderColor: colors.primary,
    },
    typeChipText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 13,
        color: colors.text2,
    },
    typeChipTextActive: {
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
