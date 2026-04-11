import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    moderateScale,
    scale,
    scaleFont,
    verticalScale,
} from '@/src/styles/responsive';
import { colors, typography } from '@/src/styles/tokens';

interface MetricInput {
    systolic?: string;
    diastolic?: string;
    heartRate?: string;
    weight?: string;
    glucose?: string;
    date: string;
    time: string;
    notes: string;
}

interface MetricsInputScreenProps {
    metricType?: 'bp' | 'weight' | 'glucose';
    onSave?: (data: MetricInput) => void;
    onCancel?: () => void;
}

const METRIC_CONFIG = {
    bp: {
        label: 'Huyết áp',
        fields: ['systolic', 'diastolic', 'heartRate'],
        icon: 'water-outline',
    },
    weight: {
        label: 'Cân nặng',
        fields: ['weight'],
        icon: 'barbell-outline',
    },
    glucose: {
        label: 'Đường huyết',
        fields: ['glucose'],
        icon: 'pulse',
    },
};

/**
 * Standalone Metrics Input Screen (C3c-input)
 * For adding/editing health metric measurements
 */
export default function MetricsInputScreen({
    metricType = 'bp',
    onSave,
    onCancel,
}: MetricsInputScreenProps): React.JSX.Element {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();

    const metric = (params.metric as string) || metricType;
    const config = METRIC_CONFIG[metric as keyof typeof METRIC_CONFIG];

    // Get current date and time
    const now = new Date();
    const defaultDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const [input, setInput] = useState<MetricInput>({
        systolic: '130',
        diastolic: '85',
        heartRate: '72',
        weight: '55',
        glucose: '5.4',
        date: defaultDate,
        time: defaultTime,
        notes: '',
    });

    const handleSave = () => {
        if (onSave) {
            onSave(input);
        } else {
            router.back();
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            router.back();
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />

            {/* TOP BAR */}
            <View
                style={[
                    styles.topbar,
                    { paddingTop: Math.max(insets.top, 16) },
                ]}
            >
                <Pressable style={styles.backBtn} onPress={handleCancel}>
                    <Ionicons
                        name='chevron-back'
                        size={18}
                        color={colors.text2}
                    />
                </Pressable>
                <View style={styles.topbarCenter}>
                    <Text style={styles.topbarTitle}>Thêm lần đo</Text>
                </View>
                <Pressable style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>Lưu</Text>
                </Pressable>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={{ flex: 1, backgroundColor: colors.bg }}
                    contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                >
                    {/* Metric Type */}
                    <Text style={styles.label}>Loại chỉ số *</Text>
                    <View style={styles.metricTypeContainer}>
                        <Ionicons
                            name={config.icon as any}
                            size={16}
                            color={colors.primary}
                            style={{ marginRight: 8 }}
                        />
                        <Text style={styles.metricTypeLabel}>
                            {config.label}
                        </Text>
                    </View>

                    {/* Blood Pressure Fields */}
                    {metric === 'bp' && (
                        <>
                            <Text style={styles.label}>
                                Tâm thu (systolic) *
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder='130'
                                placeholderTextColor={colors.text3}
                                keyboardType='numeric'
                                value={input.systolic}
                                onChangeText={(text) =>
                                    setInput({ ...input, systolic: text })
                                }
                            />

                            <Text style={styles.label}>
                                Tâm trương (diastolic) *
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder='85'
                                placeholderTextColor={colors.text3}
                                keyboardType='numeric'
                                value={input.diastolic}
                                onChangeText={(text) =>
                                    setInput({ ...input, diastolic: text })
                                }
                            />

                            <Text style={styles.label}>Nhịp tim</Text>
                            <TextInput
                                style={styles.input}
                                placeholder='72'
                                placeholderTextColor={colors.text3}
                                keyboardType='numeric'
                                value={input.heartRate}
                                onChangeText={(text) =>
                                    setInput({ ...input, heartRate: text })
                                }
                            />
                        </>
                    )}

                    {/* Weight Field */}
                    {metric === 'weight' && (
                        <>
                            <Text style={styles.label}>Cân nặng *</Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder='55'
                                    placeholderTextColor={colors.text3}
                                    keyboardType='numeric'
                                    value={input.weight}
                                    onChangeText={(text) =>
                                        setInput({ ...input, weight: text })
                                    }
                                />
                                <View
                                    style={[
                                        styles.input,
                                        { justifyContent: 'center' },
                                    ]}
                                >
                                    <Text style={styles.unitText}>kg</Text>
                                </View>
                            </View>
                        </>
                    )}

                    {/* Glucose Field */}
                    {metric === 'glucose' && (
                        <>
                            <Text style={styles.label}>Đường huyết *</Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder='5.4'
                                    placeholderTextColor={colors.text3}
                                    keyboardType='decimal-pad'
                                    value={input.glucose}
                                    onChangeText={(text) =>
                                        setInput({ ...input, glucose: text })
                                    }
                                />
                                <View
                                    style={[
                                        styles.input,
                                        { justifyContent: 'center' },
                                    ]}
                                >
                                    <Text style={styles.unitText}>mmol/L</Text>
                                </View>
                            </View>
                        </>
                    )}

                    {/* Date & Time */}
                    <Text style={[styles.label, { marginTop: 20 }]}>
                        Ngày đo *
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder='15/03/2026'
                        placeholderTextColor={colors.text3}
                        value={input.date}
                        onChangeText={(text) =>
                            setInput({ ...input, date: text })
                        }
                    />

                    <Text style={styles.label}>Giờ đo</Text>
                    <TextInput
                        style={styles.input}
                        placeholder='08:00'
                        placeholderTextColor={colors.text3}
                        value={input.time}
                        onChangeText={(text) =>
                            setInput({ ...input, time: text })
                        }
                    />

                    {/* Notes */}
                    <Text style={styles.label}>Ghi chú</Text>
                    <TextInput
                        style={[styles.input, styles.notesInput]}
                        placeholder='Ví dụ: Đo sau khi ngủ dậy'
                        placeholderTextColor={colors.text3}
                        value={input.notes}
                        onChangeText={(text) =>
                            setInput({ ...input, notes: text })
                        }
                        multiline
                        numberOfLines={3}
                        textAlignVertical='top'
                    />

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <Pressable
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleCancel}
                        >
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>Lưu</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    topbar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingBottom: verticalScale(8),
        backgroundColor: colors.bg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {
        width: moderateScale(34),
        height: moderateScale(34),
        borderRadius: moderateScale(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    topbarCenter: {
        flex: 1,
        alignItems: 'center',
    },
    topbarTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(17),
        color: colors.text,
    },
    saveBtn: {
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
    },
    saveBtnText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(15),
        color: colors.primary,
    },
    label: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: colors.text,
        marginBottom: verticalScale(8),
        marginTop: verticalScale(16),
    } as any,
    metricTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: moderateScale(10),
        borderWidth: 1.5,
        borderColor: colors.border,
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(12),
        marginBottom: verticalScale(16),
    },
    metricTypeLabel: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(14),
        color: colors.text,
    },
    input: {
        backgroundColor: colors.card,
        borderRadius: moderateScale(10),
        borderWidth: 1.5,
        borderColor: colors.border,
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(12),
        fontFamily: typography.font.regular,
        fontSize: scaleFont(14),
        color: colors.text,
        marginBottom: verticalScale(12),
    } as any,
    unitText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        color: colors.text2,
    },
    notesInput: {
        minHeight: verticalScale(80),
        paddingVertical: scale(12),
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: scale(12),
        marginTop: verticalScale(20),
    },
    button: {
        flex: 1,
        paddingVertical: verticalScale(13),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    cancelButtonText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: colors.text2,
    },
    saveButton: {
        backgroundColor: colors.primary,
    },
    saveButtonText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: '#FFF',
    },
});
