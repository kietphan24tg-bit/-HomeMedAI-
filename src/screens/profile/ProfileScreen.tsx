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
import { DateField } from '../../components/ui';
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
    isStepper?: boolean;
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
    const openDate = () => {
        Keyboard.dismiss();
        setDraft(fields.dob);
        setSheet({
            type: 'date',
            key: 'dob',
            title: 'Ngày sinh',
            value: fields.dob,
            icon: 'calendar',
        });
    };

    const openSimple = (
        key: string,
        title: string,
        icon: string,
        suffix?: string,
        keyboard?: 'default' | 'numeric',
        isStepper?: boolean,
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
            isStepper,
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
        setFields((prev) => ({ ...prev, [sheet.key]: draft }));
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
                            iconName='speedometer-outline'
                            iconColor={colors.cHealth}
                            iconBg={colors.cHealthBg}
                            onPress={() =>
                                openSimple(
                                    'weight',
                                    'Cân nặng',
                                    'speedometer-outline',
                                    'kg',
                                    'numeric',
                                    true,
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

                            {/* Date Picker (Replaced manual calendar with DateField) */}
                            {sheet?.type === 'date' && (
                                <View style={shared.sheetBody}>
                                    <DateField
                                        value={(() => {
                                            const parts = draft.split('/');
                                            if (parts.length === 3) {
                                                const d = parseInt(
                                                    parts[0],
                                                    10,
                                                );
                                                const m = parseInt(
                                                    parts[1],
                                                    10,
                                                );
                                                const y = parseInt(
                                                    parts[2],
                                                    10,
                                                );
                                                const date = new Date(
                                                    y,
                                                    m - 1,
                                                    d,
                                                );
                                                if (!isNaN(date.getTime())) {
                                                    return date;
                                                }
                                            }
                                            return null;
                                        })()}
                                        onChange={(date) => {
                                            const dd = String(
                                                date.getDate(),
                                            ).padStart(2, '0');
                                            const mm = String(
                                                date.getMonth() + 1,
                                            ).padStart(2, '0');
                                            const yyyy = date.getFullYear();
                                            setDraft(`${dd}/${mm}/${yyyy}`);
                                        }}
                                    />
                                    <Text
                                        style={{
                                            fontSize: 11,
                                            color: colors.text3,
                                            marginTop: 12,
                                            textAlign: 'center',
                                        }}
                                    >
                                        Bạn có thể nhập ngày trực tiếp
                                        (dd/mm/yyyy) hoặc nhấn biểu tượng lịch.
                                    </Text>
                                </View>
                            )}

                            {/* Simple Input / Stepper */}
                            {sheet?.type === 'simple' && (
                                <View style={shared.sheetBody}>
                                    {sheet.isStepper ? (
                                        <View
                                            style={[
                                                styles.stepperContainer,
                                                { height: 60 },
                                            ]}
                                        >
                                            <TextInput
                                                style={[
                                                    styles.stepperInput,
                                                    { fontSize: 22 },
                                                ]}
                                                value={draft}
                                                onChangeText={setDraft}
                                                keyboardType='numeric'
                                                autoFocus
                                            />
                                            <View
                                                style={styles.stepperControls}
                                            >
                                                <Pressable
                                                    style={[
                                                        styles.stepBtn,
                                                        {
                                                            width: 44,
                                                            height: 44,
                                                        },
                                                    ]}
                                                    onPress={() => {
                                                        const val =
                                                            parseInt(
                                                                draft || '0',
                                                            ) + 5;
                                                        setDraft(String(val));
                                                    }}
                                                >
                                                    <Ionicons
                                                        name='add'
                                                        size={20}
                                                        color={colors.text2}
                                                    />
                                                </Pressable>
                                                <Pressable
                                                    style={[
                                                        styles.stepBtn,
                                                        {
                                                            width: 44,
                                                            height: 44,
                                                        },
                                                    ]}
                                                    onPress={() => {
                                                        const val = Math.max(
                                                            0,
                                                            parseInt(
                                                                draft || '0',
                                                            ) - 5,
                                                        );
                                                        setDraft(String(val));
                                                    }}
                                                >
                                                    <Ionicons
                                                        name='remove'
                                                        size={20}
                                                        color={colors.text2}
                                                    />
                                                </Pressable>
                                            </View>
                                            {sheet.suffix && (
                                                <Text
                                                    style={[
                                                        styles.stepperUnit,
                                                        {
                                                            fontSize: 16,
                                                            marginRight: 10,
                                                        },
                                                    ]}
                                                >
                                                    {sheet.suffix}
                                                </Text>
                                            )}
                                        </View>
                                    ) : (
                                        <View style={shared.sheetInputWrap}>
                                            <Ionicons
                                                name={
                                                    (sheet.icon ||
                                                        'create') as any
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
                                                placeholderTextColor={
                                                    colors.text3
                                                }
                                                autoFocus
                                            />
                                            {sheet.suffix && (
                                                <Text
                                                    style={styles.sheetSuffix}
                                                >
                                                    {sheet.suffix}
                                                </Text>
                                            )}
                                        </View>
                                    )}
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
