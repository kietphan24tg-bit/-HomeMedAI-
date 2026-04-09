import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useState } from 'react';
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

const HISTORY_MOCK = [
    {
        dateFull: '15/03/2026 · 08:00',
        value: '130/85',
        status: 'Cao',
        statusColor: colors.danger,
        badgeBg: '#FEF2F2',
        badgeBorder: '#FECACA',
        badgeIcon: (
            <Ionicons
                name='warning'
                size={12}
                color={colors.warning}
                style={{ marginRight: 4 }}
            />
        ),
    },
    {
        dateFull: '01/03/2026 · 07:30',
        value: '125/82',
        status: 'Bình thường',
        statusColor: colors.success,
        badgeBg: '#F0FDF4',
        badgeBorder: '#BBF7D0',
        badgeIcon: (
            <Ionicons
                name='checkmark'
                size={12}
                color={colors.success}
                style={{ marginRight: 4 }}
            />
        ),
    },
    {
        dateFull: '15/02/2026 · 08:15',
        value: '128/80',
        status: 'Bình thường',
        statusColor: colors.success,
        badgeBg: '#F0FDF4',
        badgeBorder: '#BBF7D0',
        badgeIcon: (
            <Ionicons
                name='checkmark'
                size={12}
                color={colors.success}
                style={{ marginRight: 4 }}
            />
        ),
    },
    {
        dateFull: '01/02/2026 · 07:45',
        value: '132/88',
        status: 'Cao',
        statusColor: colors.danger,
        badgeBg: '#FEF2F2',
        badgeBorder: '#FECACA',
        badgeIcon: (
            <Ionicons
                name='warning'
                size={12}
                color={colors.warning}
                style={{ marginRight: 4 }}
            />
        ),
    },
    {
        dateFull: '15/01/2026 · 08:00',
        value: '135/85',
        status: 'Cao',
        statusColor: colors.danger,
        badgeBg: '#FEF2F2',
        badgeBorder: '#FECACA',
        badgeIcon: (
            <Ionicons
                name='warning'
                size={12}
                color={colors.warning}
                style={{ marginRight: 4 }}
            />
        ),
    },
];

export default function MemberMetricsRoute() {
    const [tab, setTab] = useState('bp');
    const insets = useSafeAreaInsets();

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
                </View>
                <View style={styles.topbarRightSpacer} />
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
                style={{ flex: 1, backgroundColor: colors.bgHealth }}
                contentContainerStyle={{ padding: 14, paddingBottom: 88 }}
                showsVerticalScrollIndicator={false}
            >
                {/* LATEST CARD */}
                <View style={styles.latestCard}>
                    <Text style={styles.latestLabel}>MỚI NHẤT</Text>
                    <Text style={styles.latestValueText}>
                        130/85 <Text style={styles.latestUnitText}>mmHg</Text>
                    </Text>
                    <View style={styles.latestTimeRow}>
                        <Ionicons
                            name='time-outline'
                            size={14}
                            color={colors.danger}
                        />
                        <Text style={styles.latestTimeText}>
                            Đo lúc 15/03/2026 08:00
                        </Text>
                    </View>
                    <View style={styles.latestBadge}>
                        <Ionicons name='warning' size={12} color='#D97706' />
                        <Text style={styles.latestBadgeText}>Hơi cao</Text>
                    </View>
                </View>

                {/* CHART MOCK */}
                <View style={[styles.cardBlock, { marginTop: scale(12) }]}>
                    <Text style={styles.chartTitle}>Biểu đồ 3 tháng</Text>
                    <View style={styles.chartArea}>
                        <Svg width='100%' height='108' viewBox='0 0 340 120'>
                            {/* Grid lines */}
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

                            {/* Tâm thu line (Red) */}
                            <Path
                                d='M 40 45 L 105 35 L 170 42 L 235 48 L 300 25'
                                stroke={colors.danger}
                                strokeWidth='2'
                                fill='none'
                            />
                            <SvgCircle
                                cx='40'
                                cy='45'
                                r='4'
                                fill={colors.danger}
                            />
                            <SvgCircle
                                cx='105'
                                cy='35'
                                r='4'
                                fill={colors.danger}
                            />
                            <SvgCircle
                                cx='170'
                                cy='42'
                                r='4'
                                fill={colors.danger}
                            />
                            <SvgCircle
                                cx='235'
                                cy='48'
                                r='4'
                                fill={colors.danger}
                            />
                            <SvgCircle
                                cx='300'
                                cy='25'
                                r='4'
                                fill={colors.danger}
                            />

                            {/* Tâm trương line (Light Pink) */}
                            <Path
                                d='M 40 85 L 105 75 L 170 80 L 235 85 L 300 70'
                                stroke='#FCA5A5'
                                strokeWidth='2'
                                fill='none'
                            />
                            <SvgCircle
                                cx='40'
                                cy='85'
                                r='4'
                                fill='#FFF'
                                stroke='#FCA5A5'
                                strokeWidth='2'
                            />
                            <SvgCircle
                                cx='105'
                                cy='75'
                                r='4'
                                fill='#FFF'
                                stroke='#FCA5A5'
                                strokeWidth='2'
                            />
                            <SvgCircle
                                cx='170'
                                cy='80'
                                r='4'
                                fill='#FFF'
                                stroke='#FCA5A5'
                                strokeWidth='2'
                            />
                            <SvgCircle
                                cx='235'
                                cy='85'
                                r='4'
                                fill='#FFF'
                                stroke='#FCA5A5'
                                strokeWidth='2'
                            />
                            <SvgCircle
                                cx='300'
                                cy='70'
                                r='4'
                                fill='#FFF'
                                stroke='#FCA5A5'
                                strokeWidth='2'
                            />
                        </Svg>
                        <View style={styles.chartXAxis}>
                            <Text style={styles.chartXLabel}>01/01</Text>
                            <Text style={styles.chartXLabel}>02/02</Text>
                            <Text style={styles.chartXLabel}>01/03</Text>
                            <Text style={styles.chartXLabel}>15/03</Text>
                        </View>
                    </View>
                    {/* Legend */}
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
                                    { backgroundColor: '#FCA5A5', height: 2 },
                                ]}
                            />
                            <Text style={styles.legendText}>Tâm trương</Text>
                        </View>
                    </View>
                </View>

                {/* HISTORY */}
                <Text style={styles.sectionHeader}>LỊCH SỬ ĐO</Text>
                <View style={styles.historyListWrap}>
                    {HISTORY_MOCK.map((item, i) => (
                        <View
                            key={i}
                            style={[
                                styles.historyItem,
                                i === HISTORY_MOCK.length - 1 && {
                                    borderBottomWidth: 0,
                                },
                            ]}
                        >
                            <View>
                                <Text style={styles.historyItemValue}>
                                    {item.value}{' '}
                                    <Text style={styles.historyItemUnit}>
                                        mmHg
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
                                {item.badgeIcon}
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
    topbarCenter: {
        flex: 1,
        alignItems: 'center',
    },
    topbarTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(17),
        color: colors.text,
    },
    topbarRightSpacer: {
        width: moderateScale(34),
        height: moderateScale(34),
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
