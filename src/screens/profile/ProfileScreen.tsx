// src/screens/profile/ProfileScreen.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import FieldRow from '../../components/profile/FieldRow';
import { shared } from '../../styles/shared';
import { colors } from '../../styles/tokens';

type SheetType = 'simple' | 'select' | 'date' | null;
interface SheetState {
    type: SheetType;
    key: string;
    title: string;
    value: string;
    icon: string;
    suffix?: string;
    keyboard?: 'default' | 'numeric';
    options?: string[];
}

const GENDER_OPTIONS = ['Nam', 'Nữ', 'Khác'];
const BLOOD_OPTIONS = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
    'Chưa biết',
];

const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
function daysInMonth(m: number, y: number) {
    return new Date(y, m + 1, 0).getDate();
}
function firstDow(m: number, y: number) {
    return new Date(y, m, 1).getDay();
}

function calcBMI(h: string, w: string): string {
    const hNum = parseFloat(h);
    const wNum = parseFloat(w);
    if (!hNum || !wNum) return '';
    const bmi = wNum / (hNum / 100) ** 2;
    return `BMI ${bmi.toFixed(1)}`;
}

export default function ProfileScreen(): React.JSX.Element {
    const router = useRouter();

    const [fields, setFields] = useState({
        dob: '12/03/1987',
        gender: 'Nam',
        height: '170',
        weight: '68',
        address: 'Quận Bình Thạnh, TP. HCM',
        blood: 'O+',
    });

    const [sheet, setSheet] = useState<SheetState | null>(null);
    const [draft, setDraft] = useState('');
    const [calMonth, setCalMonth] = useState(2);
    const [calYear, setCalYear] = useState(1987);
    const [calDay, setCalDay] = useState<number | null>(12);
    const [showCal, setShowCal] = useState(false);

    const openDate = () => {
        Keyboard.dismiss();
        const parts = fields.dob.split('/');
        if (parts.length === 3) {
            setCalDay(parseInt(parts[0], 10));
            setCalMonth(parseInt(parts[1], 10) - 1);
            setCalYear(parseInt(parts[2], 10));
        }
        setDraft(fields.dob);
        setShowCal(false);
        setSheet({
            type: 'date',
            key: 'dob',
            title: 'Ngày sinh',
            value: fields.dob,
            icon: 'calendar',
        });
    };

    const calPrev = () => {
        if (calMonth === 0) {
            setCalMonth(11);
            setCalYear((y) => y - 1);
        } else setCalMonth((m) => m - 1);
    };
    const calNext = () => {
        if (calMonth === 11) {
            setCalMonth(0);
            setCalYear((y) => y + 1);
        } else setCalMonth((m) => m + 1);
    };

    const calendarGrid = () => {
        const days = daysInMonth(calMonth, calYear);
        const first = firstDow(calMonth, calYear);
        const prevD = daysInMonth(
            calMonth === 0 ? 11 : calMonth - 1,
            calMonth === 0 ? calYear - 1 : calYear,
        );
        const cells: { day: number; cur: boolean }[] = [];
        for (let i = first - 1; i >= 0; i--) {
            cells.push({ day: prevD - i, cur: false });
        }
        for (let d = 1; d <= days; d++) cells.push({ day: d, cur: true });
        while (cells.length < 42) {
            cells.push({ day: cells.length - first - days + 1, cur: false });
        }
        const now = new Date();
        const weeks: (typeof cells)[] = [];
        for (let i = 0; i < cells.length; i += 7) {
            weeks.push(cells.slice(i, i + 7));
        }
        return weeks.map((week, wi) => (
            <View key={wi} style={styles.calWeekRow}>
                {week.map((c, di) => {
                    const sel = c.cur && c.day === calDay;
                    const td =
                        c.cur &&
                        c.day === now.getDate() &&
                        calMonth === now.getMonth() &&
                        calYear === now.getFullYear();
                    return (
                        <Pressable
                            key={di}
                            style={[styles.calDayCell, sel && styles.calDaySel]}
                            onPress={() => c.cur && setCalDay(c.day)}
                        >
                            <Text
                                style={[
                                    styles.calDayText,
                                    !c.cur && styles.calDayOther,
                                    sel && styles.calDayTextSel,
                                    td && !sel && styles.calDayTextToday,
                                ]}
                            >
                                {c.day}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        ));
    };

    const openSimple = (
        key: string,
        title: string,
        icon: string,
        suffix?: string,
        keyboard?: 'default' | 'numeric',
    ) => {
        Keyboard.dismiss();
        setDraft(fields[key as keyof typeof fields]);
        setSheet({
            type: 'simple',
            key,
            title,
            value: fields[key as keyof typeof fields],
            icon,
            suffix,
            keyboard,
        });
    };

    const openSelect = (
        key: string,
        title: string,
        icon: string,
        options: string[],
    ) => {
        Keyboard.dismiss();
        setDraft(fields[key as keyof typeof fields]);
        setSheet({
            type: 'select',
            key,
            title,
            value: fields[key as keyof typeof fields],
            icon,
            options,
        });
    };

    const saveSheet = () => {
        if (!sheet) return;
        if (sheet.type === 'date') {
            if (calDay) {
                const dd = String(calDay).padStart(2, '0');
                const mm = String(calMonth + 1).padStart(2, '0');
                setFields((prev) => ({
                    ...prev,
                    dob: `${dd}/${mm}/${calYear}`,
                }));
            }
        } else {
            setFields((prev) => ({ ...prev, [sheet.key]: draft }));
        }
        setSheet(null);
    };

    const handleLogout = (): void => {
        router.replace('/onboarding');
    };

    const bmi = calcBMI(fields.height, fields.weight);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgProfile }}>
            <StatusBar
                barStyle='dark-content'
                backgroundColor={colors.bgProfile}
            />
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* TOPBAR */}
                <View style={styles.topbar}>
                    <View style={styles.topbarLeft}>
                        <Pressable style={styles.iconBtnSmall}>
                            <Ionicons
                                name='chevron-back'
                                size={15}
                                color={colors.text2}
                            />
                        </Pressable>
                        <Text style={styles.pageTitle}>Hồ sơ cá nhân</Text>
                    </View>
                    <Pressable style={styles.iconBtnSmall}>
                        <Ionicons
                            name='share-outline'
                            size={15}
                            color={colors.text2}
                        />
                    </Pressable>
                </View>

                {/* HERO CARD */}
                <View style={styles.heroCard}>
                    <LinearGradient
                        colors={['#EFF6FF', '#F0FDFA']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroStrip}
                    >
                        <View style={styles.stripRow}>
                            <View />
                            <Pressable style={styles.pencilBtn}>
                                <Ionicons
                                    name='create-outline'
                                    size={13}
                                    color={colors.text2}
                                />
                            </Pressable>
                        </View>
                        <View style={styles.avRow}>
                            <View style={styles.avWrap}>
                                <LinearGradient
                                    colors={['#BFDBFE', '#99F6E4']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.avCircle}
                                >
                                    <Text style={styles.avInitials}>AN</Text>
                                </LinearGradient>
                                <View style={styles.avCam}>
                                    <Ionicons
                                        name='camera'
                                        size={10}
                                        color='#fff'
                                    />
                                </View>
                            </View>
                            <View style={styles.heroMeta}>
                                <Text style={styles.hmName}>Nguyễn Văn An</Text>
                                <Text style={styles.hmSub}>
                                    38 tuổi · {fields.gender} · TP. Hồ Chí Minh
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>
                    <View style={styles.heroContacts}>
                        <View style={styles.contactRow}>
                            <Text style={styles.contactLabel}>Email :</Text>
                            <Text style={styles.contactValue}>
                                nguyenvanam[at]email.com
                            </Text>
                        </View>
                        <View style={styles.contactRow}>
                            <Text style={styles.contactLabel}>
                                Số điện thoại :
                            </Text>
                            <Text style={styles.contactValue}>
                                0901 234 567
                            </Text>
                        </View>
                    </View>
                </View>

                {/* THÔNG TIN CÁ NHÂN */}
                <View style={styles.section}>
                    <View style={styles.secTitleRow}>
                        <Text style={styles.secTitle}>Thông tin cá nhân</Text>
                    </View>
                    <View style={styles.fieldCard}>
                        <FieldRow
                            label='Ngày sinh'
                            value={fields.dob}
                            iconName='calendar'
                            iconColor={colors.cMedical}
                            iconBg={colors.cMedicalBg}
                            onPress={openDate}
                        />
                        <FieldRow
                            label='Giới tính'
                            value={fields.gender}
                            iconName='person'
                            iconColor={colors.cFamily}
                            iconBg={colors.cFamilyBg}
                            onPress={() =>
                                openSelect(
                                    'gender',
                                    'Giới tính',
                                    'person',
                                    GENDER_OPTIONS,
                                )
                            }
                        />
                        <FieldRow
                            label='Chiều cao'
                            value={`${fields.height} cm`}
                            iconName='resize'
                            iconColor={colors.cHealth}
                            iconBg={colors.cHealthBg}
                            onPress={() =>
                                openSimple(
                                    'height',
                                    'Chiều cao',
                                    'resize',
                                    'cm',
                                    'numeric',
                                )
                            }
                        />
                        <FieldRow
                            label='Cân nặng'
                            value={`${fields.weight} kg`}
                            badge={bmi}
                            iconName='fitness'
                            iconColor={colors.cHealth}
                            iconBg={colors.cHealthBg}
                            onPress={() =>
                                openSimple(
                                    'weight',
                                    'Cân nặng',
                                    'fitness',
                                    'kg',
                                    'numeric',
                                )
                            }
                        />
                        <FieldRow
                            label='Địa chỉ'
                            value={fields.address}
                            iconName='location'
                            iconColor='#64748B'
                            iconBg='#F1F5F9'
                            isLast
                            onPress={() =>
                                openSimple('address', 'Địa chỉ', 'location')
                            }
                        />
                    </View>
                </View>

                {/* SAVE / LOGOUT */}
                <View style={styles.btnWrap}>
                    <Pressable style={styles.btnLogout} onPress={handleLogout}>
                        <Ionicons
                            name='log-out-outline'
                            size={15}
                            color={colors.cDanger}
                        />
                        <Text style={styles.btnLogoutText}>Đăng xuất</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* BOTTOM SHEET */}
            <Modal
                visible={sheet !== null}
                transparent
                animationType='fade'
                onRequestClose={() => setSheet(null)}
            >
                <Pressable
                    style={shared.overlay}
                    onPress={() => setSheet(null)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.sheetKeyboard}
                    >
                        <Pressable
                            style={shared.sheetContainer}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <View style={shared.sheetHandle}>
                                <View style={shared.sheetBar} />
                            </View>

                            {/* Header */}
                            <View style={shared.sheetHeader}>
                                <Text style={shared.sheetTitle}>
                                    {sheet?.title}
                                </Text>
                                <Pressable onPress={() => setSheet(null)}>
                                    <Ionicons
                                        name='close'
                                        size={20}
                                        color={colors.text2}
                                    />
                                </Pressable>
                            </View>

                            {/* Date Picker */}
                            {sheet?.type === 'date' && (
                                <View style={shared.sheetBody}>
                                    {showCal && (
                                        <>
                                            <View style={styles.calHeader}>
                                                <Text
                                                    style={styles.calMonthYear}
                                                >
                                                    {MONTH_NAMES[calMonth]}{' '}
                                                    {calYear} ▾
                                                </Text>
                                                <View style={styles.calNav}>
                                                    <Pressable
                                                        onPress={calPrev}
                                                        style={styles.calNavBtn}
                                                    >
                                                        <Ionicons
                                                            name='chevron-up'
                                                            size={18}
                                                            color={colors.text2}
                                                        />
                                                    </Pressable>
                                                    <Pressable
                                                        onPress={calNext}
                                                        style={styles.calNavBtn}
                                                    >
                                                        <Ionicons
                                                            name='chevron-down'
                                                            size={18}
                                                            color={colors.text2}
                                                        />
                                                    </Pressable>
                                                </View>
                                            </View>
                                            <View style={styles.calWeekRow}>
                                                {WEEKDAYS.map((d) => (
                                                    <Text
                                                        key={d}
                                                        style={
                                                            styles.calWeekDay
                                                        }
                                                    >
                                                        {d}
                                                    </Text>
                                                ))}
                                            </View>
                                            {calendarGrid()}
                                            <View style={styles.calActions}>
                                                <Pressable
                                                    onPress={() =>
                                                        setCalDay(null)
                                                    }
                                                >
                                                    <Text
                                                        style={styles.calClear}
                                                    >
                                                        Clear
                                                    </Text>
                                                </Pressable>
                                                <Pressable
                                                    onPress={() => {
                                                        const t = new Date();
                                                        setCalDay(t.getDate());
                                                        setCalMonth(
                                                            t.getMonth(),
                                                        );
                                                        setCalYear(
                                                            t.getFullYear(),
                                                        );
                                                    }}
                                                >
                                                    <Text
                                                        style={styles.calToday}
                                                    >
                                                        Today
                                                    </Text>
                                                </Pressable>
                                            </View>
                                        </>
                                    )}
                                    <View
                                        style={[
                                            shared.sheetInputWrap,
                                            showCal && { marginTop: 12 },
                                        ]}
                                    >
                                        <Ionicons
                                            name='create-outline'
                                            size={18}
                                            color={colors.primary}
                                        />
                                        <Text
                                            style={[
                                                shared.sheetInput,
                                                !calDay && {
                                                    color: colors.text3,
                                                },
                                            ]}
                                        >
                                            {calDay
                                                ? `${String(calMonth + 1).padStart(2, '0')}/${String(calDay).padStart(2, '0')}/${calYear}`
                                                : 'mm/dd/yyyy'}
                                        </Text>
                                        <Pressable
                                            onPress={() =>
                                                setShowCal((v) => !v)
                                            }
                                        >
                                            <Ionicons
                                                name='calendar-outline'
                                                size={18}
                                                color={
                                                    showCal
                                                        ? colors.primary
                                                        : colors.text3
                                                }
                                            />
                                        </Pressable>
                                    </View>
                                </View>
                            )}

                            {/* Simple Input */}
                            {sheet?.type === 'simple' && (
                                <View style={shared.sheetBody}>
                                    <View style={shared.sheetInputWrap}>
                                        <Ionicons
                                            name={
                                                (sheet.icon || 'create') as any
                                            }
                                            size={18}
                                            color={colors.primary}
                                        />
                                        <TextInput
                                            style={shared.sheetInput}
                                            value={draft}
                                            onChangeText={setDraft}
                                            keyboardType={
                                                sheet.keyboard || 'default'
                                            }
                                            placeholder={sheet.title}
                                            placeholderTextColor={colors.text3}
                                        />
                                        {sheet.suffix && (
                                            <Text style={styles.sheetSuffix}>
                                                {sheet.suffix}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            )}

                            {/* Select Options */}
                            {sheet?.type === 'select' && (
                                <View style={shared.sheetBody}>
                                    {sheet.options?.map((opt) => {
                                        const active = draft === opt;
                                        return (
                                            <Pressable
                                                key={opt}
                                                style={[
                                                    styles.sheetSelectOption,
                                                    active &&
                                                        styles.sheetSelectActive,
                                                ]}
                                                onPress={() => setDraft(opt)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.sheetSelectText,
                                                        active &&
                                                            styles.sheetSelectTextActive,
                                                    ]}
                                                >
                                                    {opt}
                                                </Text>
                                                {active && (
                                                    <Ionicons
                                                        name='checkmark-circle'
                                                        size={20}
                                                        color={colors.primary}
                                                    />
                                                )}
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            )}

                            {/* Buttons */}
                            <View style={shared.sheetBtnRow}>
                                <Pressable
                                    style={shared.sheetBtnGhost}
                                    onPress={() => setSheet(null)}
                                >
                                    <Text style={shared.sheetBtnGhostText}>
                                        Huỷ
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={shared.sheetBtnPrimaryWrap}
                                    onPress={saveSheet}
                                >
                                    <LinearGradient
                                        colors={[
                                            colors.primary,
                                            colors.secondary,
                                        ]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={shared.sheetBtnPrimary}
                                    >
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 4,
                                            }}
                                        >
                                            <Ionicons
                                                name='checkmark'
                                                size={16}
                                                color='#fff'
                                            />
                                            <Text
                                                style={
                                                    shared.sheetBtnPrimaryText
                                                }
                                            >
                                                Lưu
                                            </Text>
                                        </View>
                                    </LinearGradient>
                                </Pressable>
                            </View>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}
