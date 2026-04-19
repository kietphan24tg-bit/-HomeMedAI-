// src/screens/profile/ProfileScreen.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
import { meQueryKeys } from '@/src/features/me/queryKeys';
import { appQueryClient } from '@/src/lib/query-client';
import { styles } from './styles';
import FieldRow from '../../components/profile/FieldRow';
import { DateField } from '../../components/ui';
import { appToast } from '../../lib/toast';
import {
    userService,
    type PatchMyProfilePayload,
} from '../../services/user.services';
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

const GENDER_LABEL_TO_API: Record<string, string> = {
    Nam: 'male',
    Nữ: 'female',
    Khác: 'other',
};

function genderApiToLabel(g: string | null | undefined): string {
    if (!g) return '';
    const v = String(g).toLowerCase();
    if (v === 'male') return 'Nam';
    if (v === 'female') return 'Nữ';
    if (v === 'other') return 'Khác';
    return g;
}

function genderLabelToApi(label: string): string | null {
    const t = label.trim();
    if (!t) return null;
    if (GENDER_LABEL_TO_API[t]) return GENDER_LABEL_TO_API[t];
    const lower = t.toLowerCase();
    if (lower === 'male' || lower === 'female' || lower === 'other') {
        return lower;
    }
    return t;
}

const BLOOD_API_TO_DISPLAY: Record<string, string> = {
    A_POS: 'A+',
    A_NEG: 'A-',
    B_POS: 'B+',
    B_NEG: 'B-',
    O_POS: 'O+',
    O_NEG: 'O-',
    AB_POS: 'AB+',
    AB_NEG: 'AB-',
};

function bloodApiToDisplay(api: string | null | undefined): string {
    if (!api) return '';
    return BLOOD_API_TO_DISPLAY[api] ?? api;
}

function bloodDisplayToApi(display: string): string | null {
    const t = display.trim();
    if (!t) return null;
    const norm = t.toUpperCase().replace(/\s/g, '');
    const toApi: Record<string, string> = {
        'A+': 'A_POS',
        'A-': 'A_NEG',
        'B+': 'B_POS',
        'B-': 'B_NEG',
        'O+': 'O_POS',
        'O-': 'O_NEG',
        'AB+': 'AB_POS',
        'AB-': 'AB_NEG',
    };
    if (toApi[norm]) return toApi[norm];
    if (/^(A|B|O|AB)_(POS|NEG)$/.test(norm)) return norm;
    return null;
}
function calcBMI(h: string, w: string): string {
    const hNum = parseFloat(h);
    const wNum = parseFloat(w);
    if (!hNum || !wNum) return '';
    const bmi = wNum / (hNum / 100) ** 2;
    return `BMI ${bmi.toFixed(1)}`;
}

function parseDateSafe(value: unknown): Date | null {
    if (typeof value !== 'string' || !value.trim()) {
        return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** `dd/mm/yyyy` (sheet draft) → `yyyy-mm-dd` for API */
function draftDobToApiDate(draft: string): string | null {
    const parts = draft.split('/').map((p) => p.trim());
    if (parts.length !== 3) return null;
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);
    if (!d || !m || !y) return null;
    const date = new Date(y, m - 1, d);
    if (Number.isNaN(date.getTime())) return null;
    const mm = String(m).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
}

function normalizeMetricString(raw: string): string | null {
    const cleaned = raw.replace(',', '.').replace(/[^\d.]/g, '');
    if (!cleaned) return null;
    const n = parseFloat(cleaned);
    if (Number.isNaN(n)) return null;
    return String(n);
}

function buildErrorDescription(error: unknown): string {
    const err = error as {
        response?: { data?: { detail?: unknown; message?: string } };
    };
    const detail = err?.response?.data?.detail;

    if (Array.isArray(detail)) {
        return detail
            .map((item: { msg?: string }) => item?.msg)
            .filter(Boolean)
            .join(', ');
    }

    return (
        err?.response?.data?.message ||
        'Không thể lưu ngay lúc này. Vui lòng thử lại.'
    );
}

export default function ProfileScreen(): React.JSX.Element {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const {
        data: meOverview,
        isLoading,
        error: queryError,
    } = useMeOverviewQuery();
    const patchProfileMutation = usePatchMyProfileMutation();
    const patchHealthMutation = usePatchMyHealthProfileMutation();
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [userName, setUserName] = useState('');
    const [userAge, setUserAge] = useState('20');
    const [contacts, setContacts] = useState({
        email: '',
        phone: '',
    });
    const [contactDraft, setContactDraft] = useState(contacts);

    const [fields, setFields] = useState({
        dob: '',
        gender: '',
        height: '',
        weight: '',
        address: '',
        blood: '',
    });

    const [sheet, setSheet] = useState<SheetState | null>(null);
    const [draft, setDraft] = useState('');
    const [profileId, setProfileId] = useState<string | null>(null);
    const [serverUserEmail, setServerUserEmail] = useState('');
    const [saving, setSaving] = useState(false);

    // Sync profile screen state from the shared feature/me query cache.
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const data = await userService.getMe();

                if (data.profile && data.user) {
                    setProfileId(data.profile.id ?? null);
                    setServerUserEmail(data.user.email || '');
                    // Set profile name and contact info
                    setUserName(data.profile.full_name || '');
                    setContacts({
                        email: data.user.email || '',
                        phone: data.user.phone_number || '',
                    });
                    setContactDraft({
                        email: data.user.email || '',
                        phone: data.user.phone_number || '',
                    });

                    // Set profile fields
                    const dobDate = parseDateSafe(data.profile.dob);
                    const dob = dobDate
                        ? dobDate.toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                          })
                        : '';

                    const age = dobDate
                        ? Math.floor(
                              (new Date().getTime() - dobDate.getTime()) /
                                  (365.25 * 24 * 60 * 60 * 1000),
                          )
                        : '';

                    setUserAge(String(age));

                    setFields({
                        dob: dob,
                        gender: genderApiToLabel(data.profile.gender),
                        height: data.profile.height_cm || '',
                        weight: data.profile.weight_kg || '',
                        address: data.profile.address || '',
                        blood: bloodApiToDisplay(
                            data.health_profile?.blood_type,
                        ),
                    });

                    // Set avatar if available
                    if (data.profile.avatar_url) {
                        setAvatarUri(data.profile.avatar_url);
                    }
                }
                setError(null);
            } catch (err) {
                console.error('Failed to fetch user data:', err);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);
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

    const saveSheet = async () => {
        if (!sheet || saving) return;

        if (sheet.type === 'contacts') {
            try {
                setSaving(true);
                await userService.patchMyUser({
                    phone_number: contactDraft.phone.trim() || null,
                });
                setContacts({ ...contactDraft });
                setSheet(null);
                appToast.showSuccess(
                    'Đã lưu',
                    'Số điện thoại đã được cập nhật.',
                );
                if (contactDraft.email.trim() !== serverUserEmail.trim()) {
                    appToast.showWarning(
                        'Email',
                        'Ứng dụng hiện chỉ lưu số điện thoại lên máy chủ. Đổi email cần cập nhật tài khoản qua kênh hỗ trợ.',
                    );
                }
                await appQueryClient.invalidateQueries({
                    queryKey: meQueryKeys.overview(),
                });
            } catch (error) {
                appToast.showError(
                    'Lưu thất bại',
                    buildErrorDescription(error),
                );
            } finally {
                setSaving(false);
            }
            return;
        }

        if (!profileId) {
            appToast.showError(
                'Không lưu được',
                'Không tìm thấy hồ sơ cá nhân. Vui lòng đăng xuất và đăng nhập lại.',
            );
            return;
        }

        const key = sheet.key;

        try {
            setSaving(true);

            if (key === 'blood') {
                const apiBlood = bloodDisplayToApi(draft);
                if (!apiBlood) {
                    appToast.showError(
                        'Nhóm máu không hợp lệ',
                        'Chọn dạng như A+, B-, O+, AB+.',
                    );
                    return;
                }
                await userService.patchMyHealthProfile(profileId, {
                    blood_type: apiBlood,
                });
            } else {
                const payload: PatchMyProfilePayload = {};

                if (key === 'dob') {
                    const apiDob = draftDobToApiDate(draft);
                    if (!apiDob) {
                        appToast.showError(
                            'Ngày sinh không hợp lệ',
                            'Vui lòng nhập đúng định dạng dd/mm/yyyy.',
                        );
                        return;
                    }
                    payload.dob = apiDob;
                } else if (key === 'gender') {
                    payload.gender = genderLabelToApi(draft);
                } else if (key === 'height') {
                    const h = normalizeMetricString(draft);
                    if (!h) {
                        appToast.showError(
                            'Chiều cao không hợp lệ',
                            'Vui lòng nhập số hợp lệ.',
                        );
                        return;
                    }
                    payload.height_cm = h;
                } else if (key === 'weight') {
                    const w = normalizeMetricString(draft);
                    if (!w) {
                        appToast.showError(
                            'Cân nặng không hợp lệ',
                            'Vui lòng nhập số hợp lệ.',
                        );
                        return;
                    }
                    payload.weight_kg = w;
                } else if (key === 'address') {
                    payload.address = draft.trim() || null;
                } else {
                    setSheet(null);
                    return;
                }

                await userService.patchMyProfile(profileId, payload);
            }

            const newFields = { ...fields, [key]: draft };
            setFields(newFields);

            if (key === 'dob') {
                const apiDob = draftDobToApiDate(draft);
                const dobDate = apiDob ? parseDateSafe(apiDob) : null;
                const age = dobDate
                    ? Math.floor(
                          (new Date().getTime() - dobDate.getTime()) /
                              (365.25 * 24 * 60 * 60 * 1000),
                      )
                    : '';
                setUserAge(String(age));
            }

            setSheet(null);
            appToast.showSuccess('Đã lưu', 'Thông tin hồ sơ đã được cập nhật.');
            await appQueryClient.invalidateQueries({
                queryKey: meQueryKeys.overview(),
            });
        } catch (error) {
            appToast.showError('Lưu thất bại', buildErrorDescription(error));
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async (): Promise<void> => {
        await useAuthStore.getState().signOut();
    };

    const bmi = calcBMI(fields.height, fields.weight);

    if (isLoading) {
        return (
            <SafeAreaView
                style={{ flex: 1, backgroundColor: colors.bgProfile }}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <ActivityIndicator size='large' color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    const displayError = error ?? queryError?.message ?? null;

    if (displayError) {
        return (
            <SafeAreaView
                style={{ flex: 1, backgroundColor: colors.bgProfile }}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                    }}
                >
                    <Text style={{ color: colors.danger, textAlign: 'center' }}>
                        {displayError}
                    </Text>
                    <Pressable
                        style={{ marginTop: 16 }}
                        onPress={() => router.back()}
                    >
                        <Text style={{ color: colors.primary }}>Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

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
                                            {userName
                                                .split(' ')
                                                .slice(-2)
                                                .map((n) =>
                                                    n.charAt(0).toUpperCase(),
                                                )
                                                .join('')
                                                .slice(0, 2) || 'U'}
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
                                <Text style={styles.hmName}>{userName}</Text>
                                <Text style={styles.hmSub}>
                                    {userAge} tuổi · {fields.gender} · TP. Hồ
                                    Chí Minh
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
                            label='Nhóm máu'
                            value={fields.blood}
                            iconName='water'
                            iconColor={colors.danger}
                            iconBg={colors.dangerBg}
                            onPress={() =>
                                openSimple('blood', 'Nhóm máu', 'water')
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
                                        {
                                            backgroundColor: colors.primary,
                                            opacity: saving ? 0.55 : 1,
                                        },
                                    ]}
                                    disabled={saving}
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
