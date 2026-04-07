import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import {
    moderateScale,
    scale,
    scaleFont,
    verticalScale,
} from '@/src/styles/responsive';
import { inputSystem, shared } from '@/src/styles/shared';
import { colors, typography } from '@/src/styles/tokens';

type DropdownOption = { label: string; value: string };
type DropdownCategory = { title: string; options: DropdownOption[] };

interface MedicineDropdownSheetProps {
    visible: boolean;
    title: string;
    categories: DropdownCategory[];
    selected: string;
    onSelect: (value: string) => void;
    onClose: () => void;
    searchable?: boolean;
}

const ACCENT = '#0E8A7D';

export default function MedicineDropdownSheet({
    visible,
    title,
    categories,
    selected,
    onSelect,
    onClose,
    searchable = true,
}: MedicineDropdownSheetProps) {
    const [search, setSearch] = React.useState('');

    const filteredCategories = React.useMemo(() => {
        if (!search.trim()) return categories;
        const q = search.trim().toLowerCase();
        return categories
            .map((cat) => ({
                ...cat,
                options: cat.options.filter((o) =>
                    o.label.toLowerCase().includes(q),
                ),
            }))
            .filter((cat) => cat.options.length > 0);
    }, [categories, search]);

    return (
        <Modal
            transparent
            visible={visible}
            animationType='slide'
            onRequestClose={onClose}
        >
            <View style={s.backdrop}>
                <Pressable style={s.overlay} onPress={onClose} />
                <View style={s.sheet}>
                    <View style={s.handle} />
                    <View style={s.header}>
                        <Text style={s.headerTitle}>{title}</Text>
                        <Pressable onPress={onClose} style={s.closeBtn}>
                            <Ionicons
                                name='close'
                                size={18}
                                color={colors.text2}
                            />
                        </Pressable>
                    </View>

                    {searchable && (
                        <View style={s.searchWrap}>
                            <Ionicons
                                name='search-outline'
                                size={16}
                                color={colors.text3}
                            />
                            <TextInput
                                value={search}
                                onChangeText={setSearch}
                                placeholder='Tìm dạng thuốc...'
                                placeholderTextColor={colors.text3}
                                style={s.searchInput}
                            />
                        </View>
                    )}

                    <ScrollView
                        contentContainerStyle={s.bodyContent}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                        style={{
                            maxHeight: Dimensions.get('window').height * 0.5,
                        }}
                    >
                        {filteredCategories.map((cat, ci) => (
                            <View key={ci} style={s.category}>
                                <Text style={s.catTitle}>{cat.title}</Text>
                                <View style={s.optionsGrid}>
                                    {cat.options.map((opt) => {
                                        const isActive = selected === opt.value;
                                        return (
                                            <Pressable
                                                key={opt.value}
                                                style={[
                                                    s.optionChip,
                                                    isActive &&
                                                        s.optionChipActive,
                                                ]}
                                                onPress={() => {
                                                    onSelect(opt.value);
                                                    onClose();
                                                }}
                                            >
                                                {isActive && (
                                                    <Ionicons
                                                        name='checkmark-circle'
                                                        size={14}
                                                        color={ACCENT}
                                                    />
                                                )}
                                                <Text
                                                    style={[
                                                        s.optionText,
                                                        isActive &&
                                                            s.optionTextActive,
                                                    ]}
                                                >
                                                    {opt.label}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

// ── Dropdown data ──
export const FORM_CATEGORIES: DropdownCategory[] = [
    {
        title: 'Nhóm uống',
        options: [
            { label: 'Viên nén', value: 'Viên nén' },
            { label: 'Viên nang', value: 'Viên nang' },
            { label: 'Viên sủi', value: 'Viên sủi' },
            { label: 'Viên ngậm', value: 'Viên ngậm' },
            { label: 'Bột / Cốm gói', value: 'Bột / Cốm gói' },
            { label: 'Siro / Dung dịch uống', value: 'Siro' },
            { label: 'Giọt uống', value: 'Giọt uống' },
        ],
    },
    {
        title: 'Nhóm dùng ngoài',
        options: [
            { label: 'Kem/ bôi', value: 'Kem bôi' },
            { label: 'Mỡ bôi', value: 'Mỡ bôi' },
            { label: 'Gel bôi', value: 'Gel bôi' },
            { label: 'Xịt', value: 'Xịt' },
            { label: 'Nhỏ mắt', value: 'Nhỏ mắt' },
            { label: 'Nhỏ mũi', value: 'Nhỏ mũi' },
            { label: 'Nhỏ tai', value: 'Nhỏ tai' },
        ],
    },
    {
        title: 'Nhóm khác',
        options: [
            { label: 'Thuốc đặt', value: 'Thuốc đặt' },
            { label: 'Ống tiêm / Lọ tiêm', value: 'Ống tiêm' },
            { label: 'Khác...', value: 'Khác' },
        ],
    },
];

export const DOSAGE_UNIT_CATEGORIES: DropdownCategory[] = [
    {
        title: 'Khối lượng',
        options: [
            { label: 'mcg', value: 'mcg' },
            { label: 'mg', value: 'mg' },
            { label: 'g', value: 'g' },
        ],
    },
    {
        title: 'Nồng độ / Thể tích',
        options: [
            { label: 'mg/mL', value: 'mg/mL' },
            { label: 'mg/5mL', value: 'mg/5mL' },
            { label: 'mL', value: 'mL' },
            { label: '%', value: '%' },
        ],
    },
    {
        title: 'Hoạt lực',
        options: [
            { label: 'IU', value: 'IU' },
            { label: 'UI', value: 'UI' },
        ],
    },
    {
        title: 'Khác',
        options: [
            { label: 'mmol/L', value: 'mmol/L' },
            { label: 'mEq/L', value: 'mEq/L' },
            { label: 'Khác...', value: 'Khác' },
        ],
    },
];

export const STOCK_UNIT_CATEGORIES: DropdownCategory[] = [
    {
        title: 'Đơn vị đếm',
        options: [
            { label: 'viên', value: 'viên' },
            { label: 'gói', value: 'gói' },
            { label: 'ống', value: 'ống' },
            { label: 'chai', value: 'chai' },
            { label: 'lọ', value: 'lọ' },
            { label: 'tuýp', value: 'tuýp' },
            { label: 'hộp', value: 'hộp' },
        ],
    },
    {
        title: 'Đơn vị thể tích / Khối lượng',
        options: [
            { label: 'mL', value: 'mL' },
            { label: 'g', value: 'g' },
        ],
    },
];

const s = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(15,23,42,0.45)',
    },
    overlay: { flex: 1 },
    sheet: {
        ...shared.sheetContainer,
        borderTopLeftRadius: moderateScale(24),
        borderTopRightRadius: moderateScale(24),
        paddingBottom: verticalScale(20),
    },
    handle: {
        ...shared.sheetBar,
        alignSelf: 'center',
        marginBottom: verticalScale(6),
        marginTop: verticalScale(10),
    },
    header: {
        ...shared.sheetHeader,
        paddingHorizontal: scale(20),
        paddingTop: 0,
        paddingBottom: verticalScale(10),
    },
    headerTitle: {
        ...shared.sheetTitle,
        fontSize: scaleFont(14),
    },
    closeBtn: {
        ...shared.iconBtnFlat,
        width: scale(32),
        height: scale(32),
        borderRadius: moderateScale(10),
        backgroundColor: colors.bg,
    },
    searchWrap: {
        ...inputSystem.fieldIcon,
        marginHorizontal: scale(20),
        marginTop: verticalScale(10),
        backgroundColor: colors.bg,
        borderRadius: moderateScale(11),
        paddingHorizontal: scale(12),
        gap: scale(8),
    },
    searchInput: {
        flex: 1,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text,
        paddingVertical: 0,
        textAlignVertical: 'center',
    },

    bodyContent: {
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(12),
    },
    category: { marginTop: verticalScale(12) },
    catTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(10.5),
        color: colors.text3,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: verticalScale(8),
    },
    optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(8) },
    optionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(7),
        borderRadius: moderateScale(10),
        backgroundColor: colors.bg,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    optionChipActive: {
        backgroundColor: '#E6F7F5',
        borderColor: ACCENT,
    },
    optionText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text,
    },
    optionTextActive: {
        fontFamily: typography.font.bold,
        color: ACCENT,
    },
});
