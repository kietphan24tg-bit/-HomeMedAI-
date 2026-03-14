import Ionicons from '@expo/vector-icons/Ionicons';
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
import { VACCINE_DETAILS } from '../../data/health-data';
import { shared } from '../../styles/shared';
import { colors } from '../../styles/tokens';
import type { VaccineDetailItem } from '../../types';

interface Props {
    onClose: () => void;
}

type VaxView = 'list' | 'detail';

function doneMuiCount(v: VaccineDetailItem) {
    return v.doses.filter((d) => d.date).length;
}

export default function VaccineScreen({ onClose }: Props): React.JSX.Element {
    const [view, setView] = useState<VaxView>('list');
    const [detailVax, setDetailVax] = useState<VaccineDetailItem | null>(null);
    const [showAddVax, setShowAddVax] = useState(false);

    const openDetail = useCallback((v: VaccineDetailItem) => {
        setDetailVax(v);
        setView('detail');
    }, []);
    const closeDetail = useCallback(() => {
        setView('list');
        setDetailVax(null);
    }, []);

    if (view === 'detail' && detailVax) {
        return <VaxDetailScreen item={detailVax} onBack={closeDetail} />;
    }

    const totalDone = VACCINE_DETAILS.reduce(
        (s, v) => s + Math.min(doneMuiCount(v), v.total),
        0,
    );
    const totalMui = VACCINE_DETAILS.reduce((s, v) => s + v.total, 0);
    const pct = Math.round((totalDone / totalMui) * 100);
    const pending = totalMui - totalDone;

    const complete = VACCINE_DETAILS.filter((v) => doneMuiCount(v) >= v.total);
    const soon = VACCINE_DETAILS.filter(
        (v) =>
            doneMuiCount(v) < v.total &&
            v.doses.some((d) => d.scheduled && !d.date),
    );
    const soonIds = new Set(soon.map((v) => v.id));
    const incomplete = VACCINE_DETAILS.filter(
        (v) => doneMuiCount(v) < v.total && !soonIds.has(v.id),
    );

    // Find next scheduled shot
    const nextShot = soon.length > 0 ? soon[0] : null;
    const nextDose = nextShot?.doses.find((d) => d.scheduled && !d.date);

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
                <Text style={styles.subTopbarTitle}>Tiêm chủng</Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* PROGRESS HERO */}
                <LinearGradient
                    colors={['#1E3A8A', '#2563EB', '#0D9488']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.vaxHero}
                >
                    <View style={styles.vaxHeroContent}>
                        {/* Donut */}
                        <View style={styles.vaxDonut}>
                            <View style={styles.vaxDonutTrack}>
                                <View
                                    style={[
                                        styles.vaxDonutFill,
                                        {
                                            borderTopColor: '#fff',
                                            borderRightColor:
                                                pct >= 25
                                                    ? '#fff'
                                                    : 'transparent',
                                            borderBottomColor:
                                                pct >= 50
                                                    ? '#fff'
                                                    : 'transparent',
                                            borderLeftColor:
                                                pct >= 75
                                                    ? '#fff'
                                                    : 'transparent',
                                        },
                                    ]}
                                />
                                <Text style={styles.vaxDonutText}>{pct}%</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.vaxHeroSup}>Hoàn thành</Text>
                            <Text style={styles.vaxHeroNum}>
                                {totalDone}{' '}
                                <Text style={styles.vaxHeroNumSub}>
                                    / {totalMui} mũi đã tiêm
                                </Text>
                            </Text>
                            <Text style={styles.vaxHeroPending}>
                                {pending} MŨI CHƯA HOÀN THÀNH
                            </Text>
                        </View>
                    </View>
                    {/* Progress bar */}
                    <View style={styles.vaxProgressTrack}>
                        <View
                            style={[
                                styles.vaxProgressFill,
                                { width: `${pct}%` },
                            ]}
                        />
                    </View>
                </LinearGradient>

                {/* NEXT SHOT */}
                {nextShot && nextDose && (
                    <Pressable
                        style={styles.vaxNextShot}
                        onPress={() => openDetail(nextShot)}
                    >
                        <View style={styles.vaxNextShotIcon}>
                            <Ionicons
                                name='calendar-outline'
                                size={15}
                                color='#D97706'
                            />
                        </View>
                        <View style={styles.vaxNextShotBody}>
                            <Text style={styles.vaxNextShotLabel}>
                                Lịch tiêm tiếp theo
                            </Text>
                            <Text style={styles.vaxNextShotName}>
                                {nextShot.name} · Mũi {nextDose.num}
                            </Text>
                        </View>
                        <Text style={styles.vaxNextShotDate}>
                            {nextDose.scheduled}
                        </Text>
                    </Pressable>
                )}

                {/* ĐÃ TIÊM ĐỦ */}
                {complete.length > 0 && (
                    <>
                        <VaxSectionHeader
                            label='Đã tiêm đủ'
                            count={complete.length}
                            dotColor='#22C55E'
                            countBg='#F0FDF4'
                            countColor='#16A34A'
                            countBorder='#BBF7D0'
                        />
                        <View style={styles.vaxListCard}>
                            {complete.map((v, i) => (
                                <VaxRow
                                    key={v.id}
                                    item={v}
                                    isLast={i === complete.length - 1}
                                    status='done'
                                    onPress={() => openDetail(v)}
                                />
                            ))}
                        </View>
                    </>
                )}

                {/* SẮP TIÊM */}
                {soon.length > 0 && (
                    <>
                        <VaxSectionHeader
                            label='Sắp tiêm'
                            count={soon.length}
                            dotColor={colors.primary}
                            countBg={colors.primaryBg}
                            countColor={colors.primary}
                            countBorder='#BFDBFE'
                        />
                        <View style={styles.vaxListCard}>
                            {soon.map((v, i) => (
                                <VaxRow
                                    key={v.id}
                                    item={v}
                                    isLast={i === soon.length - 1}
                                    status='soon'
                                    onPress={() => openDetail(v)}
                                />
                            ))}
                        </View>
                    </>
                )}

                {/* CHƯA HOÀN THÀNH */}
                {incomplete.length > 0 && (
                    <>
                        <VaxSectionHeader
                            label='Chưa hoàn thành'
                            count={incomplete.length}
                            dotColor='#F59E0B'
                            countBg='#FFFBEB'
                            countColor='#D97706'
                            countBorder='#FDE68A'
                        />
                        <View style={styles.vaxListCard}>
                            {incomplete.map((v, i) => (
                                <VaxRow
                                    key={v.id}
                                    item={v}
                                    isLast={i === incomplete.length - 1}
                                    status='pending'
                                    onPress={() => openDetail(v)}
                                />
                            ))}
                        </View>
                    </>
                )}

                {/* ADD BUTTON */}
                <Pressable
                    style={styles.vaxAddBtn}
                    onPress={() => setShowAddVax(true)}
                >
                    <Ionicons name='add' size={14} color={colors.text2} />
                    <Text style={styles.vaxAddBtnText}>Thêm vaccine khác</Text>
                </Pressable>

                {/* NOTE */}
                <View style={styles.vaxNote}>
                    <Ionicons
                        name='information-circle-outline'
                        size={13}
                        color={colors.primary}
                    />
                    <Text style={styles.vaxNoteText}>
                        Dữ liệu theo{' '}
                        <Text style={{ fontWeight: '800' }}>
                            Bộ Y tế Việt Nam
                        </Text>
                        . Nhấn vào vaccine để xem chi tiết.
                    </Text>
                </View>
            </ScrollView>

            {/* ADD VACCINE SHEET */}
            <AddVaxSheet
                visible={showAddVax}
                onClose={() => setShowAddVax(false)}
            />
        </SafeAreaView>
    );
}

/* ═══════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════ */
function VaxSectionHeader({
    label,
    count,
    dotColor,
    countBg,
    countColor,
    countBorder,
}: {
    label: string;
    count: number;
    dotColor: string;
    countBg: string;
    countColor: string;
    countBorder: string;
}) {
    return (
        <View style={styles.vaxSecRow}>
            <View style={styles.vaxSecLeft}>
                <View
                    style={[styles.vaxSecDot, { backgroundColor: dotColor }]}
                />
                <Text style={styles.vaxSecLabel}>{label}</Text>
            </View>
            <Text
                style={[
                    styles.vaxSecCount,
                    {
                        backgroundColor: countBg,
                        color: countColor,
                        borderColor: countBorder,
                    },
                ]}
            >
                {count} loại
            </Text>
        </View>
    );
}

/* ═══════════════════════════════════
   VACCINE ROW (list item)
   ═══════════════════════════════════ */
function VaxRow({
    item,
    isLast,
    status,
    onPress,
}: {
    item: VaccineDetailItem;
    isLast: boolean;
    status: 'done' | 'soon' | 'pending';
    onPress: () => void;
}) {
    const done = doneMuiCount(item);
    const chipClass =
        status === 'done'
            ? styles.vaxChipDone
            : status === 'soon'
              ? styles.vaxChipSoon
              : styles.vaxChipPending;

    // For "soon" rows, find the next scheduled dose
    const scheduledDose =
        status === 'soon'
            ? item.doses.find((d) => d.scheduled && !d.date)
            : null;

    return (
        <Pressable
            style={[styles.vaxRow, !isLast && styles.vaxRowBorder]}
            onPress={onPress}
        >
            <View
                style={[
                    styles.vaxRowIcon,
                    {
                        backgroundColor:
                            status === 'done'
                                ? '#F0FDF4'
                                : status === 'soon'
                                  ? colors.primaryBg
                                  : done > 0
                                    ? '#FFFBEB'
                                    : '#FFF1F2',
                    },
                ]}
            >
                <Ionicons
                    name={
                        status === 'done'
                            ? 'checkmark-circle-outline'
                            : status === 'soon'
                              ? 'calendar-outline'
                              : 'alert-circle-outline'
                    }
                    size={14}
                    color={
                        status === 'done'
                            ? '#16A34A'
                            : status === 'soon'
                              ? colors.primary
                              : done > 0
                                ? '#D97706'
                                : '#E11D48'
                    }
                />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.vaxRowName}>
                    {item.name}
                    {item.abbr ? (
                        <Text style={styles.vaxRowSub}> ({item.abbr})</Text>
                    ) : null}
                </Text>
                <View style={styles.vaxRowMeta}>
                    <Text style={[styles.vaxChip, chipClass]}>
                        {done} / {item.total} mũi
                        {status === 'done' ? ' ✓' : ''}
                    </Text>
                    {status === 'soon' && (
                        <Text style={[styles.vaxChip, styles.vaxChipScheduled]}>
                            Đã lên lịch
                        </Text>
                    )}
                    {status === 'pending' && done === 0 && (
                        <Text style={styles.vaxChipLabel}>Chưa tiêm</Text>
                    )}
                    {status === 'pending' && done > 0 && (
                        <Text style={styles.vaxChipLabel}>
                            Còn thiếu {item.total - done}
                        </Text>
                    )}
                </View>
                {/* Scheduled date line for "soon" items */}
                {scheduledDose && (
                    <View style={styles.vaxRowSchedLine}>
                        <Ionicons
                            name='calendar-outline'
                            size={11}
                            color={colors.primary}
                        />
                        <Text style={styles.vaxRowSchedText}>
                            Mũi {scheduledDose.num} · {scheduledDose.scheduled}
                        </Text>
                    </View>
                )}
                {/* Dose dots */}
                <View style={styles.vaxDots}>
                    {Array.from({ length: item.total }, (_, i) => {
                        const isDone = i < done;
                        return (
                            <View
                                key={i}
                                style={[
                                    styles.vaxDotBar,
                                    {
                                        backgroundColor: isDone
                                            ? status === 'done'
                                                ? '#22C55E'
                                                : status === 'soon'
                                                  ? colors.primary
                                                  : '#F59E0B'
                                            : '#E2E8F0',
                                    },
                                ]}
                            />
                        );
                    })}
                </View>
            </View>
            <Ionicons name='chevron-forward' size={14} color={colors.text3} />
        </Pressable>
    );
}

/* ═══════════════════════════════════
   VACCINE DETAIL – FULL SCREEN
   ═══════════════════════════════════ */
function VaxDetailScreen({
    item,
    onBack,
}: {
    item: VaccineDetailItem;
    onBack: () => void;
}) {
    const [showAddDose, setShowAddDose] = useState(false);
    const [showSchedule, setShowSchedule] = useState(false);

    const done = doneMuiCount(item);
    const isComplete = done >= item.total;

    // Status badge
    let badgeText: string;
    let badgeBg: string;
    let badgeColor: string;
    let badgeBorder: string;
    if (isComplete) {
        badgeText = '✓ Hoàn thành';
        badgeBg = '#F0FDF4';
        badgeColor = '#16A34A';
        badgeBorder = '#BBF7D0';
    } else if (done > 0) {
        badgeText = `Còn thiếu ${item.total - done}`;
        badgeBg = '#FFFBEB';
        badgeColor = '#D97706';
        badgeBorder = '#FDE68A';
    } else {
        badgeText = 'Chưa tiêm';
        badgeBg = colors.bg;
        badgeColor = colors.text3;
        badgeBorder = colors.border;
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />

            {/* TOPBAR */}
            <View style={styles.subTopbar}>
                <Pressable style={styles.subBackBtn} onPress={onBack}>
                    <Ionicons
                        name='chevron-back'
                        size={16}
                        color={colors.text2}
                    />
                </Pressable>
                <Text style={styles.subTopbarTitle} numberOfLines={1}>
                    {item.name}
                    {item.abbr ? ` (${item.abbr})` : ''}
                </Text>
                <View style={{ width: 36 }} />
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* SUMMARY CARD */}
                <View style={styles.vdSummary}>
                    <View>
                        <Text style={styles.vdSummaryLabel}>TIẾN ĐỘ</Text>
                        <Text style={styles.vdSummaryProgress}>
                            {done} / {item.total} mũi
                        </Text>
                        <Text style={styles.vdSummarySub}>
                            {item.total} mũi khuyến nghị
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.vdStatusBadge,
                            {
                                backgroundColor: badgeBg,
                                borderColor: badgeBorder,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.vdStatusBadgeText,
                                { color: badgeColor },
                            ]}
                        >
                            {badgeText}
                        </Text>
                    </View>
                </View>

                {/* DOSE LIST */}
                <View style={styles.vaxListCard}>
                    {Array.from({ length: item.total }, (_, i) => {
                        const dose = item.doses.find((d) => d.num === i + 1);
                        const isDone =
                            dose?.date !== undefined && dose?.date !== null;
                        const isScheduled =
                            !isDone &&
                            dose?.scheduled !== undefined &&
                            dose?.scheduled !== null;

                        return (
                            <View
                                key={i}
                                style={[
                                    styles.vdDoseItem,
                                    i < item.total - 1 &&
                                        styles.vdDoseItemBorder,
                                ]}
                            >
                                {/* Dot icon */}
                                <View
                                    style={[
                                        styles.vdDoseDot,
                                        isDone && styles.vdDoseDotDone,
                                        isScheduled &&
                                            styles.vdDoseDotScheduled,
                                        !isDone &&
                                            !isScheduled &&
                                            styles.vdDoseDotEmpty,
                                    ]}
                                >
                                    <Ionicons
                                        name={
                                            isDone
                                                ? 'checkmark'
                                                : isScheduled
                                                  ? 'calendar-outline'
                                                  : 'ellipse-outline'
                                        }
                                        size={isDone || isScheduled ? 12 : 10}
                                        color={
                                            isDone
                                                ? '#16A34A'
                                                : isScheduled
                                                  ? colors.primary
                                                  : colors.text3
                                        }
                                    />
                                </View>

                                {/* Body */}
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.vdDoseLabel}>
                                        Mũi {i + 1}
                                    </Text>
                                    {isDone ? (
                                        <>
                                            <Text style={styles.vdDoseVal}>
                                                {dose!.date}
                                            </Text>
                                            {dose!.place ? (
                                                <Text
                                                    style={styles.vdDosePlace}
                                                >
                                                    {dose!.place}
                                                </Text>
                                            ) : null}
                                            <Text
                                                style={[
                                                    styles.vdDoseTag,
                                                    styles.vdDoseTagDone,
                                                ]}
                                            >
                                                Đã tiêm
                                            </Text>
                                        </>
                                    ) : isScheduled ? (
                                        <>
                                            <Text
                                                style={[
                                                    styles.vdDoseVal,
                                                    {
                                                        color: colors.primary,
                                                    },
                                                ]}
                                            >
                                                📅 {dose!.scheduled}
                                            </Text>
                                            {dose!.place ? (
                                                <Text
                                                    style={styles.vdDosePlace}
                                                >
                                                    {dose!.place}
                                                </Text>
                                            ) : null}
                                            <Text
                                                style={[
                                                    styles.vdDoseTag,
                                                    styles.vdDoseTagScheduled,
                                                ]}
                                            >
                                                Đã lên lịch
                                            </Text>
                                        </>
                                    ) : (
                                        <Text
                                            style={[
                                                styles.vdDoseVal,
                                                {
                                                    color: colors.text3,
                                                    fontStyle: 'italic',
                                                    fontSize: 13,
                                                },
                                            ]}
                                        >
                                            Chưa tiêm
                                        </Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* ACTION BUTTONS */}
                <View style={{ gap: 8 }}>
                    <Pressable
                        style={styles.vaxAddBtn}
                        onPress={() => setShowAddDose(true)}
                    >
                        <Ionicons name='add' size={14} color={colors.text2} />
                        <Text style={styles.vaxAddBtnText}>
                            Thêm mũi đã tiêm
                        </Text>
                    </Pressable>
                    <Pressable
                        style={styles.vdSchedBtn}
                        onPress={() => setShowSchedule(true)}
                    >
                        <Ionicons
                            name='calendar-outline'
                            size={14}
                            color={colors.primary}
                        />
                        <Text style={styles.vdSchedBtnText}>Đặt lịch tiêm</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* ADD DOSE SHEET */}
            <AddDoseSheet
                visible={showAddDose}
                onClose={() => setShowAddDose(false)}
                nextNum={Math.min(done + 1, item.total)}
            />

            {/* SCHEDULE DOSE SHEET */}
            <ScheduleDoseSheet
                visible={showSchedule}
                onClose={() => setShowSchedule(false)}
            />
        </SafeAreaView>
    );
}

/* ═══════════════════════════════════
   ADD DOSE BOTTOM SHEET
   ═══════════════════════════════════ */
function AddDoseSheet({
    visible,
    onClose,
    nextNum,
}: {
    visible: boolean;
    onClose: () => void;
    nextNum: number;
}) {
    const [doseNum, setDoseNum] = useState('');
    const [doseDate, setDoseDate] = useState(new Date());
    const [dosePlace, setDosePlace] = useState('');

    return (
        <Modal
            visible={visible}
            transparent
            animationType='fade'
            onRequestClose={onClose}
        >
            <Pressable style={shared.overlay} onPress={onClose}>
                <Pressable
                    style={styles.vaxSheet}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={shared.sheetHandle}>
                        <View style={shared.sheetBar} />
                    </View>
                    <View style={styles.vdSheetContent}>
                        <Text style={styles.vdSheetTitle}>
                            Thêm mũi đã tiêm
                        </Text>
                        <View style={{ gap: 10 }}>
                            <View>
                                <Text style={styles.vdFieldLabel}>
                                    Mũi số *
                                </Text>
                                <TextInput
                                    style={styles.vdFieldInput}
                                    placeholder={`VD: ${nextNum}`}
                                    placeholderTextColor={colors.text3}
                                    keyboardType='number-pad'
                                    value={doseNum}
                                    onChangeText={setDoseNum}
                                />
                            </View>
                            <View>
                                <Text style={styles.vdFieldLabel}>
                                    Ngày tiêm *
                                </Text>
                                <DateField
                                    value={doseDate}
                                    onChange={setDoseDate}
                                />
                            </View>
                            <View>
                                <Text style={styles.vdFieldLabel}>
                                    Nơi tiêm
                                </Text>
                                <TextInput
                                    style={styles.vdFieldInput}
                                    placeholder='VD: BV Chợ Rẫy'
                                    placeholderTextColor={colors.text3}
                                    value={dosePlace}
                                    onChangeText={setDosePlace}
                                />
                            </View>
                            {/* Photo upload placeholder */}
                            <Pressable style={styles.vdPhotoUpload}>
                                <Ionicons
                                    name='image-outline'
                                    size={16}
                                    color={colors.text3}
                                />
                                <Text style={styles.vdPhotoUploadText}>
                                    Ảnh sổ tiêm (tuỳ chọn)
                                </Text>
                            </Pressable>
                            <Pressable style={styles.vdSaveBtn}>
                                <LinearGradient
                                    colors={['#2563EB', '#0D9488']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.vdSaveBtnGrad}
                                >
                                    <Text style={styles.vdSaveBtnText}>
                                        Lưu mũi tiêm
                                    </Text>
                                </LinearGradient>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

/* ═══════════════════════════════════
   SCHEDULE DOSE BOTTOM SHEET
   ═══════════════════════════════════ */
function ScheduleDoseSheet({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}) {
    const [schedDate, setSchedDate] = useState(new Date());
    const [schedPlace, setSchedPlace] = useState('');
    const [schedRemind, setSchedRemind] = useState('3 ngày');

    return (
        <Modal
            visible={visible}
            transparent
            animationType='fade'
            onRequestClose={onClose}
        >
            <Pressable style={shared.overlay} onPress={onClose}>
                <Pressable
                    style={styles.vaxSheet}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={shared.sheetHandle}>
                        <View style={shared.sheetBar} />
                    </View>
                    <View style={styles.vdSheetContent}>
                        <Text style={styles.vdSheetTitle}>Đặt lịch tiêm</Text>
                        <View style={{ gap: 10 }}>
                            <View>
                                <Text style={styles.vdFieldLabel}>
                                    Ngày tiêm *
                                </Text>
                                <DateField
                                    value={schedDate}
                                    onChange={setSchedDate}
                                />
                            </View>
                            <View>
                                <Text style={styles.vdFieldLabel}>
                                    Cơ sở y tế
                                </Text>
                                <TextInput
                                    style={styles.vdFieldInput}
                                    placeholder='VD: BV Chợ Rẫy'
                                    placeholderTextColor={colors.text3}
                                    value={schedPlace}
                                    onChangeText={setSchedPlace}
                                />
                            </View>
                            <View>
                                <Text style={styles.vdFieldLabel}>
                                    Nhắc trước
                                </Text>
                                <View style={styles.vdRemindRow}>
                                    {['1 ngày', '3 ngày', '1 tuần'].map(
                                        (opt) => (
                                            <Pressable
                                                key={opt}
                                                style={[
                                                    styles.vdRemindChip,
                                                    schedRemind === opt &&
                                                        styles.vdRemindChipActive,
                                                ]}
                                                onPress={() =>
                                                    setSchedRemind(opt)
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.vdRemindChipText,
                                                        schedRemind === opt &&
                                                            styles.vdRemindChipTextActive,
                                                    ]}
                                                >
                                                    {opt}
                                                </Text>
                                            </Pressable>
                                        ),
                                    )}
                                </View>
                            </View>
                            <Pressable style={styles.vdSaveBtn}>
                                <LinearGradient
                                    colors={['#2563EB', '#0D9488']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.vdSaveBtnGrad}
                                >
                                    <Text style={styles.vdSaveBtnText}>
                                        Lưu lịch tiêm
                                    </Text>
                                </LinearGradient>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

/* ═══════════════════════════════════
   ADD VACCINE BOTTOM SHEET
   ═══════════════════════════════════ */
function AddVaxSheet({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}) {
    const [vaxName, setVaxName] = useState('');
    const [vaxTotal, setVaxTotal] = useState('');

    return (
        <Modal
            visible={visible}
            transparent
            animationType='fade'
            onRequestClose={onClose}
        >
            <Pressable style={shared.overlay} onPress={onClose}>
                <Pressable
                    style={styles.vaxSheet}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={shared.sheetHandle}>
                        <View style={shared.sheetBar} />
                    </View>
                    <View style={styles.vdSheetContent}>
                        <Text style={styles.vdSheetTitle}>
                            Thêm vaccine mới
                        </Text>
                        <View style={{ gap: 10 }}>
                            <View>
                                <Text style={styles.vdFieldLabel}>
                                    Tên vaccine *
                                </Text>
                                <TextInput
                                    style={styles.vdFieldInput}
                                    placeholder='VD: Viêm gan B, Uốn ván…'
                                    placeholderTextColor={colors.text3}
                                    value={vaxName}
                                    onChangeText={setVaxName}
                                />
                            </View>
                            <View>
                                <Text style={styles.vdFieldLabel}>
                                    Tổng số mũi khuyến nghị
                                </Text>
                                <TextInput
                                    style={styles.vdFieldInput}
                                    placeholder='VD: 3'
                                    placeholderTextColor={colors.text3}
                                    keyboardType='number-pad'
                                    value={vaxTotal}
                                    onChangeText={setVaxTotal}
                                />
                            </View>
                            <Pressable style={styles.vdSaveBtn}>
                                <LinearGradient
                                    colors={['#2563EB', '#0D9488']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.vdSaveBtnGrad}
                                >
                                    <Text style={styles.vdSaveBtnText}>
                                        Thêm vaccine
                                    </Text>
                                </LinearGradient>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
