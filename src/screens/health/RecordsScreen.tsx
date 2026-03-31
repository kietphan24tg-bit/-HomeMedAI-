import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useState } from 'react';
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
import { RECORDS } from '../../data/health-data';
import { shared } from '../../styles/shared';
import { colors, gradients } from '../../styles/tokens';
import type { RecordItem } from '../../types';

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
        bg: '#F5F3FF',
    },
    {
        key: 'pediatrics',
        label: 'Nhi khoa',
        icon: 'people-outline' as const,
        color: '#16A34A',
        bg: '#F0FDF4',
    },
    {
        key: 'neurology',
        label: 'Thần kinh',
        icon: 'flash-outline' as const,
        color: '#E11D48',
        bg: '#FFF1F2',
    },
    {
        key: 'orthopedic',
        label: 'Cơ xương khớp',
        icon: 'body-outline' as const,
        color: '#D97706',
        bg: '#FFFBEB',
    },
    {
        key: 'ent',
        label: 'Tai Mũi Họng',
        icon: 'ear-outline' as const,
        color: '#0D9488',
        bg: '#F0FDFA',
    },
    {
        key: 'obstetrics',
        label: 'Sản phụ khoa',
        icon: 'flower-outline' as const,
        color: '#EC4899',
        bg: '#FDF2F8',
    },
    {
        key: 'dental',
        label: 'Răng hàm mặt',
        icon: 'diamond-outline' as const,
        color: '#0EA5E9',
        bg: '#F0F9FF',
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
        color: '#F59E0B',
        bg: '#FFFBEB',
    },
    {
        key: 'gastro',
        label: 'Tiêu hóa',
        icon: 'nutrition-outline' as const,
        color: '#84CC16',
        bg: '#F7FEE7',
    },
    {
        key: 'other',
        label: 'Khác',
        icon: 'apps-outline' as const,
        color: '#64748B',
        bg: '#F1F5F9',
    },
] as const;

const ALL_TYPES = [
    {
        key: 'general',
        label: 'Tổng quát',
        icon: 'pulse-outline' as const,
        color: '#0D9488',
        bg: '#F0FDFA',
    },
    {
        key: 'internal',
        label: 'Nội khoa',
        icon: 'shield-checkmark-outline' as const,
        color: '#D97706',
        bg: '#FFFBEB',
    },
    ...SPECIALTIES,
];

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

export default function RecordsScreen({ onClose }: Props): React.JSX.Element {
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
        let list = RECORDS;

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
    }, [search, filter]);

    const groups = useMemo(() => groupByYearMonth(filtered), [filtered]);

    if (view === 'detail' && selectedRecord) {
        return <RecordDetail record={selectedRecord} onClose={backToList} />;
    }

    if (view === 'add') {
        return <AddRecordForm onClose={backToList} />;
    }

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
                <Text style={styles.subTopbarTitle}>Hồ sơ khám bệnh</Text>
                <Pressable style={styles.subAddBtn} onPress={openAdd}>
                    <Ionicons name='add' size={13} color='#fff' />
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
                            Không tìm thấy hồ sơ
                        </Text>
                        <Text style={styles.recEmptySub}>
                            Thử tìm kiếm với từ khoá khác
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
                                        onCloseMenu={closeMenu}
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
    onCloseMenu,
    onPress,
}: {
    item: RecordItem;
    isLast: boolean;
    menuOpen: boolean;
    onToggleMenu: () => void;
    onCloseMenu: () => void;
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
                            {item.doctor ? ` · ${item.doctor}` : ''}
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
                    {/* More button */}
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
                                <Pressable style={styles.ctxItem}>
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
                                        color='#E11D48'
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
    purpose: string;
    note: string;
}

function RecordDetail({
    record,
    onClose,
}: {
    record: RecordItem;
    onClose: () => void;
}): React.JSX.Element {
    const [activeTab, setActiveTab] = useState(0);
    const [showAddFu, setShowAddFu] = useState(false);
    const [followUps, setFollowUps] = useState<FollowUpEntry[]>([]);
    const [fuDate, setFuDate] = useState(new Date());
    const [fuPurpose, setFuPurpose] = useState('');
    const [fuNote, setFuNote] = useState('');

    const specEntry = SPECIALTIES.find((s) => s.key === record.category);
    const specLabel =
        specEntry?.label ??
        (record.category === 'general'
            ? 'Tổng quát'
            : record.category === 'internal'
              ? 'Nội khoa'
              : record.tag);

    const handleAddFollowUp = useCallback(() => {
        setShowAddFu(true);
        setFuDate(new Date());
        setFuPurpose('');
        setFuNote('');
    }, []);

    const saveFu = useCallback(() => {
        if (!fuPurpose.trim()) return;
        const dd = String(fuDate.getDate()).padStart(2, '0');
        const mm = String(fuDate.getMonth() + 1).padStart(2, '0');
        const yyyy = fuDate.getFullYear();
        const entry: FollowUpEntry = {
            id: Date.now().toString(),
            date: `${dd}/${mm}/${yyyy}`,
            purpose: fuPurpose.trim() || 'Tái khám',
            note: fuNote.trim(),
        };
        setFollowUps((prev) => [entry, ...prev]);
        setShowAddFu(false);
    }, [fuDate, fuPurpose, fuNote]);

    const cancelFu = useCallback(() => setShowAddFu(false), []);

    const deleteFu = useCallback((id: string) => {
        setFollowUps((prev) => prev.filter((f) => f.id !== id));
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar barStyle='light-content' backgroundColor='#1E3A5F' />

            {/* HERO */}
            <LinearGradient
                colors={gradients.familyDuo}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.rdHero}
            >
                <View style={styles.rdHeroTopRow}>
                    <Pressable style={styles.rdHeroBack} onPress={onClose}>
                        <Ionicons name='chevron-back' size={16} color='#fff' />
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
                            <Text style={styles.rdMetaLabel}>Chuyên khoa</Text>
                            <Text style={styles.rdMetaValue}>{specLabel}</Text>
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
                            <Text style={styles.rdMetaLabel}>Ngày khám</Text>
                            <Text style={styles.rdMetaValue}>
                                {record.date}
                            </Text>
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
                        {/* Chẩn đoán */}
                        <View
                            style={[
                                styles.rdInfoRow,
                                styles.rdInfoRowBorder,
                                styles.rdInfoDiag,
                            ]}
                        >
                            <View
                                style={[
                                    styles.rdInfoIcon,
                                    { backgroundColor: colors.primaryBg },
                                ]}
                            >
                                <Ionicons
                                    name='checkmark-done-outline'
                                    size={17}
                                    color={colors.primary}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.rdInfoLabel}>
                                    Chẩn đoán
                                </Text>
                                <Text style={styles.rdInfoValue}>
                                    {record.diagnosis || '—'}
                                </Text>
                            </View>
                        </View>

                        {/* Cơ sở y tế */}
                        <View
                            style={[styles.rdInfoRow, styles.rdInfoRowBorder]}
                        >
                            <View
                                style={[
                                    styles.rdInfoIcon,
                                    { backgroundColor: '#EFF6FF' },
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
                                <Text style={styles.rdInfoValue}>
                                    {record.hospital || '—'}
                                </Text>
                            </View>
                        </View>

                        {/* Bác sĩ */}
                        <View
                            style={[styles.rdInfoRow, styles.rdInfoRowBorder]}
                        >
                            <View
                                style={[
                                    styles.rdInfoIcon,
                                    { backgroundColor: '#F0FDF4' },
                                ]}
                            >
                                <Ionicons
                                    name='person-outline'
                                    size={16}
                                    color='#16A34A'
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.rdInfoLabel}>
                                    Bác sĩ phụ trách
                                </Text>
                                {record.doctor ? (
                                    <Text style={styles.rdInfoValue}>
                                        {record.doctor}
                                    </Text>
                                ) : (
                                    <Text style={styles.rdInfoEmpty}>
                                        Chưa có thông tin
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Ghi chú */}
                        <View style={styles.rdInfoRow}>
                            <View
                                style={[
                                    styles.rdInfoIcon,
                                    { backgroundColor: '#F5F3FF' },
                                ]}
                            >
                                <Ionicons
                                    name='document-text-outline'
                                    size={16}
                                    color='#7C3AED'
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.rdInfoLabel}>Ghi chú</Text>
                                <Text style={styles.rdInfoEmpty}>
                                    Nhấn để thêm ghi chú…
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {activeTab === 1 && (
                    <View>
                        <View style={styles.rdFollowHeader}>
                            <View>
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: '800',
                                        color: colors.text,
                                    }}
                                >
                                    Lịch tái khám
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 11,
                                        color: colors.text3,
                                        marginTop: 2,
                                    }}
                                >
                                    Thêm nhiều lần tái khám nếu cần
                                </Text>
                            </View>
                            <Pressable
                                style={styles.rdFollowBtn}
                                onPress={handleAddFollowUp}
                            >
                                <Ionicons
                                    name='add'
                                    size={12}
                                    color={colors.primary}
                                />
                                <Text style={styles.rdFollowBtnText}>
                                    Thêm lịch
                                </Text>
                            </Pressable>
                        </View>

                        {/* Add follow-up card */}
                        {showAddFu && (
                            <View style={styles.fuCard}>
                                <View style={styles.fuCardHeader}>
                                    <View style={styles.fuCardIcon}>
                                        <Ionicons
                                            name='calendar-outline'
                                            size={13}
                                            color={colors.primary}
                                        />
                                    </View>
                                    <Text style={styles.fuCardTitle}>
                                        Lịch tái khám mới
                                    </Text>
                                </View>

                                <View style={styles.fuField}>
                                    <Text style={styles.fuLabel}>Ngày hẹn</Text>
                                    <DateField
                                        value={fuDate}
                                        onChange={setFuDate}
                                    />
                                </View>

                                <View style={styles.fuField}>
                                    <Text style={styles.fuLabel}>Mục đích</Text>
                                    <TextInput
                                        style={styles.fuInput}
                                        placeholder='VD: Kiểm tra huyết áp…'
                                        placeholderTextColor={colors.text3}
                                        value={fuPurpose}
                                        onChangeText={setFuPurpose}
                                    />
                                </View>

                                <View style={styles.fuField}>
                                    <Text style={styles.fuLabel}>
                                        Ghi chú{' '}
                                        <Text
                                            style={{
                                                fontWeight: '500',
                                                color: colors.text3,
                                            }}
                                        >
                                            (tuỳ chọn)
                                        </Text>
                                    </Text>
                                    <TextInput
                                        style={styles.fuInput}
                                        placeholder='Ghi chú thêm nếu cần…'
                                        placeholderTextColor={colors.text3}
                                        value={fuNote}
                                        onChangeText={setFuNote}
                                    />
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
                                            Lưu lịch
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
                                        {fu.date}
                                    </Text>
                                    <Text style={styles.fuItemPurpose}>
                                        {fu.purpose}
                                        {fu.note ? ` · ${fu.note}` : ''}
                                    </Text>
                                </View>
                                <Pressable
                                    style={styles.fuItemDelete}
                                    onPress={() => deleteFu(fu.id)}
                                >
                                    <Ionicons
                                        name='trash-outline'
                                        size={14}
                                        color='#E11D48'
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
                                    Nhấn &quot;Thêm lịch&quot; để đặt ngày tái
                                    khám
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {activeTab === 2 && (
                    <View>
                        <View style={{ marginBottom: 10 }}>
                            <Text
                                style={{
                                    fontSize: 12,
                                    fontWeight: '700',
                                    color: colors.text2,
                                    letterSpacing: 0.1,
                                }}
                            >
                                Tài liệu đính kèm
                            </Text>
                            <Text
                                style={{
                                    fontSize: 10,
                                    color: colors.text3,
                                    marginTop: 2,
                                }}
                            >
                                Ảnh, PDF, kết quả xét nghiệm…
                            </Text>
                        </View>

                        <View style={styles.rdAttachGrid}>
                            <Pressable style={styles.rdAttachBtn}>
                                <View
                                    style={[
                                        styles.rdAttachIcon,
                                        { backgroundColor: '#EFF6FF' },
                                    ]}
                                >
                                    <Ionicons
                                        name='camera-outline'
                                        size={20}
                                        color={colors.primary}
                                    />
                                </View>
                                <Text
                                    style={[
                                        styles.rdAttachLabel,
                                        { color: colors.primary },
                                    ]}
                                >
                                    Thêm ảnh
                                </Text>
                                <Text style={styles.rdAttachSub}>
                                    JPG, PNG, HEIC
                                </Text>
                            </Pressable>

                            <Pressable style={styles.rdAttachBtn}>
                                <View
                                    style={[
                                        styles.rdAttachIcon,
                                        { backgroundColor: '#F5F3FF' },
                                    ]}
                                >
                                    <Ionicons
                                        name='document-outline'
                                        size={20}
                                        color='#7C3AED'
                                    />
                                </View>
                                <Text
                                    style={[
                                        styles.rdAttachLabel,
                                        { color: '#7C3AED' },
                                    ]}
                                >
                                    Tải tệp lên
                                </Text>
                                <Text style={styles.rdAttachSub}>
                                    PDF, Word, Excel
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            </ScrollView>
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
    const [name, setName] = useState('');
    const [date, setDate] = useState(new Date());
    const [type, setType] = useState('');
    const [hospital, setHospital] = useState('');
    const [doctor, setDoctor] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [note, setNote] = useState('');
    const [typePicker, setTypePicker] = useState(false);

    const selectedType = ALL_TYPES.find((t) => t.key === type);

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
                <Text style={styles.subTopbarTitle}>Thêm hồ sơ khám</Text>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    padding: 20,
                    paddingBottom: 100,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
            >
                {/* Tên hồ sơ */}
                <View style={styles.arGroup}>
                    <Text style={styles.arLabel}>
                        Tên hồ sơ <Text style={{ color: '#E11D48' }}>*</Text>
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
                            <Text style={{ color: '#E11D48' }}>*</Text>
                        </Text>
                        <DateField value={date} onChange={setDate} />
                    </View>

                    <View style={[styles.arGroup, { flex: 1 }]}>
                        <Text style={styles.arLabel}>
                            Chuyên khoa{' '}
                            <Text style={{ color: '#E11D48' }}>*</Text>
                        </Text>
                        <Pressable
                            style={styles.arSelectWrap}
                            onPress={() => setTypePicker(true)}
                        >
                            <Ionicons
                                name='heart-outline'
                                size={15}
                                color={colors.text3}
                            />
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
                    <Text style={styles.arLabel}>Cơ sở y tế</Text>
                    <View style={styles.arInputIcon}>
                        <Ionicons
                            name='home-outline'
                            size={15}
                            color={colors.text3}
                        />
                        <TextInput
                            style={styles.arInputBare}
                            placeholder='BV Chợ Rẫy, Phòng khám Medlatec…'
                            placeholderTextColor={colors.text3}
                            value={hospital}
                            onChangeText={setHospital}
                        />
                    </View>
                </View>

                {/* Bác sĩ */}
                <View style={styles.arGroup}>
                    <Text style={styles.arLabel}>Bác sĩ phụ trách</Text>
                    <View style={styles.arInputIcon}>
                        <Ionicons
                            name='person-outline'
                            size={15}
                            color={colors.text3}
                        />
                        <TextInput
                            style={styles.arInputBare}
                            placeholder='BS Nguyễn Minh Tuấn'
                            placeholderTextColor={colors.text3}
                            value={doctor}
                            onChangeText={setDoctor}
                        />
                    </View>
                </View>

                {/* Chẩn đoán */}
                <View style={styles.arGroup}>
                    <Text style={styles.arLabel}>Chẩn đoán / Vấn đề</Text>
                    <TextInput
                        style={styles.arInput}
                        placeholder='VD: Tăng huyết áp, Viêm amidan…'
                        placeholderTextColor={colors.text3}
                        value={diagnosis}
                        onChangeText={setDiagnosis}
                    />
                </View>

                {/* Ghi chú */}
                <View style={styles.arGroup}>
                    <Text style={styles.arLabel}>Ghi chú</Text>
                    <TextInput
                        style={styles.arTextarea}
                        placeholder='Ghi chú thêm về đơn thuốc, chỉ định, kết quả xét nghiệm…'
                        placeholderTextColor={colors.text3}
                        value={note}
                        onChangeText={setNote}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Đính kèm */}
                <View style={styles.arGroup}>
                    <View style={{ marginBottom: 10 }}>
                        <Text style={[styles.arLabel, { marginBottom: 0 }]}>
                            Tài liệu đính kèm
                        </Text>
                        <Text
                            style={{
                                fontSize: 10,
                                color: colors.text3,
                                marginTop: 2,
                            }}
                        >
                            Ảnh, PDF, kết quả xét nghiệm…
                        </Text>
                    </View>
                    <View style={styles.rdAttachGrid}>
                        <Pressable style={styles.rdAttachBtn}>
                            <View
                                style={[
                                    styles.rdAttachIcon,
                                    { backgroundColor: '#EFF6FF' },
                                ]}
                            >
                                <Ionicons
                                    name='camera-outline'
                                    size={20}
                                    color={colors.primary}
                                />
                            </View>
                            <Text
                                style={[
                                    styles.rdAttachLabel,
                                    { color: colors.primary },
                                ]}
                            >
                                Thêm ảnh
                            </Text>
                            <Text style={styles.rdAttachSub}>
                                JPG, PNG, HEIC
                            </Text>
                        </Pressable>

                        <Pressable style={styles.rdAttachBtn}>
                            <View
                                style={[
                                    styles.rdAttachIcon,
                                    { backgroundColor: '#F5F3FF' },
                                ]}
                            >
                                <Ionicons
                                    name='document-outline'
                                    size={20}
                                    color='#7C3AED'
                                />
                            </View>
                            <Text
                                style={[
                                    styles.rdAttachLabel,
                                    { color: '#7C3AED' },
                                ]}
                            >
                                Tải tệp lên
                            </Text>
                            <Text style={styles.rdAttachSub}>
                                PDF, Word, Excel
                            </Text>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.arDivider} />

                {/* Lịch tái khám */}
                <View style={styles.rdFollowHeader}>
                    <View>
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: '800',
                                color: colors.text,
                            }}
                        >
                            Lịch tái khám
                        </Text>
                        <Text
                            style={{
                                fontSize: 11,
                                color: colors.text3,
                                marginTop: 2,
                            }}
                        >
                            Thêm nhiều lần tái khám nếu cần
                        </Text>
                    </View>
                    <Pressable style={styles.rdFollowBtn}>
                        <Ionicons name='add' size={12} color={colors.primary} />
                        <Text style={styles.rdFollowBtnText}>Thêm lịch</Text>
                    </Pressable>
                </View>

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
                        Nhấn &quot;Thêm lịch&quot; để đặt ngày tái khám
                    </Text>
                </View>
            </ScrollView>

            {/* SAVE BUTTON */}
            <View style={styles.arSaveWrap}>
                <LinearGradient
                    colors={[colors.primary, '#0D9488']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        borderRadius: 18,
                        paddingVertical: 15,
                        alignItems: 'center',
                        shadowColor: colors.primary,
                        shadowOpacity: 0.28,
                        shadowRadius: 20,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 5,
                    }}
                >
                    <Pressable onPress={onClose}>
                        <Text
                            style={{
                                fontSize: 15,
                                fontWeight: '800',
                                color: '#fff',
                                letterSpacing: 0.2,
                            }}
                        >
                            Lưu hồ sơ
                        </Text>
                    </Pressable>
                </LinearGradient>
            </View>

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
