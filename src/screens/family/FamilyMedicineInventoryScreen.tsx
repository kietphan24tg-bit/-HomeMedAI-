import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import {
    SafeAreaView,
    useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { MedicineInventoryCard } from '@/src/components/ui';
import type { FamilyMedicineItem } from '@/src/data/family-medicine-data';
import { useFamilyMedicineInventoryQuery } from '@/src/features/family/queries';
import {
    moderateScale,
    scale,
    scaleFont,
    verticalScale,
} from '@/src/styles/responsive';
import { buttonSystem, cardSystem, inputSystem } from '@/src/styles/shared';
import { colors, shadows, typography } from '@/src/styles/tokens';
import type { FamilyGroup } from '@/src/types/family';
import MedicineDropdownSheet, {
    FORM_CATEGORIES,
    STOCK_UNIT_CATEGORIES,
} from './MedicineDropdownSheet';

type MedicineStatus = 'expiring' | 'low' | 'ok';

// ── Premium Color Palette ──
const HERO_START = '#0B5D6B';
const HERO_END = '#1A9BAA';
const ACCENT = '#0E8A7D';
const DETAIL_END = colors.danger;

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
    if (!iso) return '--';
    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
}

const STATUS_CFG = {
    expiring: {
        title: 'Sắp hết hạn',
        bg: '#FEE2E2',
        text: colors.danger,
        bar: colors.danger,
        border: colors.border,
        dot: colors.danger,
    },
    low: {
        title: 'Sắp hết',
        bg: '#FEF3C7',
        text: colors.warning,
        bar: colors.warning,
        border: colors.border,
        dot: colors.warning,
    },
    ok: {
        title: 'Còn đủ',
        bg: '#DCFCE7',
        text: colors.success,
        bar: colors.success,
        border: colors.border,
        dot: colors.success,
    },
} as const;

// ── Clone Confirmation Sheet ──
function CloneSheet({
    visible,
    item,
    onClose,
}: {
    visible: boolean;
    item: FamilyMedicineItem | null;
    onClose: () => void;
}) {
    const [keepReminder, setKeepReminder] = React.useState(true);
    const [resetStock, setResetStock] = React.useState(false);
    if (!item) return null;
    return (
        <Modal
            transparent
            visible={visible}
            animationType='fade'
            onRequestClose={onClose}
        >
            <View style={styles.sheetBackdrop}>
                <Pressable style={styles.sheetOverlay} onPress={onClose} />
                <View style={styles.confirmSheet}>
                    <View style={styles.confirmHandle} />
                    <Text style={styles.confirmTitle}>Nhân bản thuốc?</Text>
                    <Text style={styles.confirmSub}>Từ: {item.name}</Text>
                    <View style={styles.confirmDivider} />
                    <Pressable
                        style={styles.checkRow}
                        onPress={() => setKeepReminder(!keepReminder)}
                    >
                        <Ionicons
                            name={keepReminder ? 'checkbox' : 'square-outline'}
                            size={20}
                            color={keepReminder ? ACCENT : colors.text3}
                        />
                        <Text style={styles.checkText}>Giữ lịch nhắc</Text>
                    </Pressable>
                    <Pressable
                        style={styles.checkRow}
                        onPress={() => setResetStock(!resetStock)}
                    >
                        <Ionicons
                            name={resetStock ? 'checkbox' : 'square-outline'}
                            size={20}
                            color={resetStock ? ACCENT : colors.text3}
                        />
                        <Text style={styles.checkText}>Reset SL + HSD</Text>
                    </Pressable>
                    <View style={styles.confirmBtnRow}>
                        <Pressable
                            style={styles.confirmBtnGhost}
                            onPress={onClose}
                        >
                            <Text style={styles.confirmBtnGhostText}>Hủy</Text>
                        </Pressable>
                        <Pressable
                            style={styles.confirmBtnPrimary}
                            onPress={onClose}
                        >
                            <Text style={styles.confirmBtnPrimaryText}>
                                Nhân bản
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ── Delete Confirmation Sheet ──
function DeleteSheet({
    visible,
    item,
    onClose,
}: {
    visible: boolean;
    item: FamilyMedicineItem | null;
    onClose: () => void;
}) {
    const [deleteReminder, setDeleteReminder] = React.useState(false);
    if (!item) return null;
    return (
        <Modal
            transparent
            visible={visible}
            animationType='fade'
            onRequestClose={onClose}
        >
            <View style={styles.sheetBackdrop}>
                <Pressable style={styles.sheetOverlay} onPress={onClose} />
                <View style={styles.confirmSheet}>
                    <View style={styles.confirmHandle} />
                    <Text style={styles.confirmTitle}>Xóa thuốc này?</Text>
                    <Text style={styles.confirmSub}>
                        &quot;{item.name}&quot;
                    </Text>
                    <View style={styles.confirmDivider} />
                    <Pressable
                        style={styles.checkRow}
                        onPress={() => setDeleteReminder(!deleteReminder)}
                    >
                        <Ionicons
                            name='warning-outline'
                            size={18}
                            color={colors.warning}
                        />
                        <Text style={styles.checkText}>Xóa luôn lịch nhắc</Text>
                    </Pressable>
                    <View style={styles.confirmBtnRow}>
                        <Pressable
                            style={styles.confirmBtnGhost}
                            onPress={onClose}
                        >
                            <Text style={styles.confirmBtnGhostText}>Hủy</Text>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.confirmBtnPrimary,
                                { backgroundColor: colors.danger },
                            ]}
                            onPress={onClose}
                        >
                            <Text style={styles.confirmBtnPrimaryText}>
                                Xóa
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function UnifiedMedicineCard({
    item,
    onPress,
    style,
}: {
    item: FamilyMedicineItem;
    onPress: () => void;
    style?: any;
}) {
    const status = getMedicineStatus(item);
    const cfg = STATUS_CFG[status];
    const safeOriginalQty = item.originalQty > 0 ? item.originalQty : 1;
    const progress = Math.max(
        0,
        Math.min(100, Math.round((item.qty / safeOriginalQty) * 100)),
    );

    return (
        <MedicineInventoryCard
            style={style}
            title={item.name || 'Chưa có tên'}
            subtitle={`Dạng: ${item.form || 'Không rõ dạng'}`}
            icon={(size, color) => (
                <Ionicons
                    name={
                        item.form?.toLowerCase().includes('chai') ||
                        item.form?.toLowerCase().includes('lọ')
                            ? 'flask-outline'
                            : 'medkit-outline'
                    }
                    size={size}
                    color={color}
                />
            )}
            themeColor={cfg.text}
            themeLight={cfg.bg}
            quantityLabel={`Còn: ${item.qty} ${item.unit}`}
            hsdLabel={`HSD ${formatIsoDate(item.exp)}`}
            progress={progress}
            onPress={onPress}
        />
    );
}

// ── Section ──
function MedicineSection({
    status,
    items,
    onCardPress,
}: {
    status: MedicineStatus;
    items: FamilyMedicineItem[];
    onCardPress: (item: FamilyMedicineItem) => void;
}) {
    const cfg = STATUS_CFG[status];

    return (
        <View style={{ marginBottom: items.length > 0 ? 12 : 24 }}>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: items.length > 0 ? 16 : 0,
                }}
            >
                <View
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: cfg.dot,
                        marginRight: 8,
                    }}
                />
                <Text
                    style={{
                        fontFamily: typography.font.bold,
                        fontSize: 12.5,
                        color: colors.text2,
                        letterSpacing: 0.3,
                        marginRight: 10,
                    }}
                >
                    {cfg.title}
                </Text>
            </View>
            <View>
                {items.map((item, index) => (
                    <UnifiedMedicineCard
                        key={item.id}
                        item={item}
                        onPress={() => onCardPress(item)}
                        style={
                            index < items.length - 1
                                ? styles.sectionCardGap
                                : undefined
                        }
                    />
                ))}
            </View>
        </View>
    );
}

// ── Main Screen ──
export default function FamilyMedicineInventoryScreen({
    family,
}: {
    family: FamilyGroup;
}): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState('');
    const [addPopupMode, setAddPopupMode] = useState<'create' | 'edit'>(
        'create',
    );
    const [selectedItem, setSelectedItem] = useState<FamilyMedicineItem | null>(
        null,
    );
    const [usageOpen, setUsageOpen] = useState(false);
    const [usedQty, setUsedQty] = useState('1');
    const [usedUnit, setUsedUnit] = useState('viên');
    const [usedUnitDDOpen, setUsedUnitDDOpen] = useState(false);
    const [cloneItem, setCloneItem] = useState<FamilyMedicineItem | null>(null);
    const [deleteItem, setDeleteItem] = useState<FamilyMedicineItem | null>(
        null,
    );
    const [addPopupOpen, setAddPopupOpen] = useState(false);
    const [addFormDDOpen, setAddFormDDOpen] = useState(false);
    const [addUnitDDOpen, setAddUnitDDOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newForm, setNewForm] = useState('Viên nén');
    const [newQty, setNewQty] = useState('');
    const [newUnit, setNewUnit] = useState('viên');
    const [newExp, setNewExp] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [newNote, setNewNote] = useState('');

    const { data: remoteItems = [] } = useFamilyMedicineInventoryQuery(
        family.id,
    );

    const medicineFormOptions = useMemo(
        () =>
            FORM_CATEGORIES.flatMap((category) =>
                category.options.map((option) => option.value),
            ),
        [],
    );

    const items = useMemo(() => {
        return remoteItems.map((ri: any) => ({
            id: ri.id,
            familyId: family.id,
            name: ri.medicine_name,
            unit: ri.unit || 'viên',
            form: ri.medicine_type || 'Viên nén',
            qty: parseInt(ri.quantity_stock) || 0,
            originalQty: parseInt(ri.quantity_stock) || 0,
            lowThreshold: parseInt(ri.min_stock_alert) || 5,
            exp: ri.expiry_date,
            note: ri.instruction,
            reminder: undefined,
            location: 'Tủ thuốc',
            group: 'Thuốc của tôi',
        }));
    }, [family.id, remoteItems]);

    const filteredItems = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return items;
        return items.filter((item: any) =>
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

    const handleCardPress = (item: FamilyMedicineItem) => {
        setSelectedItem(item);
        setUsedQty('1');
        setUsedUnit(item.unit || 'viên');
        setUsageOpen(true);
    };

    const handleAddNew = () => {
        setAddPopupMode('create');
        setAddFormDDOpen(false);
        setNewName('');
        setNewForm('Viên nén');
        setNewQty('');
        setNewUnit('viên');
        setNewExp('');
        setNewLocation('');
        setNewNote('');
        setAddPopupOpen(true);
    };

    const handleSaveNew = () => {
        setAddPopupOpen(false);
        setAddFormDDOpen(false);
        setNewName('');
        setNewForm('Viên nén');
        setNewQty('');
        setNewUnit('viên');
        setNewExp('');
        setNewLocation('');
        setNewNote('');
    };

    const changeUsedQty = (delta: number) => {
        setUsedQty((prev) => {
            const current = parseInt(prev || '0', 10) || 0;
            return String(Math.max(1, current + delta));
        });
    };

    const openEditFromUsage = () => {
        if (!selectedItem) return;
        setAddPopupMode('edit');
        setAddFormDDOpen(false);
        setNewName(selectedItem.name || '');
        setNewForm(selectedItem.form || 'Viên nén');
        setNewQty(String(selectedItem.qty ?? ''));
        setNewUnit(selectedItem.unit || 'viên');
        setNewExp(selectedItem.exp || '');
        setNewLocation(selectedItem.location || 'Tủ thuốc');
        setNewNote(selectedItem.note || '');
        setAddPopupOpen(true);
    };

    const addPopupTitle =
        addPopupMode === 'edit' ? 'Chỉnh sửa thông tin' : 'Thêm thuốc vào tủ';
    const addPopupButtonText =
        addPopupMode === 'edit' ? 'Lưu thay đổi' : 'Lưu vào tủ thuốc';

    return (
        <SafeAreaView style={styles.page}>
            <StatusBar
                barStyle='light-content'
                backgroundColor='transparent'
                translucent
            />

            {/* ── Hero Header ── */}
            <LinearGradient
                colors={[HERO_START, HERO_END]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
            >
                <View style={styles.heroDecor1} />
                <View style={styles.heroDecor2} />
                <View style={styles.heroDecor3} />

                <View style={styles.heroTop}>
                    <View style={styles.heroTitleRow}>
                        <Pressable
                            onPress={() => router.back()}
                            style={styles.heroIconBtn}
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
                        style={styles.heroIconBtn}
                        onPress={handleAddNew}
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
                                stroke='rgba(255,255,255,0.12)'
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
                                stroke='#FFD54F'
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
                                stroke='#EF9A9A'
                                strokeWidth='8'
                                strokeLinecap='round'
                                strokeDasharray={CIRCUMFERENCE}
                                strokeDashoffset={CIRCUMFERENCE - expiringArc}
                                transform={`rotate(${((okArc + lowArc) / CIRCUMFERENCE) * 360 - 90} 40 40)`}
                            />
                        </Svg>
                        <View style={styles.donutCenter}>
                            <Text style={styles.donutNum}>
                                {filteredItems.length}
                            </Text>
                            <Text style={styles.donutLabel}>LOẠI</Text>
                        </View>
                    </View>

                    <View style={styles.legendList}>
                        {[
                            {
                                label: 'Sắp hết hạn',
                                color: STATUS_CFG.expiring.text,
                                count: expiringItems.length,
                            },
                            {
                                label: 'Sắp hết',
                                color: STATUS_CFG.low.text,
                                count: lowItems.length,
                            },
                            {
                                label: 'Còn đủ',
                                color: STATUS_CFG.ok.text,
                                count: okItems.length,
                            },
                        ].map((row) => (
                            <View key={row.label} style={styles.legendRow}>
                                <View
                                    style={[
                                        styles.legendDot,
                                        { backgroundColor: row.color },
                                    ]}
                                />
                                <Text style={styles.legendText}>
                                    {row.label}
                                </Text>
                                <Text style={styles.legendVal}>
                                    {row.count}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </LinearGradient>

            {/* ── Search ── */}
            <View style={styles.searchShell}>
                <View style={styles.searchWrap}>
                    <Ionicons
                        name='search-outline'
                        size={18}
                        color={colors.text3}
                    />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder='Tìm kiếm tủ thuốc nhà bạn'
                        placeholderTextColor={colors.text3}
                        style={styles.searchInput}
                    />
                </View>
            </View>

            {/* ── Content ── */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentInner}
                showsVerticalScrollIndicator={false}
            >
                <MedicineSection
                    status='ok'
                    items={okItems}
                    onCardPress={handleCardPress}
                />
                <MedicineSection
                    status='low'
                    items={lowItems}
                    onCardPress={handleCardPress}
                />
                <MedicineSection
                    status='expiring'
                    items={expiringItems}
                    onCardPress={handleCardPress}
                />

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
                        <Text style={styles.emptyMsg}>
                            Thử tìm theo tên thuốc hoặc vị trí bảo quản khác.
                        </Text>
                    </View>
                ) : null}
            </ScrollView>

            <Modal
                visible={usageOpen}
                animationType='slide'
                onRequestClose={() => setUsageOpen(false)}
            >
                <View style={styles.usagePage}>
                    <StatusBar
                        barStyle='light-content'
                        backgroundColor={DETAIL_END}
                    />
                    <SafeAreaView style={styles.usageTopSafe} edges={['top']}>
                        <View style={styles.usageHero}>
                            <View style={styles.usageHeroTop}>
                                <Pressable
                                    onPress={() => setUsageOpen(false)}
                                    style={styles.usageIconBtn}
                                >
                                    <Ionicons
                                        name='chevron-back'
                                        size={16}
                                        color='#fff'
                                    />
                                </Pressable>
                                <Pressable style={styles.usageIconBtn}>
                                    <Ionicons
                                        name='medkit-outline'
                                        size={16}
                                        color='#fff'
                                    />
                                </Pressable>
                            </View>

                            <Text style={styles.usageTitle} numberOfLines={1}>
                                {selectedItem?.name || 'Paracetamol 500mg'}
                            </Text>
                        </View>
                    </SafeAreaView>

                    <ScrollView
                        style={styles.usageContent}
                        contentContainerStyle={styles.usageContentInner}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.usageSectionTitle}>
                            THÔNG TIN THUỐC
                        </Text>
                        <View style={styles.usageInfoListCard}>
                            <View style={styles.usageInfoRow}>
                                <Text style={styles.usageInfoLabel}>
                                    Còn lại
                                </Text>
                                <Text style={styles.usageInfoValue}>
                                    {selectedItem?.qty ?? 0}{' '}
                                    {selectedItem?.unit || 'viên'}
                                </Text>
                            </View>
                            <View style={styles.usageInfoDivider} />
                            <View style={styles.usageInfoRow}>
                                <Text style={styles.usageInfoLabel}>
                                    Hạn dùng
                                </Text>
                                <Text style={styles.usageInfoValue}>
                                    {formatIsoDate(selectedItem?.exp || '')}
                                </Text>
                            </View>
                            <View style={styles.usageInfoDivider} />
                            <View style={styles.usageInfoRow}>
                                <Text style={styles.usageInfoLabel}>
                                    Ghi chú
                                </Text>
                                <Text
                                    style={styles.usageInfoValue}
                                    numberOfLines={1}
                                >
                                    {selectedItem?.note ||
                                        'Dùng khi sốt, đau đầu'}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.usageSectionTitle}>
                            XÁC NHẬN SỬ DỤNG
                        </Text>
                        <View style={styles.usageConfirmCard}>
                            <Text style={styles.usageConfirmLabel}>
                                Nhập số lượng đã dùng:
                            </Text>
                            <View style={styles.usageConfirmRow}>
                                <Pressable
                                    style={styles.usageQtyBtn}
                                    onPress={() => changeUsedQty(-1)}
                                >
                                    <Ionicons
                                        name='remove'
                                        size={16}
                                        color={colors.text2}
                                    />
                                </Pressable>
                                <TextInput
                                    value={usedQty}
                                    onChangeText={setUsedQty}
                                    keyboardType='numeric'
                                    style={styles.usageQtyInput}
                                />
                                <Pressable
                                    style={styles.usageUnitSelect}
                                    onPress={() => setUsedUnitDDOpen(true)}
                                >
                                    <Text style={styles.usageUnitText}>
                                        {usedUnit}
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={styles.usageQtyBtn}
                                    onPress={() => changeUsedQty(1)}
                                >
                                    <Ionicons
                                        name='add'
                                        size={16}
                                        color={colors.text2}
                                    />
                                </Pressable>
                                <Pressable style={styles.usageDoneBtn}>
                                    <Text style={styles.usageDoneText}>
                                        ✓ Đã dùng
                                    </Text>
                                </Pressable>
                            </View>
                        </View>

                        <Pressable
                            style={styles.usageEditBtn}
                            onPress={openEditFromUsage}
                        >
                            <Ionicons
                                name='create-outline'
                                size={18}
                                color={colors.text}
                            />
                            <Text style={styles.usageEditText}>
                                Chỉnh sửa thông tin
                            </Text>
                        </Pressable>

                        <Pressable style={styles.usageDeleteBtn}>
                            <Ionicons
                                name='trash-outline'
                                size={18}
                                color={colors.danger}
                            />
                            <Text style={styles.usageDeleteText}>
                                Xóa khỏi tủ thuốc
                            </Text>
                        </Pressable>
                    </ScrollView>
                </View>
            </Modal>

            <Modal
                transparent
                visible={addPopupOpen}
                animationType='fade'
                onRequestClose={() => setAddPopupOpen(false)}
            >
                <View style={styles.addBackdrop}>
                    <Pressable
                        style={styles.addOverlay}
                        onPress={() => setAddPopupOpen(false)}
                    />
                    <View
                        style={[
                            styles.addSheet,
                            {
                                paddingBottom:
                                    verticalScale(14) + insets.bottom,
                            },
                        ]}
                    >
                        <View style={styles.addHandle} />

                        <View style={styles.addHeaderRow}>
                            <Text style={styles.addTitle}>{addPopupTitle}</Text>
                            <Pressable
                                style={styles.addCloseBtn}
                                onPress={() => setAddPopupOpen(false)}
                            >
                                <Ionicons
                                    name='close'
                                    size={16}
                                    color={colors.text2}
                                />
                            </Pressable>
                        </View>

                        <View style={styles.addForm}>
                            <Text style={styles.addLabel}>
                                Tên thuốc <Text style={styles.addReq}>*</Text>
                            </Text>
                            <TextInput
                                value={newName}
                                onChangeText={setNewName}
                                placeholder='VD: Paracetamol 500mg'
                                placeholderTextColor={colors.text3}
                                style={styles.addInput}
                            />

                            <Text style={styles.addLabel}>
                                Dạng bào chế{' '}
                                <Text style={styles.addReq}>*</Text>
                            </Text>
                            <Pressable
                                style={[styles.addInput, styles.addUnitInput]}
                                onPress={() =>
                                    setAddFormDDOpen((prev) => !prev)
                                }
                            >
                                <Text style={styles.addUnitText}>
                                    {newForm}
                                </Text>
                                <Ionicons
                                    name={
                                        addFormDDOpen
                                            ? 'chevron-up'
                                            : 'chevron-down'
                                    }
                                    size={16}
                                    color={colors.text3}
                                />
                            </Pressable>
                            {addFormDDOpen ? (
                                <View style={styles.addInlineDropdown}>
                                    <ScrollView
                                        nestedScrollEnabled
                                        showsVerticalScrollIndicator={false}
                                        style={styles.addInlineDropdownList}
                                    >
                                        {medicineFormOptions.map((option) => {
                                            const isActive = option === newForm;
                                            return (
                                                <Pressable
                                                    key={option}
                                                    style={[
                                                        styles.addInlineDropdownItem,
                                                        isActive &&
                                                            styles.addInlineDropdownItemActive,
                                                    ]}
                                                    onPress={() => {
                                                        setNewForm(option);
                                                        setAddFormDDOpen(false);
                                                    }}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.addInlineDropdownItemText,
                                                            isActive &&
                                                                styles.addInlineDropdownItemTextActive,
                                                        ]}
                                                    >
                                                        {option}
                                                    </Text>
                                                    {isActive ? (
                                                        <Ionicons
                                                            name='checkmark'
                                                            size={14}
                                                            color={
                                                                colors.primary
                                                            }
                                                        />
                                                    ) : null}
                                                </Pressable>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            ) : null}

                            <View style={styles.addRowLabel}>
                                <Text
                                    style={[
                                        styles.addLabel,
                                        styles.addHalfLabel,
                                    ]}
                                >
                                    Số lượng{' '}
                                    <Text style={styles.addReq}>*</Text>
                                </Text>
                                <Text
                                    style={[
                                        styles.addLabel,
                                        styles.addHalfLabel,
                                    ]}
                                >
                                    Đơn vị <Text style={styles.addReq}>*</Text>
                                </Text>
                            </View>
                            <View style={styles.addRowTwoCol}>
                                <TextInput
                                    value={newQty}
                                    onChangeText={setNewQty}
                                    placeholder='VD: 10'
                                    placeholderTextColor={colors.text3}
                                    keyboardType='numeric'
                                    style={[
                                        styles.addInput,
                                        styles.addHalfInput,
                                    ]}
                                />
                                <Pressable
                                    style={[
                                        styles.addInput,
                                        styles.addHalfInput,
                                        styles.addUnitInput,
                                    ]}
                                    onPress={() => setAddUnitDDOpen(true)}
                                >
                                    <Text style={styles.addUnitText}>
                                        {newUnit}
                                    </Text>
                                    <Ionicons
                                        name='chevron-down'
                                        size={16}
                                        color={colors.text3}
                                    />
                                </Pressable>
                            </View>

                            <View style={styles.addRowLabel}>
                                <Text
                                    style={[
                                        styles.addLabel,
                                        styles.addHalfLabel,
                                    ]}
                                >
                                    Hạn sử dụng{' '}
                                    <Text style={styles.addReq}>*</Text>
                                </Text>
                                <Text
                                    style={[
                                        styles.addLabel,
                                        styles.addHalfLabel,
                                    ]}
                                >
                                    Vị trí lưu trữ
                                </Text>
                            </View>
                            <View style={styles.addRowTwoCol}>
                                <View
                                    style={[
                                        styles.addInput,
                                        styles.addHalfInput,
                                        styles.addDateWrap,
                                    ]}
                                >
                                    <TextInput
                                        value={newExp}
                                        onChangeText={setNewExp}
                                        placeholder='mm/dd/yyyy'
                                        placeholderTextColor={colors.text3}
                                        style={styles.addDateInput}
                                    />
                                    <Ionicons
                                        name='calendar-outline'
                                        size={14}
                                        color={colors.text2}
                                    />
                                </View>
                                <TextInput
                                    value={newLocation}
                                    onChangeText={setNewLocation}
                                    placeholder='VD: Tủ phòng ngủ'
                                    placeholderTextColor={colors.text3}
                                    style={[
                                        styles.addInput,
                                        styles.addHalfInput,
                                    ]}
                                />
                            </View>

                            <Text style={styles.addLabel}>Ghi chú</Text>
                            <TextInput
                                value={newNote}
                                onChangeText={setNewNote}
                                placeholder='VD: Uống sau ăn, tránh ánh sáng...'
                                placeholderTextColor={colors.text3}
                                multiline
                                style={[styles.addInput, styles.addNoteInput]}
                            />
                        </View>

                        <Pressable
                            style={styles.addSaveBtn}
                            onPress={handleSaveNew}
                        >
                            <Text style={styles.addSaveText}>
                                {addPopupButtonText}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <MedicineDropdownSheet
                visible={addUnitDDOpen}
                title='CHỌN ĐƠN VỊ'
                categories={STOCK_UNIT_CATEGORIES}
                selected={newUnit}
                onSelect={setNewUnit}
                onClose={() => setAddUnitDDOpen(false)}
                searchable={false}
            />

            <MedicineDropdownSheet
                visible={usedUnitDDOpen}
                title='CHỌN ĐƠN VỊ SỬ DỤNG'
                categories={STOCK_UNIT_CATEGORIES}
                selected={usedUnit}
                onSelect={setUsedUnit}
                onClose={() => setUsedUnitDDOpen(false)}
                searchable={false}
            />

            <CloneSheet
                visible={!!cloneItem}
                item={cloneItem}
                onClose={() => setCloneItem(null)}
            />
            <DeleteSheet
                visible={!!deleteItem}
                item={deleteItem}
                onClose={() => setDeleteItem(null)}
            />
        </SafeAreaView>
    );
}

// ── Styles ──
const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.bg },

    // Usage detail modal
    usagePage: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    usageTopSafe: {
        backgroundColor: DETAIL_END,
    },
    usageHero: {
        backgroundColor: DETAIL_END,
        paddingHorizontal: scale(16),
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(20),
        overflow: 'hidden',
    },
    usageHeroTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(18),
    },
    usageIconBtn: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(11),
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.28)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.16)',
    },
    usageTitle: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(17),
        lineHeight: scaleFont(22),
        color: '#fff',
        letterSpacing: -0.2,
    },
    usageContent: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    usageContentInner: {
        paddingHorizontal: scale(12),
        paddingTop: verticalScale(14),
        paddingBottom: verticalScale(32),
    },
    usageInfoListCard: {
        ...cardSystem.shell,
        borderRadius: moderateScale(14),
        marginBottom: verticalScale(18),
        overflow: 'hidden',
    },
    usageInfoRow: {
        minHeight: verticalScale(46),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(10),
        gap: scale(10),
    },
    usageInfoDivider: {
        height: 1,
        backgroundColor: colors.border,
    },
    usageInfoLabel: {
        flex: 1,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11.5),
        color: colors.text3,
    },
    usageInfoValue: {
        maxWidth: '62%',
        textAlign: 'right',
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
        color: colors.text2,
    },
    usageTopStats: {
        flexDirection: 'row',
        gap: scale(10),
        marginBottom: verticalScale(10),
    },
    usageStatCard: {
        flex: 1,
        ...cardSystem.shell,
        minHeight: verticalScale(80),
        borderRadius: moderateScale(14),
        paddingHorizontal: scale(13),
        paddingVertical: verticalScale(11),
        justifyContent: 'center',
    },
    usageStatCardDanger: {
        backgroundColor: colors.dangerBg,
        borderColor: '#FECACA',
    },
    usageStatLabel: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
        letterSpacing: 0.5,
        color: colors.text3,
        marginBottom: verticalScale(6),
    },
    usageStatValue: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(20),
        color: colors.text,
    },
    usageStatUnit: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
        color: colors.text3,
    },
    usageStatDate: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(16),
        color: colors.text,
    },
    usageNoteCard: {
        ...cardSystem.shell,
        borderRadius: moderateScale(14),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(11),
        marginBottom: verticalScale(12),
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
    },
    usageNoteIconWrap: {
        width: scale(40),
        height: scale(40),
        borderRadius: moderateScale(12),
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    usageNoteBody: {
        flex: 1,
    },
    usageNoteLabel: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
        color: colors.text3,
        letterSpacing: 0.5,
        marginBottom: verticalScale(3),
    },
    usageNoteText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        color: colors.text,
    },
    usageSectionTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11.8),
        letterSpacing: 0.7,
        color: colors.text2,
        marginBottom: verticalScale(12),
    },
    usageConfirmCard: {
        ...cardSystem.shell,
        borderRadius: moderateScale(14),
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(10),
        marginBottom: verticalScale(18),
    },
    usageConfirmLabel: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(11.5),
        color: colors.text3,
        marginBottom: verticalScale(7),
    },
    usageConfirmRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(5),
    },
    usageQtyBtn: {
        ...inputSystem.field,
        width: scale(38),
        minHeight: verticalScale(34),
        borderRadius: moderateScale(11),
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    usageQtyInput: {
        ...inputSystem.field,
        width: scale(44),
        minHeight: verticalScale(34),
        borderRadius: moderateScale(11),
        textAlign: 'center',
        paddingHorizontal: 0,
        paddingVertical: 0,
        fontFamily: typography.font.black,
        fontSize: scaleFont(13.2),
        color: colors.text,
    },
    usageUnitSelect: {
        ...inputSystem.field,
        width: scale(52),
        minHeight: verticalScale(34),
        borderRadius: moderateScale(11),
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    usageUnitText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
        color: colors.text2,
    },
    usageDoneBtn: {
        ...buttonSystem.primary,
        flex: 1,
        minHeight: verticalScale(34),
        borderRadius: moderateScale(11),
        backgroundColor: colors.primary,
    },
    usageDoneText: {
        ...buttonSystem.textPrimary,
        fontSize: scaleFont(10.2),
    },
    usageEditBtn: {
        ...buttonSystem.outline,
        minHeight: verticalScale(40),
        borderRadius: moderateScale(12),
        borderColor: colors.border,
        backgroundColor: colors.card,
        gap: scale(8),
        marginBottom: verticalScale(14),
    },
    usageEditText: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(12),
        color: colors.text2,
    },
    usageDeleteBtn: {
        ...buttonSystem.outline,
        minHeight: verticalScale(40),
        borderRadius: moderateScale(12),
        borderColor: '#FECACA',
        backgroundColor: colors.dangerBg,
        gap: scale(8),
        marginBottom: verticalScale(4),
    },
    usageDeleteText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
        color: colors.danger,
    },

    // Hero
    hero: {
        marginHorizontal: scale(16),
        marginTop: verticalScale(12),
        borderRadius: moderateScale(28),
        paddingHorizontal: scale(18),
        paddingTop: verticalScale(18),
        paddingBottom: verticalScale(22),
        overflow: 'hidden',
    },
    heroDecor1: {
        position: 'absolute',
        right: -30,
        top: -30,
        width: scale(130),
        height: scale(130),
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    heroDecor2: {
        position: 'absolute',
        right: scale(50),
        bottom: -40,
        width: scale(90),
        height: scale(90),
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    heroDecor3: {
        position: 'absolute',
        left: -20,
        top: scale(40),
        width: scale(70),
        height: scale(70),
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.035)',
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
    heroIconBtn: {
        width: scale(34),
        height: scale(34),
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
        marginTop: 1,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(10),
        color: 'rgba(255,255,255,0.6)',
    },
    heroStats: { flexDirection: 'row', alignItems: 'center', gap: scale(16) },
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
    donutNum: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(18),
        lineHeight: scaleFont(20),
        color: '#fff',
    },
    donutLabel: {
        marginTop: 1,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(8),
        color: 'rgba(255,255,255,0.75)',
        letterSpacing: 0.8,
    },
    legendList: { flex: 1, gap: verticalScale(10) },
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
    legendVal: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
        color: '#fff',
    },

    // Search
    searchShell: {
        paddingHorizontal: scale(16),
        paddingTop: verticalScale(12),
        paddingBottom: verticalScale(4),
    },
    searchWrap: {
        ...inputSystem.fieldIcon,
        gap: scale(8),
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderRadius: moderateScale(11),
        paddingHorizontal: scale(12),
    },
    searchInput: {
        flex: 1,
        paddingVertical: 0,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text,
        textAlignVertical: 'center',
    },
    scanBtn: {
        ...buttonSystem.outline,
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: ACCENT,
        paddingHorizontal: scale(12),
        borderRadius: moderateScale(11),
        gap: scale(4),
    },
    scanBtnText: {
        color: ACCENT,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
    },

    // Content
    content: { flex: 1 },
    contentInner: {
        paddingHorizontal: scale(16),
        paddingTop: verticalScale(6),
        paddingBottom: verticalScale(32),
    },

    // Section
    section: { marginTop: verticalScale(10) },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(7),
        paddingHorizontal: scale(2),
        paddingVertical: verticalScale(8),
    },
    sectionEmoji: { fontSize: scaleFont(13) },
    sectionTitle: { fontFamily: typography.font.bold, fontSize: scaleFont(12) },
    countPill: {
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(2),
        borderRadius: moderateScale(10),
    },
    countPillText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
    },
    sectionList: { gap: verticalScale(10) },
    sectionCardGap: {
        marginBottom: verticalScale(10),
    },

    // Add popup
    addBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(15,23,42,0.45)',
    },
    addOverlay: {
        flex: 1,
    },
    addSheet: {
        backgroundColor: colors.card,
        borderTopLeftRadius: moderateScale(28),
        borderTopRightRadius: moderateScale(28),
        paddingHorizontal: scale(18),
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(14),
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    addHandle: {
        alignSelf: 'center',
        width: scale(42),
        height: 4,
        borderRadius: 99,
        backgroundColor: colors.border,
        marginBottom: verticalScale(10),
    },
    addHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(8),
    },
    addTitle: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(18),
        color: colors.text,
    },
    addCloseBtn: {
        width: scale(34),
        height: scale(34),
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addForm: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: verticalScale(10),
    },
    addLabel: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11.5),
        color: colors.text2,
        marginBottom: verticalScale(5),
    },
    addReq: {
        color: colors.danger,
    },
    addInput: {
        ...inputSystem.field,
        minHeight: verticalScale(42),
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderRadius: moderateScale(11),
        paddingHorizontal: scale(12),
        marginBottom: verticalScale(8),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11.5),
        color: colors.text,
    },
    addRowLabel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: scale(10),
    },
    addHalfLabel: {
        flex: 1,
        marginBottom: verticalScale(5),
    },
    addRowTwoCol: {
        flexDirection: 'row',
        gap: scale(8),
    },
    addHalfInput: {
        flex: 1,
    },
    addUnitInput: {
        ...inputSystem.fieldIcon,
        justifyContent: 'space-between',
        marginBottom: verticalScale(8),
    },
    addUnitText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11.5),
        color: colors.text,
    },
    addInlineDropdown: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: moderateScale(10),
        backgroundColor: colors.card,
        marginTop: -verticalScale(2),
        marginBottom: verticalScale(8),
        overflow: 'hidden',
    },
    addInlineDropdownList: {
        maxHeight: verticalScale(190),
    },
    addInlineDropdownItem: {
        minHeight: verticalScale(36),
        paddingHorizontal: scale(12),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    addInlineDropdownItemActive: {
        backgroundColor: colors.primaryBg,
    },
    addInlineDropdownItemText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11.5),
        color: colors.text2,
    },
    addInlineDropdownItemTextActive: {
        fontFamily: typography.font.bold,
        color: colors.primary,
    },
    addDateWrap: {
        ...inputSystem.fieldIcon,
        justifyContent: 'space-between',
    },
    addDateInput: {
        flex: 1,
        paddingVertical: 0,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11.5),
        color: colors.text,
    },
    addNoteInput: {
        minHeight: verticalScale(66),
        textAlignVertical: 'top',
        paddingTop: verticalScale(9),
    },
    addSaveBtn: {
        ...buttonSystem.primary,
        marginTop: verticalScale(6),
        minHeight: verticalScale(44),
        borderRadius: moderateScale(14),
        backgroundColor: colors.primary,
    },
    addSaveText: {
        ...buttonSystem.textPrimary,
        fontSize: scaleFont(13.5),
    },

    // Card
    card: {
        borderRadius: moderateScale(14),
        backgroundColor: colors.card,
        overflow: 'hidden',
        ...shadows.card,
    },
    cardInner: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(14),
        borderRadius: moderateScale(14), // keep radius inside
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(6),
    },
    cardName: {
        flex: 1,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14.5),
        color: colors.text,
    },
    cardMeta: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text2,
        marginBottom: verticalScale(6),
    },
    cardInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(6),
    },
    cardInfoText: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(12),
    },
    infoDivider: {
        width: 1,
        height: 12,
        backgroundColor: colors.border,
        marginHorizontal: scale(8),
    },
    hsdBadge: {
        paddingHorizontal: scale(6),
        paddingVertical: verticalScale(2),
        borderRadius: moderateScale(6),
    },
    hsdBadgeText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11.5),
    },
    barTrack: {
        height: 4,
        borderRadius: 999,
        backgroundColor: colors.border,
        overflow: 'hidden',
        marginBottom: verticalScale(8),
    },
    barFill: { height: '100%', borderRadius: 999 },
    cardReminderText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11.5),
        color: colors.text3,
        marginBottom: verticalScale(10),
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(20),
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        paddingTop: verticalScale(10),
    },
    cardActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(5),
    },
    cardActionText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text2,
    },

    // Confirm bottom sheets
    sheetBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(15,23,42,0.45)',
    },
    sheetOverlay: { flex: 1 },
    confirmSheet: {
        backgroundColor: colors.card,
        borderTopLeftRadius: moderateScale(24),
        borderTopRightRadius: moderateScale(24),
        paddingHorizontal: scale(24),
        paddingBottom: verticalScale(28),
    },
    confirmHandle: {
        alignSelf: 'center',
        width: scale(36),
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
        marginTop: verticalScale(10),
        marginBottom: verticalScale(16),
    },
    confirmTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(16),
        color: colors.text,
        marginBottom: verticalScale(4),
    },
    confirmSub: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        color: colors.text2,
        marginBottom: verticalScale(8),
    },
    confirmDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: verticalScale(10),
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
        paddingVertical: verticalScale(8),
    },
    checkText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        color: colors.text,
    },
    confirmBtnRow: {
        flexDirection: 'row',
        gap: scale(12),
        marginTop: verticalScale(16),
    },
    confirmBtnGhost: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(13),
        borderRadius: moderateScale(12),
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    confirmBtnGhostText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
        color: colors.text2,
    },
    confirmBtnPrimary: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(13),
        borderRadius: moderateScale(12),
        backgroundColor: ACCENT,
    },
    confirmBtnPrimaryText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
        color: '#fff',
    },

    // Empty
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
    emptyMsg: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(12),
        color: colors.text3,
        textAlign: 'center',
        marginTop: verticalScale(6),
    },

    // Bottom bar
    bottomBar: {
        flexDirection: 'row',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: scale(12),
    },
    bottomOutline: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(14),
        borderRadius: moderateScale(14),
        borderWidth: 1.5,
        borderColor: ACCENT,
    },
    bottomOutlineText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
        color: ACCENT,
    },
    bottomSolid: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(14),
        borderRadius: moderateScale(14),
        backgroundColor: ACCENT,
    },
    bottomSolidText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
        color: '#fff',
    },
});
