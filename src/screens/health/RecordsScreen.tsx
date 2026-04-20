import Ionicons from '@expo/vector-icons/Ionicons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    useMeHealthProfileQuery,
    useMeOverviewQuery,
} from '@/src/features/me/queries';
import { meQueryKeys } from '@/src/features/me/queryKeys';
import { getApiErrorMessage } from '@/src/lib/api-error';
import { appToast } from '@/src/lib/toast';
import {
    medicalRecordsQueryKeys,
    medicalRecordsService,
} from '@/src/services/medicalRecords.services';
import { CustomReminderModal } from './CustomReminderModal';
import { styles } from './styles';
import type { AttachmentUploadItem } from '../../components/ui';
import { AttachmentUploadBlock, DateField } from '../../components/ui';
import { shared } from '../../styles/shared';
import { colors, gradients, typography } from '../../styles/tokens';
import type { RecordItem, RecordPrescriptionItem } from '../../types/health';
import { getCategoryColor } from '../../utils/color-palette';
import MedicineDetailSheet from '../family/MedicineDetailSheet';

const FILTERS = ['Tất cả', 'Tổng quát', 'Nội khoa', 'Khác'] as const;

const FILTER_MAP: Record<string, string[]> = {
    'Tổng quát': ['general'],
    'Nội khoa': ['internal'],
};

const FILTER_ICONS: Record<string, string> = {
    'Tất cả': 'list-outline',
    'Tổng quát': 'pulse-outline',
    'Nội khoa': 'shield-checkmark-outline',
    Khác: 'ellipsis-horizontal',
};

const SPECIALTIES = [
    {
        key: 'cardiology',
        label: 'Tim mạch',
        icon: 'heart-outline' as const,
        color: colors.primary,
        bg: colors.primaryBg,
    },
    {
        key: 'dermatology',
        label: 'Da liễu',
        icon: 'happy-outline' as const,
        color: '#7C3AED',
        bg: '#EEF2FF',
    },
    {
        key: 'pediatrics',
        label: 'Nhi khoa',
        icon: 'people-outline' as const,
        color: colors.success,
        bg: colors.successBg,
    },
    {
        key: 'neurology',
        label: 'Thần kinh',
        icon: 'flash-outline' as const,
        color: colors.danger,
        bg: colors.dangerBg,
    },
    {
        key: 'orthopedic',
        label: 'Cơ xương khớp',
        icon: 'body-outline' as const,
        color: colors.warning,
        bg: colors.warningBg,
    },
    {
        key: 'ent',
        label: 'Tai Mũi Họng',
        icon: 'ear-outline' as const,
        color: colors.secondary,
        bg: colors.secondaryBg,
    },
    {
        key: 'obstetrics',
        label: 'Sản phụ khoa',
        icon: 'flower-outline' as const,
        color: '#6366F1',
        bg: '#EEF2FF',
    },
    {
        key: 'dental',
        label: 'Răng hàm mặt',
        icon: 'diamond-outline' as const,
        color: colors.info,
        bg: colors.infoBg,
    },
    {
        key: 'ophthalmology',
        label: 'Mắt',
        icon: 'eye-outline' as const,
        color: '#6366F1',
        bg: '#EEF2FF',
    },
    {
        key: 'endocrine',
        label: 'Nội tiết',
        icon: 'flask-outline' as const,
        color: colors.warning,
        bg: colors.warningBg,
    },
    {
        key: 'gastro',
        label: 'Tiêu hóa',
        icon: 'nutrition-outline' as const,
        color: colors.success,
        bg: colors.successBg,
    },
    {
        key: 'other',
        label: 'Khác',
        icon: 'apps-outline' as const,
        color: colors.text3,
        bg: colors.divider,
    },
] as const;

const ALL_TYPES = [
    {
        key: 'general',
        label: 'Tổng quát',
        icon: 'pulse-outline' as const,
        color: colors.secondary,
        bg: colors.secondaryBg,
    },
    {
        key: 'internal',
        label: 'Nội khoa',
        icon: 'shield-checkmark-outline' as const,
        color: colors.warning,
        bg: colors.warningBg,
    },
    ...SPECIALTIES,
];

const FOLLOW_UP_REMINDER_OPTIONS = [
    'Không nhắc',
    '2 giờ trước',
    '1 ngày trước',
    '3 ngày trước',
    '1 tuần trước',
    'Tùy chỉnh',
] as const;

interface Props {
    onClose: () => void;
}

/** Group records by year → month */
function groupByYearMonth(records: RecordItem[]) {
    const map = new Map<string, Map<string, RecordItem[]>>();
    for (const r of records) {
        const [y, m] = r.isoDate.split('-');
        if (!map.has(y)) map.set(y, new Map());
        const yMap = map.get(y)!;
        if (!yMap.has(m)) yMap.set(m, []);
        yMap.get(m)!.push(r);
    }
    // Sort descending
    const sorted = [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
    return sorted.map(([year, months]) => ({
        year,
        months: [...months.entries()]
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([month, items]) => ({ month, items })),
    }));
}

const MONTH_NAMES: Record<string, string> = {
    '01': 'Tháng 1',
    '02': 'Tháng 2',
    '03': 'Tháng 3',
    '04': 'Tháng 4',
    '05': 'Tháng 5',
    '06': 'Tháng 6',
    '07': 'Tháng 7',
    '08': 'Tháng 8',
    '09': 'Tháng 9',
    '10': 'Tháng 10',
    '11': 'Tháng 11',
    '12': 'Tháng 12',
};

function nullableString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function recordList(value: unknown): Record<string, unknown>[] {
    return Array.isArray(value)
        ? value.filter(
              (item): item is Record<string, unknown> =>
                  !!item && typeof item === 'object',
          )
        : [];
}

function toIsoDate(value: unknown): string {
    const raw = nullableString(value);
    const date = raw ? new Date(raw) : new Date();
    if (Number.isNaN(date.getTime())) {
        return new Date().toISOString().slice(0, 10);
    }
    return date.toISOString().slice(0, 10);
}

function toDisplayDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
}

function normalizeRecordCategory(value: unknown): string {
    const raw = nullableString(value)?.toLowerCase();
    if (!raw) return 'other';
    if (ALL_TYPES.some((item) => item.key === raw)) return raw;
    if (raw.includes('tong') || raw.includes('tổng')) return 'general';
    if (raw.includes('noi') || raw.includes('nội')) return 'internal';
    return 'other';
}

function mapPrescriptions(value: unknown): RecordPrescriptionItem[] {
    return recordList(value).map((item, index) => ({
        name:
            nullableString(item.medicine_name) ??
            nullableString(item.name) ??
            `Thuốc ${index + 1}`,
        dose:
            nullableString(item.dose) ??
            nullableString(item.dosage) ??
            nullableString(item.dosage_value),
        schedule:
            nullableString(item.schedule) ??
            nullableString(item.instruction) ??
            nullableString(item.frequency),
    }));
}

function buildRecordsFromHealthProfile(
    healthProfile: unknown,
    medicalRecordsOverride?: unknown,
): RecordItem[] {
    const health =
        healthProfile && typeof healthProfile === 'object'
            ? (healthProfile as Record<string, unknown>)
            : {};

    const recordsSource = medicalRecordsOverride ?? health.medical_records;

    return recordList(recordsSource)
        .map((record, index): RecordItem => {
            const isoDate = toIsoDate(record.visit_date ?? record.created_at);
            const category = getCategoryColor(index);
            const recordCategory = normalizeRecordCategory(
                record.specialty ?? record.category,
            );
            const title =
                nullableString(record.title) ??
                nullableString(record.diagnosis_name) ??
                'Hồ sơ khám bệnh';

            return {
                id: nullableString(record.id) ?? `${title}-${isoDate}-${index}`,
                category: recordCategory,
                iconName:
                    recordCategory === 'internal'
                        ? 'shield-checkmark-outline'
                        : recordCategory === 'general'
                          ? 'pulse-outline'
                          : 'medkit-outline',
                iconColor: category.color,
                bg: category.bg,
                title,
                hospital:
                    nullableString(record.hospital_name) ??
                    nullableString(record.facility_name) ??
                    'Chưa có cơ sở khám',
                doctor: nullableString(record.doctor_name),
                diagnosis: nullableString(record.diagnosis_name),
                tag:
                    nullableString(record.specialty) ??
                    nullableString(record.department) ??
                    'Khác',
                tagBg: category.bg,
                tagColor: category.color,
                dotColor: category.color,
                date: toDisplayDate(isoDate),
                isoDate,
                location: nullableString(record.location),
                department:
                    nullableString(record.department) ??
                    nullableString(record.specialty),
                symptoms: Array.isArray(record.symptoms)
                    ? record.symptoms.filter(
                          (item): item is string =>
                              typeof item === 'string' && !!item.trim(),
                      )
                    : [],
                testResults: nullableString(record.test_results),
                doctorAdvice: nullableString(record.doctor_advice),
                prescriptions: mapPrescriptions(
                    record.prescriptions ?? record.medicines,
                ),
                attachments: recordList(record.attachments).map(
                    (item, attachmentIndex) => ({
                        id:
                            nullableString(item.id) ??
                            `${record.id ?? index}-attachment-${attachmentIndex}`,
                        type:
                            nullableString(item.type) === 'image'
                                ? 'image'
                                : 'pdf',
                        name:
                            nullableString(item.name) ??
                            nullableString(item.file_name) ??
                            `Tài liệu ${attachmentIndex + 1}`,
                    }),
                ),
            };
        })
        .sort((a, b) => b.isoDate.localeCompare(a.isoDate));
}

export default function RecordsScreen({ onClose }: Props): React.JSX.Element {
    const { data: healthProfile, isLoading } = useMeHealthProfileQuery();
    const { data: meOverview } = useMeOverviewQuery();
    const profileId =
        nullableString(
            (healthProfile as Record<string, unknown> | null)?.profile_id,
        ) ??
        nullableString(
            (meOverview?.profile as Record<string, unknown> | null)?.id,
        );
    const medicalRecordsQuery = useQuery({
        queryKey: profileId
            ? medicalRecordsQueryKeys.byProfile(profileId)
            : [...medicalRecordsQueryKeys.all, 'profile', 'none'],
        queryFn: () => medicalRecordsService.listForProfile(profileId!),
        enabled: !!profileId,
    });
    const [view, setView] = useState<'list' | 'detail' | 'add'>('list');
    const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(
        null,
    );
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<string>('Tất cả');
    const [menuId, setMenuId] = useState<string | null>(null);
    const [specPicker, setSpecPicker] = useState(false);
    const [specFilter, setSpecFilter] = useState<string | null>(null);

    const toggleMenu = useCallback((id: string) => {
        setMenuId((prev) => (prev === id ? null : id));
    }, []);
    const closeMenu = useCallback(() => setMenuId(null), []);

    const openDetail = useCallback((r: RecordItem) => {
        setSelectedRecord(r);
        setView('detail');
    }, []);

    const openAdd = useCallback(() => setView('add'), []);

    const backToList = useCallback(() => {
        setView('list');
        setSelectedRecord(null);
    }, []);

    const handleCardPress = useCallback(
        (r: RecordItem) => {
            if (menuId !== null) {
                closeMenu();
            } else {
                openDetail(r);
            }
        },
        [menuId, closeMenu, openDetail],
    );

    const handleFilterPress = useCallback((f: string) => {
        if (f === 'Khác') {
            setSpecPicker(true);
        } else {
            setFilter(f);
            setSpecFilter(null);
        }
    }, []);

    const selectSpec = useCallback((key: string) => {
        setSpecFilter(key);
        setFilter('Khác');
        setSpecPicker(false);
    }, []);

    const filtered = useMemo(() => {
        let list = buildRecordsFromHealthProfile(
            healthProfile,
            medicalRecordsQuery.data,
        );

        // Apply category filter
        if (filter !== 'Tất cả') {
            if (specFilter) {
                list = list.filter((r) => r.category === specFilter);
            } else {
                const cats = FILTER_MAP[filter];
                if (cats) {
                    list = list.filter((r) => cats.includes(r.category));
                } else {
                    const excluded = Object.values(FILTER_MAP).flat();
                    list = list.filter((r) => !excluded.includes(r.category));
                }
            }
        }

        // Apply search
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(
                (r) =>
                    r.title.toLowerCase().includes(q) ||
                    r.hospital.toLowerCase().includes(q) ||
                    (r.doctor && r.doctor.toLowerCase().includes(q)) ||
                    (r.diagnosis && r.diagnosis.toLowerCase().includes(q)),
            );
        }

        return list;
    }, [healthProfile, medicalRecordsQuery.data, search, filter, specFilter]);

    const groups = useMemo(() => groupByYearMonth(filtered), [filtered]);

    if (view === 'detail' && selectedRecord) {
        return <RecordDetail record={selectedRecord} onClose={backToList} />;
    }

    if (view === 'add') {
        return <AddRecordForm onClose={backToList} />;
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.card} />

            {/* TOP BAR */}
            <View style={styles.subTopbar}>
                <Pressable style={styles.subBackBtn} onPress={onClose}>
                    <Ionicons
                        name='chevron-back'
                        size={18}
                        color={colors.text2}
                    />
                </Pressable>
                <View style={styles.subTopbarTitleCenterWrap}>
                    <Text
                        style={[
                            styles.subTopbarTitle,
                            styles.subTopbarTitleCentered,
                        ]}
                    >
                        Hồ sơ khám bệnh
                    </Text>
                </View>
                <Pressable style={styles.subAddBtn} onPress={openAdd}>
                    <Ionicons name='add' size={16} color={colors.primary} />
                    <Text style={styles.subAddBtnText}>Thêm</Text>
                </Pressable>
            </View>

            {/* SEARCH + FILTERS */}
            <View style={styles.searchFilterWrap}>
                <View style={styles.searchWrap}>
                    <Ionicons
                        name='search-outline'
                        size={16}
                        color={colors.text3}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder='Tìm theo tên, bệnh viện, bác sĩ…'
                        placeholderTextColor={colors.text3}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <View style={styles.filterRow}>
                    {FILTERS.map((f) => {
                        const isActive =
                            f === 'Khác' ? filter === 'Khác' : filter === f;
                        const iconName = FILTER_ICONS[f];
                        return (
                            <Pressable
                                key={f}
                                style={[
                                    styles.filterChip,
                                    isActive && styles.filterChipActive,
                                ]}
                                onPress={() => handleFilterPress(f)}
                            >
                                {iconName && (
                                    <Ionicons
                                        name={
                                            iconName as keyof typeof Ionicons.glyphMap
                                        }
                                        size={11}
                                        color={
                                            isActive
                                                ? colors.primary
                                                : colors.text3
                                        }
                                    />
                                )}
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        isActive && styles.filterChipTextActive,
                                    ]}
                                >
                                    {f === 'Khác' && specFilter
                                        ? (SPECIALTIES.find(
                                              (s) => s.key === specFilter,
                                          )?.label ?? f)
                                        : f}
                                </Text>
                                {f === 'Khác' && (
                                    <Ionicons
                                        name='chevron-down-outline'
                                        size={9}
                                        color={
                                            isActive
                                                ? colors.primary
                                                : colors.text3
                                        }
                                    />
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {/* TIMELINE */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {groups.length === 0 && (
                    <View style={styles.recEmpty}>
                        <View style={styles.recEmptyIcon}>
                            <Ionicons
                                name='search-outline'
                                size={32}
                                color={colors.primary}
                            />
                        </View>
                        <Text style={styles.recEmptyTitle}>
                            {isLoading || medicalRecordsQuery.isLoading
                                ? 'Đang tải hồ sơ'
                                : 'Không có hồ sơ'}
                        </Text>
                        <Text style={styles.recEmptySub}>
                            {isLoading || medicalRecordsQuery.isLoading
                                ? 'Dữ liệu đang được lấy từ tài khoản của bạn'
                                : search.trim()
                                  ? 'Thử tìm kiếm với từ khoá khác'
                                  : 'Chưa có hồ sơ khám bệnh'}
                        </Text>
                    </View>
                )}

                {groups.map((g) => (
                    <View key={g.year}>
                        <Text style={styles.recYearHdr}>{g.year}</Text>
                        {g.months.map((m) => (
                            <View key={m.month}>
                                <Text style={styles.recMonthHdr}>
                                    {MONTH_NAMES[m.month] ?? `Tháng ${m.month}`}
                                </Text>
                                {m.items.map((r, idx) => (
                                    <RecordRow
                                        key={r.id}
                                        item={r}
                                        isLast={
                                            idx === m.items.length - 1 &&
                                            g.months.indexOf(m) ===
                                                g.months.length - 1
                                        }
                                        menuOpen={menuId === r.id}
                                        onToggleMenu={() => toggleMenu(r.id)}
                                        onPress={() => handleCardPress(r)}
                                    />
                                ))}
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>

            {/* SPECIALTY PICKER MODAL */}
            <Modal
                visible={specPicker}
                transparent
                animationType='fade'
                onRequestClose={() => setSpecPicker(false)}
            >
                <Pressable
                    style={shared.overlay}
                    onPress={() => setSpecPicker(false)}
                >
                    <Pressable
                        style={[shared.sheetContainer, { paddingBottom: 32 }]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={shared.sheetHandle}>
                            <View style={shared.sheetBar} />
                        </View>
                        <Text
                            style={{
                                fontSize: 15,
                                fontWeight: '800',
                                color: colors.text,
                                paddingHorizontal: 20,
                                marginBottom: 4,
                            }}
                        >
                            Chọn chuyên khoa
                        </Text>
                        <ScrollView
                            style={{ maxHeight: 340 }}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.specGrid}>
                                {SPECIALTIES.map((s) => (
                                    <Pressable
                                        key={s.key}
                                        style={[
                                            styles.specItem,
                                            specFilter === s.key &&
                                                styles.specItemActive,
                                        ]}
                                        onPress={() => selectSpec(s.key)}
                                    >
                                        <View
                                            style={[
                                                styles.specIcon,
                                                { backgroundColor: s.bg },
                                            ]}
                                        >
                                            <Ionicons
                                                name={s.icon}
                                                size={16}
                                                color={s.color}
                                            />
                                        </View>
                                        <Text
                                            style={[
                                                styles.specLabel,
                                                specFilter === s.key &&
                                                    styles.specLabelActive,
                                            ]}
                                        >
                                            {s.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

function RecordRow({
    item,
    isLast,
    menuOpen,
    onToggleMenu,
    onPress,
}: {
    item: RecordItem;
    isLast: boolean;
    menuOpen: boolean;
    onToggleMenu: () => void;
    onPress: () => void;
}): React.JSX.Element {
    const day = item.isoDate.split('-')[2];
    const monthShort = `Th${parseInt(item.isoDate.split('-')[1], 10)}`;

    return (
        <View style={styles.recItem}>
            {/* Timeline column */}
            <View style={styles.recTimeline}>
                <View style={styles.recDateCol}>
                    <Text style={styles.recDay}>{day}</Text>
                    <Text style={styles.recMon}>{monthShort}</Text>
                </View>
                <View style={styles.recDotCol}>
                    <View
                        style={[
                            styles.recDot,
                            { backgroundColor: item.dotColor },
                        ]}
                    />
                    {!isLast && <View style={styles.recLine} />}
                </View>
            </View>

            {/* Card */}
            <Pressable style={styles.recCard} onPress={onPress}>
                <View style={styles.recCardTop}>
                    <View
                        style={[
                            styles.recIconWrap,
                            { backgroundColor: item.bg },
                        ]}
                    >
                        <Ionicons
                            name={
                                item.iconName as keyof typeof Ionicons.glyphMap
                            }
                            size={18}
                            color={item.iconColor}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.recTitle}>{item.title}</Text>
                        <Text style={styles.recSub}>
                            {item.hospital}
                            {item.doctor ? ` • ${item.doctor}` : ''}
                        </Text>
                        {item.diagnosis && (
                            <View style={styles.recDiagRow}>
                                <View style={styles.recDiagDot} />
                                <Text style={styles.recDiagText}>
                                    {item.diagnosis}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={{ position: 'relative' }}>
                        <Pressable
                            style={styles.recMoreBtn}
                            onPress={onToggleMenu}
                        >
                            <Ionicons
                                name='ellipsis-vertical'
                                size={16}
                                color={colors.text2}
                            />
                        </Pressable>
                        {menuOpen && (
                            <View style={styles.ctxMenu}>
                                <Pressable
                                    style={styles.ctxItem}
                                    onPress={() => {
                                        onToggleMenu();
                                        onPress();
                                    }}
                                >
                                    <Ionicons
                                        name='create-outline'
                                        size={14}
                                        color={colors.primary}
                                    />
                                    <Text style={styles.ctxItemText}>
                                        Chỉnh sửa
                                    </Text>
                                </Pressable>
                                <View style={styles.ctxDivider} />
                                <Pressable style={styles.ctxItemDel}>
                                    <Ionicons
                                        name='trash-outline'
                                        size={14}
                                        color={colors.danger}
                                    />
                                    <Text style={styles.ctxItemDelText}>
                                        Xoá hồ sơ
                                    </Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </View>
                <View style={styles.recCardFooter}>
                    <Text
                        style={[
                            styles.recTag,
                            {
                                backgroundColor: item.tagBg,
                                color: item.tagColor,
                            },
                        ]}
                    >
                        {item.tag}
                    </Text>
                    {item.location && (
                        <View style={styles.recMetaRight}>
                            <Ionicons
                                name='location-outline'
                                size={11}
                                color={colors.text3}
                            />
                            <Text style={styles.recMetaText}>
                                {item.location}
                            </Text>
                        </View>
                    )}
                </View>
            </Pressable>
        </View>
    );
}

/* ═══════════════════════════════════
   RECORD DETAIL
═══════════════════════════════════ */
const RD_TABS = ['Thông tin', 'Tái khám', 'Tệp đính kèm'] as const;

interface FollowUpEntry {
    id: string;
    date: string;
    time: string;
    facility_name: string;
    doctor_name: string;
    purpose: string;
    notes: string;
    reminder_label: string;
}

type RecordEditorMode =
    | 'diagnosis'
    | 'hospital'
    | 'doctor'
    | 'symptoms'
    | 'testResults'
    | 'doctorAdvice'
    | 'prescriptions'
    | 'note';

function formatPrescriptionLine(item: RecordPrescriptionItem): string {
    return `${item.name}${item.dose ? ` ${item.dose}` : ''}${
        item.schedule ? ` • ${item.schedule}` : ''
    }`;
}

function toDepartmentLabel(specialtyKey: string): string {
    const specialty = SPECIALTIES.find((item) => item.key === specialtyKey);
    if (!specialty) return '';
    if (specialty.label.startsWith('Khoa ')) return specialty.label;
    return `Khoa ${specialty.label}`;
}

function toAttachmentUploadItems(
    items?: RecordItem['attachments'],
): AttachmentUploadItem[] {
    if (!items?.length) return [];
    return items.map((item) => ({
        id: item.id,
        type: item.type === 'image' ? 'image' : 'file',
        name: item.name,
        uri: item.name,
    }));
}

function formatFollowUpTime(date: Date): string {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
}

export function RecordDetail({
    record,
    onClose,
}: {
    record: RecordItem;
    onClose: () => void;
}): React.JSX.Element {
    const [activeTab, setActiveTab] = useState(0);
    const recordCategory = record.category;
    const isRecordSpecialty = SPECIALTIES.some(
        (item) => item.key === recordCategory,
    );
    const [showAddFu, setShowAddFu] = useState(true);
    const [followUps, setFollowUps] = useState<FollowUpEntry[]>([]);
    const [fuDate, setFuDate] = useState(new Date());
    const [fuTime, setFuTime] = useState(new Date());
    const [fuHospital, setFuHospital] = useState('');
    const [fuDoctor, setFuDoctor] = useState('');
    const [fuPurpose, setFuPurpose] = useState('');
    const [fuNotes, setFuNotes] = useState('');
    const [fuReminderTime, setFuReminderTime] = useState('1 ngày trước');
    const [showFuReminderOptions, setShowFuReminderOptions] = useState(false);
    const [showFuCustomReminder, setShowFuCustomReminder] = useState(false);
    const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);

    const specEntry = SPECIALTIES.find((s) => s.key === recordCategory);
    const specLabel =
        specEntry?.label ??
        (recordCategory === 'general'
            ? 'Tổng quát'
            : recordCategory === 'internal'
              ? 'Nội khoa'
              : record.tag);
    const [editableTestResults, setEditableTestResults] = useState(
        record.testResults ?? '',
    );
    const [editableDepartment, setEditableDepartment] = useState(
        record.department ?? specLabel ?? '',
    );
    const [editableDepartmentKey, setEditableDepartmentKey] = useState(
        isRecordSpecialty ? recordCategory : '',
    );
    const [editableDiagnosis, setEditableDiagnosis] = useState(
        record.diagnosis ?? '',
    );
    const [editableHospital, setEditableHospital] = useState(
        record.hospital ?? '',
    );
    const [editableDoctor, setEditableDoctor] = useState(record.doctor ?? '');
    const [editableSymptoms, setEditableSymptoms] = useState<string[]>(
        record.symptoms ?? [],
    );
    const [editableAttachments, setEditableAttachments] = useState<
        AttachmentUploadItem[]
    >(() => toAttachmentUploadItems(record.attachments));
    const [editableDoctorAdvice, setEditableDoctorAdvice] = useState(
        record.doctorAdvice ?? '',
    );
    const [editablePrescriptionLines, setEditablePrescriptionLines] = useState<
        string[]
    >(() =>
        (record.prescriptions ?? []).map((item) =>
            formatPrescriptionLine(item),
        ),
    );
    const [editableNote, setEditableNote] = useState('');
    const [editorMode, setEditorMode] = useState<RecordEditorMode | null>(null);
    const [editorDraft, setEditorDraft] = useState('');

    useEffect(() => {
        setEditableDepartment(record.department ?? specLabel ?? '');
        setEditableDepartmentKey(isRecordSpecialty ? recordCategory : '');
        setEditableDiagnosis(record.diagnosis ?? '');
        setEditableHospital(record.hospital ?? '');
        setEditableDoctor(record.doctor ?? '');
        setEditableSymptoms(record.symptoms ?? []);
        setEditableAttachments(toAttachmentUploadItems(record.attachments));
        setEditableTestResults(record.testResults ?? '');
        setEditableDoctorAdvice(record.doctorAdvice ?? '');
        setEditablePrescriptionLines(
            (record.prescriptions ?? []).map((item) =>
                formatPrescriptionLine(item),
            ),
        );
        setEditableNote('');
        setEditorMode(null);
        setEditorDraft('');
    }, [
        record.id,
        record.department,
        record.diagnosis,
        record.hospital,
        record.doctor,
        record.symptoms,
        record.attachments,
        record.testResults,
        record.doctorAdvice,
        record.prescriptions,
        recordCategory,
        isRecordSpecialty,
        specLabel,
    ]);

    const handleAddFollowUp = useCallback(() => {
        setShowAddFu(true);
        setFuDate(new Date());
        setFuTime(new Date());
        setFuHospital('');
        setFuDoctor('');
        setFuPurpose('');
        setFuNotes('');
        setFuReminderTime('1 ngày trước');
        setShowFuReminderOptions(false);
        setShowFuCustomReminder(false);
    }, []);

    const toggleFollowUpForm = useCallback(() => {
        setShowAddFu((prev) => {
            const next = !prev;
            if (next) {
                setFuDate(new Date());
                setFuTime(new Date());
                setFuHospital('');
                setFuDoctor('');
                setFuPurpose('');
                setFuNotes('');
                setFuReminderTime('1 ngày trước');
                setShowFuReminderOptions(false);
                setShowFuCustomReminder(false);
                setShowFuCustomReminder(false);
            }
            return next;
        });
    }, []);

    const saveFu = useCallback(() => {
        const dd = String(fuDate.getDate()).padStart(2, '0');
        const mm = String(fuDate.getMonth() + 1).padStart(2, '0');
        const yyyy = fuDate.getFullYear();
        const entry: FollowUpEntry = {
            id: Date.now().toString(),
            date: `${dd}/${mm}/${yyyy}`,
            time: formatFollowUpTime(fuTime),
            facility_name: fuHospital.trim(),
            doctor_name: fuDoctor.trim(),
            purpose: fuPurpose.trim() || 'Tái khám định kỳ',
            notes: fuNotes.trim(),
            reminder_label: fuReminderTime,
        };
        setFollowUps((prev) => [entry, ...prev]);
        setShowAddFu(false);
        setShowFuReminderOptions(false);
    }, [
        fuDate,
        fuTime,
        fuHospital,
        fuDoctor,
        fuPurpose,
        fuNotes,
        fuReminderTime,
    ]);

    const cancelFu = useCallback(() => setShowAddFu(false), []);

    const deleteFu = useCallback((id: string) => {
        setFollowUps((prev) => prev.filter((f) => f.id !== id));
    }, []);

    const selectFuReminder = useCallback((option: string) => {
        setShowFuReminderOptions(false);
        if (option === 'Tùy chỉnh') {
            setShowFuCustomReminder(true);
            return;
        }
        setFuReminderTime(option);
    }, []);

    const openEditor = useCallback(
        (mode: RecordEditorMode) => {
            setEditorMode(mode);
            if (mode === 'diagnosis') {
                setEditorDraft(editableDiagnosis);
                return;
            }
            if (mode === 'hospital') {
                setEditorDraft(editableHospital);
                return;
            }
            if (mode === 'doctor') {
                setEditorDraft(editableDoctor);
                return;
            }
            if (mode === 'symptoms') {
                setEditorDraft(editableSymptoms.join('\n'));
                return;
            }
            if (mode === 'testResults') {
                setEditorDraft(editableTestResults);
                return;
            }
            if (mode === 'doctorAdvice') {
                setEditorDraft(editableDoctorAdvice);
                return;
            }
            if (mode === 'prescriptions') {
                setEditorDraft(editablePrescriptionLines.join('\n'));
                return;
            }
            setEditorDraft(editableNote);
        },
        [
            editableDiagnosis,
            editableDoctor,
            editableDoctorAdvice,
            editableHospital,
            editableNote,
            editablePrescriptionLines,
            editableSymptoms,
            editableTestResults,
        ],
    );

    const closeEditor = useCallback(() => {
        setEditorMode(null);
        setEditorDraft('');
    }, []);

    const saveEditor = useCallback(() => {
        if (!editorMode) return;
        if (editorMode === 'diagnosis') {
            setEditableDiagnosis(editorDraft.trim());
        } else if (editorMode === 'hospital') {
            setEditableHospital(editorDraft.trim());
        } else if (editorMode === 'doctor') {
            setEditableDoctor(editorDraft.trim());
        } else if (editorMode === 'symptoms') {
            setEditableSymptoms(
                editorDraft
                    .split(/\r?\n|,|;/)
                    .map((item) => item.trim())
                    .filter(Boolean),
            );
        } else if (editorMode === 'testResults') {
            setEditableTestResults(editorDraft.trim());
        } else if (editorMode === 'doctorAdvice') {
            setEditableDoctorAdvice(editorDraft.trim());
        } else if (editorMode === 'prescriptions') {
            setEditablePrescriptionLines(
                editorDraft
                    .split(/\r?\n/)
                    .map((line) => line.trim())
                    .filter(Boolean),
            );
        } else {
            setEditableNote(editorDraft.trim());
        }
        closeEditor();
    }, [closeEditor, editorDraft, editorMode]);

    const editorConfig = useMemo(() => {
        switch (editorMode) {
            case 'diagnosis':
                return {
                    title: 'Chỉnh sửa chẩn đoán',
                    label: 'Chẩn đoán',
                    placeholder: 'Nhập chẩn đoán',
                    multiline: true,
                };
            case 'hospital':
                return {
                    title: 'Chỉnh sửa cơ sở y tế',
                    label: 'Cơ sở y tế',
                    placeholder: 'Nhập tên bệnh viện hoặc phòng khám',
                    multiline: false,
                };
            case 'doctor':
                return {
                    title: 'Chỉnh sửa bác sĩ phụ trách',
                    label: 'Bác sĩ phụ trách',
                    placeholder: 'Nhập tên bác sĩ',
                    multiline: false,
                };
            case 'symptoms':
                return {
                    title: 'Chỉnh sửa triệu chứng',
                    label: 'Triệu chứng',
                    placeholder:
                        'Mỗi dòng hoặc mỗi dấu phẩy là một triệu chứng',
                    multiline: true,
                };
            case 'testResults':
                return {
                    title: 'Chỉnh sửa kết quả xét nghiệm',
                    label: 'Kết quả xét nghiệm',
                    placeholder: 'Nhập kết quả xét nghiệm',
                    multiline: true,
                };
            case 'doctorAdvice':
                return {
                    title: 'Chỉnh sửa lời dặn bác sĩ',
                    label: 'Lời dặn bác sĩ',
                    placeholder: 'Nhập lời dặn từ bác sĩ',
                    multiline: true,
                };
            case 'prescriptions':
                return {
                    title: 'Chỉnh sửa đơn thuốc kê',
                    label: 'Đơn thuốc kê',
                    placeholder:
                        'Mỗi dòng là một thuốc kê\nVí dụ: Amlodipine 5mg • Sáng 1 viên • sau ăn',
                    multiline: true,
                };
            case 'note':
                return {
                    title: 'Chỉnh sửa ghi chú',
                    label: 'Ghi chú',
                    placeholder: 'Nhập ghi chú cho hồ sơ khám',
                    multiline: true,
                };
            default:
                return null;
        }
    }, [editorMode]);

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: colors.bg }}
            edges={['left', 'right', 'bottom']}
        >
            <StatusBar
                barStyle='light-content'
                translucent
                backgroundColor='transparent'
            />

            <View style={{ flex: 1, backgroundColor: colors.bg }}>
                {/* HERO */}
                <LinearGradient
                    colors={gradients.familyDuo}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ backgroundColor: gradients.familyDuo[0] }}
                >
                    <SafeAreaView
                        edges={['top']}
                        style={{ backgroundColor: 'transparent' }}
                    />
                    <View style={styles.rdHero}>
                        <View style={styles.rdHeroTopRow}>
                            <Pressable
                                style={styles.rdHeroBack}
                                onPress={onClose}
                            >
                                <Ionicons
                                    name='chevron-back'
                                    size={16}
                                    color='#fff'
                                />
                            </Pressable>
                            <Text
                                style={styles.rdHeroTitle}
                                numberOfLines={1}
                                ellipsizeMode='tail'
                            >
                                {record.title}
                            </Text>
                        </View>

                        <View style={styles.rdMetaRow}>
                            <View style={styles.rdMetaItem}>
                                <View style={styles.rdMetaIcon}>
                                    <Ionicons
                                        name={
                                            record.iconName as keyof typeof Ionicons.glyphMap
                                        }
                                        size={16}
                                        color='#fff'
                                    />
                                </View>
                                <View>
                                    <Text style={styles.rdMetaLabel}>
                                        Chuyên khoa
                                    </Text>
                                    <Text style={styles.rdMetaValue}>
                                        {specLabel}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.rdMetaDivider} />
                            <View style={styles.rdMetaItem}>
                                <View style={styles.rdMetaIcon}>
                                    <Ionicons
                                        name='calendar-outline'
                                        size={14}
                                        color='#fff'
                                    />
                                </View>
                                <View>
                                    <Text style={styles.rdMetaLabel}>
                                        Ngày khám
                                    </Text>
                                    <Text style={styles.rdMetaValue}>
                                        {record.date}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </LinearGradient>

                {/* TAB BAR */}
                <View style={styles.rdTabBar}>
                    {RD_TABS.map((t, i) => (
                        <Pressable
                            key={t}
                            style={[
                                styles.rdTab,
                                activeTab === i && styles.rdTabActive,
                            ]}
                            onPress={() => setActiveTab(i)}
                        >
                            <Text
                                style={[
                                    styles.rdTabText,
                                    activeTab === i && styles.rdTabTextActive,
                                ]}
                            >
                                {t}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* TAB PANELS */}
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    {activeTab === 0 && (
                        <View style={styles.rdInfoCard}>
                            {/* Khoa / Chuyên khoa */}
                            {(editableDepartment || specLabel) && (
                                <Pressable
                                    onPress={() =>
                                        setShowDepartmentPicker(true)
                                    }
                                    style={({ pressed }) => [
                                        styles.rdInfoRow,
                                        styles.rdInfoRowBorder,
                                        pressed && styles.rdInfoRowPressed,
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.rdInfoIcon,
                                            {
                                                backgroundColor:
                                                    colors.secondaryBg,
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name='business-outline'
                                            size={16}
                                            color={colors.secondary}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.rdInfoLabel}>
                                            Khoa / Chuyên khoa
                                        </Text>
                                        {editableDepartment ? (
                                            <Text style={styles.rdInfoValue}>
                                                {editableDepartment}
                                            </Text>
                                        ) : (
                                            <Text style={styles.rdInfoEmpty}>
                                                Chạm để chọn khoa hoặc chuyên
                                                khoa
                                            </Text>
                                        )}
                                    </View>
                                </Pressable>
                            )}

                            {/* Chẩn đoán */}
                            <Pressable
                                onPress={() => openEditor('diagnosis')}
                                style={({ pressed }) => [
                                    styles.rdInfoRow,
                                    styles.rdInfoRowBorder,
                                    pressed && styles.rdInfoRowPressed,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.rdInfoIcon,
                                        { backgroundColor: colors.successBg },
                                    ]}
                                >
                                    <Ionicons
                                        name='checkmark-done-outline'
                                        size={17}
                                        color={colors.success}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.rdInfoLabel}>
                                        Chẩn đoán
                                    </Text>
                                    {editableDiagnosis ? (
                                        <Text style={styles.rdInfoValue}>
                                            {editableDiagnosis}
                                        </Text>
                                    ) : (
                                        <Text style={styles.rdInfoEmpty}>
                                            Chạm để thêm chẩn đoán
                                        </Text>
                                    )}
                                </View>
                            </Pressable>

                            {/* Cơ sở y tế */}
                            <Pressable
                                onPress={() => openEditor('hospital')}
                                style={({ pressed }) => [
                                    styles.rdInfoRow,
                                    styles.rdInfoRowBorder,
                                    pressed && styles.rdInfoRowPressed,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.rdInfoIcon,
                                        { backgroundColor: colors.primaryBg },
                                    ]}
                                >
                                    <Ionicons
                                        name='home-outline'
                                        size={16}
                                        color={colors.primary}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.rdInfoLabel}>
                                        Cơ sở y tế
                                    </Text>
                                    {editableHospital ? (
                                        <Text style={styles.rdInfoValue}>
                                            {editableHospital}
                                        </Text>
                                    ) : (
                                        <Text style={styles.rdInfoEmpty}>
                                            Chạm để thêm cơ sở y tế
                                        </Text>
                                    )}
                                </View>
                            </Pressable>

                            {/* Bác sĩ */}
                            <Pressable
                                onPress={() => openEditor('doctor')}
                                style={({ pressed }) => [
                                    styles.rdInfoRow,
                                    styles.rdInfoRowBorder,
                                    pressed && styles.rdInfoRowPressed,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.rdInfoIcon,
                                        { backgroundColor: colors.successBg },
                                    ]}
                                >
                                    <Ionicons
                                        name='person-outline'
                                        size={16}
                                        color={colors.success}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.rdInfoLabel}>
                                        Bác sĩ phụ trách
                                    </Text>
                                    {editableDoctor ? (
                                        <Text style={styles.rdInfoValue}>
                                            {editableDoctor}
                                        </Text>
                                    ) : (
                                        <Text style={styles.rdInfoEmpty}>
                                            Chạm để thêm bác sĩ phụ trách
                                        </Text>
                                    )}
                                </View>
                            </Pressable>

                            {/* Triệu chứng */}
                            <Pressable
                                onPress={() => openEditor('symptoms')}
                                style={({ pressed }) => [
                                    styles.rdInfoRow,
                                    styles.rdInfoRowBorder,
                                    pressed && styles.rdInfoRowPressed,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.rdInfoIcon,
                                        { backgroundColor: colors.dangerBg },
                                    ]}
                                >
                                    <Ionicons
                                        name='alert-circle-outline'
                                        size={16}
                                        color={colors.danger}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.rdInfoLabel}>
                                        Triệu chứng
                                    </Text>
                                    {editableSymptoms.length ? (
                                        <View style={styles.rdInfoChipWrap}>
                                            {editableSymptoms.map(
                                                (s: string) => (
                                                    <View
                                                        key={s}
                                                        style={
                                                            styles.rdInfoChip
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.rdInfoChipText
                                                            }
                                                        >
                                                            {s}
                                                        </Text>
                                                    </View>
                                                ),
                                            )}
                                        </View>
                                    ) : (
                                        <Text style={styles.rdInfoEmpty}>
                                            Chạm để thêm triệu chứng
                                        </Text>
                                    )}
                                </View>
                            </Pressable>

                            {/* Kết quả xét nghiệm */}
                            <Pressable
                                onPress={() => openEditor('testResults')}
                                style={({ pressed }) => [
                                    styles.rdInfoRow,
                                    styles.rdInfoRowBorder,
                                    pressed && styles.rdInfoRowPressed,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.rdInfoIcon,
                                        { backgroundColor: colors.primaryBg },
                                    ]}
                                >
                                    <Ionicons
                                        name='flask-outline'
                                        size={16}
                                        color={colors.primary}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.rdInfoLabel}>
                                        Kết quả xét nghiệm
                                    </Text>
                                    {editableTestResults ? (
                                        <Text style={styles.rdInfoValue}>
                                            {editableTestResults}
                                        </Text>
                                    ) : (
                                        <Text style={styles.rdInfoEmpty}>
                                            Chạm để thêm kết quả xét nghiệm
                                        </Text>
                                    )}
                                </View>
                            </Pressable>

                            {/* Lời dặn bác sĩ */}
                            <Pressable
                                onPress={() => openEditor('doctorAdvice')}
                                style={({ pressed }) => [
                                    styles.rdInfoRow,
                                    styles.rdInfoRowBorder,
                                    pressed && styles.rdInfoRowPressed,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.rdInfoIcon,
                                        { backgroundColor: colors.warningBg },
                                    ]}
                                >
                                    <Ionicons
                                        name='chatbox-ellipses-outline'
                                        size={16}
                                        color={colors.warning}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.rdInfoLabel}>
                                        Lời dặn bác sĩ
                                    </Text>
                                    {editableDoctorAdvice ? (
                                        <Text style={styles.rdInfoValue}>
                                            {editableDoctorAdvice}
                                        </Text>
                                    ) : (
                                        <Text style={styles.rdInfoEmpty}>
                                            Chạm để thêm lời dặn từ bác sĩ
                                        </Text>
                                    )}
                                </View>
                            </Pressable>

                            {/* Đơn thuốc kê */}
                            <Pressable
                                onPress={() => openEditor('prescriptions')}
                                style={({ pressed }) => [
                                    styles.rdInfoRow,
                                    styles.rdInfoRowBorder,
                                    pressed && styles.rdInfoRowPressed,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.rdInfoIcon,
                                        { backgroundColor: colors.primaryBg },
                                    ]}
                                >
                                    <Ionicons
                                        name='medkit-outline'
                                        size={16}
                                        color={colors.primary}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.rdInfoLabel}>
                                        Đơn thuốc kê
                                    </Text>
                                    {editablePrescriptionLines.length ? (
                                        <View style={{ marginTop: 8, gap: 8 }}>
                                            {editablePrescriptionLines.map(
                                                (line, idx) => (
                                                    <Text
                                                        key={`${line}-${idx}`}
                                                        style={
                                                            styles.rdInfoValue
                                                        }
                                                    >
                                                        {idx + 1}. {line}
                                                    </Text>
                                                ),
                                            )}
                                        </View>
                                    ) : (
                                        <Text style={styles.rdInfoEmpty}>
                                            Chạm để thêm đơn thuốc kê
                                        </Text>
                                    )}
                                </View>
                            </Pressable>

                            {/* Ghi chú */}
                            <Pressable
                                onPress={() => openEditor('note')}
                                style={({ pressed }) => [
                                    styles.rdInfoRow,
                                    pressed && styles.rdInfoRowPressed,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.rdInfoIcon,
                                        { backgroundColor: '#EEF2FF' },
                                    ]}
                                >
                                    <Ionicons
                                        name='document-text-outline'
                                        size={16}
                                        color='#7C3AED'
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.rdInfoLabel}>
                                        Ghi chú
                                    </Text>
                                    {editableNote ? (
                                        <Text style={styles.rdInfoValue}>
                                            {editableNote}
                                        </Text>
                                    ) : (
                                        <Text style={styles.rdInfoEmpty}>
                                            Nhấn để thêm ghi chú…
                                        </Text>
                                    )}
                                </View>
                            </Pressable>
                        </View>
                    )}

                    {activeTab === 1 && (
                        <View>
                            <View style={styles.rdFollowHeader}>
                                <Text
                                    style={[
                                        styles.arSectionTitle,
                                        { marginBottom: 0 },
                                    ]}
                                >
                                    HẸN TÁI KHÁM
                                </Text>
                                <Pressable
                                    style={[
                                        styles.rdFollowBtn,
                                        showAddFu && styles.rdFollowBtnActive,
                                    ]}
                                    onPress={
                                        showAddFu
                                            ? toggleFollowUpForm
                                            : handleAddFollowUp
                                    }
                                >
                                    <Ionicons
                                        name={
                                            showAddFu ? 'close-outline' : 'add'
                                        }
                                        size={14}
                                        color={colors.text2}
                                    />
                                    <Text
                                        style={[
                                            styles.rdFollowBtnText,
                                            showAddFu && {
                                                color: colors.text2,
                                            },
                                        ]}
                                    >
                                        {showAddFu ? 'Ẩn form' : 'Thêm lịch'}
                                    </Text>
                                </Pressable>
                            </View>

                            {showAddFu && (
                                <View style={styles.fuCard}>
                                    <View style={styles.fuCardHeader}>
                                        <View style={styles.fuCardIcon}>
                                            <Ionicons
                                                name='calendar-outline'
                                                size={16}
                                                color={colors.primary}
                                            />
                                        </View>
                                        <Text style={styles.fuCardTitle}>
                                            Thêm lịch tái khám
                                        </Text>
                                    </View>
                                    <View
                                        style={[styles.fuField, { zIndex: 10 }]}
                                    >
                                        <Text style={styles.fuLabel}>
                                            Ngày hẹn
                                        </Text>
                                        <DateField
                                            value={fuDate}
                                            onChange={setFuDate}
                                        />
                                    </View>
                                    <View style={styles.fuField}>
                                        <Text style={styles.fuLabel}>
                                            Giờ hẹn
                                        </Text>
                                        <DateField
                                            value={fuTime}
                                            onChange={setFuTime}
                                            mode='time'
                                        />
                                    </View>
                                    <View style={styles.fuField}>
                                        <Text style={styles.fuLabel}>
                                            Bệnh viện / Phòng khám
                                        </Text>
                                        <TextInput
                                            value={fuHospital}
                                            onChangeText={setFuHospital}
                                            placeholder='VD: BV Đại học Y Dược'
                                            placeholderTextColor={colors.text3}
                                            style={styles.fuInput}
                                        />
                                    </View>
                                    <View style={styles.fuField}>
                                        <Text style={styles.fuLabel}>
                                            Bác sĩ
                                        </Text>
                                        <TextInput
                                            value={fuDoctor}
                                            onChangeText={setFuDoctor}
                                            placeholder='VD: BS. Nguyễn Văn A'
                                            placeholderTextColor={colors.text3}
                                            style={styles.fuInput}
                                        />
                                    </View>
                                    <View style={styles.fuField}>
                                        <Text style={styles.fuLabel}>
                                            Mục đích tái khám
                                        </Text>
                                        <TextInput
                                            value={fuPurpose}
                                            onChangeText={setFuPurpose}
                                            placeholder='VD: Theo dõi huyết áp, tái khám định kỳ…'
                                            placeholderTextColor={colors.text3}
                                            style={styles.fuTextarea}
                                            multiline
                                            numberOfLines={3}
                                        />
                                    </View>
                                    <View style={styles.fuField}>
                                        <Text style={styles.fuLabel}>
                                            Ghi chú
                                        </Text>
                                        <TextInput
                                            value={fuNotes}
                                            onChangeText={setFuNotes}
                                            placeholder='Ghi chú thêm (nếu có)'
                                            placeholderTextColor={colors.text3}
                                            style={styles.fuTextarea}
                                            multiline
                                            numberOfLines={4}
                                        />
                                    </View>
                                    <View style={styles.fuField}>
                                        <Text style={styles.fuLabel}>
                                            Nhắc trước
                                        </Text>
                                        <Pressable
                                            style={styles.fuReminderSelect}
                                            onPress={() =>
                                                setShowFuReminderOptions(
                                                    (prev) => !prev,
                                                )
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.fuReminderSelectText
                                                }
                                            >
                                                {fuReminderTime}
                                            </Text>
                                            <Ionicons
                                                name={
                                                    showFuReminderOptions
                                                        ? 'chevron-up'
                                                        : 'chevron-down'
                                                }
                                                size={16}
                                                color={colors.text3}
                                            />
                                        </Pressable>
                                        {showFuReminderOptions ? (
                                            <View
                                                style={
                                                    styles.fuReminderOptionWrap
                                                }
                                            >
                                                {FOLLOW_UP_REMINDER_OPTIONS.map(
                                                    (option) => (
                                                        <Pressable
                                                            key={option}
                                                            style={[
                                                                styles.fuReminderOption,
                                                                fuReminderTime ===
                                                                    option &&
                                                                    styles.fuReminderOptionActive,
                                                            ]}
                                                            onPress={() =>
                                                                selectFuReminder(
                                                                    option,
                                                                )
                                                            }
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.fuReminderOptionText,
                                                                    fuReminderTime ===
                                                                        option &&
                                                                        styles.fuReminderOptionTextActive,
                                                                ]}
                                                            >
                                                                {option}
                                                            </Text>
                                                        </Pressable>
                                                    ),
                                                )}
                                            </View>
                                        ) : null}
                                    </View>
                                    <View style={styles.fuBtnRow}>
                                        <Pressable
                                            style={styles.fuCancelBtn}
                                            onPress={cancelFu}
                                        >
                                            <Text style={styles.fuCancelText}>
                                                Huỷ
                                            </Text>
                                        </Pressable>
                                        <Pressable
                                            style={styles.fuSaveBtn}
                                            onPress={saveFu}
                                        >
                                            <Text style={styles.fuSaveText}>
                                                Lưu hẹn
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}

                            {/* Saved follow-ups */}
                            {followUps.map((fu) => (
                                <View key={fu.id} style={styles.fuItem}>
                                    <View style={styles.fuItemIcon}>
                                        <Ionicons
                                            name='calendar-outline'
                                            size={16}
                                            color={colors.primary}
                                        />
                                    </View>
                                    <View style={styles.fuItemBody}>
                                        <Text style={styles.fuItemDate}>
                                            {fu.date} - {fu.time}
                                        </Text>
                                        <Text style={styles.fuItemPurpose}>
                                            {fu.purpose}
                                        </Text>
                                        {fu.facility_name || fu.doctor_name ? (
                                            <Text style={styles.fuItemPurpose}>
                                                {[
                                                    fu.facility_name,
                                                    fu.doctor_name,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </Text>
                                        ) : null}
                                        {fu.notes ? (
                                            <Text style={styles.fuItemPurpose}>
                                                {fu.notes}
                                            </Text>
                                        ) : null}
                                        <Text style={styles.fuItemReminder}>
                                            Nhắc: {fu.reminder_label}
                                        </Text>
                                    </View>
                                    <Pressable
                                        style={styles.fuItemDelete}
                                        onPress={() => deleteFu(fu.id)}
                                    >
                                        <Ionicons
                                            name='trash-outline'
                                            size={14}
                                            color={colors.danger}
                                        />
                                    </Pressable>
                                </View>
                            ))}

                            {/* Empty state (only when no add form and no items) */}
                            {!showAddFu && followUps.length === 0 && (
                                <View style={styles.rdEmptyWrap}>
                                    <Ionicons
                                        name='calendar-outline'
                                        size={28}
                                        color={colors.text3}
                                    />
                                    <Text style={styles.rdEmptyTitle}>
                                        Chưa có lịch tái khám
                                    </Text>
                                    <Text style={styles.rdEmptySub}>
                                        Nhấn &quot;Thêm lịch&quot; để đặt ngày
                                        tái khám
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {activeTab === 2 && (
                        <View>
                            <AttachmentUploadBlock
                                title='Tài liệu đính kèm'
                                attachments={editableAttachments}
                                onChange={setEditableAttachments}
                            />
                        </View>
                    )}
                </ScrollView>
                <Modal
                    visible={Boolean(editorConfig)}
                    transparent
                    animationType='slide'
                    onRequestClose={closeEditor}
                >
                    <Pressable style={shared.overlay} onPress={closeEditor}>
                        <Pressable
                            style={[
                                shared.sheetContainer,
                                styles.rdEditorSheet,
                            ]}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <View style={shared.sheetHandle}>
                                <View style={shared.sheetBar} />
                            </View>
                            <View style={shared.sheetHeader}>
                                <Text style={shared.sheetTitle}>
                                    {editorConfig?.title}
                                </Text>
                            </View>
                            <View style={shared.sheetBody}>
                                <View style={styles.rdEditorField}>
                                    <Text style={styles.rdEditorLabel}>
                                        {editorConfig?.label}
                                    </Text>
                                    <TextInput
                                        value={editorDraft}
                                        onChangeText={setEditorDraft}
                                        placeholder={editorConfig?.placeholder}
                                        placeholderTextColor={colors.text3}
                                        style={styles.rdEditorInput}
                                        multiline={editorConfig?.multiline}
                                        textAlignVertical='top'
                                    />
                                    {editorMode === 'prescriptions' && (
                                        <Text style={styles.rdEditorHint}>
                                            Mỗi dòng là một thuốc kê. Bạn có thể
                                            sửa trực tiếp từng dòng tại đây.
                                        </Text>
                                    )}
                                </View>
                            </View>
                            <View style={shared.sheetBtnRow}>
                                <Pressable
                                    style={shared.sheetBtnGhost}
                                    onPress={closeEditor}
                                >
                                    <Text style={shared.sheetBtnGhostText}>
                                        Huỷ
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={[
                                        shared.sheetBtnPrimary,
                                        {
                                            flex: 1.2,
                                            backgroundColor: colors.primary,
                                        },
                                    ]}
                                    onPress={saveEditor}
                                >
                                    <Text style={shared.sheetBtnPrimaryText}>
                                        Lưu
                                    </Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>
                <CustomReminderModal
                    visible={showFuCustomReminder}
                    onClose={() => setShowFuCustomReminder(false)}
                    onSave={setFuReminderTime}
                />
                <Modal
                    visible={showDepartmentPicker}
                    transparent
                    animationType='fade'
                    onRequestClose={() => setShowDepartmentPicker(false)}
                >
                    <Pressable
                        style={shared.overlay}
                        onPress={() => setShowDepartmentPicker(false)}
                    >
                        <Pressable
                            style={[
                                shared.sheetContainer,
                                { paddingBottom: 32 },
                            ]}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <View style={shared.sheetHandle}>
                                <View style={shared.sheetBar} />
                            </View>
                            <Text
                                style={{
                                    fontSize: 15,
                                    fontWeight: '800',
                                    color: colors.text,
                                    paddingHorizontal: 20,
                                    marginBottom: 4,
                                }}
                            >
                                Chọn chuyên khoa
                            </Text>
                            <ScrollView
                                style={{ maxHeight: 340 }}
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={styles.specGrid}>
                                    {SPECIALTIES.map((specialty) => (
                                        <Pressable
                                            key={specialty.key}
                                            style={[
                                                styles.specItem,
                                                editableDepartmentKey ===
                                                    specialty.key &&
                                                    styles.specItemActive,
                                            ]}
                                            onPress={() => {
                                                setEditableDepartmentKey(
                                                    specialty.key,
                                                );
                                                setEditableDepartment(
                                                    toDepartmentLabel(
                                                        specialty.key,
                                                    ),
                                                );
                                                setShowDepartmentPicker(false);
                                            }}
                                        >
                                            <View
                                                style={[
                                                    styles.specIcon,
                                                    {
                                                        backgroundColor:
                                                            specialty.bg,
                                                    },
                                                ]}
                                            >
                                                <Ionicons
                                                    name={specialty.icon}
                                                    size={16}
                                                    color={specialty.color}
                                                />
                                            </View>
                                            <Text
                                                style={[
                                                    styles.specLabel,
                                                    editableDepartmentKey ===
                                                        specialty.key &&
                                                        styles.specLabelActive,
                                                ]}
                                            >
                                                {specialty.label}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </ScrollView>
                        </Pressable>
                    </Pressable>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

/* ═══════════════════════════════════
   ADD RECORD FORM
═══════════════════════════════════ */
function AddRecordForm({
    onClose,
}: {
    onClose: () => void;
}): React.JSX.Element {
    const queryClient = useQueryClient();
    const { data: healthProfile } = useMeHealthProfileQuery();
    const { data: meOverview } = useMeOverviewQuery();
    const [name, setName] = useState('');
    const [date, setDate] = useState(new Date());
    const [type, setType] = useState('');
    const [hospital, setHospital] = useState('');
    const [doctor, setDoctor] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [symptoms, setSymptoms] = useState(''); // Text input for simple list
    const [testResults, setTestResults] = useState('');
    const [doctorAdvice, setDoctorAdvice] = useState('');
    const [prescriptions, setPrescriptions] = useState<
        RecordPrescriptionItem[]
    >([]);
    const [attachments, setAttachments] = useState<AttachmentUploadItem[]>([]);
    const [typePicker, setTypePicker] = useState(false);
    const [medicineSheetOpen, setMedicineSheetOpen] = useState(false);

    // For Hẹn tái khám (Follow-up)
    const [showAddFu, setShowAddFu] = useState(false);
    const [followUps, setFollowUps] = useState<FollowUpEntry[]>([]);
    const [fuDate, setFuDate] = useState(new Date());
    const [fuTime, setFuTime] = useState(new Date());
    const [fuHospital, setFuHospital] = useState('');
    const [fuDoctor, setFuDoctor] = useState('');
    const [fuPurpose, setFuPurpose] = useState('');
    const [fuNotes, setFuNotes] = useState('');
    const [fuReminderTime, setFuReminderTime] = useState('1 ngày trước');
    const [showFuReminderOptions, setShowFuReminderOptions] = useState(false);
    const [showFuCustomReminder, setShowFuCustomReminder] = useState(false);

    const selectedType = ALL_TYPES.find((t) => t.key === type);
    const profileId =
        nullableString(
            (healthProfile as Record<string, unknown> | null)?.profile_id,
        ) ??
        nullableString(
            (meOverview?.profile as Record<string, unknown> | null)?.id,
        );

    const createRecordMutation = useMutation({
        mutationFn: async () => {
            if (!profileId) {
                throw new Error('Khong xac dinh duoc ho so suc khoe');
            }

            const symptomList = symptoms
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);

            if (__DEV__) {
                console.warn('[Records] Creating medical record', {
                    profileId,
                    title: name.trim() || diagnosis.trim() || null,
                    hospital: hospital.trim() || null,
                    visit_date: date.toISOString().slice(0, 10),
                });
            }

            return medicalRecordsService.create(profileId, {
                title: name.trim() || diagnosis.trim() || null,
                diagnosis_name: diagnosis.trim() || null,
                doctor_name: doctor.trim() || null,
                hospital_name: hospital.trim() || null,
                visit_date: date.toISOString().slice(0, 10),
                specialty: type.trim() || null,
                symptoms: symptomList.length > 0 ? symptomList : null,
                test_results: testResults.trim() || null,
                doctor_advice: doctorAdvice.trim() || null,
                notes: null,
            });
        },
        onSuccess: async (createdRecord) => {
            await queryClient.invalidateQueries({
                queryKey: meQueryKeys.overview(),
            });
            if (profileId) {
                await queryClient.invalidateQueries({
                    queryKey: medicalRecordsQueryKeys.byProfile(profileId),
                });
                if (__DEV__) {
                    const refreshed = await queryClient.fetchQuery({
                        queryKey: medicalRecordsQueryKeys.byProfile(profileId),
                        queryFn: () =>
                            medicalRecordsService.listForProfile(profileId),
                    });
                    console.warn('[Records] Created medical record success', {
                        profileId,
                        createdRecordId: createdRecord?.id ?? null,
                        totalRecordsAfterRefresh: refreshed.length,
                    });
                }
            }
            appToast.showSuccess('Da luu ho so kham benh');
            onClose();
        },
        onError: (error) => {
            appToast.showError(
                'Khong the luu ho so',
                getApiErrorMessage(error, 'Vui long thu lai.'),
            );
        },
    });

    const handleSaveRecord = useCallback(() => {
        if (!profileId) {
            appToast.showError('Khong xac dinh duoc ho so suc khoe');
            return;
        }

        if (!name.trim()) {
            appToast.showWarning('Vui long nhap ten ho so');
            return;
        }

        if (!hospital.trim()) {
            appToast.showWarning('Vui long nhap benh vien hoac phong kham');
            return;
        }

        if (!diagnosis.trim()) {
            appToast.showWarning('Vui long nhap chan doan');
            return;
        }

        createRecordMutation.mutate();
    }, [profileId, name, hospital, diagnosis, createRecordMutation]);

    const handleAddPrescription = (medicine: {
        medicine_name?: string;
        dosage_value?: string;
        dosage_unit?: string;
        instruction?: string;
    }) => {
        const dose = [medicine.dosage_value, medicine.dosage_unit]
            .filter(Boolean)
            .join('');
        setPrescriptions((prev) => [
            ...prev,
            {
                name: medicine.medicine_name?.trim() || 'Thuốc chưa đặt tên',
                dose: dose || undefined,
                schedule: medicine.instruction?.trim() || undefined,
            },
        ]);
        setMedicineSheetOpen(false);
    };

    const toggleFollowUpForm = useCallback(() => {
        setShowAddFu((prev) => {
            const next = !prev;
            if (next) {
                setFuDate(new Date());
                setFuTime(new Date());
                setFuHospital('');
                setFuDoctor('');
                setFuPurpose('');
                setFuNotes('');
                setFuReminderTime('1 ngày trước');
                setShowFuReminderOptions(false);
                setShowFuCustomReminder(false);
            }
            return next;
        });
    }, []);

    const saveFollowUp = useCallback(() => {
        const dd = String(fuDate.getDate()).padStart(2, '0');
        const mm = String(fuDate.getMonth() + 1).padStart(2, '0');
        const yyyy = fuDate.getFullYear();

        setFollowUps((prev) => [
            {
                id: `${Date.now()}`,
                date: `${dd}/${mm}/${yyyy}`,
                time: formatFollowUpTime(fuTime),
                facility_name: fuHospital.trim(),
                doctor_name: fuDoctor.trim(),
                purpose: fuPurpose.trim() || 'Tái khám định kỳ',
                notes: fuNotes.trim(),
                reminder_label: fuReminderTime,
            },
            ...prev,
        ]);
        setShowAddFu(false);
        setFuDate(new Date());
        setFuTime(new Date());
        setFuHospital('');
        setFuDoctor('');
        setFuPurpose('');
        setFuNotes('');
        setFuReminderTime('1 ngày trước');
        setShowFuReminderOptions(false);
        setShowFuCustomReminder(false);
    }, [
        fuDate,
        fuTime,
        fuHospital,
        fuDoctor,
        fuPurpose,
        fuNotes,
        fuReminderTime,
    ]);

    const deleteFollowUp = useCallback((id: string) => {
        setFollowUps((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const selectFuReminder = useCallback((option: string) => {
        setShowFuReminderOptions(false);
        if (option === 'Tùy chỉnh') {
            setShowFuCustomReminder(true);
            return;
        }
        setFuReminderTime(option);
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.card} />

            {/* TOP BAR */}
            <View style={styles.subTopbar}>
                <Pressable style={styles.subBackBtn} onPress={onClose}>
                    <Ionicons
                        name='chevron-back'
                        size={18}
                        color={colors.text2}
                    />
                </Pressable>
                <View style={styles.subTopbarTitleCenterWrap}>
                    <Text
                        style={[
                            styles.subTopbarTitle,
                            styles.subTopbarTitleCentered,
                        ]}
                    >
                        Hồ sơ khám bệnh
                    </Text>
                </View>
                <View style={styles.subTopbarActionPlaceholder} />
            </View>

            <ScrollView
                style={{ flex: 1, backgroundColor: colors.bg }}
                contentContainerStyle={{
                    padding: 20,
                    paddingBottom: 100,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
            >
                {/* THÔNG TIN KHÁM */}
                <Text style={styles.arSectionTitle}>THÔNG TIN KHÁM</Text>

                {/* Tên hồ sơ */}
                <View style={styles.arGroup}>
                    <Text style={styles.arLabel}>
                        Tên hồ sơ{' '}
                        <Text style={{ color: colors.danger }}>*</Text>
                    </Text>
                    <TextInput
                        style={styles.arInput}
                        placeholder='VD: Khám tim mạch định kỳ'
                        placeholderTextColor={colors.text3}
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                {/* Ngày khám + Chuyên khoa */}
                <View style={styles.arRow}>
                    <View style={[styles.arGroup, { flex: 1 }]}>
                        <Text style={styles.arLabel}>
                            Ngày khám{' '}
                            <Text style={{ color: colors.danger }}>*</Text>
                        </Text>
                        <DateField value={date} onChange={setDate} />
                    </View>

                    <View style={[styles.arGroup, { flex: 1 }]}>
                        <Text style={styles.arLabel}>Chuyên khoa</Text>
                        <Pressable
                            style={styles.arSelectWrap}
                            onPress={() => setTypePicker(true)}
                        >
                            {selectedType ? (
                                <Text style={styles.arSelectText}>
                                    {selectedType.label}
                                </Text>
                            ) : (
                                <Text style={styles.arSelectPlaceholder}>
                                    Chọn...
                                </Text>
                            )}
                            <Ionicons
                                name='chevron-down-outline'
                                size={14}
                                color={colors.text3}
                            />
                        </Pressable>
                    </View>
                </View>

                {/* Cơ sở y tế */}
                <View style={styles.arGroup}>
                    <Text style={styles.arLabel}>
                        Bệnh viện / Phòng khám{' '}
                        <Text style={{ color: colors.danger }}>*</Text>
                    </Text>
                    <View style={styles.arInputIcon}>
                        <Ionicons
                            name='home-outline'
                            size={15}
                            color={colors.text3}
                        />
                        <TextInput
                            style={styles.arInputBare}
                            placeholder='BV Đại học Y Dược'
                            placeholderTextColor={colors.text3}
                            value={hospital}
                            onChangeText={setHospital}
                        />
                    </View>
                </View>

                {/* Bác sĩ */}
                <View style={styles.arGroup}>
                    <Text style={styles.arLabel}>Bác sĩ điều trị</Text>
                    <View style={styles.arInputIcon}>
                        <Ionicons
                            name='person-outline'
                            size={15}
                            color={colors.text3}
                        />
                        <TextInput
                            style={styles.arInputBare}
                            placeholder='BS. Lê Văn Hùng'
                            placeholderTextColor={colors.text3}
                            value={doctor}
                            onChangeText={setDoctor}
                        />
                    </View>
                </View>

                <View style={[styles.arDivider, { marginVertical: 24 }]} />
                <Text style={styles.arSectionTitle}>KẾT QUẢ KHÁM</Text>

                {/* Chẩn đoán */}
                <View style={styles.arGroup}>
                    <Text style={styles.arLabel}>
                        Chẩn đoán{' '}
                        <Text style={{ color: colors.danger }}>*</Text>
                    </Text>
                    <TextInput
                        style={styles.arInput}
                        placeholder='VD: Tăng huyết áp giai đoạn 1'
                        placeholderTextColor={colors.text3}
                        value={diagnosis}
                        onChangeText={setDiagnosis}
                    />
                </View>

                {/* Triệu chứng */}
                <View style={styles.arGroup}>
                    <Text style={styles.arLabel}>Triệu chứng</Text>
                    <TextInput
                        style={styles.arInput}
                        placeholder='Đau đầu, chóng mặt...'
                        placeholderTextColor={colors.text3}
                        value={symptoms}
                        onChangeText={setSymptoms}
                    />
                </View>

                {/* Kết quả xét nghiệm */}
                <View style={styles.arGroup}>
                    <Text style={styles.arLabel}>Kết quả xét nghiệm</Text>
                    <TextInput
                        style={styles.arTextarea}
                        placeholder='VD: Cholesterol 5.8 mmol/L...'
                        placeholderTextColor={colors.text3}
                        value={testResults}
                        onChangeText={setTestResults}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Lời dặn bác sĩ */}
                <View style={styles.arGroup}>
                    <Text style={styles.arLabel}>Lời dặn bác sĩ</Text>
                    <TextInput
                        style={styles.arTextarea}
                        placeholder='VD: Giảm muối, tập thể dục 30p/ngày...'
                        placeholderTextColor={colors.text3}
                        value={doctorAdvice}
                        onChangeText={setDoctorAdvice}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View style={[styles.arDivider, { marginVertical: 24 }]} />
                <Text style={styles.arSectionTitle}>ĐƠN THUỐC KÊ</Text>
                <View style={styles.arGroup}>
                    <Pressable
                        style={{
                            padding: 12,
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 12,
                            borderStyle: 'dashed',
                            alignItems: 'center',
                        }}
                        onPress={() => setMedicineSheetOpen(true)}
                    >
                        <Text
                            style={{
                                color: colors.primary,
                                fontFamily: typography.font.bold,
                            }}
                        >
                            + Thêm thuốc vào đơn
                        </Text>
                    </Pressable>
                    {prescriptions.length ? (
                        <View style={{ marginTop: 12, gap: 10 }}>
                            {prescriptions.map((item, idx) => (
                                <View
                                    key={`${item.name}-${idx}`}
                                    style={{
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        borderRadius: 14,
                                        paddingHorizontal: 14,
                                        paddingVertical: 12,
                                        backgroundColor: '#fff',
                                        gap: 4,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontFamily: typography.font.bold,
                                            fontSize: 15,
                                            color: colors.text,
                                        }}
                                    >
                                        {idx + 1}. {item.name}
                                    </Text>
                                    {item.dose || item.schedule ? (
                                        <Text
                                            style={{
                                                fontFamily:
                                                    typography.font.medium,
                                                fontSize: 13,
                                                color: colors.text2,
                                            }}
                                        >
                                            {[item.dose, item.schedule]
                                                .filter(Boolean)
                                                .join(' • ')}
                                        </Text>
                                    ) : null}
                                </View>
                            ))}
                        </View>
                    ) : null}
                </View>

                <View style={[styles.arDivider, { marginVertical: 24 }]} />
                <View style={styles.arGroup}>
                    <AttachmentUploadBlock
                        attachments={attachments}
                        onChange={setAttachments}
                    />
                </View>

                <View style={[styles.arDivider, { marginVertical: 24 }]} />

                <View style={styles.rdFollowHeader}>
                    <Text style={[styles.arSectionTitle, { marginBottom: 0 }]}>
                        HẸN TÁI KHÁM
                    </Text>
                    <Pressable
                        style={[
                            styles.rdFollowBtn,
                            showAddFu && styles.rdFollowBtnActive,
                        ]}
                        onPress={toggleFollowUpForm}
                    >
                        <Ionicons
                            name={showAddFu ? 'close-outline' : 'add'}
                            size={14}
                            color={colors.text2}
                        />
                        <Text
                            style={[
                                styles.rdFollowBtnText,
                                showAddFu && { color: colors.text2 },
                            ]}
                        >
                            {showAddFu ? 'Ẩn form' : 'Thêm hẹn'}
                        </Text>
                    </Pressable>
                </View>

                {showAddFu && (
                    <View style={styles.fuCard}>
                        <View style={styles.fuCardHeader}>
                            <View style={styles.fuCardIcon}>
                                <Ionicons
                                    name='calendar-outline'
                                    size={16}
                                    color={colors.primary}
                                />
                            </View>
                            <Text style={styles.fuCardTitle}>
                                Thêm lịch tái khám
                            </Text>
                        </View>
                        <View style={[styles.fuField, { zIndex: 10 }]}>
                            <Text style={styles.fuLabel}>Ngày hẹn</Text>
                            <DateField value={fuDate} onChange={setFuDate} />
                        </View>
                        <View style={styles.fuField}>
                            <Text style={styles.fuLabel}>Giờ hẹn</Text>
                            <DateField
                                value={fuTime}
                                onChange={setFuTime}
                                mode='time'
                            />
                        </View>
                        <View style={styles.fuField}>
                            <Text style={styles.fuLabel}>
                                Bệnh viện / Phòng khám
                            </Text>
                            <TextInput
                                value={fuHospital}
                                onChangeText={setFuHospital}
                                placeholder='VD: BV Đại học Y Dược'
                                placeholderTextColor={colors.text3}
                                style={styles.fuInput}
                            />
                        </View>
                        <View style={styles.fuField}>
                            <Text style={styles.fuLabel}>Bác sĩ</Text>
                            <TextInput
                                value={fuDoctor}
                                onChangeText={setFuDoctor}
                                placeholder='VD: BS. Nguyễn Văn A'
                                placeholderTextColor={colors.text3}
                                style={styles.fuInput}
                            />
                        </View>
                        <View style={styles.fuField}>
                            <Text style={styles.fuLabel}>
                                Mục đích tái khám
                            </Text>
                            <TextInput
                                value={fuPurpose}
                                onChangeText={setFuPurpose}
                                placeholder='VD: Theo dõi huyết áp…'
                                placeholderTextColor={colors.text3}
                                style={styles.fuTextarea}
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                        <View style={styles.fuField}>
                            <Text style={styles.fuLabel}>Ghi chú</Text>
                            <TextInput
                                value={fuNotes}
                                onChangeText={setFuNotes}
                                placeholder='Ghi chú thêm (nếu có)'
                                placeholderTextColor={colors.text3}
                                style={styles.fuTextarea}
                                multiline
                                numberOfLines={4}
                            />
                        </View>
                        <View style={styles.fuField}>
                            <Text style={styles.fuLabel}>Nhắc trước</Text>
                            <Pressable
                                style={styles.fuReminderSelect}
                                onPress={() =>
                                    setShowFuReminderOptions((prev) => !prev)
                                }
                            >
                                <Text style={styles.fuReminderSelectText}>
                                    {fuReminderTime}
                                </Text>
                                <Ionicons
                                    name={
                                        showFuReminderOptions
                                            ? 'chevron-up'
                                            : 'chevron-down'
                                    }
                                    size={16}
                                    color={colors.text3}
                                />
                            </Pressable>
                            {showFuReminderOptions ? (
                                <View style={styles.fuReminderOptionWrap}>
                                    {FOLLOW_UP_REMINDER_OPTIONS.map(
                                        (option) => (
                                            <Pressable
                                                key={option}
                                                style={[
                                                    styles.fuReminderOption,
                                                    fuReminderTime === option &&
                                                        styles.fuReminderOptionActive,
                                                ]}
                                                onPress={() =>
                                                    selectFuReminder(option)
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.fuReminderOptionText,
                                                        fuReminderTime ===
                                                            option &&
                                                            styles.fuReminderOptionTextActive,
                                                    ]}
                                                >
                                                    {option}
                                                </Text>
                                            </Pressable>
                                        ),
                                    )}
                                </View>
                            ) : null}
                        </View>
                        <View style={styles.fuBtnRow}>
                            <Pressable
                                style={styles.fuCancelBtn}
                                onPress={() => setShowAddFu(false)}
                            >
                                <Text style={styles.fuCancelText}>Huỷ</Text>
                            </Pressable>
                            <Pressable
                                style={styles.fuSaveBtn}
                                onPress={saveFollowUp}
                            >
                                <Text style={styles.fuSaveText}>Lưu hẹn</Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                {followUps.map((item) => (
                    <View key={item.id} style={styles.fuItem}>
                        <View style={styles.fuItemIcon}>
                            <Ionicons
                                name='calendar-outline'
                                size={16}
                                color={colors.primary}
                            />
                        </View>
                        <View style={styles.fuItemBody}>
                            <Text style={styles.fuItemDate}>
                                {item.date} - {item.time}
                            </Text>
                            <Text style={styles.fuItemPurpose}>
                                {item.purpose}
                            </Text>
                            {item.facility_name || item.doctor_name ? (
                                <Text style={styles.fuItemPurpose}>
                                    {[item.facility_name, item.doctor_name]
                                        .filter(Boolean)
                                        .join(' · ')}
                                </Text>
                            ) : null}
                            {item.notes ? (
                                <Text style={styles.fuItemPurpose}>
                                    {item.notes}
                                </Text>
                            ) : null}
                            <Text style={styles.fuItemReminder}>
                                Nhắc: {item.reminder_label}
                            </Text>
                        </View>
                        <Pressable
                            style={styles.fuItemDelete}
                            onPress={() => deleteFollowUp(item.id)}
                        >
                            <Ionicons
                                name='trash-outline'
                                size={14}
                                color={colors.danger}
                            />
                        </Pressable>
                    </View>
                ))}

                {!showAddFu && followUps.length === 0 ? (
                    <View
                        style={{
                            borderWidth: 1,
                            borderStyle: 'dashed',
                            borderColor: colors.border,
                            borderRadius: 14,
                            paddingVertical: 14,
                            paddingHorizontal: 16,
                            alignItems: 'center',
                            marginTop: 4,
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: typography.font.medium,
                                fontSize: 12,
                                color: colors.text3,
                            }}
                        >
                            Chưa có lịch tái khám
                        </Text>
                    </View>
                ) : null}

                <View style={styles.arSaveInlineWrap}>
                    <Pressable
                        onPress={handleSaveRecord}
                        style={styles.arSaveBtn}
                        disabled={createRecordMutation.isPending}
                    >
                        {createRecordMutation.isPending ? (
                            <ActivityIndicator size='small' color='#fff' />
                        ) : (
                            <Text style={styles.arSaveBtnText}>Lưu hồ sơ</Text>
                        )}
                    </Pressable>
                </View>
            </ScrollView>

            <MedicineDetailSheet
                visible={medicineSheetOpen}
                item={null}
                onClose={() => setMedicineSheetOpen(false)}
                onSave={handleAddPrescription}
            />
            <CustomReminderModal
                visible={showFuCustomReminder}
                onClose={() => setShowFuCustomReminder(false)}
                onSave={setFuReminderTime}
            />

            {/* TYPE PICKER MODAL */}
            <Modal
                visible={typePicker}
                transparent
                animationType='fade'
                onRequestClose={() => setTypePicker(false)}
            >
                <Pressable
                    style={shared.overlay}
                    onPress={() => setTypePicker(false)}
                >
                    <Pressable
                        style={[shared.sheetContainer, { paddingBottom: 32 }]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={shared.sheetHandle}>
                            <View style={shared.sheetBar} />
                        </View>
                        <Text
                            style={{
                                fontSize: 15,
                                fontWeight: '800',
                                color: colors.text,
                                paddingHorizontal: 20,
                                marginBottom: 4,
                            }}
                        >
                            Chọn chuyên khoa
                        </Text>
                        <ScrollView
                            style={{ maxHeight: 380 }}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.specGrid}>
                                {ALL_TYPES.map((s) => (
                                    <Pressable
                                        key={s.key}
                                        style={[
                                            styles.specItem,
                                            type === s.key &&
                                                styles.specItemActive,
                                        ]}
                                        onPress={() => {
                                            setType(s.key);
                                            setTypePicker(false);
                                        }}
                                    >
                                        <View
                                            style={[
                                                styles.specIcon,
                                                {
                                                    backgroundColor: s.bg,
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name={
                                                    s.icon as keyof typeof Ionicons.glyphMap
                                                }
                                                size={16}
                                                color={s.color}
                                            />
                                        </View>
                                        <Text
                                            style={[
                                                styles.specLabel,
                                                type === s.key &&
                                                    styles.specLabelActive,
                                            ]}
                                        >
                                            {s.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}
