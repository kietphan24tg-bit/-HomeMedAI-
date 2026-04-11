// src/screens/profile/ProfileScreen.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
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
import { useShallow } from 'zustand/shallow';
import { styles } from './styles';
import FieldRow from '../../components/profile/FieldRow';
import { DateField } from '../../components/ui';
import { useAuthStore } from '../../stores/useAuthStore';
import { shared } from '../../styles/shared';
import { colors, gradients } from '../../styles/tokens';

type SheetType = 'simple' | 'select' | 'date' | 'contacts' | null;
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
function calcBMI(h: string, w: string): string {
    const hNum = parseFloat(h);
    const wNum = parseFloat(w);
    if (!hNum || !wNum) return '';
    const bmi = wNum / (hNum / 100) ** 2;
    return `BMI ${bmi.toFixed(1)}`;
}

export default function ProfileScreen(): React.JSX.Element {
    const router = useRouter();
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [contacts, setContacts] = useState({
        email: 'nguyenvanam[at]email.com',
        phone: '0901 234 567',
    });
    const [contactDraft, setContactDraft] = useState(contacts);
    const { accessToken } = useAuthStore(
        useShallow((state) => ({
            accessToken: state.accessToken,
        })),
    );
    console.log('Access Token lay ra duoc la: ', accessToken);
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

    const handlePickAvatar = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert(
                'Chưa có quyền truy cập ảnh',
                'Hãy cho phép ứng dụng truy cập thư viện ảnh để chọn ảnh đại diện.',
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
        });

        if (!result.canceled && result.assets[0]?.uri) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const openContactsEditor = () => {
        Keyboard.dismiss();
        setContactDraft(contacts);
        setSheet({
            type: 'contacts',
            key: 'contacts',
            title: 'Thông tin liên hệ',
            value: '',
            icon: 'mail-outline',
        });
    };

    const saveSheet = () => {
        if (!sheet) return;
        if (sheet.type === 'contacts') {
            setContacts(contactDraft);
            setSheet(null);
            return;
        }
        setFields((prev) => ({ ...prev, [sheet.key]: draft }));
        setSheet(null);
    };

    const handleLogout = async (): Promise<void> => {
        await useAuthStore.getState().signOut();
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
                        <Pressable
                            style={styles.iconBtnPlain}
                            onPress={() => router.back()}
                        >
                            <Ionicons
                                name='chevron-back'
                                size={15}
                                color={colors.text2}
                            />
                        </Pressable>
                        <Text style={styles.pageTitle}>
                            {'H\u1ED3 s\u01A1 c\u00E1 nh\u00E2n'}
                        </Text>
                    </View>
                </View>

                {/* HERO CARD */}
                <View style={styles.heroCard}>
                    <LinearGradient
                        colors={gradients.brandSoft}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroStrip}
                    >
                        <View style={styles.stripRow}>
                            <View />
                            <Pressable
                                style={styles.pencilBtn}
                                onPress={openContactsEditor}
                            >
                                <Ionicons
                                    name='create-outline'
                                    size={13}
                                    color={colors.text2}
                                />
                            </Pressable>
                        </View>
                        <View style={styles.avRow}>
                            <Pressable
                                style={styles.avWrap}
                                onPress={handlePickAvatar}
                            >
                                {avatarUri ? (
                                    <Image
                                        source={{ uri: avatarUri }}
                                        style={styles.avCircle}
                                    />
                                ) : (
                                    <LinearGradient
                                        colors={gradients.healthSoft}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.avCircle}
                                    >
                                        <Text style={styles.avInitials}>
                                            AN
                                        </Text>
                                    </LinearGradient>
                                )}
                                <View style={styles.avCam}>
                                    <Ionicons
                                        name='camera'
                                        size={10}
                                        color='#fff'
                                    />
                                </View>
                            </Pressable>
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
                                {contacts.email}
                            </Text>
                        </View>
                        <View style={styles.contactRow}>
                            <Text style={styles.contactLabel}>
                                Số điện thoại :
                            </Text>
                            <Text style={styles.contactValue}>
                                {contacts.phone}
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
                            iconColor={colors.primary}
                            iconBg={colors.primaryBg}
                            onPress={openDate}
                        />
                        <FieldRow
                            label='Giới tính'
                            value={fields.gender}
                            iconName='person'
                            iconColor={colors.secondary}
                            iconBg={colors.secondaryBg}
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
                            iconColor={colors.success}
                            iconBg={colors.successBg}
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
                            iconColor={colors.success}
                            iconBg={colors.successBg}
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
                            iconColor={colors.text2}
                            iconBg={colors.bgHealth}
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
                            color={colors.danger}
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
                                        <View style={styles.stepperContainer}>
                                            <TextInput
                                                style={styles.stepperInput}
                                                value={draft}
                                                onChangeText={setDraft}
                                                keyboardType='numeric'
                                                autoFocus
                                            />
                                            <View
                                                style={styles.stepperControls}
                                            >
                                                <Pressable
                                                    style={styles.stepBtn}
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
                                                    style={styles.stepBtn}
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
                                                    style={styles.stepperUnit}
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

                            {sheet?.type === 'contacts' && (
                                <View style={shared.sheetBody}>
                                    <View style={styles.contactFieldGroup}>
                                        <Text style={styles.contactFieldLabel}>
                                            Email
                                        </Text>
                                        <View
                                            style={styles.contactFieldInputWrap}
                                        >
                                            <Ionicons
                                                name='mail-outline'
                                                size={17}
                                                color={colors.primary}
                                            />
                                            <TextInput
                                                style={styles.contactFieldInput}
                                                value={contactDraft.email}
                                                onChangeText={(value) =>
                                                    setContactDraft((prev) => ({
                                                        ...prev,
                                                        email: value,
                                                    }))
                                                }
                                                keyboardType='email-address'
                                                autoCapitalize='none'
                                                autoCorrect={false}
                                                placeholder='Nhập email'
                                                placeholderTextColor={
                                                    colors.text3
                                                }
                                                autoFocus
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.contactFieldGroup}>
                                        <Text style={styles.contactFieldLabel}>
                                            Số điện thoại
                                        </Text>
                                        <View
                                            style={styles.contactFieldInputWrap}
                                        >
                                            <Ionicons
                                                name='call-outline'
                                                size={17}
                                                color={colors.primary}
                                            />
                                            <TextInput
                                                style={styles.contactFieldInput}
                                                value={contactDraft.phone}
                                                onChangeText={(value) =>
                                                    setContactDraft((prev) => ({
                                                        ...prev,
                                                        phone: value,
                                                    }))
                                                }
                                                keyboardType='phone-pad'
                                                placeholder='Nhập số điện thoại'
                                                placeholderTextColor={
                                                    colors.text3
                                                }
                                            />
                                        </View>
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
                                    style={[
                                        shared.sheetBtnPrimaryWrap,
                                        { backgroundColor: colors.primary },
                                    ]}
                                    onPress={saveSheet}
                                >
                                    <View style={shared.sheetBtnPrimary}>
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
                                                {'L\u01B0u'}
                                            </Text>
                                        </View>
                                    </View>
                                </Pressable>
                            </View>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}
