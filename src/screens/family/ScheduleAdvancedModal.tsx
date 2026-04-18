import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    moderateScale,
    scale,
    scaleFont,
    verticalScale,
} from '@/src/styles/responsive';
import { buttonSystem, formSystem, inputSystem } from '@/src/styles/shared';
import { colors, typography } from '@/src/styles/tokens';

// ── Constants ──
const ACCENT = '#0E8A7D';
const ACCENT_LIGHT = '#E6F7F5';

type FrequencyMode = 'daily' | 'weekdays' | 'interval';

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;

const TIME_PRESETS = [
    { key: 'morning', label: 'Sáng', icon: '🌅', defaultTime: '08:00' },
    { key: 'noon', label: 'Trưa', icon: '☀️', defaultTime: '12:00' },
    { key: 'afternoon', label: 'Chiều', icon: '🌆', defaultTime: '17:00' },
    { key: 'evening', label: 'Tối', icon: '🌙', defaultTime: '20:00' },
] as const;

const DURATION_PRESETS = [
    { label: '3 ngày', count: 3 },
    { label: '5 ngày', count: 5 },
    { label: '7 ngày', count: 7 },
    { label: '14 ngày', count: 14 },
    { label: 'Liên tục', count: 0 },
] as const;

const REMIND_BEFORE_OPTIONS = [
    'Đúng giờ',
    '5 phút',
    '10 phút',
    '15 phút',
    '30 phút',
    '1 giờ',
] as const;

// ── rrule builder ──
function buildRrule(
    mode: FrequencyMode,
    weekdays: number[],
    intervalDays: number,
    durationCount: number,
): string {
    const parts: string[] = [];

    if (mode === 'daily') {
        parts.push('FREQ=DAILY');
    } else if (mode === 'weekdays') {
        parts.push('FREQ=WEEKLY');
        const dayMap = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
        const byDay = weekdays
            .sort((a, b) => a - b)
            .map((i) => dayMap[i])
            .join(',');
        if (byDay) parts.push(`BYDAY=${byDay}`);
    } else if (mode === 'interval') {
        parts.push('FREQ=DAILY');
        if (intervalDays > 1) parts.push(`INTERVAL=${intervalDays}`);
    }

    if (durationCount > 0) {
        parts.push(`COUNT=${durationCount}`);
    }

    return parts.join(';');
}

// ── Exported data type ──
export interface ScheduleConfig {
    enabled: boolean;
    times: string[];
    rrule: string;
    remindBefore: string;
    durationCount: number;
    frequencyMode: FrequencyMode;
    weekdays: number[];
    intervalDays: number;
}

interface Props {
    visible: boolean;
    initialConfig?: Partial<ScheduleConfig>;
    onClose: () => void;
    onSave: (config: ScheduleConfig) => void;
}

export default function ScheduleAdvancedModal({
    visible,
    initialConfig,
    onClose,
    onSave,
}: Props): React.JSX.Element {
    const [enabled, setEnabled] = useState(true);
    const [frequencyMode, setFrequencyMode] = useState<FrequencyMode>('daily');
    const [weekdays, setWeekdays] = useState<number[]>([0, 1, 2, 3, 4]); // T2-T6
    const [intervalDays, setIntervalDays] = useState(2);
    const [durationCount, setDurationCount] = useState(0); // 0 = continuous
    const [durationInput, setDurationInput] = useState('');
    const [selectedTimeKeys, setSelectedTimeKeys] = useState<string[]>([
        'morning',
    ]);
    const [customTimes, setCustomTimes] = useState<string[]>([]);
    const [remindBefore, setRemindBefore] = useState('10 phút');
    const [remindDropdownOpen, setRemindDropdownOpen] = useState(false);

    useEffect(() => {
        if (visible && initialConfig) {
            setEnabled(initialConfig.enabled ?? true);
            setFrequencyMode(initialConfig.frequencyMode ?? 'daily');
            setWeekdays(initialConfig.weekdays ?? [0, 1, 2, 3, 4]);
            setIntervalDays(initialConfig.intervalDays ?? 2);
            setDurationCount(initialConfig.durationCount ?? 0);
            setDurationInput(
                initialConfig.durationCount && initialConfig.durationCount > 0
                    ? String(initialConfig.durationCount)
                    : '',
            );
            setRemindBefore(initialConfig.remindBefore ?? '10 phút');

            // Restore times from initial config
            if (initialConfig.times && initialConfig.times.length > 0) {
                const presetKeys: string[] = [];
                const customs: string[] = [];
                for (const t of initialConfig.times) {
                    const preset = TIME_PRESETS.find(
                        (p) => p.defaultTime === t,
                    );
                    if (preset) {
                        presetKeys.push(preset.key);
                    } else {
                        customs.push(t);
                    }
                }
                setSelectedTimeKeys(
                    presetKeys.length > 0 ? presetKeys : ['morning'],
                );
                setCustomTimes(customs);
            } else {
                setSelectedTimeKeys(['morning']);
                setCustomTimes([]);
            }
        } else if (visible) {
            // Reset to defaults
            setEnabled(true);
            setFrequencyMode('daily');
            setWeekdays([0, 1, 2, 3, 4]);
            setIntervalDays(2);
            setDurationCount(0);
            setDurationInput('');
            setSelectedTimeKeys(['morning']);
            setCustomTimes([]);
            setRemindBefore('10 phút');
        }
    }, [visible, initialConfig]);

    const allTimes = useMemo(() => {
        const times: string[] = [];
        for (const key of selectedTimeKeys) {
            const preset = TIME_PRESETS.find((p) => p.key === key);
            if (preset) times.push(preset.defaultTime);
        }
        times.push(...customTimes);
        return [...new Set(times)].sort();
    }, [selectedTimeKeys, customTimes]);

    const rrule = useMemo(
        () => buildRrule(frequencyMode, weekdays, intervalDays, durationCount),
        [frequencyMode, weekdays, intervalDays, durationCount],
    );

    const previewText = useMemo(() => {
        const parts: string[] = [];
        if (frequencyMode === 'daily') {
            parts.push('Mỗi ngày');
        } else if (frequencyMode === 'weekdays') {
            const names = weekdays
                .sort((a, b) => a - b)
                .map((i) => DAY_LABELS[i]);
            parts.push(`Các ngày: ${names.join(', ')}`);
        } else {
            parts.push(`Cách ${intervalDays} ngày`);
        }
        parts.push(`lúc ${allTimes.join(', ')}`);
        if (durationCount > 0) {
            parts.push(`trong ${durationCount} ngày`);
        }
        return parts.join(' · ');
    }, [frequencyMode, weekdays, intervalDays, allTimes, durationCount]);

    const handleSave = () => {
        onSave({
            enabled,
            times: allTimes,
            rrule,
            remindBefore,
            durationCount,
            frequencyMode,
            weekdays,
            intervalDays,
        });
    };

    const toggleTimePreset = (key: string) => {
        setSelectedTimeKeys((prev) => {
            if (prev.includes(key)) {
                if (prev.length === 1 && customTimes.length === 0) return prev;
                return prev.filter((k) => k !== key);
            }
            return [...prev, key];
        });
    };

    const toggleDay = (idx: number) => {
        setWeekdays((prev) => {
            if (prev.includes(idx)) {
                if (prev.length === 1) return prev;
                return prev.filter((d) => d !== idx);
            }
            return [...prev, idx].sort((a, b) => a - b);
        });
    };

    const addCustomTime = () => {
        setCustomTimes((prev) => [...prev, '12:00']);
    };

    const updateCustomTime = (idx: number, val: string) => {
        setCustomTimes((prev) => {
            const next = [...prev];
            next[idx] = val;
            return next;
        });
    };

    const removeCustomTime = (idx: number) => {
        setCustomTimes((prev) => prev.filter((_, i) => i !== idx));
    };

    const changeInterval = (delta: number) => {
        setIntervalDays((prev) => Math.max(2, Math.min(30, prev + delta)));
    };

    const applyCustomDuration = () => {
        const next = parseInt(durationInput.trim(), 10);
        if (Number.isNaN(next) || next <= 0) {
            setDurationCount(0);
            setDurationInput('');
            return;
        }
        setDurationCount(Math.min(next, 365));
        setDurationInput(String(Math.min(next, 365)));
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType='slide'
            onRequestClose={onClose}
        >
            <SafeAreaView style={st.safeArea}>
                <StatusBar barStyle='dark-content' />

                {/* ── Header ── */}
                <View style={st.header}>
                    <Pressable onPress={onClose} style={st.backBtn}>
                        <Ionicons
                            name='arrow-back'
                            size={20}
                            color={colors.text}
                        />
                    </Pressable>
                    <View style={st.headerCenter}>
                        <Text style={st.headerTitle}>Cài đặt lịch nhắc</Text>
                        <Text style={st.headerSub}>Nâng cao</Text>
                    </View>
                    <Pressable onPress={handleSave} style={st.saveBtn}>
                        <Text style={st.saveBtnText}>Lưu</Text>
                    </Pressable>
                </View>

                <ScrollView
                    style={st.scroll}
                    contentContainerStyle={st.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                >
                    {/* ── Switch ── */}
                    <View style={st.enableRow}>
                        <View style={st.enableInfo}>
                            <Ionicons
                                name='notifications'
                                size={20}
                                color={enabled ? ACCENT : colors.text3}
                            />
                            <Text style={st.enableLabel}>Bật nhắc uống</Text>
                        </View>
                        <Switch
                            value={enabled}
                            onValueChange={setEnabled}
                            trackColor={{
                                false: colors.border,
                                true: colors.success,
                            }}
                            thumbColor='#fff'
                        />
                    </View>

                    {enabled && (
                        <>
                            {/* ── Tần suất ── */}
                            <SectionBlock
                                icon='repeat-outline'
                                title='TẦN SUẤT LẶP LẠI'
                            >
                                <View style={st.segmentRow}>
                                    {(
                                        [
                                            {
                                                key: 'daily',
                                                label: 'Hàng ngày',
                                            },
                                            {
                                                key: 'weekdays',
                                                label: 'Theo thứ',
                                            },
                                            {
                                                key: 'interval',
                                                label: 'Cách ngày',
                                            },
                                        ] as const
                                    ).map((seg) => (
                                        <Pressable
                                            key={seg.key}
                                            style={[
                                                st.segmentItem,
                                                frequencyMode === seg.key &&
                                                    st.segmentItemActive,
                                            ]}
                                            onPress={() =>
                                                setFrequencyMode(seg.key)
                                            }
                                        >
                                            <Text
                                                style={[
                                                    st.segmentText,
                                                    frequencyMode === seg.key &&
                                                        st.segmentTextActive,
                                                ]}
                                            >
                                                {seg.label}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>

                                {frequencyMode === 'weekdays' && (
                                    <View style={st.daysGrid}>
                                        {DAY_LABELS.map((d, i) => (
                                            <Pressable
                                                key={d}
                                                style={[
                                                    st.dayChip,
                                                    weekdays.includes(i) &&
                                                        st.dayChipActive,
                                                ]}
                                                onPress={() => toggleDay(i)}
                                            >
                                                <Text
                                                    style={[
                                                        st.dayChipText,
                                                        weekdays.includes(i) &&
                                                            st.dayChipTextActive,
                                                    ]}
                                                >
                                                    {d}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                )}

                                {frequencyMode === 'interval' && (
                                    <View style={st.intervalRow}>
                                        <Text style={st.intervalLabel}>
                                            Cách mỗi
                                        </Text>
                                        <View style={st.stepper}>
                                            <Pressable
                                                style={st.stepBtn}
                                                onPress={() =>
                                                    changeInterval(-1)
                                                }
                                            >
                                                <Ionicons
                                                    name='remove'
                                                    size={16}
                                                    color={colors.text2}
                                                />
                                            </Pressable>
                                            <Text style={st.stepValue}>
                                                {intervalDays}
                                            </Text>
                                            <Pressable
                                                style={st.stepBtn}
                                                onPress={() =>
                                                    changeInterval(1)
                                                }
                                            >
                                                <Ionicons
                                                    name='add'
                                                    size={16}
                                                    color={colors.text2}
                                                />
                                            </Pressable>
                                        </View>
                                        <Text style={st.intervalUnit}>
                                            ngày
                                        </Text>
                                    </View>
                                )}
                            </SectionBlock>

                            {/* ── Thời lượng ── */}
                            <SectionBlock
                                icon='calendar-outline'
                                title='THỜI LƯỢNG DÙNG THUỐC'
                            >
                                <View style={st.chipRow}>
                                    {DURATION_PRESETS.map((d) => (
                                        <Pressable
                                            key={d.label}
                                            style={[
                                                st.chip,
                                                durationCount === d.count &&
                                                    st.chipActive,
                                            ]}
                                            onPress={() =>
                                                (() => {
                                                    setDurationCount(d.count);
                                                    setDurationInput(
                                                        d.count > 0
                                                            ? String(d.count)
                                                            : '',
                                                    );
                                                })()
                                            }
                                        >
                                            <Text
                                                style={[
                                                    st.chipText,
                                                    durationCount === d.count &&
                                                        st.chipTextActive,
                                                ]}
                                            >
                                                {d.label}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                                <View style={st.customDurationRow}>
                                    <TextInput
                                        style={st.customDurationInput}
                                        value={durationInput}
                                        onChangeText={setDurationInput}
                                        placeholder='Nhập số ngày tùy ý'
                                        placeholderTextColor={colors.text3}
                                        keyboardType='number-pad'
                                    />
                                    <Pressable
                                        style={st.customDurationBtn}
                                        onPress={applyCustomDuration}
                                    >
                                        <Text style={st.customDurationBtnText}>
                                            Áp dụng
                                        </Text>
                                    </Pressable>
                                </View>
                                {durationCount > 0 && (
                                    <Text style={st.durationHint}>
                                        Hệ thống sẽ tự dừng nhắc sau{' '}
                                        {durationCount} ngày
                                    </Text>
                                )}
                            </SectionBlock>

                            {/* ── Giờ nhắc uống ── */}
                            <SectionBlock
                                icon='time-outline'
                                title='GIỜ NHẮC UỐNG'
                            >
                                <View style={st.timePresetsRow}>
                                    {TIME_PRESETS.map((preset) => (
                                        <Pressable
                                            key={preset.key}
                                            style={[
                                                st.timeCard,
                                                selectedTimeKeys.includes(
                                                    preset.key,
                                                ) && st.timeCardActive,
                                            ]}
                                            onPress={() =>
                                                toggleTimePreset(preset.key)
                                            }
                                        >
                                            <Text style={st.timeCardEmoji}>
                                                {preset.icon}
                                            </Text>
                                            <Text
                                                style={[
                                                    st.timeCardLabel,
                                                    selectedTimeKeys.includes(
                                                        preset.key,
                                                    ) && st.timeCardLabelActive,
                                                ]}
                                            >
                                                {preset.label}
                                            </Text>
                                            <Text
                                                style={[
                                                    st.timeCardTime,
                                                    selectedTimeKeys.includes(
                                                        preset.key,
                                                    ) && st.timeCardTimeActive,
                                                ]}
                                            >
                                                {preset.defaultTime}
                                            </Text>
                                            {selectedTimeKeys.includes(
                                                preset.key,
                                            ) && (
                                                <View
                                                    style={st.timeCardCheckmark}
                                                >
                                                    <Ionicons
                                                        name='checkmark-circle'
                                                        size={16}
                                                        color={ACCENT}
                                                    />
                                                </View>
                                            )}
                                        </Pressable>
                                    ))}
                                </View>

                                {/* Custom times */}
                                {customTimes.map((t, i) => (
                                    <View
                                        key={`custom-${i}`}
                                        style={st.customTimeRow}
                                    >
                                        <Ionicons
                                            name='time'
                                            size={16}
                                            color={ACCENT}
                                        />
                                        <TextInput
                                            style={st.customTimeInput}
                                            value={t}
                                            onChangeText={(v) =>
                                                updateCustomTime(i, v)
                                            }
                                            placeholder='HH:MM'
                                            placeholderTextColor={colors.text3}
                                            keyboardType='numbers-and-punctuation'
                                            maxLength={5}
                                        />
                                        <Pressable
                                            onPress={() => removeCustomTime(i)}
                                            hitSlop={8}
                                        >
                                            <Ionicons
                                                name='close-circle'
                                                size={20}
                                                color={colors.danger}
                                            />
                                        </Pressable>
                                    </View>
                                ))}

                                <Pressable
                                    style={st.addTimeBtn}
                                    onPress={addCustomTime}
                                >
                                    <Ionicons
                                        name='add-circle-outline'
                                        size={18}
                                        color={ACCENT}
                                    />
                                    <Text style={st.addTimeBtnText}>
                                        Thêm giờ khác
                                    </Text>
                                </Pressable>
                            </SectionBlock>

                            {/* ── Nhắc trước ── */}
                            <SectionBlock
                                icon='alarm-outline'
                                title='NHẮC TRƯỚC'
                            >
                                <Pressable
                                    style={st.remindBeforeBtn}
                                    onPress={() =>
                                        setRemindDropdownOpen(
                                            !remindDropdownOpen,
                                        )
                                    }
                                >
                                    <Text style={st.remindBeforeText}>
                                        {remindBefore}
                                    </Text>
                                    <Ionicons
                                        name={
                                            remindDropdownOpen
                                                ? 'chevron-up'
                                                : 'chevron-down'
                                        }
                                        size={16}
                                        color={colors.text3}
                                    />
                                </Pressable>
                                {remindDropdownOpen && (
                                    <View style={st.remindDropdown}>
                                        {REMIND_BEFORE_OPTIONS.map((opt) => (
                                            <Pressable
                                                key={opt}
                                                style={[
                                                    st.remindDropdownItem,
                                                    remindBefore === opt &&
                                                        st.remindDropdownItemActive,
                                                ]}
                                                onPress={() => {
                                                    setRemindBefore(opt);
                                                    setRemindDropdownOpen(
                                                        false,
                                                    );
                                                }}
                                            >
                                                <Text
                                                    style={[
                                                        st.remindDropdownText,
                                                        remindBefore === opt &&
                                                            st.remindDropdownTextActive,
                                                    ]}
                                                >
                                                    {opt}
                                                </Text>
                                                {remindBefore === opt && (
                                                    <Ionicons
                                                        name='checkmark'
                                                        size={16}
                                                        color={ACCENT}
                                                    />
                                                )}
                                            </Pressable>
                                        ))}
                                    </View>
                                )}
                            </SectionBlock>

                            {/* ── Preview ── */}
                            <View style={st.previewCard}>
                                <View style={st.previewHeader}>
                                    <Ionicons
                                        name='eye-outline'
                                        size={16}
                                        color={ACCENT}
                                    />
                                    <Text style={st.previewTitle}>
                                        Xem trước lịch
                                    </Text>
                                </View>
                                <Text style={st.previewText}>
                                    {previewText}
                                </Text>
                            </View>
                        </>
                    )}
                </ScrollView>

                {/* ── Bottom Buttons ── */}
                <View style={st.bottomBar}>
                    <Pressable style={st.cancelBtn} onPress={onClose}>
                        <Text style={st.cancelBtnText}>Hủy</Text>
                    </Pressable>
                    <Pressable style={st.confirmBtn} onPress={handleSave}>
                        <Ionicons
                            name='checkmark-circle'
                            size={18}
                            color='#fff'
                        />
                        <Text style={st.confirmBtnText}>Xác nhận</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

// ── Section Block sub-component ──
function SectionBlock({
    icon,
    title,
    children,
}: {
    icon: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <View style={st.sectionCard}>
            <View style={st.sectionTitleRow}>
                <View style={st.sectionBadge}>
                    <Ionicons name={icon as any} size={14} color={ACCENT} />
                </View>
                <Text style={st.sectionTitle}>{title}</Text>
            </View>
            <View style={st.sectionBody}>{children}</View>
        </View>
    );
}

// ── Styles ──
const st = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.bg,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
    },
    backBtn: {
        width: scale(28),
        height: scale(28),
        borderRadius: moderateScale(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(17),
        color: colors.text,
    },
    headerSub: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(11),
        color: colors.text3,
        marginTop: 1,
    },
    saveBtn: {
        ...buttonSystem.primary,
        minHeight: verticalScale(34),
        paddingHorizontal: scale(14),
        borderRadius: moderateScale(10),
        backgroundColor: ACCENT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: {
        ...buttonSystem.textPrimary,
        fontSize: scaleFont(12),
        color: '#fff',
    },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: {
        padding: scale(16),
        paddingTop: verticalScale(6),
        paddingBottom: verticalScale(40),
        gap: verticalScale(14),
    },

    // Enable row
    enableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.card,
        borderRadius: moderateScale(16),
        padding: scale(16),
        borderWidth: 1,
        borderColor: colors.border,
    },
    enableInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
    },
    enableLabel: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(15),
        color: colors.text,
    },

    // Section card
    sectionCard: {
        backgroundColor: colors.card,
        borderRadius: moderateScale(16),
        padding: scale(16),
        borderWidth: 1,
        borderColor: colors.border,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
        marginBottom: verticalScale(12),
    },
    sectionBadge: {
        width: scale(28),
        height: scale(28),
        borderRadius: moderateScale(8),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ACCENT_LIGHT,
    },
    sectionTitle: {
        ...formSystem.sectionTitle,
    },
    sectionBody: {
        gap: verticalScale(10),
    },

    // Segmented control
    segmentRow: {
        flexDirection: 'row',
        backgroundColor: colors.divider,
        borderRadius: moderateScale(10),
        padding: 3,
    },
    segmentItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: verticalScale(8),
        borderRadius: moderateScale(8),
    },
    segmentItemActive: {
        backgroundColor: colors.card,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    segmentText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text3,
    },
    segmentTextActive: {
        fontFamily: typography.font.bold,
        color: ACCENT,
    },

    // Days grid
    daysGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: scale(6),
    },
    dayChip: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(10),
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.bg,
    },
    dayChipActive: {
        backgroundColor: ACCENT,
        borderColor: ACCENT,
    },
    dayChipText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
        color: colors.text2,
    },
    dayChipTextActive: {
        color: '#fff',
    },

    // Interval
    intervalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(12),
    },
    intervalLabel: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        color: colors.text2,
    },
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    stepBtn: {
        width: moderateScale(34),
        height: moderateScale(34),
        borderRadius: moderateScale(10),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    stepValue: {
        minWidth: scale(36),
        textAlign: 'center',
        fontFamily: typography.font.bold,
        fontSize: scaleFont(16),
        color: ACCENT,
    },
    intervalUnit: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        color: colors.text2,
    },

    // Duration chips
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(8),
    },
    chip: {
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(8),
        borderRadius: moderateScale(20),
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.bg,
    },
    chipActive: {
        backgroundColor: ACCENT,
        borderColor: ACCENT,
    },
    chipText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text2,
    },
    chipTextActive: {
        fontFamily: typography.font.bold,
        color: '#fff',
    },
    durationHint: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(11),
        color: colors.text3,
        marginTop: verticalScale(2),
    },
    customDurationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    customDurationInput: {
        flex: 1,
        ...inputSystem.field,
        minHeight: verticalScale(38),
        paddingHorizontal: scale(12),
        borderRadius: moderateScale(8),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        color: colors.text,
    },
    customDurationBtn: {
        minHeight: verticalScale(38),
        paddingHorizontal: scale(14),
        borderRadius: moderateScale(10),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ACCENT,
    },
    customDurationBtnText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
        color: '#fff',
    },

    // Time presets
    timePresetsRow: {
        flexDirection: 'row',
        gap: scale(8),
    },
    timeCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(4),
        borderRadius: moderateScale(12),
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.bg,
        position: 'relative',
    },
    timeCardActive: {
        borderColor: ACCENT,
        backgroundColor: ACCENT_LIGHT,
    },
    timeCardEmoji: {
        fontSize: scaleFont(18),
        marginBottom: verticalScale(4),
    },
    timeCardLabel: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(10.5),
        color: colors.text2,
    },
    timeCardLabelActive: {
        color: ACCENT,
    },
    timeCardTime: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(10),
        color: colors.text3,
        marginTop: verticalScale(2),
    },
    timeCardTimeActive: {
        color: ACCENT,
    },
    timeCardCheckmark: {
        position: 'absolute',
        top: verticalScale(4),
        right: scale(4),
    },

    // Custom time
    customTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
        paddingHorizontal: scale(4),
    },
    customTimeInput: {
        flex: 1,
        ...inputSystem.field,
        minHeight: verticalScale(36),
        paddingHorizontal: scale(12),
        borderRadius: moderateScale(8),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        color: colors.text,
        textAlign: 'center',
    },

    // Add time button
    addTimeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(6),
        paddingVertical: verticalScale(8),
    },
    addTimeBtnText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: ACCENT,
    },

    // Remind before
    remindBeforeBtn: {
        ...inputSystem.selectOption,
        paddingHorizontal: scale(14),
        borderRadius: moderateScale(10),
    },
    remindBeforeText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        color: colors.text,
    },
    remindDropdown: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: moderateScale(10),
        backgroundColor: colors.card,
        overflow: 'hidden',
    },
    remindDropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(10),
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    remindDropdownItemActive: {
        backgroundColor: ACCENT_LIGHT,
    },
    remindDropdownText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        color: colors.text,
    },
    remindDropdownTextActive: {
        fontFamily: typography.font.bold,
        color: ACCENT,
    },

    // Preview card
    previewCard: {
        backgroundColor: ACCENT_LIGHT,
        borderRadius: moderateScale(14),
        padding: scale(14),
        borderWidth: 1,
        borderColor: ACCENT + '30',
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
        marginBottom: verticalScale(6),
    },
    previewTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
        color: ACCENT,
    },
    previewText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12.5),
        color: colors.text,
        lineHeight: scaleFont(18),
    },
    // Bottom bar
    bottomBar: {
        flexDirection: 'row',
        gap: scale(12),
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.card,
    },
    cancelBtn: {
        ...buttonSystem.outline,
        flex: 1,
        borderRadius: moderateScale(12),
        backgroundColor: colors.bg,
    },
    cancelBtnText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: colors.text2,
    },
    confirmBtn: {
        ...buttonSystem.primary,
        flex: 2,
        borderRadius: moderateScale(12),
        backgroundColor: ACCENT,
        gap: scale(6),
    },
    confirmBtnText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: '#fff',
    },
});
