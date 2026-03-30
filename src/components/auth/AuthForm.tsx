import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Image,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Svg, { Path } from 'react-native-svg';
import { appToast } from '@/src/lib/toast';
import ForgotPasswordFlow from '@/src/screens/auth/ForgotPasswordFlow';
import { useAuthStore } from '@/src/stores/useAuthStore';
import {
    moderateScale,
    scale,
    scaleFont,
    verticalScale,
} from '@/src/styles/responsive';
import { shared } from '@/src/styles/shared';
import { colors, shadows, typography } from '@/src/styles/tokens';

interface Props {
    initialMode: 'signin' | 'signup';
    onSuccess?: () => void;
    showSubtext?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GOOGLE_LOGO_URI =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png';

export default function AuthForm({
    initialMode,
    onSuccess,
    showSubtext = true,
}: Props): React.JSX.Element {
    const { signIn, signUp, loading } = useAuthStore();
    const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
    const [view, setView] = useState<'auth' | 'forgot-password'>('auth');

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password strength
    const [pwStrength, setPwStrength] = useState(0);

    // Animation
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID || '',
            iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID || '',
        });
    }, []);

    const switchMode = (newMode: 'signin' | 'signup') => {
        if (newMode === mode) return;
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
        setTimeout(() => setMode(newMode), 120);
    };

    const checkStrength = (pw: string) => {
        setPassword(pw);
        let score = 0;
        if (pw.length >= 6) score++;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
        if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
        setPwStrength(score);
    };

    const getStrengthColor = (barIndex: number) => {
        if (barIndex >= pwStrength) return colors.border;
        if (pwStrength <= 1) return colors.cDanger;
        if (pwStrength === 2) return colors.cReminder;
        if (pwStrength === 3) return '#22C55E';
        return '#16A34A';
    };

    const handleAction = async () => {
        if (!EMAIL_REGEX.test(email.trim())) {
            appToast.showError('Lỗi', 'Email không đúng định dạng.');
            return;
        }
        if (password.length < 6) {
            appToast.showError('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        if (mode === 'signup' && password !== confirmPassword) {
            appToast.showError('Lỗi', 'Mật khẩu nhập lại không khớp.');
            return;
        }

        try {
            const device_id = await DeviceInfo.getUniqueId();
            const device_name = await DeviceInfo.getDeviceName();
            const platform = Platform.OS;

            let success = false;
            if (mode === 'signin') {
                success = await signIn({
                    email,
                    password,
                    device_id,
                    device_name,
                    platform,
                });
            } else {
                success = await signUp({ email, password });
            }

            if (success) {
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.replace('/(tabs)');
                }
            }
        } catch (error: any) {
            appToast.showError('Lỗi', error.message || 'Có lỗi xảy ra');
        }
    };

    if (view === 'forgot-password') {
        return (
            <ForgotPasswordFlow
                initialEmail={email}
                onBackToAuth={() => setView('auth')}
            />
        );
    }

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
        >
            {/* ── HEADER: Logo + Title ── */}
            <View style={s.headerSection}>
                {/* Decorative circles */}
                <View style={s.deco1} />
                <View style={s.deco2} />

                <LinearGradient
                    colors={['#2563EB', '#14B8A6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s.logoBox}
                >
                    <Svg width={28} height={28} viewBox='0 0 24 24' fill='none'>
                        <Path
                            d='M22 12h-4l-3 9L9 3l-3 9H2'
                            stroke='#fff'
                            strokeWidth={1.5}
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            fill='none'
                        />
                    </Svg>
                </LinearGradient>
                <Text style={s.appName}>HOMEMEDAI</Text>
                <Text style={s.headerTitle}>
                    Bắt đầu hành trình{'\n'}
                    <Text style={{ color: colors.primary }}>chăm sóc</Text> sức
                    khoẻ
                </Text>
                <Text style={s.headerSub}>
                    Tạo tài khoản hoặc đăng nhập để tiếp tục
                </Text>
            </View>

            {/* ── TABS: Đăng nhập / Đăng ký ── */}
            <View style={s.tabsContainer}>
                <Pressable
                    style={[s.tab, mode === 'signin' && s.tabActive]}
                    onPress={() => switchMode('signin')}
                >
                    <Text
                        style={[
                            s.tabText,
                            mode === 'signin' && s.tabTextActive,
                        ]}
                    >
                        Đăng nhập
                    </Text>
                </Pressable>
                <Pressable
                    style={[s.tab, mode === 'signup' && s.tabActive]}
                    onPress={() => switchMode('signup')}
                >
                    <Text
                        style={[
                            s.tabText,
                            mode === 'signup' && s.tabTextActive,
                        ]}
                    >
                        Đăng ký
                    </Text>
                </Pressable>
            </View>

            {/* ── FORM ── */}
            <Animated.View style={{ opacity: fadeAnim }}>
                {mode === 'signin' ? (
                    /* ──── ĐĂNG NHẬP ──── */
                    <View>
                        {/* Email */}
                        <View style={s.inputGroup}>
                            <Text style={s.inputLabel}>EMAIL</Text>
                            <View style={s.inputWrap}>
                                <View style={s.inputIcon}>
                                    <Ionicons
                                        name='mail-outline'
                                        size={16}
                                        color={colors.text3}
                                    />
                                </View>
                                <TextInput
                                    style={s.textInput}
                                    placeholder='example@email.com'
                                    placeholderTextColor={colors.text3}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType='email-address'
                                    autoCapitalize='none'
                                    editable={!loading}
                                />
                            </View>
                        </View>

                        {/* Mật khẩu */}
                        <View style={s.inputGroup}>
                            <Text style={s.inputLabel}>MẬT KHẨU</Text>
                            <View style={s.inputWrap}>
                                <View style={s.inputIcon}>
                                    <Ionicons
                                        name='lock-closed-outline'
                                        size={16}
                                        color={colors.text3}
                                    />
                                </View>
                                <TextInput
                                    style={s.textInput}
                                    placeholder='Nhập mật khẩu'
                                    placeholderTextColor={colors.text3}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    editable={!loading}
                                />
                                <Pressable
                                    onPress={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    hitSlop={8}
                                >
                                    <Ionicons
                                        name={
                                            showPassword
                                                ? 'eye-off-outline'
                                                : 'eye-outline'
                                        }
                                        size={18}
                                        color={colors.text3}
                                    />
                                </Pressable>
                            </View>
                        </View>

                        {/* Quên mật khẩu */}
                        <Pressable
                            style={s.forgotBtn}
                            onPress={() => setView('forgot-password')}
                        >
                            <Text style={s.forgotText}>Quên mật khẩu?</Text>
                        </Pressable>

                        {/* Nút Đăng nhập */}
                        <Pressable
                            style={({ pressed }) => [pressed && shared.pressed]}
                            onPress={handleAction}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={
                                    loading
                                        ? [
                                              'rgba(37,99,235,0.7)',
                                              'rgba(29,78,216,0.7)',
                                          ]
                                        : ['#2563EB', '#1D4ED8']
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={s.btnPrimary}
                            >
                                {loading ? (
                                    <ActivityIndicator
                                        size='small'
                                        color='#fff'
                                        style={{ marginRight: 8 }}
                                    />
                                ) : null}
                                <Text style={s.btnPrimaryText}>
                                    {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                                </Text>
                            </LinearGradient>
                        </Pressable>

                        {/* OR Divider */}
                        <View style={s.orRow}>
                            <View style={s.orLine} />
                            <Text style={s.orText}>hoặc tiếp tục với</Text>
                            <View style={s.orLine} />
                        </View>

                        {/* Google */}
                        <Pressable
                            style={({ pressed }) => [
                                s.btnGoogle,
                                pressed && {
                                    opacity: 0.85,
                                    transform: [{ translateY: -1 }],
                                },
                            ]}
                            onPress={() =>
                                appToast.showInfo(
                                    'Thông tin',
                                    'Tính năng đang phát triển',
                                )
                            }
                        >
                            <Image
                                source={{ uri: GOOGLE_LOGO_URI }}
                                style={{ width: 18, height: 18 }}
                            />
                            <Text style={s.btnSocialLabel}>
                                Tiếp tục với Google
                            </Text>
                        </Pressable>

                        {/* Trust */}
                        <View style={s.trustRow}>
                            <View style={s.trustItem}>
                                <Ionicons
                                    name='lock-closed-outline'
                                    size={12}
                                    color={colors.text3}
                                />
                                <Text style={s.trustText}>SSL bảo mật</Text>
                            </View>
                            <View style={s.trustItem}>
                                <Ionicons
                                    name='shield-checkmark-outline'
                                    size={12}
                                    color={colors.text3}
                                />
                                <Text style={s.trustText}>
                                    Không chia sẻ dữ liệu
                                </Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    /* ──── ĐĂNG KÝ ──── */
                    <View>
                        {/* Email */}
                        <View style={s.inputGroup}>
                            <Text style={s.inputLabel}>EMAIL</Text>
                            <View style={s.inputWrap}>
                                <View style={s.inputIcon}>
                                    <Ionicons
                                        name='mail-outline'
                                        size={16}
                                        color={colors.text3}
                                    />
                                </View>
                                <TextInput
                                    style={s.textInput}
                                    placeholder='example@email.com'
                                    placeholderTextColor={colors.text3}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType='email-address'
                                    autoCapitalize='none'
                                    editable={!loading}
                                />
                            </View>
                        </View>

                        {/* Mật khẩu */}
                        <View style={s.inputGroup}>
                            <Text style={s.inputLabel}>MẬT KHẨU</Text>
                            <View style={s.inputWrap}>
                                <View style={s.inputIcon}>
                                    <Ionicons
                                        name='lock-closed-outline'
                                        size={16}
                                        color={colors.text3}
                                    />
                                </View>
                                <TextInput
                                    style={s.textInput}
                                    placeholder='Ít nhất 6 ký tự'
                                    placeholderTextColor={colors.text3}
                                    value={password}
                                    onChangeText={checkStrength}
                                    secureTextEntry={!showPassword}
                                    editable={!loading}
                                />
                                <Pressable
                                    onPress={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    hitSlop={8}
                                >
                                    <Ionicons
                                        name={
                                            showPassword
                                                ? 'eye-off-outline'
                                                : 'eye-outline'
                                        }
                                        size={18}
                                        color={colors.text3}
                                    />
                                </Pressable>
                            </View>
                            {/* Password strength bars */}
                            <View style={s.pwStrengthRow}>
                                {[0, 1, 2, 3].map((i) => (
                                    <View
                                        key={i}
                                        style={[
                                            s.pwBar,
                                            {
                                                backgroundColor:
                                                    getStrengthColor(i),
                                            },
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>

                        {/* Nhập lại mật khẩu */}
                        <View style={s.inputGroup}>
                            <Text style={s.inputLabel}>NHẬP LẠI MẬT KHẨU</Text>
                            <View style={s.inputWrap}>
                                <View style={s.inputIcon}>
                                    <Ionicons
                                        name='lock-closed-outline'
                                        size={16}
                                        color={colors.text3}
                                    />
                                </View>
                                <TextInput
                                    style={s.textInput}
                                    placeholder='Nhập lại mật khẩu'
                                    placeholderTextColor={colors.text3}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    editable={!loading}
                                />
                                <Pressable
                                    onPress={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )
                                    }
                                    hitSlop={8}
                                >
                                    <Ionicons
                                        name={
                                            showConfirmPassword
                                                ? 'eye-off-outline'
                                                : 'eye-outline'
                                        }
                                        size={18}
                                        color={colors.text3}
                                    />
                                </Pressable>
                            </View>
                        </View>

                        {/* Nút Tạo tài khoản */}
                        <Pressable
                            style={({ pressed }) => [pressed && shared.pressed]}
                            onPress={handleAction}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={
                                    loading
                                        ? [
                                              'rgba(37,99,235,0.7)',
                                              'rgba(29,78,216,0.7)',
                                          ]
                                        : ['#2563EB', '#1D4ED8']
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[s.btnPrimary, { marginTop: 4 }]}
                            >
                                {loading ? (
                                    <ActivityIndicator
                                        size='small'
                                        color='#fff'
                                        style={{ marginRight: 8 }}
                                    />
                                ) : null}
                                <Text style={s.btnPrimaryText}>
                                    {loading
                                        ? 'Đang xử lý...'
                                        : 'Tạo tài khoản'}
                                </Text>
                            </LinearGradient>
                        </Pressable>

                        {/* Terms */}
                        <Text style={s.termsText}>
                            Bằng cách đăng ký, bạn đồng ý với{'\n'}
                            <Text
                                style={s.termsLink}
                                onPress={() => router.push('/')}
                            >
                                Điều khoản dịch vụ
                            </Text>{' '}
                            và{' '}
                            <Text
                                style={s.termsLink}
                                onPress={() => router.push('/')}
                            >
                                Chính sách bảo mật
                            </Text>
                        </Text>

                        {/* Trust */}
                        <View style={s.trustRow}>
                            <View style={s.trustItem}>
                                <Ionicons
                                    name='lock-closed-outline'
                                    size={12}
                                    color={colors.text3}
                                />
                                <Text style={s.trustText}>SSL bảo mật</Text>
                            </View>
                            <View style={s.trustItem}>
                                <Ionicons
                                    name='shield-checkmark-outline'
                                    size={12}
                                    color={colors.text3}
                                />
                                <Text style={s.trustText}>
                                    Không chia sẻ dữ liệu
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </Animated.View>
        </ScrollView>
    );
}

/* ══════════════════════════════════════
   STYLES — matching CareSync S4 - Auth
   ══════════════════════════════════════ */
const s = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: scale(24),
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(40),
        flexGrow: 1,
    },

    /* ── Header ── */
    headerSection: {
        alignItems: 'center',
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(20),
        position: 'relative',
        overflow: 'hidden',
    },
    deco1: {
        position: 'absolute',
        width: moderateScale(160),
        height: moderateScale(160),
        borderRadius: moderateScale(80),
        backgroundColor: 'rgba(37,99,235,0.06)',
        top: verticalScale(-50),
        right: scale(-50),
    },
    deco2: {
        position: 'absolute',
        width: moderateScale(100),
        height: moderateScale(100),
        borderRadius: moderateScale(50),
        backgroundColor: 'rgba(20,184,166,0.07)',
        bottom: verticalScale(-10),
        left: scale(-30),
    },
    logoBox: {
        width: moderateScale(60),
        height: moderateScale(60),
        borderRadius: moderateScale(18),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(12),
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 24,
        elevation: 8,
    },
    appName: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: colors.primary,
        marginBottom: verticalScale(6),
    },
    headerTitle: {
        textAlign: 'center',
        fontFamily: typography.font.black,
        fontSize: scaleFont(22),
        color: colors.text,
        lineHeight: verticalScale(28),
        letterSpacing: -0.2,
    },
    headerSub: {
        textAlign: 'center',
        marginTop: verticalScale(5),
        fontFamily: typography.font.regular,
        fontSize: scaleFont(13),
        color: colors.text2,
        lineHeight: verticalScale(20),
    },

    /* ── Tabs ── */
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.bg,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: moderateScale(12),
        padding: scale(3),
        marginBottom: verticalScale(18),
    },
    tab: {
        flex: 1,
        borderRadius: moderateScale(9),
        alignItems: 'center',
        paddingVertical: verticalScale(9),
    },
    tabActive: {
        backgroundColor: colors.card,
        ...shadows.card,
    },
    tabText: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(13),
        color: colors.text2,
    },
    tabTextActive: {
        color: colors.primary,
    },

    /* ── Inputs ── */
    inputGroup: {
        marginBottom: verticalScale(12),
    },
    inputLabel: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
        color: colors.text2,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        marginBottom: verticalScale(5),
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
        backgroundColor: colors.bg,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: moderateScale(12),
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(12),
    },
    inputIcon: {
        flexShrink: 0,
    },
    textInput: {
        flex: 1,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(14),
        color: colors.text,
        padding: 0,
    },

    /* ── Forgot ── */
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: verticalScale(16),
    },
    forgotText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.primary,
    },

    /* ── Primary Button ── */
    btnPrimary: {
        width: '100%',
        paddingVertical: verticalScale(16),
        borderRadius: moderateScale(14),
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 5,
    },
    btnPrimaryText: {
        color: '#fff',
        fontFamily: typography.font.bold,
        fontSize: scaleFont(15),
        letterSpacing: 0.1,
    },

    /* ── OR Divider ── */
    orRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
        marginVertical: verticalScale(14),
    },
    orLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    orText: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(12),
        color: colors.text3,
    },

    /* ── Social Buttons ── */
    btnGoogle: {
        width: '100%',
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(16),
        borderRadius: moderateScale(12),
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.card,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(10),
        marginBottom: verticalScale(8),
    },
    btnSocialLabel: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(14),
        color: colors.text,
    },

    /* ── Trust Row ── */
    trustRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(16),
        marginTop: verticalScale(14),
    },
    trustItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
    },
    trustText: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(11),
        color: colors.text3,
    },

    /* ── Terms ── */
    termsText: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(11),
        color: colors.text3,
        textAlign: 'center',
        marginTop: verticalScale(14),
        lineHeight: verticalScale(18),
    },
    termsLink: {
        fontFamily: typography.font.medium,
        color: colors.primary,
    },

    /* ── Password Strength ── */
    pwStrengthRow: {
        flexDirection: 'row',
        gap: scale(4),
        marginTop: verticalScale(6),
    },
    pwBar: {
        flex: 1,
        height: 3,
        borderRadius: 3,
    },
});
