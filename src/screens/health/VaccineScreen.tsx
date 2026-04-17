import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StatusBar,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Circle,
    Defs,
    Stop,
    Svg,
    LinearGradient as SvgLinearGradient,
} from 'react-native-svg';
import { appointmentRemindersService } from '@/src/services/appointmentReminders.services';
import { familiesServices } from '@/src/services/families.services';
import { styles } from './styles';
import type { AttachmentUploadItem } from '../../components/ui';
import { AttachmentUploadBlock, DateField } from '../../components/ui';
import { VACCINE_DETAILS } from '../../data/health-data';
import { shared } from '../../styles/shared';
import { colors } from '../../styles/tokens';
import type { VaccineDetailItem, VaccineDose } from '../../types/health';

interface Props {
    onClose?: () => void;
}

type VaxView = 'list' | 'detail';

function doneMuiCount(v: VaccineDetailItem) {
    return v.doses.filter((d: VaccineDose) => d.date).length;
}

export default function VaccineScreen({ onClose }: Props): React.JSX.Element {
    const [apiReminderCount, setApiReminderCount] = useState<number | null>(
        null,
    );

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const fams = await familiesServices.getMyFamilies();
                const list = Array.isArray(fams)
                    ? fams
                    : Array.isArray((fams as { data?: unknown })?.data)
                      ? (fams as { data: unknown[] }).data
                      : [];
                const first = list[0] as {
                    members?: { profile?: { id?: string } }[];
                };
                const pid = first?.members?.[0]?.profile?.id;
                if (!pid) return;
                const rows =
                    await appointmentRemindersService.listForProfile(pid);
                if (!cancelled) setApiReminderCount(rows.length);
            } catch {
                if (!cancelled) setApiReminderCount(null);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const [view, setView] = useState<VaxView>('list');
    const [detailVax, setDetailVax] = useState<VaccineDetailItem | null>(null);
    const [showAddVax, setShowAddVax] = useState(false);
    const [showVaxInfo, setShowVaxInfo] = useState(false);

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
    const donutSize = 62;
    const donutStroke = 6;
    const donutRadius = (donutSize - donutStroke) / 2;
    const donutCircumference = 2 * Math.PI * donutRadius;
    const donutOffset =
        donutCircumference -
        (Math.max(0, Math.min(100, pct)) / 100) * donutCircumference;

    const complete = VACCINE_DETAILS.filter((v) => doneMuiCount(v) >= v.total);
    const soon = VACCINE_DETAILS.filter(
        (v) =>
            doneMuiCount(v) < v.total &&
            v.doses.some((d: VaccineDose) => d.scheduled && !d.date),
    );
    const soonIds = new Set(soon.map((v) => v.id));
    const incomplete = VACCINE_DETAILS.filter(
        (v) => doneMuiCount(v) < v.total && !soonIds.has(v.id),
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />

            {/* TOP BAR */}
            <View style={[styles.subTopbar, styles.vaxSubTopbar]}>
                <Pressable
                    style={[styles.subBackBtn, styles.vaxBackBtn]}
                    onPress={onClose}
                >
                    <Ionicons
                        name='chevron-back'
                        size={18}
                        color={colors.text2}
                    />
                </Pressable>
                <Text style={styles.subTopbarTitle}>Tiêm chủng</Text>
                <View style={styles.vaxTopbarActions}>
                    <Pressable
                        style={styles.vaxAddIconBtn}
                        onPress={() => setShowAddVax(true)}
                    >
                        <Ionicons name='add' size={18} color={colors.primary} />
                    </Pressable>
                    <Pressable
                        style={styles.vaxInfoBtn}
                        onPress={() => setShowVaxInfo((current) => !current)}
                        onHoverIn={() => setShowVaxInfo(true)}
                        onHoverOut={() => setShowVaxInfo(false)}
                    >
                        <Ionicons
                            name='information-circle-outline'
                            size={18}
                            color={colors.primary}
                        />
                    </Pressable>
                    {showVaxInfo ? (
                        <View style={styles.vaxInfoTooltip}>
                            <View style={styles.vaxInfoTooltipBody}>
                                <View style={styles.vaxInfoTooltipIconWrap}>
                                    <Ionicons
                                        name='information-circle-outline'
                                        size={14}
                                        color={colors.primary}
                                    />
                                </View>
                                <Text style={styles.vaxInfoTooltipText}>
                                    Theo khuyến nghị của{' '}
                                    <Text
                                        style={styles.vaxInfoTooltipTextStrong}
                                    >
                                        Bộ Y tế Việt Nam
                                    </Text>
                                    .{'\n'}
                                    Nhấn vào từng mũi tiêm để xem lịch sử và chi
                                    tiết mũi tiêm.
                                </Text>
                            </View>
                        </View>
                    ) : null}
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {apiReminderCount !== null ? (
                    <Text
                        style={{
                            fontSize: 12,
                            color: colors.text3,
                            marginBottom: 8,
                        }}
                    >
                        Lịch hẹn nhắc (API): {apiReminderCount}
                    </Text>
                ) : null}
                {/* PROGRESS HERO */}
                <View style={styles.vaxHero}>
                    <View style={styles.vaxHeroContent}>
                        {/* Donut */}
                        <View style={styles.vaxDonut}>
                            <View style={styles.vaxDonutTrack}>
                                <Svg
                                    width={donutSize}
                                    height={donutSize}
                                    style={styles.vaxDonutSvg}
                                >
                                    <Defs>
                                        <SvgLinearGradient
                                            id='vaxHeroDonutGradient'
                                            x1='0%'
                                            y1='0%'
                                            x2='100%'
                                            y2='100%'
                                        >
                                            <Stop
                                                offset='0%'
                                                stopColor='#26C89A'
                                            />
                                            <Stop
                                                offset='100%'
                                                stopColor='#0A8F74'
                                            />
                                        </SvgLinearGradient>
                                    </Defs>
                                    <Circle
                                        cx={donutSize / 2}
                                        cy={donutSize / 2}
                                        r={donutRadius}
                                        stroke='#2F3A3B'
                                        strokeWidth={donutStroke}
                                        fill='none'
                                    />
                                    <Circle
                                        cx={donutSize / 2}
                                        cy={donutSize / 2}
                                        r={donutRadius}
                                        stroke='url(#vaxHeroDonutGradient)'
                                        strokeWidth={donutStroke}
                                        fill='none'
                                        strokeLinecap='round'
                                        strokeDasharray={`${donutCircumference}, ${donutCircumference}`}
                                        strokeDashoffset={donutOffset}
                                        transform={`rotate(-90 ${donutSize / 2} ${donutSize / 2})`}
                                    />
                                </Svg>
                                <Text style={styles.vaxDonutText}>{pct}%</Text>
                            </View>
                        </View>
                        <View style={styles.vaxHeroBody}>
                            <Text style={styles.vaxHeroSup}>Hoàn thành</Text>
                            <View style={styles.vaxHeroCountRow}>
                                <Text style={styles.vaxHeroNum}>
                                    {totalDone}
                                </Text>
                                <Text style={styles.vaxHeroNumSub}>
                                    / {totalMui} mũi
                                </Text>
                            </View>
                            <View style={styles.vaxHeroPendingPill}>
                                <View style={styles.vaxHeroPendingDot} />
                                <Text style={styles.vaxHeroPendingText}>
                                    {pending} mũi chưa hoàn thành
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* SẮP TIÊM */}
                {soon.length > 0 && (
                    <>
                        <VaxSectionHeader
                            label='Sắp tiêm'
                            icon='calendar-outline'
                            dotColor={colors.primary}
                            countBg={colors.primaryBg}
                            count={soon.length}
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
                            icon='alert-circle-outline'
                            dotColor={colors.warning}
                            countBg={colors.warningBg}
                            count={incomplete.length}
                            countColor={colors.warning}
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

                {/* ĐÃ TIÊM ĐỦ */}
                {complete.length > 0 && (
                    <>
                        <VaxSectionHeader
                            label='Đã tiêm đủ'
                            icon='checkmark-outline'
                            dotColor={colors.success}
                            countBg={colors.successBg}
                            count={complete.length}
                            countColor={colors.success}
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
    icon,
    dotColor,
    countBg,
    countColor,
    countBorder,
}: {
    label: string;
    count: number;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    dotColor: string;
    countBg: string;
    countColor: string;
    countBorder: string;
}) {
    return (
        <View style={styles.vaxSecRow}>
            <View style={styles.vaxSecLeft}>
                <View
                    style={[
                        styles.vaxSecIconWrap,
                        { backgroundColor: countBg, borderColor: countBorder },
                    ]}
                >
                    <Ionicons name={icon} size={13} color={dotColor} />
                </View>
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
            ? item.doses.find((d: VaccineDose) => d.scheduled && !d.date)
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
                                ? colors.successBg
                                : status === 'soon'
                                  ? colors.primaryBg
                                  : done > 0
                                    ? colors.warningBg
                                    : colors.dangerBg,
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
                            ? colors.success
                            : status === 'soon'
                              ? colors.primary
                              : done > 0
                                ? colors.warning
                                : colors.danger
                    }
                />
            </View>
            <View style={styles.vaxRowBody}>
                <Text style={styles.vaxRowName} numberOfLines={1}>
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
                    <View style={styles.vaxRowMetaSecondary}>
                        <Text style={styles.vaxChipLabel}>
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
                                                ? colors.success
                                                : status === 'soon'
                                                  ? colors.primary
                                                  : colors.warning
                                            : colors.border,
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
        badgeBg = colors.successBg;
        badgeColor = colors.success;
        badgeBorder = 'rgba(22,163,74,0.3)';
    } else if (done > 0) {
        badgeText = `Còn thiếu ${item.total - done}`;
        badgeBg = colors.warningBg;
        badgeColor = colors.warning;
        badgeBorder = 'rgba(217,119,6,0.35)';
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
            <View style={[styles.subTopbar, styles.vaxDetailTopbar]}>
                <Pressable
                    style={[styles.subBackBtn, styles.vaxDetailBackBtn]}
                    onPress={onBack}
                >
                    <Ionicons
                        name='chevron-back'
                        size={17}
                        color={colors.text2}
                    />
                </Pressable>
                <Text style={styles.vaxDetailTopbarTitle} numberOfLines={1}>
                    {item.name}
                    {item.abbr ? ` (${item.abbr})` : ''}
                </Text>
                <Pressable
                    style={styles.vaxDetailAddBtn}
                    onPress={() => setShowAddDose(true)}
                >
                    <Ionicons name='add' size={17} color={colors.primary} />
                </Pressable>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* SUMMARY CARD */}
                <View style={styles.vdSummary}>
                    <View>
                        <Text style={styles.vdSummaryLabel}>Tiến độ</Text>
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
                <View style={styles.vdDoseCard}>
                    {Array.from({ length: item.total }, (_, i) => {
                        const dose = item.doses.find(
                            (d: VaccineDose) => d.num === i + 1,
                        );
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
                                                ? colors.success
                                                : isScheduled
                                                  ? colors.primary
                                                  : colors.text3
                                        }
                                    />
                                </View>

                                {/* Body */}
                                <View style={styles.vdDoseBody}>
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
                        style={styles.vdSchedBtn}
                        onPress={() => setShowSchedule(true)}
                    >
                        <Ionicons
                            name='calendar-outline'
                            size={14}
                            color={colors.text2}
                        />
                        <Text style={styles.vdSchedBtnText}>Đặt lịch tiêm</Text>
                    </Pressable>
                </View>
            </ScrollView>

            <AddDoseSheet
                visible={showAddDose}
                onClose={() => setShowAddDose(false)}
                nextNum={Math.min(done + 1, item.total)}
                vaxName={item.name}
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
    vaxName,
}: {
    visible: boolean;
    onClose: () => void;
    nextNum: number;
    vaxName?: string;
}) {
    const [doseNum, setDoseNum] = useState(nextNum.toString());
    const [doseDate, setDoseDate] = useState(new Date());
    const [dosePlace, setDosePlace] = useState('');
    const [reaction, setReaction] = useState('');
    const [attachments, setAttachments] = useState<AttachmentUploadItem[]>([]);

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType='slide'
            onRequestClose={onClose}
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
                <StatusBar
                    barStyle='dark-content'
                    backgroundColor={colors.card}
                />

                <View style={{ flex: 1, backgroundColor: colors.bg }}>
                    {/* TOP BAR */}
                    <View
                        style={[
                            styles.subTopbar,
                            {
                                justifyContent: 'flex-start',
                                gap: 12,
                            },
                        ]}
                    >
                        <Pressable
                            style={[styles.subBackBtn, styles.vaxBackBtn]}
                            onPress={onClose}
                        >
                            <Ionicons
                                name='chevron-back'
                                size={18}
                                color={colors.text2}
                            />
                        </Pressable>
                        <Text style={[styles.subTopbarTitle, { flex: 0 }]}>
                            Thêm mũi tiêm
                        </Text>
                    </View>

                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{
                            padding: 20,
                            paddingBottom: 176,
                        }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps='handled'
                    >
                        {/* Tên vaccine */}
                        <View style={styles.arGroup}>
                            <Text style={styles.arLabel}>Tên vaccine</Text>
                            <TextInput
                                style={styles.arInput}
                                placeholder='VD: COVID-19 (Pfizer)'
                                placeholderTextColor={colors.text3}
                                value={vaxName}
                                editable={false}
                                selectTextOnFocus={false}
                            />
                        </View>

                        {/* Mũi thứ */}
                        <View style={styles.arGroup}>
                            <Text style={styles.arLabel}>Mũi thứ</Text>
                            <TextInput
                                style={styles.arInput}
                                placeholder='VD: 3'
                                placeholderTextColor={colors.text3}
                                keyboardType='number-pad'
                                value={doseNum}
                                onChangeText={setDoseNum}
                            />
                        </View>

                        {/* Ngày tiêm */}
                        <View style={styles.arGroup}>
                            <Text style={styles.arLabel}>Ngày tiêm</Text>
                            <DateField
                                value={doseDate}
                                onChange={setDoseDate}
                            />
                        </View>

                        {/* Nơi tiêm */}
                        <View style={styles.arGroup}>
                            <Text style={styles.arLabel}>Nơi tiêm</Text>
                            <View style={styles.arInputIcon}>
                                <Ionicons
                                    name='home-outline'
                                    size={15}
                                    color={colors.text3}
                                />
                                <TextInput
                                    style={styles.arInputBare}
                                    placeholder='VD: VNVC Quận 1'
                                    placeholderTextColor={colors.text3}
                                    value={dosePlace}
                                    onChangeText={setDosePlace}
                                />
                            </View>
                        </View>

                        {/* Phản ứng sau tiêm */}
                        <View style={styles.arGroup}>
                            <Text style={styles.arLabel}>
                                Phản ứng sau tiêm
                            </Text>
                            <TextInput
                                style={styles.arTextarea}
                                placeholder='VD: Sốt nhẹ, đau tay 1 ngày...'
                                placeholderTextColor={colors.text3}
                                value={reaction}
                                onChangeText={setReaction}
                                multiline
                                numberOfLines={2}
                            />
                        </View>

                        <View style={styles.arGroup}>
                            <View
                                style={[
                                    styles.arDivider,
                                    { marginVertical: 24 },
                                ]}
                            />
                            <AttachmentUploadBlock
                                attachments={attachments}
                                onChange={setAttachments}
                            />
                        </View>
                    </ScrollView>

                    {/* SAVE BUTTON */}
                    <View style={styles.arSaveWrap}>
                        <Pressable
                            onPress={onClose}
                            style={styles.vdSaveBtnSolid}
                        >
                            <Text style={styles.vdSaveBtnText}>
                                Lưu mũi tiêm
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
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
    const [schedRemindOn, setSchedRemindOn] = useState(true);

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
                                <View style={styles.vdRemindSwitchCard}>
                                    <View style={styles.vdRemindSwitchContent}>
                                        <Text style={styles.vdRemindSwitchText}>
                                            Nhắc nhở trước 1 ngày
                                        </Text>
                                        <Text style={styles.vdRemindSwitchHint}>
                                            Gửi thông báo trước lịch tiêm 24 giờ
                                        </Text>
                                    </View>
                                    <Switch
                                        value={schedRemindOn}
                                        onValueChange={setSchedRemindOn}
                                        trackColor={{
                                            false: '#E5E7EB',
                                            true: colors.success,
                                        }}
                                        thumbColor='#fff'
                                        ios_backgroundColor='#E5E7EB'
                                    />
                                </View>
                            </View>
                            <Pressable style={styles.vdSaveBtn}>
                                <View style={styles.vdSaveBtnSolid}>
                                    <Text style={styles.vdSaveBtnText}>
                                        Lưu lịch tiêm
                                    </Text>
                                </View>
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
                                    Tên vaccine
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
                            <Pressable
                                style={[
                                    styles.vdSaveBtn,
                                    styles.vdAddVaxSaveBtnSpacing,
                                ]}
                            >
                                <View style={styles.vdSaveBtnSolid}>
                                    <Text style={styles.vdSaveBtnText}>
                                        Thêm vaccine
                                    </Text>
                                </View>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
