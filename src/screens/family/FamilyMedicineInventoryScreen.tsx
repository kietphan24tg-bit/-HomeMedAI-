import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { getFamilyMedicines } from '@/src/data/family-medicine-data';
import type { FamilyMedicineItem } from '@/src/data/family-medicine-data';
import {
    moderateScale,
    scale,
    scaleFont,
    verticalScale,
} from '@/src/styles/responsive';
import { colors, gradients, shadows, typography } from '@/src/styles/tokens';
import type { FamilyGroup } from '@/src/types/family';

type MedicineStatus = 'expiring' | 'low' | 'ok';

const CIRCUMFERENCE = 188.5;

function getMedicineStatus(item: FamilyMedicineItem): MedicineStatus {
    const today = new Date();
    const exp = new Date(item.exp);
    const daysLeft = Math.ceil(
        (exp.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
    );

    if (daysLeft <= 30) return 'expiring';
    if (item.qty <= item.lowThreshold) return 'low';
    return 'ok';
}

function formatIsoDate(iso: string) {
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
}

function getStatusConfig(status: MedicineStatus) {
    if (status === 'expiring') {
        return {
            title: 'Sắp hết hạn',
            accent: colors.cDanger,
            dot: '#FDA4AF',
            cardBg: colors.cDangerBg,
            cardBorder: '#FDA4AF',
            iconBg: '#FFE4E6',
            icon: colors.cDanger,
            emoji: '⚠️',
        };
    }

    if (status === 'low') {
        return {
            title: 'Sắp hết',
            accent: colors.cReminder,
            dot: '#FCD34D',
            cardBg: colors.cReminderBg,
            cardBorder: '#FDE68A',
            iconBg: '#FEF3C7',
            icon: colors.cReminder,
            emoji: '📉',
        };
    }

    return {
        title: 'Còn đủ',
        accent: colors.cFamily,
        dot: '#E5E7EB',
        cardBg: colors.card,
        cardBorder: colors.border,
        iconBg: colors.secondaryBg,
        icon: colors.cFamily,
        emoji: '✅',
    };
}

function MedicineCard({ item }: { item: FamilyMedicineItem }) {
    const status = getMedicineStatus(item);
    const cfg = getStatusConfig(status);
    const progress = Math.max(
        8,
        Math.min(100, Math.round((item.qty / item.originalQty) * 100)),
    );

    return (
        <Pressable
            style={[
                styles.card,
                {
                    backgroundColor: cfg.cardBg,
                    borderColor: cfg.cardBorder,
                },
            ]}
        >
            <View style={[styles.cardIcon, { backgroundColor: cfg.iconBg }]}>
                <Ionicons name='medkit-outline' size={18} color={cfg.icon} />
            </View>

            <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Ionicons
                        name='chevron-forward'
                        size={14}
                        color={colors.text3}
                    />
                </View>

                <Text style={[styles.cardExpiry, { color: cfg.accent }]}>
                    HSD: {formatIsoDate(item.exp)}
                </Text>

                <View style={styles.barTrack}>
                    <View
                        style={[
                            styles.barFill,
                            {
                                width: `${progress}%`,
                                backgroundColor: cfg.accent,
                            },
                        ]}
                    />
                </View>

                <Text style={[styles.cardAmount, { color: cfg.accent }]}>
                    {item.qty} / {item.originalQty} {item.unit}
                </Text>
            </View>
        </Pressable>
    );
}

function MedicineSection({
    status,
    items,
}: {
    status: MedicineStatus;
    items: FamilyMedicineItem[];
}) {
    if (!items.length) return null;
    const cfg = getStatusConfig(status);

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionEmoji}>{cfg.emoji}</Text>
                <Text style={[styles.sectionTitle, { color: cfg.accent }]}>
                    {cfg.title}
                </Text>
                <Text style={styles.sectionCount}>({items.length})</Text>
            </View>

            <View style={styles.sectionList}>
                {items.map((item) => (
                    <MedicineCard key={item.id} item={item} />
                ))}
            </View>
        </View>
    );
}

function AddMedicineSheet({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}) {
    return (
        <Modal
            transparent
            visible={visible}
            animationType='fade'
            onRequestClose={onClose}
        >
            <View style={styles.sheetBackdrop}>
                <Pressable style={styles.sheetOverlay} onPress={onClose} />
                <View style={styles.sheet}>
                    <View style={styles.sheetHeader}>
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetTitleRow}>
                            <Text style={styles.sheetTitle}>
                                Thêm thuốc vào tủ
                            </Text>
                            <Pressable
                                style={styles.sheetCloseBtn}
                                onPress={onClose}
                            >
                                <Ionicons
                                    name='close'
                                    size={14}
                                    color={colors.text2}
                                />
                            </Pressable>
                        </View>
                    </View>

                    <ScrollView
                        style={styles.sheetScroll}
                        contentContainerStyle={styles.sheetScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>
                                Tên thuốc <Text style={styles.req}>*</Text>
                            </Text>
                            <TextInput
                                placeholder='VD: Paracetamol 500mg'
                                placeholderTextColor={colors.text3}
                                style={styles.fieldInput}
                            />
                        </View>

                        <View style={styles.fieldRow}>
                            <View style={[styles.fieldGroup, styles.fieldHalf]}>
                                <Text style={styles.fieldLabel}>
                                    Nhóm thuốc
                                </Text>
                                <TextInput
                                    placeholder='Giảm đau'
                                    placeholderTextColor={colors.text3}
                                    style={styles.fieldInput}
                                />
                            </View>

                            <View style={[styles.fieldGroup, styles.fieldHalf]}>
                                <Text style={styles.fieldLabel}>Vị trí</Text>
                                <TextInput
                                    placeholder='Tủ phòng khách'
                                    placeholderTextColor={colors.text3}
                                    style={styles.fieldInput}
                                />
                            </View>
                        </View>

                        <View style={styles.fieldRow}>
                            <View style={[styles.fieldGroup, styles.fieldHalf]}>
                                <Text style={styles.fieldLabel}>Số lượng</Text>
                                <TextInput
                                    placeholder='8'
                                    placeholderTextColor={colors.text3}
                                    keyboardType='numeric'
                                    style={styles.fieldInput}
                                />
                            </View>

                            <View style={[styles.fieldGroup, styles.fieldHalf]}>
                                <Text style={styles.fieldLabel}>Đơn vị</Text>
                                <TextInput
                                    placeholder='viên'
                                    placeholderTextColor={colors.text3}
                                    style={styles.fieldInput}
                                />
                            </View>
                        </View>

                        <View style={styles.fieldRow}>
                            <View style={[styles.fieldGroup, styles.fieldHalf]}>
                                <Text style={styles.fieldLabel}>
                                    Hạn sử dụng
                                </Text>
                                <TextInput
                                    placeholder='20/04/2026'
                                    placeholderTextColor={colors.text3}
                                    style={styles.fieldInput}
                                />
                            </View>

                            <View style={[styles.fieldGroup, styles.fieldHalf]}>
                                <Text style={styles.fieldLabel}>
                                    Ngưỡng cảnh báo
                                </Text>
                                <TextInput
                                    placeholder='10'
                                    placeholderTextColor={colors.text3}
                                    keyboardType='numeric'
                                    style={styles.fieldInput}
                                />
                            </View>
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Liều dùng</Text>
                            <TextInput
                                placeholder='VD: 1-2 viên/lần'
                                placeholderTextColor={colors.text3}
                                style={styles.fieldInput}
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Ghi chú</Text>
                            <TextInput
                                placeholder='Ghi chú bảo quản hoặc cách dùng'
                                placeholderTextColor={colors.text3}
                                multiline
                                textAlignVertical='top'
                                style={[
                                    styles.fieldInput,
                                    styles.fieldTextarea,
                                ]}
                            />
                        </View>

                        <Pressable
                            style={styles.sheetSubmitBtn}
                            onPress={onClose}
                        >
                            <Text style={styles.sheetSubmitText}>
                                Lưu vào tủ thuốc
                            </Text>
                        </Pressable>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

export default function FamilyMedicineInventoryScreen({
    family,
}: {
    family: FamilyGroup;
}): React.JSX.Element {
    const [query, setQuery] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);

    const items = useMemo(() => getFamilyMedicines(family.id), [family.id]);

    const filteredItems = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return items;
        return items.filter((item) =>
            `${item.name} ${item.group ?? ''} ${item.location} ${item.note ?? ''}`
                .toLowerCase()
                .includes(normalized),
        );
    }, [items, query]);

    const expiringItems = filteredItems.filter(
        (item) => getMedicineStatus(item) === 'expiring',
    );
    const lowItems = filteredItems.filter(
        (item) => getMedicineStatus(item) === 'low',
    );
    const okItems = filteredItems.filter(
        (item) => getMedicineStatus(item) === 'ok',
    );

    const totalCount = filteredItems.length || 1;
    const okArc = (CIRCUMFERENCE * okItems.length) / totalCount;
    const lowArc = (CIRCUMFERENCE * lowItems.length) / totalCount;
    const expiringArc = (CIRCUMFERENCE * expiringItems.length) / totalCount;

    return (
        <SafeAreaView style={styles.page}>
            <StatusBar
                barStyle='light-content'
                backgroundColor='transparent'
                translucent
            />

            <LinearGradient
                colors={gradients.health}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
            >
                <View style={styles.heroCircleLg} />
                <View style={styles.heroCircleMd} />
                <View style={styles.heroCircleSm} />

                <View style={styles.heroTop}>
                    <View style={styles.heroTitleRow}>
                        <Pressable
                            onPress={() => router.back()}
                            style={styles.heroIconButton}
                        >
                            <Ionicons
                                name='chevron-back'
                                size={16}
                                color='#fff'
                            />
                        </Pressable>
                        <View>
                            <Text style={styles.heroTitle}>
                                Tủ thuốc gia đình
                            </Text>
                            <Text style={styles.heroSubtitle}>
                                {family.name}
                            </Text>
                        </View>
                    </View>

                    <Pressable
                        style={styles.heroIconButton}
                        onPress={() => setIsAddOpen(true)}
                    >
                        <Ionicons name='add' size={18} color='#fff' />
                    </Pressable>
                </View>

                <View style={styles.heroStats}>
                    <View style={styles.donutWrap}>
                        <Svg width={80} height={80} viewBox='0 0 80 80'>
                            <Circle
                                cx='40'
                                cy='40'
                                r='30'
                                fill='none'
                                stroke='rgba(255,255,255,0.15)'
                                strokeWidth='8'
                            />
                            <Circle
                                cx='40'
                                cy='40'
                                r='30'
                                fill='none'
                                stroke='rgba(255,255,255,0.85)'
                                strokeWidth='8'
                                strokeLinecap='round'
                                strokeDasharray={CIRCUMFERENCE}
                                strokeDashoffset={CIRCUMFERENCE - okArc}
                                transform='rotate(-90 40 40)'
                            />
                            <Circle
                                cx='40'
                                cy='40'
                                r='30'
                                fill='none'
                                stroke='#FCD34D'
                                strokeWidth='8'
                                strokeLinecap='round'
                                strokeDasharray={CIRCUMFERENCE}
                                strokeDashoffset={CIRCUMFERENCE - lowArc}
                                transform={`rotate(${(okArc / CIRCUMFERENCE) * 360 - 90} 40 40)`}
                            />
                            <Circle
                                cx='40'
                                cy='40'
                                r='30'
                                fill='none'
                                stroke='#FDA4AF'
                                strokeWidth='8'
                                strokeLinecap='round'
                                strokeDasharray={CIRCUMFERENCE}
                                strokeDashoffset={CIRCUMFERENCE - expiringArc}
                                transform={`rotate(${((okArc + lowArc) / CIRCUMFERENCE) * 360 - 90} 40 40)`}
                            />
                        </Svg>

                        <View style={styles.donutCenter}>
                            <Text style={styles.donutNumber}>
                                {filteredItems.length}
                            </Text>
                            <Text style={styles.donutLabel}>LOẠI</Text>
                        </View>
                    </View>

                    <View style={styles.legendList}>
                        <View style={styles.legendRow}>
                            <View
                                style={[
                                    styles.legendDot,
                                    { backgroundColor: '#FDA4AF' },
                                ]}
                            />
                            <Text style={styles.legendText}>Sắp hết hạn</Text>
                            <Text style={styles.legendValue}>
                                {expiringItems.length}
                            </Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View
                                style={[
                                    styles.legendDot,
                                    { backgroundColor: '#FCD34D' },
                                ]}
                            />
                            <Text style={styles.legendText}>Sắp hết</Text>
                            <Text style={styles.legendValue}>
                                {lowItems.length}
                            </Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View
                                style={[
                                    styles.legendDot,
                                    {
                                        backgroundColor:
                                            'rgba(255,255,255,0.85)',
                                    },
                                ]}
                            />
                            <Text style={styles.legendText}>Còn đủ</Text>
                            <Text style={styles.legendValue}>
                                {okItems.length}
                            </Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.searchShell}>
                <View style={styles.searchWrap}>
                    <Ionicons
                        name='search-outline'
                        size={16}
                        color={colors.text3}
                    />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder='Tìm thuốc trong tủ...'
                        placeholderTextColor={colors.text3}
                        style={styles.searchInput}
                    />
                </View>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentInner}
                showsVerticalScrollIndicator={false}
            >
                <MedicineSection status='expiring' items={expiringItems} />
                <MedicineSection status='low' items={lowItems} />
                <MedicineSection status='ok' items={okItems} />

                {!filteredItems.length ? (
                    <View style={styles.emptyState}>
                        <Ionicons
                            name='file-tray-outline'
                            size={26}
                            color={colors.text3}
                        />
                        <Text style={styles.emptyTitle}>
                            Không tìm thấy thuốc
                        </Text>
                        <Text style={styles.emptyMessage}>
                            Thử tìm theo tên thuốc hoặc vị trí bảo quản khác.
                        </Text>
                    </View>
                ) : null}
            </ScrollView>

            <AddMedicineSheet
                visible={isAddOpen}
                onClose={() => setIsAddOpen(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    hero: {
        marginHorizontal: scale(16),
        marginTop: verticalScale(12),
        borderRadius: moderateScale(34),
        paddingHorizontal: scale(18),
        paddingTop: verticalScale(18),
        paddingBottom: verticalScale(22),
        overflow: 'hidden',
    },
    heroCircleLg: {
        position: 'absolute',
        right: -30,
        top: -30,
        width: scale(130),
        height: scale(130),
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.07)',
    },
    heroCircleMd: {
        position: 'absolute',
        right: scale(50),
        bottom: -40,
        width: scale(90),
        height: scale(90),
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    heroCircleSm: {
        position: 'absolute',
        left: -20,
        top: scale(40),
        width: scale(70),
        height: scale(70),
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    heroTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(18),
    },
    heroTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
    },
    heroIconButton: {
        width: scale(32),
        height: scale(32),
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.18)',
    },
    heroTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(16),
        color: '#fff',
        letterSpacing: -0.2,
    },
    heroSubtitle: {
        marginTop: verticalScale(1),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(10),
        color: 'rgba(255,255,255,0.6)',
    },
    heroStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(16),
    },
    donutWrap: {
        width: scale(94),
        alignItems: 'center',
        justifyContent: 'center',
    },
    donutCenter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    donutNumber: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(18),
        lineHeight: scaleFont(20),
        color: '#fff',
    },
    donutLabel: {
        marginTop: verticalScale(1),
        fontFamily: typography.font.bold,
        fontSize: scaleFont(8),
        color: 'rgba(255,255,255,0.75)',
        letterSpacing: 0.8,
    },
    legendList: {
        flex: 1,
        gap: verticalScale(10),
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 999,
        marginRight: scale(6),
    },
    legendText: {
        flex: 1,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11),
        color: 'rgba(255,255,255,0.75)',
    },
    legendValue: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
        color: '#fff',
    },
    searchShell: {
        paddingHorizontal: scale(16),
        paddingTop: verticalScale(12),
        paddingBottom: verticalScale(4),
    },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: moderateScale(14),
        paddingHorizontal: scale(14),
        minHeight: verticalScale(46),
    },
    searchInput: {
        flex: 1,
        paddingVertical:
            Platform.OS === 'ios' ? verticalScale(10) : verticalScale(8),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        color: colors.text,
    },
    content: {
        flex: 1,
    },
    contentInner: {
        paddingHorizontal: scale(16),
        paddingTop: verticalScale(6),
        paddingBottom: verticalScale(32),
    },
    section: {
        marginTop: verticalScale(10),
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(7),
        paddingHorizontal: scale(2),
        paddingVertical: verticalScale(8),
    },
    sectionEmoji: {
        fontSize: scaleFont(13),
    },
    sectionTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
    },
    sectionCount: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11),
        color: colors.text3,
    },
    sectionList: {
        gap: verticalScale(8),
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
        borderRadius: moderateScale(16),
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(13),
        borderWidth: 1.5,
        ...shadows.card,
    },
    cardIcon: {
        width: scale(42),
        height: scale(42),
        borderRadius: moderateScale(14),
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    cardBody: {
        flex: 1,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: scale(8),
        marginBottom: verticalScale(6),
    },
    cardTitle: {
        flex: 1,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13.5),
        color: colors.text,
    },
    cardExpiry: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(10.5),
        marginBottom: verticalScale(5),
    },
    barTrack: {
        height: 5,
        borderRadius: 999,
        backgroundColor: colors.border,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 999,
    },
    cardAmount: {
        marginTop: verticalScale(4),
        fontFamily: typography.font.bold,
        fontSize: scaleFont(10.5),
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(36),
        paddingHorizontal: scale(24),
    },
    emptyTitle: {
        marginTop: verticalScale(10),
        fontFamily: typography.font.bold,
        fontSize: scaleFont(16),
        color: colors.text,
    },
    emptyMessage: {
        marginTop: verticalScale(6),
        textAlign: 'center',
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        lineHeight: scaleFont(19),
        color: colors.text2,
    },
    sheetBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(15,23,42,0.4)',
    },
    sheetOverlay: {
        flex: 1,
    },
    sheet: {
        backgroundColor: colors.card,
        borderTopLeftRadius: moderateScale(24),
        borderTopRightRadius: moderateScale(24),
        maxHeight: '88%',
        overflow: 'hidden',
    },
    sheetHeader: {
        paddingHorizontal: scale(18),
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    sheetHandle: {
        alignSelf: 'center',
        width: scale(32),
        height: verticalScale(4),
        borderRadius: 999,
        backgroundColor: colors.border,
        marginBottom: verticalScale(12),
    },
    sheetTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sheetTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(15),
        color: colors.text,
    },
    sheetCloseBtn: {
        width: scale(28),
        height: scale(28),
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    sheetScroll: {
        flexGrow: 0,
    },
    sheetScrollContent: {
        paddingHorizontal: scale(18),
        paddingTop: verticalScale(14),
        paddingBottom: verticalScale(28),
        gap: verticalScale(10),
    },
    fieldGroup: {
        marginBottom: verticalScale(10),
    },
    fieldRow: {
        flexDirection: 'row',
        gap: scale(8),
    },
    fieldHalf: {
        flex: 1,
    },
    fieldLabel: {
        marginBottom: verticalScale(6),
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
        color: colors.text2,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    req: {
        color: colors.cDanger,
    },
    fieldInput: {
        minHeight: verticalScale(46),
        paddingHorizontal: scale(12),
        paddingVertical:
            Platform.OS === 'ios' ? verticalScale(12) : verticalScale(9),
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: moderateScale(11),
        backgroundColor: colors.bg,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        color: colors.text,
    },
    fieldTextarea: {
        minHeight: verticalScale(88),
    },
    sheetSubmitBtn: {
        marginTop: verticalScale(4),
        minHeight: verticalScale(48),
        borderRadius: moderateScale(14),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
    },
    sheetSubmitText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: '#FFFFFF',
    },
});
