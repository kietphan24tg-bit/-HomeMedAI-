import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { FamilyMedicineItem } from '@/src/data/family-medicine-data';
import {
    moderateScale,
    scale,
    scaleFont,
    verticalScale,
} from '@/src/styles/responsive';
import { buttonSystem, formSystem, inputSystem } from '@/src/styles/shared';
import { colors, typography } from '@/src/styles/tokens';
import MedicineDropdownSheet, {
    DOSAGE_UNIT_CATEGORIES,
    FORM_CATEGORIES,
    STOCK_UNIT_CATEGORIES,
} from './MedicineDropdownSheet';

const ACCENT = '#0E8A7D';
const ACCENT_LIGHT = '#E6F7F5';

interface Props {
    visible: boolean;
    item: FamilyMedicineItem | null;
    onClose: () => void;
    onSave?: (data: any) => void;
    isPending?: boolean;
}

function summarizeTags(values: string[]): {
    lead: string | null;
    remaining: number;
} {
    if (!values.length) {
        return { lead: null, remaining: 0 };
    }

    return {
        lead: values[0],
        remaining: Math.max(0, values.length - 1),
    };
}

function truncateTag(label: string | null, maxLength = 22): string {
    if (!label) return '';
    if (label.length <= maxLength) return label;
    return `${label.slice(0, maxLength - 1).trimEnd()}...`;
}

export default function MedicineDetailSheet({
    visible,
    item,
    onClose,
    onSave,
    isPending,
}: Props) {
    const isCreateMode = !item;
    const headerTitle = isCreateMode ? 'Thêm thuốc mới' : 'Chi tiết thuốc';
    const headerSub = isCreateMode ? '(Tạo mới)' : '(Đang sửa)';

    const [name, setName] = useState('');
    const [form, setForm] = useState('Viên nén');
    const [dosageVal, setDosageVal] = useState('');
    const [dosageUnit, setDosageUnit] = useState('mg');
    const [dosePerUseVal, setDosePerUseVal] = useState('');
    const [dosePerUseUnit, setDosePerUseUnit] = useState('viên');
    const [note, setNote] = useState('');
    const [qty, setQty] = useState('');
    const [stockUnit, setStockUnit] = useState('viên');
    const [exp, setExp] = useState('');
    const [location, setLocation] = useState('');
    const [lowAlert, setLowAlert] = useState('5');
    const [alertOn, setAlertOn] = useState(true);
    const [reminderOn, setReminderOn] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [repeatEvery, setRepeatEvery] = useState('2 tuần');
    const [activeDays, setActiveDays] = useState([1, 3]);
    const [times, setTimes] = useState(['07:00', '20:00']);
    const [remindBefore, setRemindBefore] = useState('10 phút');

    // Tags
    const [tags, setTags] = useState<string[]>(['Sốt', 'Đau đầu']);
    const [tagInputVisible, setTagInputVisible] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [tagPreviewVisible, setTagPreviewVisible] = useState(false);

    // Dropdowns
    const [formDDOpen, setFormDDOpen] = useState(false);
    const [dosageDDOpen, setDosageDDOpen] = useState(false);
    const [dosePerUseDDOpen, setDosePerUseDDOpen] = useState(false);
    const [stockDDOpen, setStockDDOpen] = useState(false);
    const [remBeforeDDOpen, setRemBeforeDDOpen] = useState(false);

    const [cloneSheetOpen, setCloneSheetOpen] = useState(false);
    const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);

    React.useEffect(() => {
        if (visible && item) {
            setName(item.name ?? '');
            setForm(item.form ?? 'Viên nén');
            setNote(item.note ?? '');
            setDosePerUseVal(String((item as any).dosePerUseVal ?? ''));
            setDosePerUseUnit((item as any).dosePerUseUnit ?? 'viên');
            setQty(String(item.qty ?? ''));
            setStockUnit(item.unit ?? 'viên');
            setExp(item.exp ?? '');
            setLocation(item.location ?? '');
            setLowAlert(String(item.lowThreshold ?? '5'));
            setReminderOn(item.reminder?.includes('ON') ?? false);
        } else if (visible && !item) {
            setName('');
            setForm('Viên nén');
            setNote('');
            setDosePerUseVal('');
            setDosePerUseUnit('viên');
            setQty('');
            setStockUnit('viên');
            setExp('');
            setLocation('');
            setLowAlert('5');
            setReminderOn(false);
        }
    }, [visible, item]);

    const handleSave = () => {
        onSave?.({
            medicine_name: name,
            medicine_type: form,
            dosage_value: dosageVal,
            dosage_unit: dosageUnit,
            dosage_per_use_value: parseFloat(dosePerUseVal) || 0,
            dosage_per_use_unit: dosePerUseUnit,
            use_tags: tags,
            quantity_stock: parseFloat(qty) || 0,
            unit: stockUnit,
            expiry_date: exp || null,
            min_stock_alert: parseFloat(lowAlert) || null,
            instruction: note,
            reminder_on: reminderOn,
            reminder_times_local: [...times],
            dosage_per_time: parseFloat(dosePerUseVal) || undefined,
        });
    };

    const toggleDay = (idx: number) => {
        if (activeDays.includes(idx)) {
            setActiveDays((prev) => prev.filter((d) => d !== idx));
        } else {
            setActiveDays((prev) => [...prev, idx].sort((a, b) => a - b));
        }
    };

    const updateTime = (idx: number, val: string) => {
        setTimes((prev) => {
            const next = [...prev];
            next[idx] = val;
            return next;
        });
    };

    const formatDateInput = (val: string) => {
        const digits = val.replace(/\D/g, '').slice(0, 8);
        if (digits.length <= 2) return digits;
        if (digits.length <= 4) {
            return `${digits.slice(0, 2)}/${digits.slice(2)}`;
        }
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    };

    const changeLowAlert = (delta: number) => {
        setLowAlert((prev) => {
            const current = parseInt(prev || '0', 10) || 0;
            return String(Math.max(1, current + delta));
        });
    };

    const addTime = () => {
        setTimes((prev) => [...prev, '12:00']);
    };

    const removeTime = (idx: number) => {
        setTimes((prev) => prev.filter((_, i) => i !== idx));
    };

    const previewDays = activeDays
        .map((i) => ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i])
        .join('/');

    return (
        <Modal
            transparent
            visible={visible}
            animationType='slide'
            onRequestClose={onClose}
        >
            <SafeAreaView style={s.safeArea}>
                <StatusBar barStyle='dark-content' />

                {/* ── Header ── */}
                <View style={s.header}>
                    <Pressable onPress={onClose} style={s.backBtn}>
                        <Ionicons
                            name='arrow-back'
                            size={20}
                            color={colors.text}
                        />
                    </Pressable>
                    <View style={s.headerCenter}>
                        <Text style={s.headerTitle}>{headerTitle}</Text>
                        <Text style={s.headerSub}>{headerSub}</Text>
                    </View>
                    <Pressable
                        onPress={handleSave}
                        style={s.saveHeaderBtn}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <ActivityIndicator size='small' color='#fff' />
                        ) : (
                            <Text style={s.saveHeaderText}>Lưu</Text>
                        )}
                    </Pressable>
                </View>

                {/* ── Scrollable content ── */}
                <ScrollView
                    style={s.scroll}
                    contentContainerStyle={s.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                >
                    {/* ─── [1] THÔNG TIN THUỐC ─── */}
                    <SectionCard
                        icon='medical-outline'
                        iconBg={ACCENT_LIGHT}
                        iconColor={ACCENT}
                        title='THÔNG TIN THUỐC'
                    >
                        <Label text='Tên thuốc' required />
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            style={s.input}
                            placeholder='Paracetamol'
                            placeholderTextColor={colors.text3}
                        />

                        <Label text='Dạng bào chế' required />
                        <Pressable
                            style={s.selectInput}
                            onPress={() => setFormDDOpen(true)}
                        >
                            <Text style={s.selectText}>{form}</Text>
                            <Ionicons
                                name='chevron-down'
                                size={16}
                                color={colors.text3}
                            />
                        </Pressable>

                        <Label text='Hàm lượng' />
                        <View style={s.row}>
                            <TextInput
                                value={dosageVal}
                                onChangeText={setDosageVal}
                                style={[s.input, { flex: 2 }]}
                                placeholder='500'
                                placeholderTextColor={colors.text3}
                                keyboardType='numeric'
                            />
                            <Pressable
                                style={[s.selectInput, { flex: 1 }]}
                                onPress={() => setDosageDDOpen(true)}
                            >
                                <Text style={s.selectText}>{dosageUnit}</Text>
                                <Ionicons
                                    name='chevron-down'
                                    size={14}
                                    color={colors.text3}
                                />
                            </Pressable>
                        </View>
                        <Text style={s.hint}>(hoặc nhập nhanh: 250mg/5mL)</Text>

                        <Label text='Liều dùng/lần' />
                        <View style={s.row}>
                            <TextInput
                                value={dosePerUseVal}
                                onChangeText={setDosePerUseVal}
                                style={[s.input, { flex: 2 }]}
                                placeholder='12'
                                placeholderTextColor={colors.text3}
                                keyboardType='numeric'
                            />
                            <Pressable
                                style={[s.selectInput, { flex: 1 }]}
                                onPress={() => setDosePerUseDDOpen(true)}
                            >
                                <Text style={s.selectText}>
                                    {dosePerUseUnit}
                                </Text>
                                <Ionicons
                                    name='chevron-down'
                                    size={14}
                                    color={colors.text3}
                                />
                            </Pressable>
                        </View>

                        <Label text='Dùng cho (tag)' />
                        <View style={s.tagRow}>
                            {(() => {
                                const tagSummary = summarizeTags(tags);
                                const secondTag = tags[1] ?? null;
                                if (!tagSummary.lead) {
                                    return null;
                                }

                                return (
                                    <>
                                        <Pressable
                                            style={s.tag}
                                            onPress={() =>
                                                setTagPreviewVisible(true)
                                            }
                                        >
                                            <Text
                                                style={s.tagText}
                                                numberOfLines={1}
                                            >
                                                {truncateTag(tagSummary.lead)}
                                            </Text>
                                            <Pressable
                                                hitSlop={6}
                                                onPress={(event) => {
                                                    event.stopPropagation();
                                                    setTags((prev) =>
                                                        prev.slice(1),
                                                    );
                                                }}
                                            >
                                                <Ionicons
                                                    name='close-circle'
                                                    size={14}
                                                    color={colors.text2}
                                                    style={{
                                                        marginLeft: scale(4),
                                                    }}
                                                />
                                            </Pressable>
                                        </Pressable>

                                        {tagSummary.remaining === 1 &&
                                        secondTag ? (
                                            <View style={s.tag}>
                                                <Text
                                                    style={s.tagText}
                                                    numberOfLines={1}
                                                >
                                                    {truncateTag(secondTag)}
                                                </Text>
                                                <Pressable
                                                    hitSlop={6}
                                                    onPress={() =>
                                                        setTags((prev) =>
                                                            prev.filter(
                                                                (
                                                                    _item,
                                                                    index,
                                                                ) =>
                                                                    index !== 1,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <Ionicons
                                                        name='close-circle'
                                                        size={14}
                                                        color={colors.text2}
                                                        style={{
                                                            marginLeft:
                                                                scale(4),
                                                        }}
                                                    />
                                                </Pressable>
                                            </View>
                                        ) : null}

                                        {tagSummary.remaining > 1 ? (
                                            <Pressable
                                                style={s.tagSummaryBtn}
                                                onPress={() =>
                                                    setTagPreviewVisible(true)
                                                }
                                            >
                                                <Text style={s.tagSummaryText}>
                                                    +{tagSummary.remaining} mục
                                                    khác
                                                </Text>
                                            </Pressable>
                                        ) : null}
                                    </>
                                );
                            })()}
                            <Pressable
                                style={[s.tag, s.tagAdd]}
                                onPress={() => {
                                    setNewTag('');
                                    setTagInputVisible(true);
                                }}
                            >
                                <Text
                                    style={[s.tagText, { color: colors.text2 }]}
                                >
                                    + Tag
                                </Text>
                            </Pressable>
                        </View>

                        <Label text='Ghi chú' />
                        <TextInput
                            value={note}
                            onChangeText={setNote}
                            style={[
                                s.input,
                                {
                                    minHeight: verticalScale(72),
                                    textAlignVertical: 'top',
                                },
                            ]}
                            placeholder='Uống sau ăn'
                            placeholderTextColor={colors.text3}
                            multiline
                        />
                    </SectionCard>

                    {/* ─── [2] TỒN KHO ─── */}
                    <SectionCard
                        icon='cube-outline'
                        iconBg='#FFF3E0'
                        iconColor='#FB8C00'
                        title='TỒN KHO'
                    >
                        <Label text='Số lượng còn' required />
                        <View style={s.row}>
                            <TextInput
                                value={qty}
                                onChangeText={setQty}
                                style={[s.input, { flex: 2 }]}
                                placeholder='12'
                                placeholderTextColor={colors.text3}
                                keyboardType='numeric'
                            />
                            <Pressable
                                style={[s.selectInput, { flex: 1 }]}
                                onPress={() => setStockDDOpen(true)}
                            >
                                <Text style={s.selectText}>{stockUnit}</Text>
                                <Ionicons
                                    name='chevron-down'
                                    size={14}
                                    color={colors.text3}
                                />
                            </Pressable>
                        </View>

                        <Label text='Hạn sử dụng' required />
                        <TextInput
                            value={exp}
                            onChangeText={setExp}
                            style={s.input}
                            placeholder='12/2026'
                            placeholderTextColor={colors.text3}
                        />

                        <Label text='Vị trí lưu trữ' />
                        <TextInput
                            value={location}
                            onChangeText={setLocation}
                            style={s.input}
                            placeholder='Tủ bếp tầng 2'
                            placeholderTextColor={colors.text3}
                        />

                        <View style={s.alertRow}>
                            <View style={s.alertPanel}>
                                <View style={s.alertHeaderRow}>
                                    <Text style={s.alertHeaderTitle}>
                                        Bật thông báo (Cảnh báo sắp hết)
                                    </Text>
                                    <Switch
                                        value={alertOn}
                                        onValueChange={setAlertOn}
                                        trackColor={{
                                            false: '#DDE6E4',
                                            true: colors.success,
                                        }}
                                        thumbColor='#FFFFFF'
                                        ios_backgroundColor='#DDE6E4'
                                    />
                                </View>
                                {alertOn ? (
                                    <View style={s.alertThresholdCard}>
                                        <Text style={s.alertThresholdTitle}>
                                            Ngưỡng cảnh báo
                                        </Text>
                                        <View style={s.alertStepper}>
                                            <Pressable
                                                style={s.alertStepBtn}
                                                onPress={() =>
                                                    changeLowAlert(-1)
                                                }
                                            >
                                                <Ionicons
                                                    name='remove'
                                                    size={16}
                                                    color={colors.text2}
                                                />
                                            </Pressable>
                                            <Text style={s.alertStepperValue}>
                                                {`${lowAlert || '1'} ${stockUnit}`}
                                            </Text>
                                            <Pressable
                                                style={s.alertStepBtn}
                                                onPress={() =>
                                                    changeLowAlert(1)
                                                }
                                            >
                                                <Ionicons
                                                    name='add'
                                                    size={16}
                                                    color={colors.text2}
                                                />
                                            </Pressable>
                                        </View>
                                    </View>
                                ) : null}
                            </View>
                            <Pressable
                                style={[
                                    s.alertToggle,
                                    alertOn && s.alertToggleActive,
                                ]}
                                onPress={() => setAlertOn(!alertOn)}
                            >
                                <Text
                                    style={[
                                        s.alertToggleText,
                                        alertOn && s.alertToggleTextActive,
                                    ]}
                                >
                                    {alertOn ? 'Bật' : 'Tắt'}
                                </Text>
                            </Pressable>
                            <Text style={s.alertInlineLabel}>Ngưỡng</Text>
                            <View style={s.alertThresholdBox}>
                                <View style={s.alertThresholdLabelWrap}>
                                    <Text style={s.alertInlineLabelBox}>
                                        Ngưỡng
                                    </Text>
                                </View>
                                <View style={s.alertValueWrap}>
                                    <TextInput
                                        value={lowAlert}
                                        onChangeText={setLowAlert}
                                        style={s.alertInlineInput}
                                        placeholder='5'
                                        placeholderTextColor={colors.text3}
                                        keyboardType='numeric'
                                    />
                                    <Text style={s.alertInlineUnit}>
                                        {stockUnit}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </SectionCard>

                    {/* ─── [3] LỊCH NHẮC UỐNG THUỐC ─── */}
                    <SectionCard
                        icon='notifications-outline'
                        iconBg='#E8EAF6'
                        iconColor='#5C6BC0'
                        title='LỊCH NHẮC UỐNG THUỐC'
                    >
                        <HField label='Bật nhắc uống'>
                            <Switch
                                value={reminderOn}
                                onValueChange={setReminderOn}
                                trackColor={{
                                    false: colors.border,
                                    true: colors.success,
                                }}
                                thumbColor='#fff'
                            />
                        </HField>

                        {reminderOn && (
                            <>
                                <HField label='Ngày bắt đầu'>
                                    <TextInput
                                        value={startDate}
                                        onChangeText={(v) =>
                                            setStartDate(formatDateInput(v))
                                        }
                                        style={[
                                            s.inlineInputBox,
                                            s.inlineInputBoxDate,
                                        ]}
                                        placeholder='31/03/2026'
                                        placeholderTextColor={colors.text3}
                                        keyboardType='number-pad'
                                        maxLength={10}
                                    />
                                </HField>

                                <HField label='Lặp mỗi'>
                                    <View
                                        style={[
                                            s.row,
                                            { alignItems: 'center' },
                                        ]}
                                    >
                                        <TextInput
                                            value={
                                                repeatEvery.replace(
                                                    /[^0-9]/g,
                                                    '',
                                                ) || '2'
                                            }
                                            onChangeText={(v) =>
                                                setRepeatEvery(`${v} tuần`)
                                            }
                                            style={[
                                                s.inlineInputBox,
                                                {
                                                    minWidth: scale(50),
                                                    textAlign: 'center',
                                                },
                                            ]}
                                            keyboardType='numeric'
                                        />
                                        <Text style={s.repeatUnit}>tuần</Text>
                                    </View>
                                </HField>

                                <HField label='Ngày' alignTop>
                                    <View style={{ width: '100%' }}>
                                        <View style={s.daysHeaderRow}>
                                            {[
                                                'T2',
                                                'T3',
                                                'T4',
                                                'T5',
                                                'T6',
                                                'T7',
                                                'CN',
                                            ].map((d) => (
                                                <Text
                                                    key={d}
                                                    style={s.dayColText}
                                                >
                                                    {d}
                                                </Text>
                                            ))}
                                        </View>
                                        <View style={s.daysCheckRow}>
                                            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                                                <Pressable
                                                    key={i}
                                                    style={s.dayCheckCol}
                                                    onPress={() => toggleDay(i)}
                                                >
                                                    <View
                                                        style={[
                                                            s.dayCheckbox,
                                                            activeDays.includes(
                                                                i,
                                                            ) &&
                                                                s.dayCheckboxActive,
                                                        ]}
                                                    >
                                                        {activeDays.includes(
                                                            i,
                                                        ) && (
                                                            <Ionicons
                                                                name='checkmark'
                                                                size={14}
                                                                color='#fff'
                                                            />
                                                        )}
                                                    </View>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>
                                </HField>

                                <HField label='Giờ nhắc' alignTop>
                                    <View style={s.timesWrap}>
                                        {times.map((t, i) => (
                                            <View
                                                key={i}
                                                style={s.timeRowSmall}
                                            >
                                                <TextInput
                                                    style={[
                                                        s.inlineInputBox,
                                                        {
                                                            minWidth: scale(80),
                                                        },
                                                    ]}
                                                    value={t}
                                                    onChangeText={(v) =>
                                                        updateTime(i, v)
                                                    }
                                                    keyboardType='numbers-and-punctuation'
                                                />
                                                {i === 0 ? (
                                                    <Pressable
                                                        style={s.timeBtn}
                                                        onPress={addTime}
                                                    >
                                                        <Ionicons
                                                            name='add-circle'
                                                            size={24}
                                                            color={ACCENT}
                                                        />
                                                    </Pressable>
                                                ) : (
                                                    <Pressable
                                                        style={s.timeBtn}
                                                        onPress={() =>
                                                            removeTime(i)
                                                        }
                                                    >
                                                        <Ionicons
                                                            name='close-circle'
                                                            size={24}
                                                            color={
                                                                colors.danger
                                                            }
                                                        />
                                                    </Pressable>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                </HField>

                                <HField label='Nhắc trước'>
                                    <Pressable
                                        style={s.inlineSelectBox}
                                        onPress={() => setRemBeforeDDOpen(true)}
                                    >
                                        <Text style={s.inlineSelectText}>
                                            {remindBefore}
                                        </Text>
                                        <Ionicons
                                            name='caret-down'
                                            size={12}
                                            color={colors.text3}
                                        />
                                    </Pressable>
                                </HField>

                                <HField label='Preview' alignTop>
                                    <Text style={s.previewRight}>
                                        Tuần 1,3,5... {previewDays}
                                    </Text>
                                </HField>
                            </>
                        )}
                    </SectionCard>

                    {/* ─── Bottom actions ─── */}
                    <View style={s.footerWrapper}>
                        <Pressable
                            style={s.footerActionBtn}
                            onPress={() => setCloneSheetOpen(true)}
                        >
                            <Ionicons
                                name='copy-outline'
                                size={20}
                                color={colors.text}
                            />
                            <Text style={s.footerActionText}>
                                Nhân bản thuốc này
                            </Text>
                        </Pressable>
                        <Pressable
                            style={s.footerActionBtn}
                            onPress={() => setDeleteSheetOpen(true)}
                        >
                            <Ionicons
                                name='trash-outline'
                                size={20}
                                color={colors.danger}
                            />
                            <Text
                                style={[
                                    s.footerActionText,
                                    { color: colors.danger },
                                ]}
                            >
                                Xóa thuốc
                            </Text>
                        </Pressable>

                        <View style={s.footerDividerLine} />

                        <View style={s.footerSaveRow}>
                            <Pressable
                                style={s.btnFooterGhost}
                                onPress={onClose}
                            >
                                <Text style={s.btnFooterGhostText}>Hủy</Text>
                            </Pressable>
                            <Pressable
                                style={s.btnFooterSolid}
                                onPress={handleSave}
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <ActivityIndicator
                                        size='small'
                                        color='#fff'
                                    />
                                ) : (
                                    <Text style={s.btnFooterSolidText}>
                                        Lưu
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Dropdown modals */}
            <MedicineDropdownSheet
                visible={formDDOpen}
                title='CHỌN DẠNG BÀO CHẾ'
                categories={FORM_CATEGORIES}
                selected={form}
                onSelect={setForm}
                onClose={() => setFormDDOpen(false)}
            />
            <MedicineDropdownSheet
                visible={dosageDDOpen}
                title='CHỌN ĐƠN VỊ HÀM LƯỢNG'
                categories={DOSAGE_UNIT_CATEGORIES}
                selected={dosageUnit}
                onSelect={setDosageUnit}
                onClose={() => setDosageDDOpen(false)}
                searchable={false}
            />
            <MedicineDropdownSheet
                visible={stockDDOpen}
                title='CHỌN ĐƠN VỊ TỒN KHO'
                categories={STOCK_UNIT_CATEGORIES}
                selected={stockUnit}
                onSelect={setStockUnit}
                onClose={() => setStockDDOpen(false)}
                searchable={false}
            />
            <MedicineDropdownSheet
                visible={dosePerUseDDOpen}
                title='CHỌN ĐƠN VỊ LIỀU DÙNG'
                categories={STOCK_UNIT_CATEGORIES}
                selected={dosePerUseUnit}
                onSelect={setDosePerUseUnit}
                onClose={() => setDosePerUseDDOpen(false)}
                searchable={false}
            />

            <MedicineDropdownSheet
                visible={remBeforeDDOpen}
                title='NHẮC TRƯỚC'
                categories={[
                    {
                        title: 'Tùy chọn thời gian',
                        options: [
                            'Đúng giờ',
                            '5 phút',
                            '10 phút',
                            '15 phút',
                            '30 phút',
                            '1 giờ',
                            '2 giờ',
                        ].map((c) => ({ label: c, value: c })),
                    },
                ]}
                selected={remindBefore}
                onSelect={setRemindBefore}
                onClose={() => setRemBeforeDDOpen(false)}
                searchable={false}
            />

            {/* Tag input dialog */}
            <TagInputSheet
                visible={tagInputVisible}
                value={newTag}
                onChange={setNewTag}
                onAdd={() => {
                    const trimmed = newTag.trim();
                    if (trimmed && !tags.includes(trimmed)) {
                        setTags((prev) => [...prev, trimmed]);
                    }
                    setNewTag('');
                    setTagInputVisible(false);
                }}
                onClose={() => setTagInputVisible(false)}
            />

            <TagListPreviewSheet
                visible={tagPreviewVisible}
                tags={tags}
                onRemove={(tag) =>
                    setTags((prev) =>
                        prev.filter((currentTag) => currentTag !== tag),
                    )
                }
                onClose={() => setTagPreviewVisible(false)}
            />

            {/* Clone confirmation */}
            <CloneConfirmSheet
                visible={cloneSheetOpen}
                medicineName={name}
                onClose={() => setCloneSheetOpen(false)}
            />

            {/* Delete confirmation */}
            <DeleteConfirmSheet
                visible={deleteSheetOpen}
                medicineName={name}
                onClose={() => setDeleteSheetOpen(false)}
            />
        </Modal>
    );
}

/* ── Reusable sub-components ── */

function Label({ text, required }: { text: string; required?: boolean }) {
    if (text === 'Cảnh báo sắp hết') {
        return null;
    }
    return (
        <Text style={s.label}>
            {text} {required && <Text style={s.req}>*</Text>}
        </Text>
    );
}

function SectionCard({
    icon,
    iconBg,
    iconColor,
    title,
    children,
}: {
    icon: string;
    iconBg: string;
    iconColor: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <View style={s.sectionCard}>
            <View style={s.sectionTitleRow}>
                <View style={[s.sectionBadge, { backgroundColor: iconBg }]}>
                    <Ionicons name={icon as any} size={14} color={iconColor} />
                </View>
                <Text style={s.sectionTitle}>{title}</Text>
            </View>
            <View style={s.sectionBody}>{children}</View>
        </View>
    );
}

function HField({
    label,
    children,
    alignTop,
}: {
    label: string;
    children: React.ReactNode;
    alignTop?: boolean;
}) {
    return (
        <View style={[s.hFieldRow, alignTop && { alignItems: 'flex-start' }]}>
            <Text
                style={[
                    s.hFieldLabel,
                    alignTop && { marginTop: verticalScale(14) },
                ]}
            >
                {label}
            </Text>
            <View style={s.hFieldContent}>{children}</View>
        </View>
    );
}

/* ── Tag Input Bottom Sheet ── */

function TagInputSheet({
    visible,
    value,
    onChange,
    onAdd,
    onClose,
}: {
    visible: boolean;
    value: string;
    onChange: (v: string) => void;
    onAdd: () => void;
    onClose: () => void;
}) {
    return (
        <Modal
            transparent
            visible={visible}
            animationType='fade'
            onRequestClose={onClose}
        >
            <View style={bs.backdrop}>
                <Pressable style={bs.overlay} onPress={onClose} />
                <View style={bs.sheet}>
                    <View style={bs.handle} />
                    <Text style={bs.title}>Thêm tag</Text>
                    <TextInput
                        value={value}
                        onChangeText={onChange}
                        placeholder='Nhập tag (VD: Sốt, Đau đầu...)'
                        placeholderTextColor={colors.text3}
                        style={bs.textInput}
                        autoFocus
                        returnKeyType='done'
                        onSubmitEditing={onAdd}
                    />
                    <View style={bs.btnRow}>
                        <Pressable style={bs.btnGhost} onPress={onClose}>
                            <Text style={bs.btnGhostText}>Hủy</Text>
                        </Pressable>
                        <Pressable style={bs.btnPrimary} onPress={onAdd}>
                            <Text style={bs.btnPrimaryText}>Thêm</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function TagListPreviewSheet({
    visible,
    tags,
    onRemove,
    onClose,
}: {
    visible: boolean;
    tags: string[];
    onRemove: (tag: string) => void;
    onClose: () => void;
}) {
    return (
        <Modal
            transparent
            visible={visible}
            animationType='fade'
            onRequestClose={onClose}
        >
            <View style={bs.backdrop}>
                <Pressable style={bs.overlay} onPress={onClose} />
                <View style={bs.sheet}>
                    <View style={bs.handle} />
                    <Text style={bs.title}>Tag đã khai báo</Text>
                    <View style={s.tagPreviewWrap}>
                        {tags.length > 0 ? (
                            tags.map((tag, index) => (
                                <Pressable
                                    key={`${tag}-${index}`}
                                    style={s.tag}
                                    onPress={() => onRemove(tag)}
                                >
                                    <Text style={s.tagText}>{tag}</Text>
                                    <Ionicons
                                        name='close-circle'
                                        size={14}
                                        color={colors.text2}
                                        style={{ marginLeft: scale(4) }}
                                    />
                                </Pressable>
                            ))
                        ) : (
                            <Text style={s.tagPreviewEmpty}>Chưa có tag</Text>
                        )}
                    </View>
                    <View style={bs.btnRow}>
                        <Pressable style={bs.btnPrimary} onPress={onClose}>
                            <Text style={bs.btnPrimaryText}>Đóng</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

/* ── Clone Confirmation Bottom Sheet ── */

function CloneConfirmSheet({
    visible,
    medicineName,
    onClose,
}: {
    visible: boolean;
    medicineName: string;
    onClose: () => void;
}) {
    const [keepReminder, setKeepReminder] = React.useState(true);
    const [resetStock, setResetStock] = React.useState(false);

    return (
        <Modal
            transparent
            visible={visible}
            animationType='fade'
            onRequestClose={onClose}
        >
            <View style={bs.backdrop}>
                <Pressable style={bs.overlay} onPress={onClose} />
                <View style={bs.sheet}>
                    <View style={bs.handle} />
                    <Text style={bs.title}>Nhân bản thuốc?</Text>
                    <Text style={bs.sub}>
                        Từ: {medicineName || 'Chưa có tên'}
                    </Text>
                    <View style={bs.divider} />
                    <Pressable
                        style={bs.checkRow}
                        onPress={() => setKeepReminder(!keepReminder)}
                    >
                        <Ionicons
                            name={keepReminder ? 'checkbox' : 'square-outline'}
                            size={20}
                            color={keepReminder ? ACCENT : colors.text3}
                        />
                        <Text style={bs.checkText}>Giữ lịch nhắc</Text>
                    </Pressable>
                    <Pressable
                        style={bs.checkRow}
                        onPress={() => setResetStock(!resetStock)}
                    >
                        <Ionicons
                            name={resetStock ? 'checkbox' : 'square-outline'}
                            size={20}
                            color={resetStock ? ACCENT : colors.text3}
                        />
                        <Text style={bs.checkText}>Reset SL + HSD</Text>
                    </Pressable>
                    <View style={bs.btnRow}>
                        <Pressable style={bs.btnGhost} onPress={onClose}>
                            <Text style={bs.btnGhostText}>Hủy</Text>
                        </Pressable>
                        <Pressable style={bs.btnPrimary} onPress={onClose}>
                            <Text style={bs.btnPrimaryText}>Nhân bản</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

/* ── Delete Confirmation Bottom Sheet ── */

function DeleteConfirmSheet({
    visible,
    medicineName,
    onClose,
}: {
    visible: boolean;
    medicineName: string;
    onClose: () => void;
}) {
    const [deleteReminder, setDeleteReminder] = React.useState(false);

    return (
        <Modal
            transparent
            visible={visible}
            animationType='fade'
            onRequestClose={onClose}
        >
            <View style={bs.backdrop}>
                <Pressable style={bs.overlay} onPress={onClose} />
                <View style={bs.sheet}>
                    <View style={bs.handle} />
                    <Text style={bs.title}>Xóa thuốc này?</Text>
                    <Text
                        style={bs.sub}
                    >{`"${medicineName || 'Chưa có tên'}"`}</Text>
                    <View style={bs.divider} />
                    <Pressable
                        style={bs.checkRow}
                        onPress={() => setDeleteReminder(!deleteReminder)}
                    >
                        <Ionicons
                            name='warning-outline'
                            size={18}
                            color={colors.warning}
                        />
                        <Text style={bs.checkText}>Xóa luôn lịch nhắc</Text>
                    </Pressable>
                    <View style={bs.btnRow}>
                        <Pressable style={bs.btnGhost} onPress={onClose}>
                            <Text style={bs.btnGhostText}>Hủy</Text>
                        </Pressable>
                        <Pressable
                            style={[
                                bs.btnPrimary,
                                { backgroundColor: colors.danger },
                            ]}
                            onPress={onClose}
                        >
                            <Text style={bs.btnPrimaryText}>Xóa</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

/* ── Bottom Sheet shared styles ── */

const bs = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(15,23,42,0.45)',
    },
    overlay: { flex: 1 },
    sheet: {
        backgroundColor: colors.card,
        borderTopLeftRadius: moderateScale(24),
        borderTopRightRadius: moderateScale(24),
        paddingHorizontal: scale(24),
        paddingBottom: verticalScale(28),
    },
    handle: {
        alignSelf: 'center',
        width: scale(36),
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
        marginTop: verticalScale(10),
        marginBottom: verticalScale(16),
    },
    title: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(16),
        color: colors.text,
        marginBottom: verticalScale(4),
    },
    sub: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        color: colors.text2,
        marginBottom: verticalScale(8),
    },
    divider: {
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
    textInput: {
        ...inputSystem.fieldSoft,
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: moderateScale(11),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12.5),
        color: colors.text,
        marginTop: verticalScale(8),
        marginBottom: verticalScale(4),
    },
    btnRow: {
        flexDirection: 'row',
        gap: scale(12),
        marginTop: verticalScale(16),
    },
    btnGhost: {
        ...buttonSystem.outline,
        flex: 1,
        borderRadius: moderateScale(11),
    },
    btnGhostText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12.5),
        color: colors.text2,
    },
    btnPrimary: {
        ...buttonSystem.primary,
        flex: 1,
        borderRadius: moderateScale(11),
        backgroundColor: ACCENT,
    },
    btnPrimaryText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12.5),
        color: '#fff',
    },
});

/* ── Styles ── */

const INPUT_HEIGHT = verticalScale(40);

const s = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.bg,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        backgroundColor: 'transparent',
    },
    backBtn: {
        width: scale(28),
        height: scale(28),
        borderRadius: moderateScale(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(17),
        color: colors.text,
    },
    headerSub: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(11),
        color: colors.text3,
        marginTop: 1,
    },
    saveHeaderBtn: {
        ...buttonSystem.primary,
        minHeight: verticalScale(34),
        paddingHorizontal: scale(14),
        borderRadius: moderateScale(10),
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveHeaderText: {
        ...buttonSystem.textPrimary,
        fontSize: scaleFont(12),
        color: '#fff',
    },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: {
        padding: scale(16),
        paddingTop: verticalScale(6),
        paddingBottom: verticalScale(40),
        gap: verticalScale(14),
    },

    // Section card
    sectionCard: {
        backgroundColor: colors.card,
        borderRadius: moderateScale(16),
        padding: scale(16),
        borderWidth: 1,
        borderColor: colors.border,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
        marginBottom: verticalScale(8),
    },
    sectionBadge: {
        width: scale(28),
        height: scale(28),
        borderRadius: moderateScale(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        ...formSystem.sectionTitle,
    },
    sectionBody: {
        paddingTop: verticalScale(2),
    },

    // Labels & inputs
    label: {
        ...formSystem.fieldLabel,
        marginBottom: verticalScale(6),
        marginTop: verticalScale(9),
    },
    req: { color: colors.danger },
    input: {
        ...inputSystem.field,
        minHeight: INPUT_HEIGHT,
        paddingHorizontal: scale(12),
        borderRadius: moderateScale(10),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text,
    },
    selectInput: {
        ...inputSystem.selectOption,
        minHeight: INPUT_HEIGHT,
        paddingHorizontal: scale(12),
        borderRadius: moderateScale(10),
    },
    selectText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text,
    },
    row: {
        flexDirection: 'row',
        gap: scale(10),
    },
    hint: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(10.5),
        color: colors.text3,
        marginTop: verticalScale(4),
    },

    // Tags
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(8),
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(4),
        backgroundColor: colors.divider,
        borderRadius: moderateScale(7),
        maxWidth: scale(150),
    },
    tagSummaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: verticalScale(30),
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(4),
        backgroundColor: colors.divider,
        borderRadius: moderateScale(8),
    },
    tagSummaryText: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(10.5),
        lineHeight: verticalScale(14),
        color: colors.text2,
        textAlign: 'center',
    },
    tagAdd: {
        ...buttonSystem.outline,
        minHeight: verticalScale(30),
        backgroundColor: colors.bg,
        borderRadius: moderateScale(8),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(4),
    },
    tagText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(10.5),
        color: colors.text2,
    },
    tagPreviewWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(8),
        marginTop: verticalScale(8),
    },
    tagPreviewEmpty: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text3,
    },

    // Alert row (Cảnh báo sắp hết)
    alertRow: {
        marginTop: verticalScale(9),
    },
    alertSectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
        marginTop: verticalScale(9),
        marginBottom: verticalScale(6),
    },
    alertSectionDot: {
        width: moderateScale(8),
        height: moderateScale(8),
        borderRadius: moderateScale(4),
        backgroundColor: '#F45B54',
    },
    alertSectionTitle: {
        ...formSystem.fieldLabel,
    },
    alertPanel: {
        gap: 0,
    },
    alertHeaderRow: {
        minHeight: verticalScale(24),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(6),
    },
    alertHeaderTitle: {
        ...formSystem.fieldLabel,
        color: colors.text2,
    },
    alertThresholdCard: {
        ...inputSystem.field,
        minHeight: INPUT_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: scale(10),
        paddingHorizontal: scale(12),
        borderRadius: moderateScale(10),
    },
    alertThresholdCardDisabled: {
        opacity: 0.55,
    },
    alertThresholdTitle: {
        flex: 1,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text3,
    },
    alertStepper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    alertStepBtn: {
        width: moderateScale(30),
        height: moderateScale(30),
        borderRadius: moderateScale(10),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    alertStepBtnDisabled: {
        backgroundColor: '#F5F7F7',
        borderColor: colors.border,
    },
    alertStepperValue: {
        minWidth: scale(72),
        textAlign: 'center',
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text,
    },
    alertStepperValueDisabled: {
        color: colors.text3,
    },
    alertToggle: {
        display: 'none',
    },
    alertToggleActive: {
        display: 'none',
    },
    alertToggleText: {
        display: 'none',
    },
    alertToggleTextActive: {
        display: 'none',
    },
    alertThresholdBox: {
        display: 'none',
    },
    alertThresholdLabelWrap: {
        display: 'none',
    },
    alertInlineLabel: {
        display: 'none',
    },
    alertInlineLabelBox: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(11),
        color: colors.text2,
    },
    alertValueWrap: {
        display: 'none',
    },
    alertInlineInput: {
        display: 'none',
    },
    alertInlineUnit: {
        display: 'none',
    },

    // HField row
    hFieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(10),
        borderBottomWidth: 1,
        borderBottomColor: colors.border + '40', // light subtle divider
    },
    hFieldLabel: {
        flex: 2,
        ...formSystem.fieldLabel,
    },
    hFieldContent: {
        flex: 3,
        alignItems: 'flex-end',
    },

    // Inline right-aligned controls
    inlineInputBox: {
        ...inputSystem.field,
        minWidth: scale(110),
        minHeight: verticalScale(36),
        paddingHorizontal: scale(14),
        borderRadius: moderateScale(8),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text,
        textAlign: 'center',
        textAlignVertical: 'center',
        lineHeight: scaleFont(15),
        paddingVertical: 0,
    },
    inlineInputBoxDate: {
        minWidth: scale(106),
    },
    inlineSelectBox: {
        ...inputSystem.selectOption,
        minWidth: scale(110),
        paddingHorizontal: scale(14),
        borderRadius: moderateScale(8),
    },
    inlineSelectText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text,
    },

    // Repeat input
    repeatUnit: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        color: colors.text2,
        marginLeft: scale(8),
    },

    // Days grid
    daysHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingBottom: verticalScale(8),
    },
    dayColText: {
        flex: 1,
        textAlign: 'center',
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11),
        color: colors.text2,
    },
    daysCheckRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    dayCheckCol: {
        flex: 1,
        alignItems: 'center',
    },
    dayCheckbox: {
        width: scale(20),
        height: scale(20),
        borderRadius: moderateScale(4),
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
    },
    dayCheckboxActive: {
        backgroundColor: ACCENT,
        borderColor: ACCENT,
    },

    // Times vertical stack
    timesWrap: {
        gap: verticalScale(10),
        width: '100%',
        alignItems: 'flex-end',
    },
    timeRowSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    timeInputText: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(13),
        color: colors.text,
    },
    timeBtn: {
        width: scale(28),
        alignItems: 'center',
    },

    // Preview
    previewRight: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(12),
        color: colors.text2,
        textAlign: 'right',
        lineHeight: scaleFont(18),
    },

    // Footer
    footerWrapper: {
        paddingVertical: verticalScale(16),
        marginTop: verticalScale(8),
        marginBottom: verticalScale(20),
    },
    footerActionBtn: {
        display: 'none',
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: verticalScale(40),
        paddingVertical: verticalScale(7),
        gap: scale(12),
        paddingHorizontal: scale(12),
        backgroundColor: colors.card,
        borderRadius: moderateScale(12),
        marginBottom: verticalScale(6),
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    footerActionText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(14),
        color: colors.text,
    },
    footerDividerLine: {
        display: 'none',
        height: 1,
        backgroundColor: colors.border,
        marginVertical: verticalScale(16),
    },
    footerSaveRow: {
        flexDirection: 'row',
        gap: scale(12),
    },
    btnFooterGhost: {
        ...buttonSystem.outline,
        flex: 1,
        borderRadius: moderateScale(12),
        backgroundColor: colors.bg,
    },
    btnFooterGhostText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: colors.text2,
    },
    btnFooterSolid: {
        ...buttonSystem.primary,
        flex: 1,
        borderRadius: moderateScale(12),
        backgroundColor: colors.primary,
    },
    btnFooterSolidText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: '#fff',
    },
});
