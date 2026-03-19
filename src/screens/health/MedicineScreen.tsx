import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { DateField } from '../../components/ui';
import { MEDICINES } from '../../data/health-data';
import { shared } from '../../styles/shared';
import { colors } from '../../styles/tokens';
import type { MedicineItem } from '../../types';

/* ── Simulated today state ── */
const TODAY_TAKEN: Record<string, string[]> = {
    t1: ['Sáng 07:00'],
    t2: ['Sáng 07:00'],
    t3: [],
};

/* ── Time slot definitions ── */
const TIME_SLOTS = [
    { label: 'Sáng', defaultTime: '07:00' },
    { label: 'Trưa', defaultTime: '12:00' },
    { label: 'Tối', defaultTime: '18:00' },
    { label: 'Trước ngủ', defaultTime: '22:00' },
] as const;

/* ── Helpers ── */
function fmtDate(iso: string): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
}

function urgencyColors(daysLeft: number) {
    if (daysLeft <= 3) {
        return {
            color: '#E11D48',
            bg: '#FFF1F2',
            border: '#FECDD3',
        };
    }
    if (daysLeft <= 7) {
        return {
            color: '#D97706',
            bg: '#FFFBEB',
            border: '#FDE68A',
        };
    }
    return { color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' };
}

function pillBarColors(remaining: number): [string, string] {
    if (remaining <= 7) return ['#E11D48', '#F43F5E'];
    if (remaining <= 14) return ['#D97706', '#F59E0B'];
    return ['#0D9488', '#14B8A6'];
}

type MedView = 'list' | 'detail';
type SheetType = 'none' | 'choose' | 'addForm';

const MEAL_OPTIONS = ['Sau ăn', 'Trước ăn', 'Trong bữa', 'Không quan trọng'];
const FREQ_OPTIONS = [1, 2, 3, 4];

interface Props {
    onClose: () => void;
}

export default function MedicineScreen({ onClose }: Props): React.JSX.Element {
    const [view, setView] = useState<MedView>('list');
    const [selectedMed, setSelectedMed] = useState<MedicineItem | null>(null);
    const [sheet, setSheet] = useState<SheetType>('none');

    const active = MEDICINES.filter((m) => m.active);
    const ended = MEDICINES.filter((m) => !m.active);

    // Today progress
    const todayTotal = active.reduce((s, m) => s + m.freq, 0);
    const todayDone = Object.values(TODAY_TAKEN).reduce(
        (s, arr) => s + arr.length,
        0,
    );
    const todayPct =
        todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;
    const todayRemain = todayTotal - todayDone;

    // Dynamic today card gradient
    const todayGradient: [string, string, string] =
        todayRemain === 0
            ? ['#14532D', '#16A34A', '#15803D']
            : todayRemain >= 2
              ? ['#78350F', '#B45309', '#92400E']
              : ['#0F766E', '#0D9488', '#0E7490'];

    // Warning text
    const lowSupply = active.filter((m) => m.daysLeft <= 3);
    const warnText =
        todayRemain > 0
            ? `Còn ${todayRemain} liều chưa uống hôm nay`
            : 'Đã uống đủ liều hôm nay';

    // Next dose time
    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
    const allNextTimes: number[] = [];
    active.forEach((t) => {
        (t.times || []).forEach((slot) => {
            const match = slot.match(/(\d{1,2}):(\d{2})$/);
            if (match) {
                const mins = parseInt(match[1]) * 60 + parseInt(match[2]);
                if (mins > nowMins) allNextTimes.push(mins);
            }
        });
    });
    allNextTimes.sort((a, b) => a - b);
    const nextDoseTime =
        allNextTimes.length > 0
            ? `${String(Math.floor(allNextTimes[0] / 60)).padStart(2, '0')}:${String(allNextTimes[0] % 60).padStart(2, '0')}`
            : null;

    const openDetail = useCallback((m: MedicineItem) => {
        setSelectedMed(m);
        setView('detail');
    }, []);
    const closeDetail = useCallback(() => {
        setView('list');
        setSelectedMed(null);
    }, []);

    if (view === 'detail' && selectedMed) {
        return <MedDetail item={selectedMed} onBack={closeDetail} />;
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />

            {/* TOP BAR */}
            <View style={styles.subTopbar}>
                <Pressable style={styles.subBackBtn} onPress={onClose}>
                    <Ionicons
                        name='chevron-back'
                        size={16}
                        color={colors.text2}
                    />
                </Pressable>
                <Text style={styles.subTopbarTitle}>Đơn thuốc</Text>
                <Pressable
                    style={[styles.subAddBtn, { backgroundColor: '#0D9488' }]}
                    onPress={() => setSheet('choose')}
                >
                    <Ionicons name='add' size={12} color='#fff' />
                    <Text style={styles.subAddBtnText}>Thêm toa</Text>
                </Pressable>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* TODAY CARD */}
                <LinearGradient
                    colors={todayGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.medTodayCard}
                >
                    <Text style={styles.medTodaySup}>HÔM NAY</Text>
                    <View style={styles.medTodayRow}>
                        <View>
                            <Text style={styles.medTodayNum}>
                                {todayDone}{' '}
                                <Text style={styles.medTodayNumSub}>
                                    / {todayTotal} liều đã uống
                                </Text>
                            </Text>
                            {/* Warning row */}
                            <View style={styles.medTodayWarn}>
                                {todayRemain > 0 && (
                                    <Ionicons
                                        name='warning-outline'
                                        size={12}
                                        color='rgba(255,255,255,0.8)'
                                    />
                                )}
                                <Text style={styles.medTodayWarnText}>
                                    {warnText}
                                </Text>
                            </View>
                            {/* Next dose */}
                            {todayRemain > 0 && nextDoseTime && (
                                <View style={styles.medNextDose}>
                                    <Ionicons
                                        name='time-outline'
                                        size={10}
                                        color='rgba(255,255,255,0.6)'
                                    />
                                    <Text style={styles.medNextDoseText}>
                                        Tiếp theo:
                                    </Text>
                                    <Text style={styles.medNextDoseTime}>
                                        {nextDoseTime}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.medTodayPct}>{todayPct}%</Text>
                    </View>

                    {/* Dose dots */}
                    <View style={styles.medDoseDots}>
                        {active.map((t) => {
                            const taken = TODAY_TAKEN[t.id] || [];
                            return t.times.map((time) => {
                                const ok = taken.includes(time);
                                return (
                                    <View
                                        key={`${t.id}-${time}`}
                                        style={[
                                            styles.medDoseDot,
                                            {
                                                backgroundColor: ok
                                                    ? 'rgba(255,255,255,0.25)'
                                                    : 'rgba(255,255,255,0.1)',
                                            },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.medDoseDotCircle,
                                                {
                                                    backgroundColor: ok
                                                        ? '#fff'
                                                        : 'rgba(255,255,255,0.35)',
                                                },
                                            ]}
                                        />
                                        <Text
                                            style={[
                                                styles.medDoseDotText,
                                                {
                                                    color: ok
                                                        ? '#fff'
                                                        : 'rgba(255,255,255,0.5)',
                                                },
                                            ]}
                                        >
                                            {time}
                                        </Text>
                                    </View>
                                );
                            });
                        })}
                    </View>

                    <View style={styles.medProgressTrack}>
                        <View
                            style={[
                                styles.medProgressFill,
                                { width: `${todayPct}%` },
                            ]}
                        />
                    </View>
                </LinearGradient>

                {/* ĐANG DÙNG */}
                {active.length > 0 && (
                    <>
                        <View style={styles.medSecRow}>
                            <View style={styles.medSecLeft}>
                                <View
                                    style={[
                                        styles.vaxSecDot,
                                        { backgroundColor: '#0D9488' },
                                    ]}
                                />
                                <Text style={styles.medSecLabel}>
                                    Đang dùng
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.vaxSecCount,
                                    {
                                        backgroundColor: '#F0FDFA',
                                        color: '#0D9488',
                                        borderColor: '#99F6E4',
                                    },
                                ]}
                            >
                                {active.length} loại
                            </Text>
                        </View>
                        <View style={styles.vaxListCard}>
                            {active.map((m, i) => (
                                <MedRow
                                    key={m.id}
                                    item={m}
                                    isLast={i === active.length - 1}
                                    onPress={() => openDetail(m)}
                                />
                            ))}
                        </View>
                    </>
                )}

                {/* ĐÃ KẾT THÚC */}
                {ended.length > 0 && (
                    <>
                        <View style={styles.medSecRow}>
                            <View style={styles.medSecLeft}>
                                <View
                                    style={[
                                        styles.vaxSecDot,
                                        { backgroundColor: colors.text3 },
                                    ]}
                                />
                                <Text style={styles.medSecLabel}>
                                    Đã kết thúc
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.vaxSecCount,
                                    {
                                        backgroundColor: colors.bg,
                                        color: colors.text3,
                                        borderColor: colors.border,
                                    },
                                ]}
                            >
                                {ended.length} loại
                            </Text>
                        </View>
                        <View style={styles.vaxListCard}>
                            {ended.map((m, i) => (
                                <MedRow
                                    key={m.id}
                                    item={m}
                                    isLast={i === ended.length - 1}
                                    onPress={() => openDetail(m)}
                                    isEnded
                                />
                            ))}
                        </View>
                    </>
                )}

                {/* NOTE */}
                <View style={styles.medNote}>
                    <Ionicons
                        name='warning-outline'
                        size={13}
                        color='#D97706'
                    />
                    <Text style={styles.medNoteText}>
                        Nhắc nhở dựa trên lịch uống thuốc. Luôn tham khảo ý kiến
                        bác sĩ trước khi thay đổi liều lượng.
                    </Text>
                </View>
            </ScrollView>

            {/* CHOOSE SHEET */}
            <Modal
                visible={sheet !== 'none'}
                transparent
                animationType='fade'
                onRequestClose={() => setSheet('none')}
            >
                <Pressable
                    style={shared.overlay}
                    onPress={() => setSheet('none')}
                >
                    {sheet === 'choose' && (
                        <Pressable
                            style={styles.medSheet}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <View style={shared.sheetHandle}>
                                <View style={shared.sheetBar} />
                            </View>
                            <ChooseSheet
                                onManual={() => setSheet('addForm')}
                                onClose={() => setSheet('none')}
                            />
                        </Pressable>
                    )}
                    {sheet === 'addForm' && (
                        <Pressable
                            style={styles.medSheet}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <View style={shared.sheetHandle}>
                                <View style={shared.sheetBar} />
                            </View>
                            <AddMedSheet
                                onBack={() => setSheet('choose')}
                                onClose={() => setSheet('none')}
                            />
                        </Pressable>
                    )}
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

/* ═══════════════════════════════════ */
/*  MedRow                             */
/* ═══════════════════════════════════ */
function MedRow({
    item,
    isLast,
    onPress,
    isEnded,
}: {
    item: MedicineItem;
    isLast: boolean;
    onPress: () => void;
    isEnded?: boolean;
}) {
    const urg = urgencyColors(item.daysLeft);

    return (
        <Pressable
            style={[styles.medRow, !isLast && styles.medRowBorder]}
            onPress={onPress}
        >
            <View
                style={[
                    styles.medRowIcon,
                    {
                        backgroundColor: isEnded ? colors.bg : '#F0FDFA',
                    },
                ]}
            >
                <MaterialCommunityIcons
                    name='pill'
                    size={16}
                    color={isEnded ? colors.text3 : '#0D9488'}
                />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                    style={[
                        styles.medRowName,
                        isEnded && {
                            color: colors.text3,
                            textDecorationLine: 'line-through',
                        },
                    ]}
                    numberOfLines={1}
                >
                    {item.name}
                </Text>
                {isEnded ? (
                    <Text style={styles.medRowSub}>Đã kết thúc</Text>
                ) : (
                    <>
                        <Text style={styles.medRowSub} numberOfLines={1}>
                            {item.dose} · {(item.times || []).join(' · ')} ·{' '}
                            {item.meal}
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                                marginTop: 5,
                            }}
                        >
                            <View
                                style={[
                                    styles.medDaysLeftBadge,
                                    {
                                        backgroundColor: urg.bg,
                                        borderColor: urg.border,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.medDaysLeftText,
                                        { color: urg.color },
                                    ]}
                                >
                                    còn {item.daysLeft} ngày
                                </Text>
                            </View>
                        </View>
                    </>
                )}
            </View>
            <Ionicons name='chevron-forward' size={14} color={colors.text3} />
        </Pressable>
    );
}

/* ═══════════════════════════════════ */
/*  MedDetail (full-screen)            */
/* ═══════════════════════════════════ */
function MedDetail({
    item,
    onBack,
}: {
    item: MedicineItem;
    onBack: () => void;
}) {
    const [editMode, setEditMode] = useState(false);
    const [eName, setEName] = useState(item.name);
    const [ePills, setEPills] = useState(String(item.totalPills));
    const [eDose, setEDose] = useState(item.dose);
    const [eFreq, setEFreq] = useState(item.freq);
    const [eMeal, setEMeal] = useState(item.meal);
    const [eNote, setENote] = useState(item.note || '');
    const [eSlots, setESlots] = useState<
        Record<string, { active: boolean; time: string }>
    >(() => {
        const slotDefaults: Record<string, string> = {
            Sáng: '07:00',
            Trưa: '12:00',
            Tối: '18:00',
            'Trước ngủ': '22:00',
        };
        const result: Record<string, { active: boolean; time: string }> = {};
        TIME_SLOTS.forEach((s) => {
            const match = (item.times || []).find((x) => x.startsWith(s.label));
            const timeVal = match
                ? (match.match(/(\d{1,2}:\d{2})$/) || [])[1] ||
                  slotDefaults[s.label]
                : slotDefaults[s.label];
            result[s.label] = { active: !!match, time: timeVal };
        });
        return result;
    });

    const remaining = item.totalPills - item.takenPills;
    const pct =
        item.totalPills > 0
            ? Math.round((item.takenPills / item.totalPills) * 100)
            : 0;
    const barColors = pillBarColors(remaining);
    const urg = urgencyColors(item.daysLeft);

    const toggleEdit = useCallback(() => {
        if (editMode) {
            // Cancel — reset
            setEName(item.name);
            setEPills(String(item.totalPills));
            setEDose(item.dose);
            setEFreq(item.freq);
            setEMeal(item.meal);
            setENote(item.note || '');
        }
        setEditMode((prev) => !prev);
    }, [editMode, item]);

    const toggleSlot = useCallback((label: string) => {
        setESlots((prev) => ({
            ...prev,
            [label]: { ...prev[label], active: !prev[label].active },
        }));
    }, []);

    const updateSlotTime = useCallback((label: string, time: string) => {
        setESlots((prev) => ({
            ...prev,
            [label]: { ...prev[label], time },
        }));
    }, []);

    const infoRows = [
        { label: 'Liều dùng', value: item.dose },
        { label: 'Số lần/ngày', value: `${item.freq} lần` },
        { label: 'Thời điểm', value: item.times.join(', ') },
        { label: 'Bữa ăn', value: item.meal },
        { label: 'Bắt đầu', value: fmtDate(item.startDate) },
        { label: 'Tổng số ngày', value: `${item.days} ngày` },
        ...(item.note ? [{ label: 'Ghi chú', value: item.note }] : []),
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />

            {/* Header */}
            <View style={styles.mdHeader}>
                <Pressable style={styles.subBackBtn} onPress={onBack}>
                    <Ionicons
                        name='chevron-back'
                        size={16}
                        color={colors.text2}
                    />
                </Pressable>
                <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.medDetailName} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={styles.medDetailSub}>{item.group}</Text>
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <View
                        style={[
                            styles.medDetailBadge,
                            {
                                backgroundColor: item.active
                                    ? urg.bg
                                    : colors.bg,
                                borderColor: item.active
                                    ? urg.border
                                    : colors.border,
                            },
                        ]}
                    >
                        <Text
                            style={{
                                fontSize: 10,
                                fontWeight: '700',
                                color: item.active ? urg.color : colors.text3,
                            }}
                        >
                            {item.active
                                ? `Còn ${item.daysLeft} ngày`
                                : 'Đã kết thúc'}
                        </Text>
                    </View>
                    <Pressable
                        style={[
                            styles.mdEditBtn,
                            editMode && { borderColor: '#0D9488' },
                        ]}
                        onPress={toggleEdit}
                    >
                        <Ionicons
                            name='create-outline'
                            size={14}
                            color={editMode ? '#0D9488' : colors.text2}
                        />
                    </Pressable>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Pill Progress (active only) */}
                {item.active && item.totalPills > 0 && (
                    <View style={styles.medPillWidget}>
                        <View style={styles.medPillRow}>
                            <View>
                                <Text style={styles.medPillLabel}>ĐÃ UỐNG</Text>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'baseline',
                                        gap: 3,
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.medPillNum,
                                            { color: barColors[0] },
                                        ]}
                                    >
                                        {item.takenPills}
                                    </Text>
                                    <Text style={styles.medPillTotal}>
                                        / {item.totalPills} viên
                                    </Text>
                                </View>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={styles.medPillLabel}>CÒN LẠI</Text>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'baseline',
                                        gap: 3,
                                        justifyContent: 'flex-end',
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.medPillNum,
                                            { color: colors.text },
                                        ]}
                                    >
                                        {remaining}
                                    </Text>
                                    <Text style={styles.medPillTotal}>
                                        viên
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.medPillTrack}>
                            <LinearGradient
                                colors={barColors}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[
                                    styles.medPillFill,
                                    { width: `${pct}%` },
                                ]}
                            />
                        </View>
                        <Text
                            style={[styles.medPillPct, { color: barColors[0] }]}
                        >
                            {pct}%
                        </Text>
                    </View>
                )}

                {/* VIEW MODE */}
                {!editMode && (
                    <View style={styles.medInfoCard}>
                        {infoRows.map((row, i) => (
                            <View
                                key={row.label}
                                style={[
                                    styles.medInfoRow,
                                    i > 0 && styles.medInfoRowBorder,
                                ]}
                            >
                                <Text style={styles.medInfoLabel}>
                                    {row.label}
                                </Text>
                                <Text style={styles.medInfoValue}>
                                    {row.value}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* EDIT MODE */}
                {editMode && (
                    <View style={styles.mdEditForm}>
                        {/* Tên thuốc */}
                        <View>
                            <Text style={styles.mdFieldLabel}>Tên thuốc</Text>
                            <TextInput
                                style={styles.mdInput}
                                value={eName}
                                onChangeText={setEName}
                            />
                        </View>
                        {/* Số viên */}
                        <View>
                            <Text style={styles.mdFieldLabel}>
                                Số viên trong toa
                            </Text>
                            <TextInput
                                style={styles.mdInput}
                                value={ePills}
                                onChangeText={setEPills}
                                keyboardType='number-pad'
                            />
                        </View>
                        {/* Liều + Freq row */}
                        <View style={styles.mdRowGrid}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.mdFieldLabel}>
                                    Liều dùng
                                </Text>
                                <TextInput
                                    style={styles.mdInput}
                                    value={eDose}
                                    onChangeText={setEDose}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.mdFieldLabel}>
                                    Số lần/ngày
                                </Text>
                                <View style={styles.mdFreqRow}>
                                    {FREQ_OPTIONS.map((n) => (
                                        <Pressable
                                            key={n}
                                            style={[
                                                styles.mdFreqChip,
                                                eFreq === n &&
                                                    styles.mdFreqChipActive,
                                            ]}
                                            onPress={() => setEFreq(n)}
                                        >
                                            <Text
                                                style={[
                                                    styles.mdFreqChipText,
                                                    eFreq === n &&
                                                        styles.mdFreqChipTextActive,
                                                ]}
                                            >
                                                {n}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        </View>
                        {/* Time slots */}
                        <View>
                            <Text style={styles.mdFieldLabel}>
                                Thời điểm uống
                            </Text>
                            {TIME_SLOTS.map((s) => {
                                const slot = eSlots[s.label];
                                return (
                                    <View
                                        key={s.label}
                                        style={styles.mdSlotRow}
                                    >
                                        <Pressable
                                            style={[
                                                styles.mdSlotChip,
                                                slot.active &&
                                                    styles.mdSlotChipActive,
                                            ]}
                                            onPress={() => toggleSlot(s.label)}
                                        >
                                            <Text
                                                style={[
                                                    styles.mdSlotChipText,
                                                    slot.active &&
                                                        styles.mdSlotChipTextActive,
                                                ]}
                                            >
                                                {s.label}
                                            </Text>
                                        </Pressable>
                                        <DateField
                                            mode='time'
                                            containerStyle={{ flex: 1 }}
                                            value={(() => {
                                                if (!slot.time) return null;
                                                const [h, m] = slot.time
                                                    .split(':')
                                                    .map(Number);
                                                const d = new Date();
                                                d.setHours(
                                                    h || 0,
                                                    m || 0,
                                                    0,
                                                    0,
                                                );
                                                return d;
                                            })()}
                                            onChange={(date) => {
                                                const hh = String(
                                                    date.getHours(),
                                                ).padStart(2, '0');
                                                const mm = String(
                                                    date.getMinutes(),
                                                ).padStart(2, '0');
                                                updateSlotTime(
                                                    s.label,
                                                    `${hh}:${mm}`,
                                                );
                                            }}
                                        />
                                    </View>
                                );
                            })}
                        </View>
                        {/* Bữa ăn */}
                        <View>
                            <Text style={styles.mdFieldLabel}>Bữa ăn</Text>
                            <View style={styles.mdFreqRow}>
                                {MEAL_OPTIONS.map((m) => (
                                    <Pressable
                                        key={m}
                                        style={[
                                            styles.mdMealChip,
                                            eMeal === m &&
                                                styles.mdFreqChipActive,
                                        ]}
                                        onPress={() => setEMeal(m)}
                                    >
                                        <Text
                                            style={[
                                                styles.mdFreqChipText,
                                                eMeal === m &&
                                                    styles.mdFreqChipTextActive,
                                            ]}
                                        >
                                            {m}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                        {/* Ghi chú */}
                        <View>
                            <Text style={styles.mdFieldLabel}>Ghi chú</Text>
                            <TextInput
                                style={[
                                    styles.mdInput,
                                    { minHeight: 60, textAlignVertical: 'top' },
                                ]}
                                value={eNote}
                                onChangeText={setENote}
                                multiline
                                numberOfLines={2}
                                placeholder='VD: Uống với nhiều nước…'
                                placeholderTextColor={colors.text3}
                            />
                        </View>
                        {/* Save */}
                        <Pressable style={styles.mdSaveBtn}>
                            <LinearGradient
                                colors={['#0F766E', '#0D9488']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.mdSaveBtnInner}
                            >
                                <Text style={styles.mdSaveBtnText}>
                                    Lưu thay đổi
                                </Text>
                            </LinearGradient>
                        </Pressable>
                    </View>
                )}

                {/* Delete (ended only) */}
                {!item.active && !editMode && (
                    <Pressable style={styles.mdDeleteBtn}>
                        <Ionicons
                            name='trash-outline'
                            size={14}
                            color='#E11D48'
                        />
                        <Text style={styles.mdDeleteText}>Xoá toa thuốc</Text>
                    </Pressable>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

/* ═══════════════════════════════════ */
/*  ChooseSheet                        */
/* ═══════════════════════════════════ */
function ChooseSheet({
    onManual,
    onClose,
}: {
    onManual: () => void;
    onClose: () => void;
}) {
    return (
        <View style={{ padding: 20, paddingBottom: 32, gap: 10 }}>
            <Text
                style={{
                    fontSize: 16,
                    fontWeight: '800',
                    color: colors.text,
                    marginBottom: 4,
                }}
            >
                Thêm toa thuốc
            </Text>
            {/* Option 1: Manual */}
            <Pressable style={styles.mdChooseOption} onPress={onManual}>
                <View
                    style={[
                        styles.mdChooseIcon,
                        { backgroundColor: '#F0FDFA' },
                    ]}
                >
                    <Ionicons name='create-outline' size={20} color='#0D9488' />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.mdChooseTitle}>Nhập thông tin</Text>
                    <Text style={styles.mdChooseSub}>
                        Điền thủ công thông tin toa thuốc
                    </Text>
                </View>
                <Ionicons
                    name='chevron-forward'
                    size={14}
                    color={colors.text3}
                />
            </Pressable>
            {/* Option 2: Scan */}
            <Pressable style={styles.mdChooseOption}>
                <View
                    style={[
                        styles.mdChooseIcon,
                        { backgroundColor: '#EFF6FF' },
                    ]}
                >
                    <Ionicons name='image-outline' size={20} color='#2563EB' />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.mdChooseTitle}>Quét toa thuốc</Text>
                    <Text style={styles.mdChooseSub}>
                        Chụp ảnh toa, hệ thống tự điền thông tin
                    </Text>
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                    }}
                >
                    <View style={styles.mdAiBadge}>
                        <Text style={styles.mdAiBadgeText}>AI</Text>
                    </View>
                    <Ionicons
                        name='chevron-forward'
                        size={14}
                        color={colors.text3}
                    />
                </View>
            </Pressable>
        </View>
    );
}

/* ═══════════════════════════════════ */
/*  AddMedSheet                        */
/* ═══════════════════════════════════ */
function AddMedSheet({
    onBack,
    onClose,
}: {
    onBack: () => void;
    onClose: () => void;
}) {
    const [name, setName] = useState('');
    const [pills, setPills] = useState('');
    const [dose, setDose] = useState('');
    const [freq, setFreq] = useState(2);
    const [meal, setMeal] = useState('Sau ăn');
    const [note, setNote] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [slots, setSlots] = useState<
        Record<string, { active: boolean; time: string }>
    >({
        Sáng: { active: true, time: '07:00' },
        Trưa: { active: false, time: '12:00' },
        Tối: { active: true, time: '18:00' },
        'Trước ngủ': { active: false, time: '22:00' },
    });

    const toggleSlot = (label: string) => {
        setSlots((prev) => ({
            ...prev,
            [label]: { ...prev[label], active: !prev[label].active },
        }));
    };

    return (
        <ScrollView
            style={{ maxHeight: 600 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.mdAddHeader}>
                <Pressable style={styles.mdAddBackBtn} onPress={onBack}>
                    <Ionicons
                        name='chevron-back'
                        size={14}
                        color={colors.text2}
                    />
                </Pressable>
                <Text style={styles.mdAddTitle}>Nhập thông tin</Text>
            </View>

            <View style={{ padding: 20, paddingTop: 14, gap: 11 }}>
                {/* Tên thuốc */}
                <View>
                    <Text style={styles.mdFieldLabel}>Tên thuốc *</Text>
                    <TextInput
                        style={styles.mdInput}
                        value={name}
                        onChangeText={setName}
                        placeholder='VD: Metformin 500mg'
                        placeholderTextColor={colors.text3}
                    />
                </View>
                {/* Số viên */}
                <View>
                    <TextInput
                        style={styles.mdInput}
                        value={pills}
                        onChangeText={setPills}
                        placeholder='Số viên trong toa (VD: 60)'
                        placeholderTextColor={colors.text3}
                        keyboardType='number-pad'
                    />
                </View>
                {/* Ngày bắt đầu */}
                <View>
                    <Text style={styles.mdFieldLabel}>Ngày bắt đầu uống</Text>
                    <DateField value={startDate} onChange={setStartDate} />
                </View>
                {/* Dose + Freq */}
                <View style={styles.mdRowGrid}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.mdFieldLabel}>Liều dùng *</Text>
                        <TextInput
                            style={styles.mdInput}
                            value={dose}
                            onChangeText={setDose}
                            placeholder='VD: 1 viên'
                            placeholderTextColor={colors.text3}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.mdFieldLabel}>Số lần/ngày *</Text>
                        <View style={styles.mdFreqRow}>
                            {FREQ_OPTIONS.map((n) => (
                                <Pressable
                                    key={n}
                                    style={[
                                        styles.mdFreqChip,
                                        freq === n && styles.mdFreqChipActive,
                                    ]}
                                    onPress={() => setFreq(n)}
                                >
                                    <Text
                                        style={[
                                            styles.mdFreqChipText,
                                            freq === n &&
                                                styles.mdFreqChipTextActive,
                                        ]}
                                    >
                                        {n} lần
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </View>
                {/* Time slots */}
                <View>
                    <Text style={styles.mdFieldLabel}>Thời điểm uống</Text>
                    {TIME_SLOTS.map((s) => {
                        const slot = slots[s.label];
                        return (
                            <View key={s.label} style={styles.mdSlotRow}>
                                <Pressable
                                    style={[
                                        styles.mdSlotChip,
                                        slot.active && styles.mdSlotChipActive,
                                    ]}
                                    onPress={() => toggleSlot(s.label)}
                                >
                                    <Text
                                        style={[
                                            styles.mdSlotChipText,
                                            slot.active &&
                                                styles.mdSlotChipTextActive,
                                        ]}
                                    >
                                        {s.label}
                                    </Text>
                                </Pressable>
                                <DateField
                                    mode='time'
                                    containerStyle={{ flex: 1 }}
                                    value={(() => {
                                        if (!slot.time) return null;
                                        const [h, m] = slot.time
                                            .split(':')
                                            .map(Number);
                                        const d = new Date();
                                        d.setHours(h || 0, m || 0, 0, 0);
                                        return d;
                                    })()}
                                    onChange={(date) => {
                                        const hh = String(
                                            date.getHours(),
                                        ).padStart(2, '0');
                                        const mm = String(
                                            date.getMinutes(),
                                        ).padStart(2, '0');
                                        setSlots((prev) => ({
                                            ...prev,
                                            [s.label]: {
                                                ...prev[s.label],
                                                time: `${hh}:${mm}`,
                                            },
                                        }));
                                    }}
                                />
                            </View>
                        );
                    })}
                </View>
                {/* Bữa ăn */}
                <View>
                    <Text style={styles.mdFieldLabel}>Bữa ăn</Text>
                    <View style={styles.mdFreqRow}>
                        {MEAL_OPTIONS.map((m) => (
                            <Pressable
                                key={m}
                                style={[
                                    styles.mdMealChip,
                                    meal === m && styles.mdFreqChipActive,
                                ]}
                                onPress={() => setMeal(m)}
                            >
                                <Text
                                    style={[
                                        styles.mdFreqChipText,
                                        meal === m &&
                                            styles.mdFreqChipTextActive,
                                    ]}
                                >
                                    {m}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
                {/* Ghi chú */}
                <View>
                    <Text style={styles.mdFieldLabel}>Ghi chú</Text>
                    <TextInput
                        style={[
                            styles.mdInput,
                            { minHeight: 60, textAlignVertical: 'top' },
                        ]}
                        value={note}
                        onChangeText={setNote}
                        multiline
                        numberOfLines={2}
                        placeholder='VD: Uống với nhiều nước…'
                        placeholderTextColor={colors.text3}
                    />
                </View>
                {/* Save */}
                <Pressable style={styles.mdSaveBtn}>
                    <LinearGradient
                        colors={['#0F766E', '#0D9488']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.mdSaveBtnInner}
                    >
                        <Text style={styles.mdSaveBtnText}>Lưu toa thuốc</Text>
                    </LinearGradient>
                </Pressable>
            </View>
        </ScrollView>
    );
}
