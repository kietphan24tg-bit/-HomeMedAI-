import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, {
    type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
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
    STOCK_UNIT_CATEGORIES,
} from './MedicineDropdownSheet';
import ScheduleAdvancedModal, {
    type ScheduleConfig,
} from './ScheduleAdvancedModal';

const ACCENT = '#0E8A7D';
const ACCENT_LIGHT = '#E6F7F5';

interface Props {
    visible: boolean;
    item: FamilyMedicineItem | null;
    onClose: () => void;
    onSave?: (data: any) => void;
    isPending?: boolean;
    /** Dev / EXPO_PUBLIC_SHOW_PUSH_TEST: smoke-test push from parent */
    onTestPush?: () => void | Promise<void>;
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

function getSchedulePreviewText(config: ScheduleConfig): string {
    const timesText = config.times.length
        ? config.times.join(', ')
        : 'chưa có giờ';

    if (config.frequencyMode === 'weekdays') {
        const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const days = config.weekdays
            .slice()
            .sort((a, b) => a - b)
            .map((d) => labels[d])
            .join(', ');
        return `Theo thứ ${days} · ${timesText}`;
    }

    if (config.frequencyMode === 'interval') {
        return `Cách ${config.intervalDays} ngày · ${timesText}`;
    }

    return `Hàng ngày · ${timesText}`;
}

function formatDateForDisplay(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

function parseDisplayDate(value: string): Date | null {
    const matched = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!matched) return null;
    const [, dd, mm, yyyy] = matched;
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(date.getTime()) ? null : date;
}

export default function MedicineDetailSheet({
    visible,
    item,
    onClose,
    onSave,
    isPending,
    onTestPush,
}: Props) {
    const isCreateMode = !item;
    const headerTitle = isCreateMode ? 'Thêm thuốc mới' : 'Chi tiết thuốc';
    const headerSub = isCreateMode ? '(Tạo mới)' : '(Đang sửa)';

    const [name, setName] = useState('');
    const [dosePerUseVal, setDosePerUseVal] = useState('');
    const [dosePerUseUnit, setDosePerUseUnit] = useState('viên');
    const [note, setNote] = useState('');
    const [qty, setQty] = useState('');
    const [stockUnit, setStockUnit] = useState('viên');
    const [exp, setExp] = useState('');
    const [expDate, setExpDate] = useState<Date | null>(null);
    const [expPickerOpen, setExpPickerOpen] = useState(false);
    const [location, setLocation] = useState('');
    const [lowAlert, setLowAlert] = useState('5');
    const [alertOn, setAlertOn] = useState(true);
    const [reminderOn, setReminderOn] = useState(false);
    const [times, setTimes] = useState(['07:00', '20:00']);

    // Schedule Advanced Modal
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
        enabled: false,
        times: [],
        rrule: 'FREQ=DAILY',
        remindBefore: '10 phút',
        durationCount: 0,
        frequencyMode: 'daily',
        weekdays: [0, 1, 2, 3, 4],
        intervalDays: 2,
    });

    // Tags
    const [tags, setTags] = useState<string[]>(['Sốt', 'Đau đầu']);
    const [tagInputVisible, setTagInputVisible] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [tagPreviewVisible, setTagPreviewVisible] = useState(false);

    // Dropdowns
    const [dosePerUseDDOpen, setDosePerUseDDOpen] = useState(false);
    const [stockDDOpen, setStockDDOpen] = useState(false);

    const [cloneSheetOpen, setCloneSheetOpen] = useState(false);
    const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
    const [testPushPending, setTestPushPending] = useState(false);

    React.useEffect(() => {
        if (visible && item) {
            setName(item.name ?? '');
            setNote(item.note ?? '');
            setDosePerUseVal(String((item as any).dosePerUseVal ?? ''));
            setDosePerUseUnit((item as any).dosePerUseUnit ?? 'viên');
            setQty(String(item.qty ?? ''));
            setStockUnit(item.unit ?? 'viên');
            setExp(item.exp ?? '');
            setExpDate(item.exp ? parseDisplayDate(item.exp) : null);
            setLocation(item.location ?? '');
            setLowAlert(String(item.lowThreshold ?? '5'));
            setReminderOn(item.reminder?.includes('ON') ?? false);
        } else if (visible && !item) {
            setName('');
            setNote('');
            setDosePerUseVal('');
            setDosePerUseUnit('viên');
            setQty('');
            setStockUnit('viên');
            setExp('');
            setExpDate(null);
            setLocation('');
            setLowAlert('5');
            setReminderOn(false);
        }
    }, [visible, item]);

    const handleSave = () => {
        onSave?.({
            medicine_name: name,
            medicine_type: item?.form ?? 'Viên nén',
            dosage_per_use_value: parseFloat(dosePerUseVal) || 0,
            dosage_per_use_unit: dosePerUseUnit,
            use_tags: tags,
            quantity_stock: parseFloat(qty) || 0,
            unit: stockUnit,
            expiry_date: exp || null,
            min_stock_alert: parseFloat(lowAlert) || null,
            instruction: note,
            reminder_on: scheduleConfig.enabled,
            reminder_times_local: scheduleConfig.enabled
                ? scheduleConfig.times
                : [],
            dosage_per_time: parseFloat(dosePerUseVal) || undefined,
            rrule: scheduleConfig.enabled ? scheduleConfig.rrule : undefined,
        });
    };

    const handleScheduleSave = (config: ScheduleConfig) => {
        setScheduleConfig(config);
        setReminderOn(config.enabled);
        setTimes(config.times);
        setScheduleModalOpen(false);
    };

    const schedulePreviewText = scheduleConfig.enabled
        ? getSchedulePreviewText(scheduleConfig)
        : 'Chưa thiết lập';

    const changeLowAlert = (delta: number) => {
        setLowAlert((prev) => {
            const current = parseInt(prev || '0', 10) || 0;
            return String(Math.max(1, current + delta));
        });
    };

    const handleExpDateChange = (
        _event: DateTimePickerEvent,
        selectedDate?: Date,
    ) => {
        if (Platform.OS === 'android') {
            setExpPickerOpen(false);
        }
        if (!selectedDate) {
            return;
        }
        setExpDate(selectedDate);
        setExp(formatDateForDisplay(selectedDate));
    };

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
                <KeyboardAvoidingView
                    style={s.scroll}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                >
                    <ScrollView
                        style={s.scroll}
                        contentContainerStyle={s.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps='handled'
                        keyboardDismissMode='interactive'
                        automaticallyAdjustKeyboardInsets
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
                                                    {truncateTag(
                                                        tagSummary.lead,
                                                    )}
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
                                                            marginLeft:
                                                                scale(4),
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
                                                                        index !==
                                                                        1,
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
                                                        setTagPreviewVisible(
                                                            true,
                                                        )
                                                    }
                                                >
                                                    <Text
                                                        style={s.tagSummaryText}
                                                    >
                                                        +{tagSummary.remaining}{' '}
                                                        mục khác
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
                                        style={[
                                            s.tagText,
                                            { color: colors.text2 },
                                        ]}
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
                                    onChangeText={(text) => {
                                        const sanitized = text
                                            .replace(',', '.')
                                            .replace(/[^0-9.]/g, '')
                                            .replace(/^(\d*\.?\d*).*$/, '$1');
                                        setQty(sanitized);
                                    }}
                                    style={[s.input, { flex: 2 }]}
                                    placeholder='12'
                                    placeholderTextColor={colors.text3}
                                    keyboardType='numeric'
                                />
                                <Pressable
                                    style={[s.selectInput, { flex: 1 }]}
                                    onPress={() => setStockDDOpen(true)}
                                >
                                    <Text style={s.selectText}>
                                        {stockUnit}
                                    </Text>
                                    <Ionicons
                                        name='chevron-down'
                                        size={14}
                                        color={colors.text3}
                                    />
                                </Pressable>
                            </View>

                            <Label text='Hạn sử dụng' required />
                            <Pressable
                                style={s.dateInput}
                                onPress={() => setExpPickerOpen(true)}
                            >
                                <Text
                                    style={
                                        exp
                                            ? s.dateInputText
                                            : s.dateInputPlaceholder
                                    }
                                >
                                    {exp || 'Chọn ngày hết hạn'}
                                </Text>
                                <Ionicons
                                    name='calendar-outline'
                                    size={16}
                                    color={colors.text3}
                                />
                            </Pressable>
                            {expPickerOpen &&
                                (Platform.OS === 'ios' ? (
                                    <View style={s.iosDateWrap}>
                                        <View style={s.iosDateHeader}>
                                            <Pressable
                                                onPress={() =>
                                                    setExpPickerOpen(false)
                                                }
                                            >
                                                <Text style={s.iosDateDone}>
                                                    Xong
                                                </Text>
                                            </Pressable>
                                        </View>
                                        <DateTimePicker
                                            value={expDate || new Date()}
                                            mode='date'
                                            display='inline'
                                            onChange={handleExpDateChange}
                                        />
                                    </View>
                                ) : (
                                    <DateTimePicker
                                        value={expDate || new Date()}
                                        mode='date'
                                        display='default'
                                        onChange={handleExpDateChange}
                                    />
                                ))}

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
                                                <Text
                                                    style={s.alertStepperValue}
                                                >
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
                                    value={scheduleConfig.enabled}
                                    onValueChange={(val) => {
                                        setScheduleConfig((prev) => {
                                            const next = {
                                                ...prev,
                                                enabled: val,
                                            };
                                            return next;
                                        });
                                        setReminderOn(val);
                                        if (val) {
                                            setScheduleModalOpen(true);
                                        }
                                    }}
                                    trackColor={{
                                        false: colors.border,
                                        true: colors.success,
                                    }}
                                    thumbColor='#fff'
                                />
                            </HField>

                            {scheduleConfig.enabled && (
                                <>
                                    {/* Preview summary */}
                                    <View style={s.schedulePreviewCard}>
                                        <View style={s.schedulePreviewRow}>
                                            <Ionicons
                                                name='time-outline'
                                                size={16}
                                                color={ACCENT}
                                            />
                                            <Text style={s.schedulePreviewText}>
                                                {schedulePreviewText}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Open advanced modal button */}
                                    <Pressable
                                        style={s.advancedBtn}
                                        onPress={() =>
                                            setScheduleModalOpen(true)
                                        }
                                    >
                                        <Ionicons
                                            name='settings-outline'
                                            size={16}
                                            color={ACCENT}
                                        />
                                        <Text style={s.advancedBtnText}>
                                            Cài đặt nâng cao
                                        </Text>
                                        <Ionicons
                                            name='chevron-forward'
                                            size={16}
                                            color={colors.text3}
                                        />
                                    </Pressable>

                                    {onTestPush ? (
                                        <HField label='Kiểm thử'>
                                            <Pressable
                                                style={s.testPushBtn}
                                                disabled={testPushPending}
                                                onPress={() => {
                                                    void (async () => {
                                                        setTestPushPending(
                                                            true,
                                                        );
                                                        try {
                                                            await onTestPush();
                                                        } finally {
                                                            setTestPushPending(
                                                                false,
                                                            );
                                                        }
                                                    })();
                                                }}
                                            >
                                                {testPushPending ? (
                                                    <ActivityIndicator
                                                        color={ACCENT}
                                                    />
                                                ) : (
                                                    <Text
                                                        style={
                                                            s.testPushBtnText
                                                        }
                                                    >
                                                        Gửi thử thông báo
                                                    </Text>
                                                )}
                                            </Pressable>
                                        </HField>
                                    ) : null}
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
                                    <Text style={s.btnFooterGhostText}>
                                        Hủy
                                    </Text>
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
                </KeyboardAvoidingView>
            </SafeAreaView>

            {/* Dropdown modals */}
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

            {/* Schedule Advanced Modal */}
            <ScheduleAdvancedModal
                visible={scheduleModalOpen}
                initialConfig={scheduleConfig}
                onClose={() => setScheduleModalOpen(false)}
                onSave={handleScheduleSave}
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
            <KeyboardAvoidingView
                style={bs.backdrop}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
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
            </KeyboardAvoidingView>
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
    testPushBtn: {
        borderWidth: 1,
        borderColor: ACCENT,
        borderRadius: moderateScale(10),
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(14),
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: verticalScale(40),
    },
    testPushBtnText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        color: ACCENT,
    },

    // Schedule preview & advanced button
    schedulePreviewCard: {
        backgroundColor: '#E6F7F5',
        borderRadius: moderateScale(10),
        padding: scale(12),
        marginTop: verticalScale(6),
        borderWidth: 1,
        borderColor: ACCENT + '25',
    },
    schedulePreviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    schedulePreviewText: {
        flex: 1,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text,
        lineHeight: scaleFont(17),
    },
    advancedBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(14),
        borderRadius: moderateScale(10),
        borderWidth: 1.5,
        borderColor: ACCENT + '40',
        backgroundColor: colors.card,
        marginTop: verticalScale(4),
    },
    advancedBtnText: {
        flex: 1,
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(13),
        color: ACCENT,
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
    dateInput: {
        ...inputSystem.field,
        minHeight: INPUT_HEIGHT,
        paddingHorizontal: scale(12),
        borderRadius: moderateScale(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateInputText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text,
    },
    dateInputPlaceholder: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text3,
    },
    iosDateWrap: {
        marginTop: verticalScale(8),
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: moderateScale(10),
        backgroundColor: colors.card,
        overflow: 'hidden',
    },
    iosDateHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(8),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    iosDateDone: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
        color: colors.primary,
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
