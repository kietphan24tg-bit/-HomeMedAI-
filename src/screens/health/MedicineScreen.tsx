import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';
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
import {
    useAddMedicineInventoryMutation,
    usePatchMedicineInventoryMutation,
} from '@/src/features/family/mutations';
import { useMyFamiliesQuery } from '@/src/features/family/queries';
import { useMeHealthProfileQuery } from '@/src/features/me/queries';
import { meQueryKeys } from '@/src/features/me/queryKeys';
import { appToast } from '@/src/lib/toast';
import { familiesServices } from '@/src/services/families.services';
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
    familyId?: string;
    name: string;
    form: string;
    desc: string;
    remaining: number;
    unit: string;
    hsd: string;
    reminderText: string;
    reminderOn: boolean;
    reminderTimesLocal: string[];
    progress: number;
    status: MedicineStatus;
    iconName: keyof typeof MaterialCommunityIcons.glyphMap;
}

function isSameItem(a: MockItem, b: MockItem): boolean {
    return (
        a.id === b.id &&
        a.familyId === b.familyId &&
        a.name === b.name &&
        a.form === b.form &&
        a.desc === b.desc &&
        a.remaining === b.remaining &&
        a.unit === b.unit &&
        a.hsd === b.hsd &&
        a.reminderText === b.reminderText &&
        a.reminderOn === b.reminderOn &&
        isSameStringList(a.reminderTimesLocal, b.reminderTimesLocal) &&
        a.progress === b.progress &&
        a.status === b.status &&
        a.iconName === b.iconName
    );
}

function isSameStringList(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function isSameItemsList(prev: MockItem[], next: MockItem[]): boolean {
    if (prev.length !== next.length) return false;
    for (let i = 0; i < prev.length; i += 1) {
        if (!isSameItem(prev[i], next[i])) return false;
    }
    return true;
}

function parseExpiryInput(raw: string): string | null {
    const t = raw.trim();
    if (!t) return null;
    const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t);
    if (dmy) {
        const day = parseInt(dmy[1], 10);
        const month = parseInt(dmy[2], 10);
        const year = parseInt(dmy[3], 10);
        const dt = new Date(Date.UTC(year, month - 1, day));
        if (
            dt.getUTCFullYear() === year &&
            dt.getUTCMonth() === month - 1 &&
            dt.getUTCDate() === day
        ) {
            return dt.toISOString().slice(0, 10);
        }
        return null;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
    const parsed = new Date(t);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString().slice(0, 10);
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

function nullableString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}

function booleanValue(value: unknown): boolean | undefined {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['true', '1', 'on', 'yes'].includes(normalized)) return true;
        if (['false', '0', 'off', 'no'].includes(normalized)) return false;
    }
    return undefined;
}

function recordList(value: unknown): Record<string, unknown>[] {
    return Array.isArray(value)
        ? value.filter(
              (item): item is Record<string, unknown> =>
                  !!item && typeof item === 'object',
          )
        : [];
}

function formatExpiry(value: unknown): string {
    const raw = nullableString(value);
    if (!raw) return '--';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(
        date.getFullYear(),
    ).slice(-2)}`;
}

function medicineStatus(item: Record<string, unknown>): MedicineStatus {
    if (item.alert_expired || item.alert_expiring) return 'expiring';
    if (item.alert_low_stock) return 'low';

    const stock = numberValue(item.quantity_stock);
    const minStock = numberValue(item.min_stock_alert);
    if (minStock > 0 && stock <= minStock) return 'low';

    return 'ok';
}

function parseReminderState(item: Record<string, unknown>): {
    on: boolean;
    text: string;
    times: string[];
} {
    const reminder =
        item.medicine_reminder && typeof item.medicine_reminder === 'object'
            ? (item.medicine_reminder as Record<string, unknown>)
            : null;
    const timesFromReminder = Array.isArray(reminder?.times)
        ? reminder.times.filter(
              (time): time is string => typeof time === 'string' && !!time,
          )
        : [];
    const timesFromItem = Array.isArray(item.reminder_times_local)
        ? item.reminder_times_local.filter(
              (time): time is string => typeof time === 'string' && !!time,
          )
        : [];
    const times =
        timesFromReminder.length > 0 ? timesFromReminder : timesFromItem;
    const on =
        booleanValue(reminder?.enabled) ??
        booleanValue(reminder?.reminder_on) ??
        booleanValue(reminder?.reminder_enabled) ??
        booleanValue(item.reminder_on) ??
        booleanValue(item.reminder_enabled) ??
        times.length > 0;

    if (!on) {
        return { on: false, text: 'Tắt', times: [] };
    }
    return {
        on: true,
        text: times.length > 0 ? times.join(', ') : 'Đang bật',
        times,
    };
}

function reminderText(item: Record<string, unknown>): string {
    return parseReminderState(item).text;
}

function buildMedicineItems(healthProfile: unknown): MockItem[] {
    const health =
        healthProfile && typeof healthProfile === 'object'
            ? (healthProfile as Record<string, unknown>)
            : {};

    return recordList(health.medicine_inventory).map((item, index) => {
        const status = medicineStatus(item);
        const stock = numberValue(item.quantity_stock);
        const minStock = numberValue(item.min_stock_alert);
        const progress =
            minStock > 0
                ? Math.min(100, Math.round((stock / minStock) * 100))
                : 100;
        const reminderState = parseReminderState(item);

        return {
            id: nullableString(item.id) ?? `medicine-${index}`,
            name:
                nullableString(item.medicine_name) ??
                nullableString(item.name) ??
                `Thuốc ${index + 1}`,
            form:
                nullableString(item.medicine_type) ??
                nullableString(item.form) ??
                'Chưa rõ dạng',
            desc:
                nullableString(item.instruction) ??
                nullableString(item.storage_location) ??
                'Chưa có hướng dẫn',
            remaining: stock,
            unit: nullableString(item.unit) ?? 'đơn vị',
            hsd: formatExpiry(item.expiry_date),
            reminderText: reminderText(item),
            reminderOn: reminderState.on,
            reminderTimesLocal: reminderState.times,
            progress,
            status,
            iconName: 'pill',
        };
    });
}

interface Props {
    onClose: () => void;
    headerTitle?: string;
}

export default function MedicineScreen({
    onClose,
    headerTitle = 'Thuốc đang có',
}: Props): React.JSX.Element {
    const queryClient = useQueryClient();
    const { data: healthProfile, isLoading } = useMeHealthProfileQuery();
    const { data: myFamilies = [] } = useMyFamiliesQuery();
    const familyMedicineQueries = useQueries({
        queries: myFamilies.map((family) => ({
            queryKey: ['families', family.id, 'medicine-inventory'],
            queryFn: () => familiesServices.getMedicineInventory(family.id),
            enabled: !!family.id,
        })),
    });
    const addMedicineMutation = useAddMedicineInventoryMutation();
    const patchMedicineMutation = usePatchMedicineInventoryMutation();
    const [search, setSearch] = useState('');
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const familyItems = useMemo(() => {
        const rows: MockItem[] = [];
        myFamilies.forEach((family, index) => {
            const query = familyMedicineQueries[index];
            const source = recordList(
                (query?.data as any)?.data ?? query?.data,
            );
            source.forEach((item, itemIndex) => {
                const status = medicineStatus(item);
                const stock = numberValue(item.quantity_stock);
                const minStock = numberValue(item.min_stock_alert);
                const progress =
                    minStock > 0
                        ? Math.min(100, Math.round((stock / minStock) * 100))
                        : 100;
                const reminderState = parseReminderState(item);

                rows.push({
                    id:
                        nullableString(item.id) ??
                        `${family.id}-medicine-${itemIndex}`,
                    familyId: family.id,
                    name:
                        nullableString(item.medicine_name) ??
                        nullableString(item.name) ??
                        `Thuốc ${itemIndex + 1}`,
                    form:
                        nullableString(item.medicine_type) ??
                        nullableString(item.form) ??
                        'Chưa rõ dạng',
                    desc:
                        nullableString(item.instruction) ??
                        nullableString(item.storage_location) ??
                        'Chưa có hướng dẫn',
                    remaining: stock,
                    unit: nullableString(item.unit) ?? 'đơn vị',
                    hsd: formatExpiry(item.expiry_date),
                    reminderText: reminderText(item),
                    reminderOn: reminderState.on,
                    reminderTimesLocal: reminderState.times,
                    progress,
                    status,
                    iconName: 'pill',
                });
            });
        });
        return rows;
    }, [familyMedicineQueries, myFamilies]);
    const apiItems = useMemo(
        () =>
            familyItems.length > 0
                ? familyItems
                : buildMedicineItems(healthProfile),
        [familyItems, healthProfile],
    );
    const [items, setItems] = useState<MockItem[]>([]);
    const [cloneItem, setCloneItem] = useState<MockItem | null>(null);
    const [deleteItem, setDeleteItem] = useState<MockItem | null>(null);

    useEffect(() => {
        setItems((prev) => {
            if (!prev.length) return apiItems;

            const prevById = new Map(prev.map((item) => [item.id, item]));
            const apiIdSet = new Set(apiItems.map((item) => item.id));
            const mergedApiItems = apiItems.map((apiItem) => {
                const previous = prevById.get(apiItem.id);
                if (!previous) return apiItem;
                return {
                    ...apiItem,
                    reminderOn: previous.reminderOn,
                    reminderText: previous.reminderText,
                    reminderTimesLocal: previous.reminderTimesLocal,
                };
            });
            const localOnlyItems = prev.filter(
                (item) => !apiIdSet.has(item.id),
            );
            const nextItems = [...localOnlyItems, ...mergedApiItems];

            return isSameItemsList(prev, nextItems) ? prev : nextItems;
        });
    }, [apiItems]);

    const filteredItems = useMemo(() => {
        const normalized = search.trim().toLowerCase();
        if (!normalized) return items;
        return items.filter((item) =>
            `${item.name} ${item.form} ${item.desc} ${item.unit}`
                .toLowerCase()
                .includes(normalized),
        );
    }, [items, search]);

    const toggleReminder = async (id: string) => {
        const currentItem = items.find((item) => item.id === id);
        if (!currentItem) return;

        const nextReminderOn = !currentItem.reminderOn;
        const nextReminderTimes = nextReminderOn
            ? currentItem.reminderTimesLocal.length > 0
                ? currentItem.reminderTimesLocal
                : ['08:00']
            : [];
        const nextReminderText = nextReminderOn
            ? nextReminderTimes.join(', ')
            : 'Tắt';

        setItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          reminderOn: nextReminderOn,
                          reminderText: nextReminderText,
                          reminderTimesLocal: nextReminderTimes,
                      }
                    : item,
            ),
        );

        if (!currentItem.familyId) return;

        try {
            await familiesServices.patchMedicineInventory(currentItem.id, {
                reminder_on: nextReminderOn,
                reminder_times_local: nextReminderTimes,
            });
            await queryClient.invalidateQueries({
                queryKey: [
                    'families',
                    currentItem.familyId,
                    'medicine-inventory',
                ],
            });
        } catch {
            setItems((prev) =>
                prev.map((item) => (item.id === id ? currentItem : item)),
            );
            appToast.showError('Lỗi', 'Không thể cập nhật nhắc thuốc lúc này.');
        }
    };

    const openDetail = (item: MockItem | null) => {
        if (item) {
            setSelectedItem({
                id: item.id,
                familyId: item.familyId,
                name: item.name,
                form: item.form,
                qty: String(item.remaining),
                unit: item.unit,
                exp: item.hsd === '--' ? '' : `01/${item.hsd}`,
                note: item.desc,
                reminder: item.reminderOn ? 'ON' : 'OFF',
            });
        } else {
            setSelectedItem(null);
        }
        setDetailOpen(true);
    };

    const handleSaveMedicine = async (payload: {
        medicine_name?: string;
        medicine_type?: string;
        quantity_stock?: number;
        unit?: string;
        min_stock_alert?: number | null;
        instruction?: string | null;
        expiry_date?: string | null;
    }) => {
        const medicineName = payload.medicine_name?.trim();
        if (!medicineName) {
            appToast.showError('Thiếu thông tin', 'Vui lòng nhập tên thuốc.');
            return;
        }

        const familyId =
            selectedItem?.familyId ?? (myFamilies[0] ? myFamilies[0].id : null);
        if (!familyId) {
            appToast.showError(
                'Chưa có gia đình',
                'Cần tham gia hoặc tạo gia đình để quản lý thuốc.',
            );
            return;
        }

        const expiryDate = payload.expiry_date
            ? parseExpiryInput(payload.expiry_date)
            : null;
        if (payload.expiry_date && !expiryDate) {
            appToast.showError(
                'Ngày không hợp lệ',
                'Vui lòng dùng dd/mm/yyyy hoặc yyyy-mm-dd.',
            );
            return;
        }

        const requestBody = {
            medicine_name: medicineName,
            medicine_type: payload.medicine_type ?? 'Viên nén',
            quantity_stock: Number(payload.quantity_stock ?? 0),
            unit: payload.unit ?? 'viên',
            min_stock_alert: Number(payload.min_stock_alert ?? 5),
            instruction: payload.instruction ?? null,
            expiry_date: expiryDate,
            expiry_alert_days_before: 30,
        };

        try {
            if (selectedItem?.id && selectedItem?.familyId) {
                await patchMedicineMutation.mutateAsync({
                    itemId: selectedItem.id,
                    familyId: selectedItem.familyId,
                    data: requestBody,
                });
            } else {
                await addMedicineMutation.mutateAsync({
                    familyId,
                    data: requestBody,
                });
            }
            await queryClient.invalidateQueries({
                queryKey: meQueryKeys.overview(),
            });
            setDetailOpen(false);
            setSelectedItem(null);
        } catch {
            // toast handled in mutation hooks
        }
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

                {filteredItems.length > 0 ? (
                    filteredItems.map(renderInventoryCard)
                ) : (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <MaterialCommunityIcons
                                name='pill-off'
                                size={30}
                                color={colors.primary}
                            />
                        </View>
                        <Text style={styles.emptyTitle}>
                            {isLoading ? 'Đang tải thuốc' : 'Chưa có thuốc'}
                        </Text>
                        <Text style={styles.emptySub}>
                            {isLoading
                                ? 'Dữ liệu đang được lấy từ tài khoản của bạn'
                                : search.trim()
                                  ? 'Thử tìm kiếm với từ khoá khác'
                                  : 'Chưa có thuốc đang dùng'}
                        </Text>
                    </View>
                )}
            </ScrollView>

            <MedicineDetailSheet
                visible={detailOpen}
                item={selectedItem}
                onClose={() => setDetailOpen(false)}
                onSave={handleSaveMedicine}
                isPending={
                    addMedicineMutation.isPending ||
                    patchMedicineMutation.isPending
                }
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
    emptyState: {
        alignItems: 'center',
        paddingVertical: verticalScale(44),
        paddingHorizontal: scale(20),
    },
    emptyIcon: {
        width: scale(64),
        height: scale(64),
        borderRadius: moderateScale(32),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryBg,
        marginBottom: verticalScale(12),
    },
    emptyTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(15),
        color: colors.text,
        marginBottom: verticalScale(4),
    },
    emptySub: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12.5),
        color: colors.text3,
        textAlign: 'center',
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
