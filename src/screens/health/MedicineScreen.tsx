import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { MedicineInventoryCard } from '../../components/ui';
import {
    moderateScale,
    scale,
    scaleFont,
    verticalScale,
} from '../../styles/responsive';
import {
    buttonSystem,
    cardSystem,
    inputSystem,
    shared,
} from '../../styles/shared';
import { colors, shadows, typography } from '../../styles/tokens';
import MedicineDetailSheet from '../family/MedicineDetailSheet';

type MedicineStatus = 'ok' | 'low' | 'expiring';

interface MockItem {
    id: string;
    name: string;
    form: string;
    desc: string;
    remaining: number;
    unit: string;
    hsd: string;
    reminderText: string;
    reminderOn: boolean;
    progress: number;
    status: MedicineStatus;
    iconName: keyof typeof MaterialCommunityIcons.glyphMap;
}

const STATUS_THEME: Record<
    MedicineStatus,
    { color: string; light: string; track: string }
> = {
    ok: {
        color: colors.success,
        light: '#DCFCE7',
        track: '#DCFCE7',
    },
    low: {
        color: colors.warning,
        light: '#FEF3C7',
        track: '#FEF3C7',
    },
    expiring: {
        color: colors.danger,
        light: '#FEE2E2',
        track: '#FEE2E2',
    },
};

const INITIAL_ITEMS: MockItem[] = [
    {
        id: '1',
        name: 'Paracetamol 500mg',
        form: 'Viên nén',
        desc: 'Giảm đau, hạ sốt',
        remaining: 12,
        unit: 'viên',
        hsd: '12/26',
        reminderText: 'T3, T5 · 07:00 & 20:00',
        reminderOn: true,
        progress: 60,
        status: 'ok',
        iconName: 'pill',
    },
    {
        id: '2',
        name: 'Oresol',
        form: 'Gói bột',
        desc: 'Bù điện giải',
        remaining: 8,
        unit: 'gói',
        hsd: '08/27',
        reminderText: 'Mỗi ngày · 08:00',
        reminderOn: true,
        progress: 30,
        status: 'low',
        iconName: 'grid',
    },
    {
        id: '3',
        name: 'Vitamin C 1000mg',
        form: 'Viên sủi',
        desc: 'Bổ sung vitamin',
        remaining: 20,
        unit: 'viên',
        hsd: '02/27',
        reminderText: 'Mỗi ngày · 08:00',
        reminderOn: true,
        progress: 80,
        status: 'expiring',
        iconName: 'pill',
    },
];

interface Props {
    onClose: () => void;
    headerTitle?: string;
}

export default function MedicineScreen({
    onClose,
    headerTitle = 'Thuốc đang có',
}: Props): React.JSX.Element {
    const [search, setSearch] = useState('');
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [items, setItems] = useState<MockItem[]>(INITIAL_ITEMS);
    const [cloneItem, setCloneItem] = useState<MockItem | null>(null);
    const [deleteItem, setDeleteItem] = useState<MockItem | null>(null);

    const filteredItems = useMemo(() => {
        const normalized = search.trim().toLowerCase();
        if (!normalized) return items;
        return items.filter((item) =>
            `${item.name} ${item.form} ${item.desc} ${item.unit}`
                .toLowerCase()
                .includes(normalized),
        );
    }, [items, search]);

    const toggleReminder = (id: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          reminderOn: !item.reminderOn,
                          reminderText: item.reminderOn
                              ? 'Tắt'
                              : item.reminderText === 'Tắt'
                                ? 'Mỗi ngày · 08:00'
                                : item.reminderText,
                      }
                    : item,
            ),
        );
    };

    const openDetail = (item: MockItem | null) => {
        if (item) {
            setSelectedItem({
                name: item.name,
                form: item.form,
                qty: String(item.remaining),
                unit: item.unit,
                exp: `20${item.hsd.split('/')[1]}-${item.hsd.split('/')[0]}-01`,
                note: item.desc,
                reminder: item.reminderOn ? 'ON' : 'OFF',
            });
        } else {
            setSelectedItem(null);
        }
        setDetailOpen(true);
    };

    const handleClone = () => {
        if (!cloneItem) return;
        const duplicate: MockItem = {
            ...cloneItem,
            id: `${cloneItem.id}-copy-${Date.now()}`,
            name: `${cloneItem.name} (bản sao)`,
        };
        setItems((prev) => [duplicate, ...prev]);
        setCloneItem(null);
    };

    const handleDelete = () => {
        if (!deleteItem) return;
        setItems((prev) => prev.filter((item) => item.id !== deleteItem.id));
        setDeleteItem(null);
    };

    const renderInventoryCard = (item: MockItem) => {
        const theme = STATUS_THEME[item.status];

        return (
            <MedicineInventoryCard
                key={item.id}
                style={styles.cardWrap}
                title={item.name}
                subtitle={`Dạng: ${item.form}`}
                icon={(size, color) => (
                    <MaterialCommunityIcons
                        name={item.iconName}
                        size={size}
                        color={color}
                    />
                )}
                themeColor={theme.color}
                themeLight={theme.light}
                quantityLabel={`Còn: ${item.remaining} ${item.unit}`}
                hsdLabel={`HSD ${item.hsd}`}
                progress={item.progress}
                onPress={() => openDetail(item)}
                reminderText={`Nhắc: ${item.reminderText}`}
                reminderOn={item.reminderOn}
                onToggleReminder={() => toggleReminder(item.id)}
                onClone={() => setCloneItem(item)}
                onDelete={() => setDeleteItem(item)}
                cloneLabel='Nhân bản'
                deleteLabel='Xóa'
            />
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle='dark-content' backgroundColor='#fff' />

            <View style={styles.header}>
                <Pressable
                    onPress={onClose}
                    style={styles.backBtn}
                    hitSlop={10}
                >
                    <Ionicons
                        name='chevron-back'
                        size={18}
                        color={colors.text2}
                    />
                </Pressable>
                <Text style={styles.headerTitle}>{headerTitle}</Text>
                <Pressable
                    style={styles.headerActionBtn}
                    hitSlop={10}
                    onPress={() => openDetail(null)}
                >
                    <Ionicons name='add' size={18} color={colors.primary} />
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputWrap}>
                        <Ionicons
                            name='search'
                            size={18}
                            color={colors.text3}
                        />
                        <TextInput
                            style={styles.searchInput}
                            placeholder='Tìm thuốc trong tủ...'
                            placeholderTextColor={colors.text3}
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                    <Pressable style={styles.scanBtn}>
                        <MaterialCommunityIcons
                            name='qrcode-scan'
                            size={14}
                            color='#fff'
                        />
                        <Text style={styles.scanBtnText}>Quét</Text>
                    </Pressable>
                </View>

                <View style={styles.listHeader}>
                    <Text style={styles.listHeaderTitle}>
                        DANH SÁCH THUỐC ({filteredItems.length})
                    </Text>
                </View>

                {filteredItems.map(renderInventoryCard)}
            </ScrollView>

            <MedicineDetailSheet
                visible={detailOpen}
                item={selectedItem}
                onClose={() => setDetailOpen(false)}
            />

            <CloneConfirmSheet
                visible={!!cloneItem}
                medicineName={cloneItem?.name ?? ''}
                onClose={() => setCloneItem(null)}
                onConfirm={handleClone}
            />

            <DeleteConfirmSheet
                visible={!!deleteItem}
                medicineName={deleteItem?.name ?? ''}
                onClose={() => setDeleteItem(null)}
                onConfirm={handleDelete}
            />
        </SafeAreaView>
    );
}

function CloneConfirmSheet({
    visible,
    medicineName,
    onClose,
    onConfirm,
}: {
    visible: boolean;
    medicineName: string;
    onClose: () => void;
    onConfirm: () => void;
}) {
    const [keepReminder, setKeepReminder] = useState(true);
    const [resetStock, setResetStock] = useState(false);

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
                    <Text style={styles.confirmSub}>
                        Từ: {medicineName || 'Chưa có tên'}
                    </Text>
                    <View style={styles.confirmDivider} />
                    <Pressable
                        style={styles.checkRow}
                        onPress={() => setKeepReminder(!keepReminder)}
                    >
                        <Ionicons
                            name={keepReminder ? 'checkbox' : 'square-outline'}
                            size={20}
                            color={keepReminder ? colors.primary : colors.text3}
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
                            color={resetStock ? colors.primary : colors.text3}
                        />
                        <Text style={styles.checkText}>Reset SL + HSD</Text>
                    </Pressable>
                    <View style={styles.confirmBtnRow}>
                        <Pressable
                            style={styles.confirmBtnGhost}
                            onPress={onClose}
                        >
                            <Text style={styles.confirmBtnGhostText}>Huỷ</Text>
                        </Pressable>
                        <Pressable
                            style={styles.confirmBtnPrimary}
                            onPress={onConfirm}
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

function DeleteConfirmSheet({
    visible,
    medicineName,
    onClose,
    onConfirm,
}: {
    visible: boolean;
    medicineName: string;
    onClose: () => void;
    onConfirm: () => void;
}) {
    const [deleteReminder, setDeleteReminder] = useState(false);

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
                        &quot;{medicineName || 'Chưa có tên'}&quot;
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
                            <Text style={styles.confirmBtnGhostText}>Huỷ</Text>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.confirmBtnPrimary,
                                styles.confirmBtnDanger,
                            ]}
                            onPress={onConfirm}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        backgroundColor: 'transparent',
    },
    backBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerActionBtn: {
        ...shared.iconBtn,
    },
    headerTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(18),
        color: colors.text,
    },
    scrollContent: {
        padding: scale(16),
        paddingBottom: verticalScale(40),
    },
    searchContainer: {
        flexDirection: 'row',
        gap: scale(10),
        marginBottom: verticalScale(18),
    },
    searchInputWrap: {
        flex: 1,
        ...inputSystem.fieldIcon,
        borderColor: colors.border,
        backgroundColor: colors.card,
        borderRadius: moderateScale(11),
        paddingHorizontal: scale(12),
        gap: scale(8),
    },
    searchInput: {
        ...inputSystem.text,
        fontSize: scaleFont(12),
        paddingVertical: 0,
        textAlignVertical: 'center',
    },
    scanBtn: {
        ...buttonSystem.primary,
        backgroundColor: colors.primary,
        minHeight: verticalScale(34),
        borderRadius: moderateScale(10),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        gap: scale(4),
    },
    scanBtnText: {
        ...buttonSystem.textPrimary,
        fontSize: scaleFont(11.5),
    },
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(16),
    },
    listHeaderTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
        color: colors.text2,
        letterSpacing: 0.5,
    },
    cardWrap: {
        marginBottom: verticalScale(16),
    },
    medCard: {
        ...cardSystem.shell,
        borderRadius: moderateScale(18),
        borderColor: colors.border,
        backgroundColor: colors.card,
        ...shadows.card,
    },
    medCardTop: {
        flexDirection: 'row',
        paddingHorizontal: scale(16),
        paddingTop: verticalScale(16),
        paddingBottom: verticalScale(10),
    },
    medIconBox: {
        width: scale(40),
        height: scale(40),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(12),
    },
    medInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    medName: {
        ...cardSystem.rowTitle,
        fontSize: scaleFont(16),
        marginBottom: verticalScale(3),
    },
    medDesc: {
        ...cardSystem.rowSub,
        fontSize: scaleFont(12.5),
        marginTop: 0,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        marginBottom: verticalScale(10),
    },
    statusRemaining: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
    },
    statusDot: {
        marginHorizontal: scale(8),
        color: colors.text3,
        fontSize: scaleFont(13),
    },
    hsdBadge: {
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(3),
        borderRadius: moderateScale(999),
    },
    hsdText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
    },
    progressTrack: {
        height: 6,
        borderRadius: 999,
        marginHorizontal: scale(16),
        marginBottom: verticalScale(14),
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 999,
    },
    reminderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(8),
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    reminderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
        flex: 1,
        marginRight: scale(12),
    },
    reminderText: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(12.5),
    },
    actionRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(11),
        gap: scale(6),
    },
    actionDivider: {
        width: 1,
        backgroundColor: colors.border,
    },
    actionText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12.5),
        color: colors.text2,
    },
    sheetBackdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(15,23,42,0.45)',
    },
    sheetOverlay: {
        flex: 1,
    },
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
        ...buttonSystem.outline,
        flex: 1,
        borderRadius: moderateScale(11),
    },
    confirmBtnGhostText: {
        ...buttonSystem.textOutline,
        fontSize: scaleFont(12.5),
    },
    confirmBtnPrimary: {
        ...buttonSystem.primary,
        flex: 1,
        borderRadius: moderateScale(11),
        backgroundColor: colors.primary,
    },
    confirmBtnDanger: {
        backgroundColor: colors.danger,
    },
    confirmBtnPrimaryText: {
        ...buttonSystem.textPrimary,
        fontSize: scaleFont(12.5),
    },
});
