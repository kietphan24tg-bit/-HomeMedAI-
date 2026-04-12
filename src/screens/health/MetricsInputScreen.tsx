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
import { buttonSystem, shared } from '@/src/styles/shared';
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

type MetricType = NonNullable<MetricsInputScreenProps['metricType']>;

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

function formatDate(date: Date): string {
    return `${String(date.getDate()).padStart(2, '0')}/${String(
        date.getMonth() + 1,
    ).padStart(2, '0')}/${date.getFullYear()}`;
}

function formatTime(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(
        date.getMinutes(),
    ).padStart(2, '0')}`;
}

function normalizeMetricType(value: unknown, fallback: MetricType): MetricType {
    return value === 'weight' || value === 'glucose' || value === 'bp'
        ? value
        : fallback;
}

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

    const metric = normalizeMetricType(params.metric, metricType);
    const config = METRIC_CONFIG[metric];

    // Get current date and time
    const now = new Date();
    const defaultDate = formatDate(now);
    const defaultTime = formatTime(now);

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
                    <Text style={styles.topbarTitle}>
                        Thêm {config.label.toLowerCase()}
                    </Text>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={{ flex: 1, backgroundColor: colors.bg }}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                >
                    {/* Metric Type */}
                    <Text style={styles.label}>Loại chỉ số</Text>
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
                    <Text style={styles.label}>Ngày đo *</Text>
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

                    <View style={styles.saveInline}>
                        <Pressable
                            onPress={handleSave}
                            style={({ pressed }) => [
                                styles.saveBtn,
                                pressed && shared.pressed,
                            ]}
                        >
                            <Text style={styles.saveBtnText}>Lưu lần đo</Text>
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
        paddingBottom: verticalScale(10),
        backgroundColor: colors.bg,
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
    headerSpacer: {
        width: moderateScale(34),
        height: moderateScale(34),
    },
    content: {
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(32),
    },
    label: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(12),
        color: colors.text2,
        marginBottom: verticalScale(8),
        marginTop: verticalScale(14),
    } as any,
    metricTypeContainer: {
        ...shared.inputField,
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    metricTypeLabel: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(12.5),
        color: colors.text,
    },
    input: {
        ...shared.inputField,
        ...shared.inputTextStrong,
    } as any,
    unitText: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(12),
        color: colors.text2,
    },
    notesInput: {
        minHeight: verticalScale(80),
        paddingTop: verticalScale(11),
    },
    saveInline: {
        marginTop: verticalScale(20),
        marginBottom: verticalScale(10),
    },
    saveBtn: {
        ...buttonSystem.primary,
        backgroundColor: colors.primary,
        minHeight: verticalScale(42),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
        width: '100%',
    },
    saveBtnText: {
        ...buttonSystem.textPrimary,
        fontSize: scaleFont(14),
        color: '#fff',
        letterSpacing: 0.1,
    },
});
