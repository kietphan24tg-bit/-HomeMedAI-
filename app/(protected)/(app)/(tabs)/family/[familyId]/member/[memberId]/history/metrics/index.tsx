import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useLocalSearchParams } from 'expo-router';
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
import { type BP_DATA, getMetricData } from '@/src/data/metrics-data';
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
/**
 * Chart data generator for different metric types
 */
function renderChart(tab: string, metricData: typeof BP_DATA) {
    if (tab === 'bp') {
        const systolic = metricData.chartData.systolic || [
            135, 128, 125, 130, 140,
        ];
        const diastolic = metricData.chartData.diastolic || [
            85, 80, 82, 88, 85,
        ];

        const maxSys = Math.max(...systolic);
        const minSys = Math.min(...systolic);
        const maxDias = Math.max(...diastolic);
        const minDias = Math.min(...diastolic);

        const sysScale = (val: number) =>
            100 - ((val - minSys) / (maxSys - minSys)) * 60;
        const diasScale = (val: number) =>
            100 - ((val - minDias) / (maxDias - minDias)) * 30 + 40;

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
        const values = metricData.chartData.values || [57, 56, 55, 54, 55];
        const maxVal = Math.max(...values);
        const minVal = Math.min(...values);
        const valScale = (val: number) =>
            100 - ((val - minVal) / (maxVal - minVal)) * 60;

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

export default function MemberMetricsRoute() {
    const params = useLocalSearchParams();
    const initialTab = (params.metric as string) || 'bp';
    const [tab, setTab] = useState(initialTab);
    const insets = useSafeAreaInsets();

    const metricData = useMemo(
        () => getMetricData(tab as 'bp' | 'weight' | 'glucose'),
        [tab],
    );

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
                    <Text style={styles.topbarTitle}>{metricData.label}</Text>
                </View>
                <Pressable
                    style={styles.exportBtn}
                    onPress={() => {
                        // TODO: Export to PDF functionality
                    }}
                >
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
                            Đo lúc {metricData.latestDate}
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

                {/* CHART MOCK */}
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

                {/* HISTORY */}
                <Text style={[styles.sectionHeader, { color: colors.text3 }]}>
                    LỊCH SỬ ĐO
                </Text>
                <View style={styles.historyListWrap}>
                    {metricData.readings.map((item, i) => (
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
                    ))}
                </View>

                <Pressable
                    style={styles.addBtn}
                    onPress={() => router.push('./new')}
                >
                    <Text style={styles.addBtnText}>+ Thêm lần đo mới</Text>
                </Pressable>

                {/* Export PDF Button */}
                <Pressable
                    style={[styles.addBtn, { borderColor: colors.primary }]}
                    onPress={() => {
                        // TODO: Export to PDF functionality
                    }}
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
        borderBottomColor: colors.danger,
    },
    tabText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
        color: colors.text3,
    },
    tabTextActive: {
        color: colors.danger,
    },
    latestCard: {
        backgroundColor: '#FFF7F7',
        borderRadius: moderateScale(14),
        borderWidth: 1.5,
        borderColor: '#FBD2D2',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(12),
        alignItems: 'flex-start',
        ...shadows.card,
    },
    latestLabel: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
        color: colors.danger,
        marginBottom: verticalScale(4),
    },
    latestValueText: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(26),
        color: colors.danger,
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
        gap: 4,
    },
    latestTimeText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11.5),
        color: colors.danger,
    },
    latestBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE4E6',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(999),
        borderWidth: 1,
        borderColor: '#FECACA',
        gap: 4,
    },
    latestBadgeText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11.5),
        color: colors.danger,
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
        color: colors.text3,
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
        alignItems: 'center',
        marginBottom: verticalScale(16),
        ...shadows.card,
    },
    addBtnText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
        color: colors.primary,
    },
});
