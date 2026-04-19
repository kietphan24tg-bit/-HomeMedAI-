import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Line, Path, Svg, Circle as SvgCircle } from 'react-native-svg';
import type { MetricData, MetricReading } from '@/src/data/metrics-data';
import { useMeOverviewQuery } from '@/src/features/me/queries';
import {
    moderateScale,
    scale,
    scaleFont,
    verticalScale,
} from '@/src/styles/responsive';
import { formSystem } from '@/src/styles/shared';
import { colors, shadows, typography } from '@/src/styles/tokens';

const METRIC_TABS = [
    { label: 'Huyết áp', id: 'bp' },
    { label: 'Cân nặng', id: 'weight' },
    { label: 'Đường huyết', id: 'glucose' },
];

type MetricType = 'bp' | 'weight' | 'glucose';

const METRIC_META: Record<
    MetricType,
    Pick<MetricData, 'id' | 'label' | 'unit' | 'icon' | 'iconColor'>
> = {
    bp: {
        id: 'bp',
        label: 'Huyết áp',
        unit: 'mmHg',
        icon: 'water-outline',
        iconColor: colors.danger,
    },
    weight: {
        id: 'weight',
        label: 'Cân nặng',
        unit: 'kg',
        icon: 'barbell-outline',
        iconColor: colors.primary,
    },
    glucose: {
        id: 'glucose',
        label: 'Đường huyết',
        unit: 'mmol/L',
        icon: 'document-text-outline',
        iconColor: '#D97706',
    },
};

function emptyMetricData(metric: MetricType): MetricData {
    const meta = METRIC_META[metric];

    return {
        ...meta,
        latestValue: '--',
        latestDate: 'Chưa có dữ liệu',
        latestStatus: 'Chưa có dữ liệu',
        statusColor: colors.text3,
        badgeBg: colors.card,
        badgeBorder: colors.border,
        readings: [],
        chartData: {
            dates: [],
        },
    };
}

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object'
        ? (value as Record<string, unknown>)
        : {};
}

function recordList(value: unknown): Record<string, unknown>[] {
    return Array.isArray(value)
        ? value.filter(
              (item): item is Record<string, unknown> =>
                  !!item && typeof item === 'object',
          )
        : [];
}

function numberValue(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}

function formatMeasuredDate(value: unknown): {
    dateFull: string;
    latestDate: string;
    date: string;
    time: string;
} {
    const raw = typeof value === 'string' ? value : undefined;
    const date = raw ? new Date(raw) : new Date();
    const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
    const day = String(safeDate.getDate()).padStart(2, '0');
    const month = String(safeDate.getMonth() + 1).padStart(2, '0');
    const year = safeDate.getFullYear();
    const time = `${String(safeDate.getHours()).padStart(2, '0')}:${String(
        safeDate.getMinutes(),
    ).padStart(2, '0')}`;

    return {
        dateFull: `${day}/${month}/${year} · ${time}`,
        latestDate: `${day}/${month}/${year} ${time}`,
        date: `${day}/${month}`,
        time,
    };
}

function getMetricStatus(metric: MetricType, row: Record<string, unknown>) {
    if (metric === 'bp') {
        const systolic = numberValue(row.systolic) ?? 0;
        const diastolic = numberValue(row.diastolic) ?? 0;
        if (systolic >= 130 || diastolic >= 85) {
            return {
                label: 'Cao',
                latestLabel: 'Hơi cao',
                color: colors.danger,
                bg: '#FEF2F2',
                border: '#FECACA',
                icon: 'warning',
                iconColor: colors.warning,
            };
        }
    }

    if (metric === 'glucose') {
        const glucose = numberValue(row.glucose_mmol_l) ?? 0;
        if (glucose >= 6) {
            return {
                label: 'Cao',
                latestLabel: 'Cao',
                color: colors.danger,
                bg: '#FEF2F2',
                border: '#FECACA',
                icon: 'warning',
                iconColor: colors.warning,
            };
        }
    }

    return {
        label: 'Bình thường',
        latestLabel: 'Bình thường',
        color: colors.success,
        bg: '#F0FDF4',
        border: '#BBF7D0',
        icon: 'checkmark',
        iconColor: colors.success,
    };
}

function metricValue(metric: MetricType, row: Record<string, unknown>): string {
    if (metric === 'bp') {
        return `${numberValue(row.systolic) ?? '--'}/${
            numberValue(row.diastolic) ?? '--'
        }`;
    }

    if (metric === 'weight') {
        return String(numberValue(row.weight_kg) ?? '--');
    }

    return String(numberValue(row.glucose_mmol_l) ?? '--');
}

function buildMetricDataFromHealthProfile(
    metric: MetricType,
    healthProfile: unknown,
): MetricData | null {
    const rows = recordList(asRecord(healthProfile).health_metrics)
        .filter((row) => row.metric_type === metric)
        .sort((a, b) => {
            const aTime = new Date(String(a.measured_at ?? '')).getTime();
            const bTime = new Date(String(b.measured_at ?? '')).getTime();
            return (
                (Number.isFinite(bTime) ? bTime : 0) -
                (Number.isFinite(aTime) ? aTime : 0)
            );
        });

    if (!rows.length) return null;

    const meta = METRIC_META[metric];
    const readings: MetricReading[] = rows.map((row) => {
        const status = getMetricStatus(metric, row);
        const measured = formatMeasuredDate(row.measured_at);

        return {
            dateFull: measured.dateFull,
            date: measured.date,
            time: measured.time,
            value: metricValue(metric, row),
            status: typeof row.status === 'string' ? row.status : status.label,
            statusColor: status.color,
            badgeBg: status.bg,
            badgeBorder: status.border,
            icon: status.icon,
            iconColor: status.iconColor,
        };
    });
    const latest = rows[0];
    const latestStatus = getMetricStatus(metric, latest);
    const latestMeasured = formatMeasuredDate(latest.measured_at);
    const chartRows = [...rows].reverse().slice(-6);

    return {
        ...meta,
        latestValue: metricValue(metric, latest),
        latestDate: latestMeasured.latestDate,
        latestStatus:
            typeof latest.status === 'string'
                ? latest.status
                : latestStatus.latestLabel,
        statusColor: latestStatus.color,
        badgeBg: latestStatus.bg,
        badgeBorder: latestStatus.border,
        readings,
        chartData:
            metric === 'bp'
                ? {
                      systolic: chartRows
                          .map((row) => numberValue(row.systolic))
                          .filter(
                              (value): value is number => value !== undefined,
                          ),
                      diastolic: chartRows
                          .map((row) => numberValue(row.diastolic))
                          .filter(
                              (value): value is number => value !== undefined,
                          ),
                      dates: chartRows.map(
                          (row) => formatMeasuredDate(row.measured_at).date,
                      ),
                  }
                : {
                      values: chartRows
                          .map((row) =>
                              metric === 'weight'
                                  ? numberValue(row.weight_kg)
                                  : numberValue(row.glucose_mmol_l),
                          )
                          .filter(
                              (value): value is number => value !== undefined,
                          ),
                      dates: chartRows.map(
                          (row) => formatMeasuredDate(row.measured_at).date,
                      ),
                  },
    };
}

/**
 * Chart data generator for different metric types
 */
function renderChart(tab: string, metricData: MetricData) {
    if (tab === 'bp') {
        const systolic = metricData.chartData.systolic ?? [];
        const diastolic = metricData.chartData.diastolic ?? [];

        if (!systolic.length || !diastolic.length) {
            return (
                <Svg width='100%' height='108' viewBox='0 0 340 120'>
                    <Line
                        x1='10'
                        y1='20'
                        x2='330'
                        y2='20'
                        stroke='#E2E8F0'
                        strokeWidth='1'
                    />
                    <Line
                        x1='10'
                        y1='50'
                        x2='330'
                        y2='50'
                        stroke='#E2E8F0'
                        strokeWidth='1'
                    />
                    <Line
                        x1='10'
                        y1='80'
                        x2='330'
                        y2='80'
                        stroke='#E2E8F0'
                        strokeWidth='1'
                    />
                </Svg>
            );
        }

        const maxSys = Math.max(...systolic);
        const minSys = Math.min(...systolic);
        const maxDias = Math.max(...diastolic);
        const minDias = Math.min(...diastolic);
        const sysRange = Math.max(maxSys - minSys, 1);
        const diasRange = Math.max(maxDias - minDias, 1);

        const sysScale = (val: number) =>
            100 - ((val - minSys) / sysRange) * 60;
        const diasScale = (val: number) =>
            100 - ((val - minDias) / diasRange) * 30 + 40;

        const sysPaths = systolic
            .map((val, i) => `${40 + i * 65} ${sysScale(val)}`)
            .join(' L ');
        const diasPaths = diastolic
            .map((val, i) => `${40 + i * 65} ${diasScale(val)}`)
            .join(' L ');

        return (
            <Svg width='100%' height='108' viewBox='0 0 340 120'>
                <Line
                    x1='10'
                    y1='20'
                    x2='330'
                    y2='20'
                    stroke='#E2E8F0'
                    strokeWidth='1'
                />
                <Line
                    x1='10'
                    y1='50'
                    x2='330'
                    y2='50'
                    stroke='#E2E8F0'
                    strokeWidth='1'
                />
                <Line
                    x1='10'
                    y1='80'
                    x2='330'
                    y2='80'
                    stroke='#E2E8F0'
                    strokeWidth='1'
                />

                <Path
                    d={`M ${sysPaths}`}
                    stroke={colors.danger}
                    strokeWidth='2'
                    fill='none'
                />
                <Path
                    d={`M ${diasPaths}`}
                    stroke='#FCA5A5'
                    strokeWidth='2'
                    fill='none'
                />

                {systolic.map((val, i) => (
                    <SvgCircle
                        key={`sys-${i}`}
                        cx={40 + i * 65}
                        cy={sysScale(val)}
                        r='4'
                        fill={colors.danger}
                    />
                ))}
                {diastolic.map((val, i) => (
                    <SvgCircle
                        key={`dias-${i}`}
                        cx={40 + i * 65}
                        cy={diasScale(val)}
                        r='4'
                        fill='#FFF'
                        stroke='#FCA5A5'
                        strokeWidth='2'
                    />
                ))}
            </Svg>
        );
    } else {
        const values = metricData.chartData.values ?? [];

        if (!values.length) {
            return (
                <Svg width='100%' height='108' viewBox='0 0 340 120'>
                    <Line
                        x1='10'
                        y1='20'
                        x2='330'
                        y2='20'
                        stroke='#E2E8F0'
                        strokeWidth='1'
                    />
                    <Line
                        x1='10'
                        y1='50'
                        x2='330'
                        y2='50'
                        stroke='#E2E8F0'
                        strokeWidth='1'
                    />
                    <Line
                        x1='10'
                        y1='80'
                        x2='330'
                        y2='80'
                        stroke='#E2E8F0'
                        strokeWidth='1'
                    />
                </Svg>
            );
        }
        const maxVal = Math.max(...values);
        const minVal = Math.min(...values);
        const valRange = Math.max(maxVal - minVal, 1);
        const valScale = (val: number) =>
            100 - ((val - minVal) / valRange) * 60;

        const paths = values
            .map((val, i) => `${40 + i * 65} ${valScale(val)}`)
            .join(' L ');

        return (
            <Svg width='100%' height='108' viewBox='0 0 340 120'>
                <Line
                    x1='10'
                    y1='20'
                    x2='330'
                    y2='20'
                    stroke='#E2E8F0'
                    strokeWidth='1'
                />
                <Line
                    x1='10'
                    y1='50'
                    x2='330'
                    y2='50'
                    stroke='#E2E8F0'
                    strokeWidth='1'
                />
                <Line
                    x1='10'
                    y1='80'
                    x2='330'
                    y2='80'
                    stroke='#E2E8F0'
                    strokeWidth='1'
                />

                <Path
                    d={`M ${paths}`}
                    stroke={colors.primary}
                    strokeWidth='2'
                    fill='none'
                />
                {values.map((val, i) => (
                    <SvgCircle
                        key={`val-${i}`}
                        cx={40 + i * 65}
                        cy={valScale(val)}
                        r='4'
                        fill={colors.primary}
                    />
                ))}
            </Svg>
        );
    }
}

interface MetricsHistoryScreenProps {
    memberName?: string;
    hideAddButton?: boolean;
    onAddNew?: () => void;
    onExportPDF?: (metricId: string) => void;
}

/**
 * Standalone Metrics History Screen (C3c)
 * Shows health metrics over time with tabs for different metric types
 */
export default function MetricsHistoryScreen({
    memberName = 'Nguyễn Thị Bình',
    hideAddButton = false,
    onAddNew,
    onExportPDF,
}: MetricsHistoryScreenProps): React.JSX.Element {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { data: meOverview } = useMeOverviewQuery();

    const initialTab = (params.metric as string) || 'bp';
    const [tab, setTab] = useState(initialTab);
    const activeMetric =
        tab === 'weight' || tab === 'glucose' || tab === 'bp' ? tab : 'bp';
    const profile = asRecord(meOverview?.profile);
    const displayMemberName =
        typeof profile.full_name === 'string' && profile.full_name.trim()
            ? profile.full_name.trim()
            : memberName;

    const metricData = useMemo(
        () =>
            buildMetricDataFromHealthProfile(
                activeMetric,
                meOverview?.health_profile,
            ) ?? emptyMetricData(activeMetric),
        [activeMetric, meOverview?.health_profile],
    );
    const hasMetricData = metricData.readings.length > 0;

    const handleAddNew = () => {
        if (onAddNew) {
            onAddNew();
        } else {
            router.push({
                pathname: '/health/metrics-input',
                params: { metric: tab },
            } as any);
        }
    };

    const handleExport = () => {
        if (onExportPDF) {
            onExportPDF(tab);
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
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons
                        name='chevron-back'
                        size={18}
                        color={colors.text2}
                    />
                </Pressable>
                <View style={styles.topbarCenter}>
                    <Text style={styles.topbarTitle}>Chỉ số sức khỏe</Text>
                    <Text style={styles.topbarSubtitle}>
                        {displayMemberName}
                    </Text>
                </View>
                <Pressable style={styles.exportBtn} onPress={handleExport}>
                    <MaterialCommunityIcons
                        name='file-pdf-box'
                        size={20}
                        color={colors.primary}
                    />
                </Pressable>
            </View>

            {/* TABS */}
            <View style={styles.tabContainer}>
                {METRIC_TABS.map((t) => {
                    const isActive = tab === t.id;
                    return (
                        <Pressable
                            key={t.id}
                            style={[styles.tab, isActive && styles.tabActive]}
                            onPress={() => setTab(t.id)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    isActive && styles.tabTextActive,
                                ]}
                            >
                                {t.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <ScrollView
                style={{ flex: 1, backgroundColor: colors.bg }}
                contentContainerStyle={{ padding: 14, paddingBottom: 88 }}
                showsVerticalScrollIndicator={false}
            >
                {/* LATEST CARD */}
                <View
                    style={[
                        styles.latestCard,
                        {
                            borderColor: metricData.badgeBorder,
                            backgroundColor: metricData.badgeBg,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.latestLabel,
                            { color: metricData.statusColor },
                        ]}
                    >
                        MỚI NHẤT
                    </Text>
                    <Text
                        style={[
                            styles.latestValueText,
                            { color: metricData.statusColor },
                        ]}
                    >
                        {metricData.latestValue}{' '}
                        <Text style={styles.latestUnitText}>
                            {metricData.unit}
                        </Text>
                    </Text>
                    <View style={[styles.latestTimeRow, { gap: 6 }]}>
                        <Ionicons
                            name='time-outline'
                            size={14}
                            color={metricData.statusColor}
                        />
                        <Text
                            style={[
                                styles.latestTimeText,
                                { color: metricData.statusColor },
                            ]}
                        >
                            {hasMetricData
                                ? `Đo lúc ${metricData.latestDate}`
                                : metricData.latestDate}
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.latestBadge,
                            {
                                backgroundColor: metricData.badgeBg,
                                borderColor: metricData.badgeBorder,
                            },
                        ]}
                    >
                        <Ionicons
                            name={
                                metricData.id === 'bp' ? 'warning' : 'checkmark'
                            }
                            size={12}
                            color={metricData.statusColor}
                        />
                        <Text
                            style={[
                                styles.latestBadgeText,
                                { color: metricData.statusColor },
                            ]}
                        >
                            {metricData.latestStatus}
                        </Text>
                    </View>
                </View>

                {/* CHART SECTION */}
                <View style={[styles.cardBlock, { marginTop: scale(12) }]}>
                    <Text style={styles.chartTitle}>Biểu đồ 3 tháng</Text>
                    <View style={styles.chartArea}>
                        {renderChart(tab, metricData)}
                        <View style={styles.chartXAxis}>
                            {metricData.chartData.dates
                                .slice(0, 4)
                                .map((date, i) => (
                                    <Text key={i} style={styles.chartXLabel}>
                                        {date}
                                    </Text>
                                ))}
                        </View>
                    </View>
                    {/* Legend */}
                    {tab === 'bp' ? (
                        <View style={styles.chartLegend}>
                            <View style={styles.legendItem}>
                                <View
                                    style={[
                                        styles.legendLine,
                                        { backgroundColor: colors.danger },
                                    ]}
                                />
                                <Text style={styles.legendText}>Tâm thu</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View
                                    style={[
                                        styles.legendLine,
                                        {
                                            backgroundColor: '#FCA5A5',
                                            height: 2,
                                        },
                                    ]}
                                />
                                <Text style={styles.legendText}>
                                    Tâm trương
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.chartLegend}>
                            <View style={styles.legendItem}>
                                <View
                                    style={[
                                        styles.legendLine,
                                        { backgroundColor: colors.primary },
                                    ]}
                                />
                                <Text style={styles.legendText}>
                                    {metricData.label}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* HISTORY SECTION */}
                <Text style={[styles.sectionHeader, { color: colors.text3 }]}>
                    LỊCH SỬ ĐO
                </Text>
                <View style={styles.historyListWrap}>
                    {hasMetricData ? (
                        metricData.readings.map((item, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.historyItem,
                                    i === metricData.readings.length - 1 && {
                                        borderBottomWidth: 0,
                                    },
                                ]}
                            >
                                <View>
                                    <Text style={styles.historyItemValue}>
                                        {item.value}{' '}
                                        <Text style={styles.historyItemUnit}>
                                            {metricData.unit}
                                        </Text>
                                    </Text>
                                    <Text style={styles.historyItemDate}>
                                        {item.dateFull}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.historyBadge,
                                        {
                                            backgroundColor: item.badgeBg,
                                            borderColor: item.badgeBorder,
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name={item.icon as any}
                                        size={12}
                                        color={item.iconColor}
                                    />
                                    <Text
                                        style={[
                                            styles.historyBadgeText,
                                            { color: item.statusColor },
                                        ]}
                                    >
                                        {item.status}
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.historyEmpty}>
                            <Text style={styles.historyEmptyTitle}>
                                Chưa có lần đo
                            </Text>
                            <Text style={styles.historyEmptyText}>
                                Thêm lần đo mới để xem biểu đồ và lịch sử.
                            </Text>
                        </View>
                    )}
                </View>

                {!hideAddButton && (
                    <Pressable style={styles.addBtn} onPress={handleAddNew}>
                        <Text style={styles.addBtnText}>+ Thêm lần đo mới</Text>
                    </Pressable>
                )}

                {/* Export PDF Button */}
                <Pressable
                    style={[styles.addBtn, { borderColor: colors.primary }]}
                    onPress={handleExport}
                >
                    <MaterialCommunityIcons
                        name='file-pdf-box'
                        size={16}
                        color={colors.primary}
                        style={{ marginRight: 4 }}
                    />
                    <Text style={styles.addBtnText}>Xuất báo cáo PDF</Text>
                </Pressable>
            </ScrollView>
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
    },
    backBtn: {
        width: moderateScale(34),
        height: moderateScale(34),
        borderRadius: moderateScale(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    exportBtn: {
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
    topbarSubtitle: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(12),
        color: colors.text2,
        marginTop: 2,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.bg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: verticalScale(11),
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 2.5,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
        color: colors.text3,
    },
    tabTextActive: {
        color: colors.primary,
    },
    latestCard: {
        borderRadius: moderateScale(14),
        borderWidth: 1.5,
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(12),
        alignItems: 'flex-start',
        ...shadows.card,
    },
    latestLabel: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
        marginBottom: verticalScale(4),
    },
    latestValueText: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(26),
        lineHeight: verticalScale(31),
        marginBottom: verticalScale(4),
    },
    latestUnitText: {
        fontSize: scaleFont(11),
        fontFamily: typography.font.bold,
    },
    latestTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    latestTimeText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11.5),
    },
    latestBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(999),
        borderWidth: 1,
        gap: 4,
    },
    latestBadgeText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11.5),
    },
    cardBlock: {
        backgroundColor: colors.card,
        borderRadius: moderateScale(14),
        borderWidth: 1.5,
        borderColor: colors.border,
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(12),
        marginBottom: verticalScale(16),
        ...shadows.card,
    },
    chartTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
        color: colors.text2,
        marginBottom: verticalScale(10),
    },
    chartArea: {
        marginBottom: verticalScale(16),
    },
    chartXAxis: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: scale(8),
        marginTop: verticalScale(4),
    },
    chartXLabel: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11),
        color: colors.text3,
    },
    chartLegend: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(16),
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendLine: {
        width: 12,
        height: 3,
        borderRadius: 2,
    },
    legendText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11),
        color: colors.text3,
    },
    sectionHeader: {
        ...formSystem.sectionTitle,
        marginBottom: verticalScale(10),
    },
    historyListWrap: {
        backgroundColor: colors.card,
        borderRadius: moderateScale(16),
        borderWidth: 1.5,
        borderColor: colors.border,
        marginBottom: verticalScale(16),
        ...shadows.card,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    historyItemValue: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: colors.text,
        marginBottom: 2,
    },
    historyItemUnit: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(13),
        color: colors.text3,
    },
    historyItemDate: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11.5),
        color: colors.text3,
    },
    historyEmpty: {
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(28),
    },
    historyEmptyTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
        color: colors.text2,
        marginBottom: verticalScale(4),
    },
    historyEmptyText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11.5),
        color: colors.text3,
        textAlign: 'center',
    },
    historyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(4),
        borderRadius: 16,
        borderWidth: 1,
    },
    historyBadgeText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11.5),
    },
    addBtn: {
        backgroundColor: colors.card,
        borderRadius: moderateScale(14),
        borderWidth: 1.5,
        borderColor: colors.border,
        paddingVertical: verticalScale(13),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(16),
        ...shadows.card,
    },
    addBtnText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
        color: colors.primary,
    },
});
