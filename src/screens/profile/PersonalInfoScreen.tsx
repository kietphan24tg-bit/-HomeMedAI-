import { Feather, Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
    type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    ActivityIndicator,
    Animated,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUpsertMyProfileMutation } from '@/src/features/me/mutations';
import {
    mapMeUserAndProfileToVM,
    type MeUserAndProfileVM,
} from '@/src/features/me/presenters';
import { useMeUserAndProfileQuery } from '@/src/features/me/queries';
import { appToast } from '../../lib/toast';
import { useAuthStore } from '../../stores/useAuthStore';
import {
    moderateScale,
    scale,
    scaleFont,
    verticalScale,
} from '../../styles/responsive';
import {
    buttonSystem,
    formSystem,
    inputSystem,
    shared,
} from '../../styles/shared';
import { colors, typography } from '../../styles/tokens';

const PAGE_BG = colors.bg;
const APP_TABS_ROUTE = '/(protected)/(app)/(tabs)' as const;

const GENDERS = [
    { key: 'male', label: 'Nam', icon: 'male-outline' as const },
    { key: 'female', label: 'Nữ', icon: 'female-outline' as const },
    { key: 'other', label: 'Khác', icon: 'male-female-outline' as const },
];

function formatDate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd} / ${mm} / ${d.getFullYear()}`;
}

function toApiDate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
}

function parseApiDob(dob: string | null): Date | null {
    if (!dob || typeof dob !== 'string') {
        return null;
    }

    const raw = dob.includes('T') ? dob.slice(0, 10) : dob;
    const parts = raw.split('-');
    if (parts.length !== 3) {
        return null;
    }

    const [year, month, day] = parts.map((value) => Number(value));
    if (!year || !month || !day) {
        return null;
    }

    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDobInput(text: string): string {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);

    let formatted = cleaned;
    if (cleaned.length > 2) {
        formatted = `${cleaned.slice(0, 2)} / ${cleaned.slice(2)}`;
    }
    if (cleaned.length > 4) {
        formatted = `${cleaned.slice(0, 2)} / ${cleaned.slice(2, 4)} / ${cleaned.slice(4)}`;
    }

    return formatted;
}

interface Props {
    embedded?: boolean;
    width?: number;
    onComplete?: () => void;
}

export default function PersonalInfoScreen({
    embedded = false,
    width,
    onComplete,
}: Props): React.JSX.Element {
    const syncMeOverview = useAuthStore((state) => state.syncMeOverview);
    const {
        data: meUserAndProfile,
        isLoading: isProfileLoading,
        isError: isProfileError,
    } = useMeUserAndProfileQuery();
    const upsertMutation = useUpsertMyProfileMutation();
    const profileVm: MeUserAndProfileVM = useMemo(
        () =>
            mapMeUserAndProfileToVM(
                meUserAndProfile ?? {
                    user: null,
                    profile: null,
                },
            ),
        [meUserAndProfile],
    );
    const hydratedProfileIdRef = useRef<string | null | undefined>(undefined);
    const [dob, setDob] = useState<Date | null>(null);
    const [dobText, setDobText] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [address, setAddress] = useState('');

    const anims = useRef(
        Array.from({ length: 7 }, () => new Animated.Value(1)),
    ).current;

    const anim = (i: number) => ({
        opacity: anims[i],
        transform: [
            {
                translateY: anims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, 0],
                }),
            },
        ],
    });

    const handleDobText = (text: string) => {
        const formatted = formatDobInput(text);
        const cleaned = formatted.replace(/\D/g, '');

        setDobText(formatted);

        if (cleaned.length === 8) {
            const parsedDate = new Date(
                Number(cleaned.slice(4, 8)),
                Number(cleaned.slice(2, 4)) - 1,
                Number(cleaned.slice(0, 2)),
            );

            if (!Number.isNaN(parsedDate.getTime())) {
                setDob(parsedDate);
            }
        }
    };

    const handlePicker = useCallback(
        (_e: DateTimePickerEvent, selected?: Date) => {
            if (Platform.OS === 'android') {
                setShowPicker(false);
            }

            if (selected) {
                setDob(selected);
                setDobText(formatDate(selected));
            }
        },
        [],
    );

    const closePicker = useCallback(() => setShowPicker(false), []);

    useEffect(() => {
        const profileId = profileVm.profile.id;
        if (hydratedProfileIdRef.current === profileId) {
            return;
        }

        hydratedProfileIdRef.current = profileId;
        const parsedDob = parseApiDob(profileVm.profile.dob);

        setFullName(profileVm.profile.full_name ?? '');
        setGender(profileVm.profile.gender ?? '');
        setHeight(
            profileVm.profile.height_cm !== null
                ? String(profileVm.profile.height_cm)
                : '',
        );
        setWeight(
            profileVm.profile.weight_kg !== null
                ? String(profileVm.profile.weight_kg)
                : '',
        );
        setAddress(profileVm.profile.address ?? '');
        setDob(parsedDob);
        setDobText(parsedDob ? formatDate(parsedDob) : '');
    }, [profileVm]);

    const buildDescription = (error: any) => {
        const detail = error?.response?.data?.detail;

        if (Array.isArray(detail)) {
            return detail
                .map((item) => item?.msg)
                .filter(Boolean)
                .join(', ');
        }

        return (
            error?.response?.data?.message ||
            'Không thể lưu hồ sơ ngay lúc này.'
        );
    };

    const handleComplete = async () => {
        const trimmedFullName = fullName.trim();
        const trimmedAddress = address.trim();
        const parsedHeight = height.trim() ? Number(height) : null;
        const parsedWeight = weight.trim() ? Number(weight) : null;

        if (!trimmedFullName) {
            appToast.showWarning(
                'Thiếu họ tên',
                'Vui lòng nhập họ và tên trước khi tiếp tục.',
            );
            return;
        }

        if (height.trim() && Number.isNaN(parsedHeight)) {
            appToast.showWarning(
                'Chiều cao chưa hợp lệ',
                'Vui lòng nhập chiều cao ở dạng số.',
            );
            return;
        }

        if (weight.trim() && Number.isNaN(parsedWeight)) {
            appToast.showWarning(
                'Cân nặng chưa hợp lệ',
                'Vui lòng nhập cân nặng ở dạng số.',
            );
            return;
        }

        try {
            await upsertMutation.mutateAsync({
                profileId: profileVm.profile.id,
                payload: {
                    full_name: trimmedFullName,
                    dob: dob ? toApiDate(dob) : null,
                    gender: gender || null,
                    height_cm: parsedHeight + '',
                    weight_kg: parsedWeight + '',
                    address: trimmedAddress || null,
                },
            });

            appToast.showSuccess(
                profileVm.profile.id
                    ? 'Cập nhật thành công'
                    : 'Tạo hồ sơ thành công',
                'Thông tin cá nhân của bạn đã được lưu.',
            );

            const overview = await syncMeOverview();
            console.log(overview);
            if (!overview?.post_login_flow_completed) {
                appToast.showWarning(
                    'Chưa hoàn tất',
                    'App chưa xác nhận hoàn tất thiết lập ban đầu. Vui lòng thử lại.',
                );
                return;
            }

            if (onComplete) {
                onComplete();
            } else {
                router.replace(APP_TABS_ROUTE);
            }
        } catch (error: any) {
            appToast.showError('Lưu hồ sơ thất bại', buildDescription(error));
        }
    };

    const Wrapper = embedded ? View : SafeAreaView;
    const containerStyle = embedded
        ? [styles.page, { width, backgroundColor: PAGE_BG }]
        : [styles.page, { backgroundColor: PAGE_BG }];

    return (
        <Wrapper style={containerStyle}>
            {!embedded && (
                <StatusBar barStyle='dark-content' backgroundColor={PAGE_BG} />
            )}

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
                keyboardDismissMode='none'
                removeClippedSubviews={false}
            >
                {isProfileLoading && (
                    <View style={styles.loadingInline}>
                        <ActivityIndicator color={colors.primary} />
                        <Text style={styles.loadingInlineText}>
                            Đang tải thông tin hồ sơ...
                        </Text>
                    </View>
                )}
                {isProfileError && (
                    <Text style={styles.loadErrorText}>
                        Không thể tải dữ liệu hồ sơ. Bạn vẫn có thể nhập và lưu
                        thủ công.
                    </Text>
                )}

                <Animated.View style={[styles.header, anim(0)]}>
                    <View style={styles.badge}>
                        <Ionicons
                            name='person-outline'
                            size={11}
                            color={colors.primary}
                        />
                        <Text style={styles.badgeText}>Thông tin cá nhân</Text>
                    </View>
                    <Text style={styles.title}>
                        {'Hãy cho HomeMedAI\n'}
                        <Text style={{ color: colors.primary }}>
                            biết về bạn
                        </Text>
                    </Text>
                    <Text style={styles.sub}>
                        Thông tin này giúp cá nhân hóa trải nghiệm và theo dõi
                        sức khỏe chính xác hơn.
                    </Text>
                </Animated.View>

                <Animated.View style={[styles.inputGroup, anim(1)]}>
                    <Text style={styles.label}>Họ và tên</Text>
                    <View style={styles.inputCard}>
                        <Ionicons
                            name='person-outline'
                            size={18}
                            color={colors.text3}
                            style={styles.leadingIcon}
                        />
                        <TextInput
                            style={[styles.inputText, { flex: 1 }]}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder='Nguyễn Văn An'
                            placeholderTextColor={colors.text3}
                            autoCapitalize='words'
                            returnKeyType='done'
                        />
                    </View>
                </Animated.View>

                <Animated.View style={[styles.inputGroup, anim(2)]}>
                    <Text style={styles.label}>Ngày sinh</Text>
                    <View style={styles.inputCard}>
                        <Pressable
                            onPress={() => setShowPicker(true)}
                            hitSlop={8}
                            style={styles.dateIconButton}
                        >
                            <Ionicons
                                name='calendar-outline'
                                size={18}
                                color={colors.text3}
                            />
                        </Pressable>
                        <TextInput
                            style={[styles.inputText, { flex: 1 }]}
                            value={dobText}
                            onChangeText={handleDobText}
                            placeholder='DD / MM / YYYY'
                            placeholderTextColor={colors.text3}
                            keyboardType='numeric'
                            maxLength={14}
                            returnKeyType='done'
                        />
                    </View>

                    {showPicker &&
                        (Platform.OS === 'ios' ? (
                            <View style={styles.iosWrap}>
                                <View style={styles.iosBar}>
                                    <Pressable onPress={closePicker}>
                                        <Text style={styles.iosDone}>Xong</Text>
                                    </Pressable>
                                </View>
                                <DateTimePicker
                                    value={dob ?? new Date()}
                                    mode='date'
                                    display='inline'
                                    onChange={handlePicker}
                                    themeVariant='light'
                                />
                            </View>
                        ) : (
                            <DateTimePicker
                                value={dob ?? new Date()}
                                mode='date'
                                display='default'
                                onChange={handlePicker}
                            />
                        ))}
                </Animated.View>

                <Animated.View style={[styles.inputGroup, anim(3)]}>
                    <Text style={styles.label}>Giới tính</Text>
                    <View style={styles.genderRow}>
                        {GENDERS.map(({ key, label, icon }) => {
                            const active = gender === key;

                            return (
                                <Pressable
                                    key={key}
                                    onPress={() => setGender(key)}
                                    style={({ pressed }) => [
                                        styles.genderBtn,
                                        active && styles.genderBtnActive,
                                        pressed && shared.pressed,
                                    ]}
                                >
                                    <Ionicons
                                        name={icon}
                                        size={18}
                                        color={
                                            active
                                                ? colors.primary
                                                : colors.text3
                                        }
                                        style={styles.genderIcon}
                                    />
                                    <Text
                                        style={[
                                            styles.genderLabel,
                                            active && styles.genderLabelActive,
                                        ]}
                                    >
                                        {label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </Animated.View>

                <Animated.View style={[styles.dualRow, anim(4)]}>
                    <View style={styles.dualCol}>
                        <Text style={styles.label}>Chiều cao</Text>
                        <View style={styles.inputCard}>
                            <TextInput
                                style={[styles.metricInput, { flex: 1 }]}
                                value={height}
                                onChangeText={setHeight}
                                placeholder='170'
                                placeholderTextColor={colors.text3}
                                keyboardType='numeric'
                                maxLength={3}
                                returnKeyType='done'
                            />
                            <Text style={styles.metricUnit}>cm</Text>
                        </View>
                    </View>

                    <View style={styles.dualCol}>
                        <Text style={styles.label}>Cân nặng</Text>
                        <View style={styles.inputCard}>
                            <TextInput
                                style={[styles.metricInput, { flex: 1 }]}
                                value={weight}
                                onChangeText={setWeight}
                                placeholder='65'
                                placeholderTextColor={colors.text3}
                                keyboardType='numeric'
                                maxLength={3}
                                returnKeyType='done'
                            />
                            <Text style={styles.metricUnit}>kg</Text>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View style={[styles.inputGroup, anim(5)]}>
                    <Text style={styles.label}>Địa chỉ</Text>
                    <View style={styles.inputCard}>
                        <Ionicons
                            name='location-outline'
                            size={18}
                            color={colors.text3}
                            style={styles.leadingIcon}
                        />
                        <TextInput
                            style={[styles.inputText, { flex: 1 }]}
                            value={address}
                            onChangeText={setAddress}
                            placeholder='Hồ Chí Minh'
                            placeholderTextColor={colors.text3}
                            returnKeyType='done'
                        />
                    </View>
                </Animated.View>

                <Animated.View style={[styles.btnWrap, anim(6)]}>
                    <Pressable
                        style={[
                            styles.btnSave,
                            upsertMutation.isPending && styles.btnSaveLoading,
                        ]}
                        onPress={handleComplete}
                        disabled={upsertMutation.isPending}
                    >
                        {upsertMutation.isPending ? (
                            <View style={styles.btnSaveContent}>
                                <ActivityIndicator size='small' color='#fff' />
                                <Text style={styles.btnSaveText}>
                                    {'\u0110ang l\u01B0u...'}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.btnSaveContent}>
                                <Feather
                                    name='arrow-right'
                                    size={18}
                                    color='#fff'
                                />
                                <Text style={styles.btnSaveText}>
                                    {'Ti\u1EBFp theo'}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                </Animated.View>
            </ScrollView>
        </Wrapper>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(12),
        paddingBottom: verticalScale(28),
        flexGrow: 1,
    },
    header: {
        paddingTop: verticalScale(4),
        paddingBottom: verticalScale(16),
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
        backgroundColor: 'rgba(37,99,235,0.10)',
        borderRadius: moderateScale(20),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(4),
        marginBottom: verticalScale(10),
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
        color: colors.primary,
    },
    title: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(24),
        color: colors.text,
        lineHeight: verticalScale(32),
        letterSpacing: -0.5,
        marginBottom: verticalScale(8),
    },
    sub: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(14),
        color: colors.text2,
        lineHeight: verticalScale(22),
    },
    inputGroup: {
        marginBottom: verticalScale(16),
    },
    loadingInline: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
        marginBottom: verticalScale(12),
    },
    loadingInlineText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text2,
    },
    loadErrorText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.danger,
        marginBottom: verticalScale(12),
    },
    label: {
        ...formSystem.fieldLabel,
        lineHeight: verticalScale(16),
        marginBottom: verticalScale(7),
    },
    inputCard: {
        ...inputSystem.fieldIcon,
        backgroundColor: colors.card,
        minHeight: verticalScale(45),
        borderRadius: moderateScale(12),
        borderWidth: 1.5,
        borderColor: colors.border,
        paddingHorizontal: scale(13),
    },
    leadingIcon: {
        marginRight: scale(10),
    },
    dateIconButton: {
        marginRight: scale(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputText: {
        ...inputSystem.text,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12.5),
        lineHeight: scaleFont(16),
        textAlignVertical: 'center',
    },
    iosWrap: {
        marginTop: verticalScale(10),
        borderRadius: moderateScale(11),
        backgroundColor: colors.card,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    iosBar: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(10),
        alignItems: 'flex-end',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    iosDone: {
        color: colors.primary,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
    },
    genderRow: {
        flexDirection: 'row',
        gap: scale(10),
    },
    genderBtn: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: moderateScale(11),
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: verticalScale(45),
        paddingVertical: verticalScale(4),
    },
    genderBtnActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryBg,
    },
    genderIcon: {
        marginBottom: verticalScale(3),
    },
    genderLabel: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(12.5),
        color: colors.text2,
    },
    genderLabelActive: {
        color: colors.text,
    },
    dualRow: {
        flexDirection: 'row',
        gap: scale(12),
        marginBottom: verticalScale(16),
    },
    dualCol: {
        flex: 1,
    },
    metricInput: {
        ...inputSystem.text,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12.5),
        lineHeight: scaleFont(16),
        textAlignVertical: 'center',
    },
    metricUnit: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
        color: colors.text2,
    },
    btnWrap: {
        marginTop: verticalScale(2),
    },
    btnSave: {
        width: '100%',
        ...buttonSystem.primary,
        backgroundColor: colors.primary,
        minHeight: verticalScale(45),
        borderRadius: moderateScale(11),
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 5,
    },
    btnSaveLoading: {
        backgroundColor: 'rgba(15, 110, 86, 0.72)',
        opacity: 0.88,
    },
    btnSaveContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
    },
    btnSaveText: {
        ...buttonSystem.textPrimary,
        fontSize: scaleFont(13.5),
    },
    btn: {
        borderRadius: moderateScale(20),
    },
    btnText: {
        letterSpacing: 0.2,
    },
});
