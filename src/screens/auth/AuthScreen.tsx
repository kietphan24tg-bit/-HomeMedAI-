import {
    GoogleSignin,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { getDeviceMetadata } from '@/src/lib/device';
import { configureGoogleSignIn } from '@/src/lib/googleSignIn';
import { appToast } from '@/src/lib/toast';
import ForgotPasswordFlow from '@/src/screens/auth/ForgotPasswordFlow';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { colors, gradients } from '@/src/styles/tokens';
import { sanitizeVietnamPhoneInput, toVietnamE164 } from '@/src/utils/phone';
import { authStyles as s } from './authStyles';
import RegisterForm from './RegisterForm';
import SignInForm from './SignInForm';

const APP_TABS_ROUTE = '/(protected)/(app)/(tabs)' as const;

interface Props {
    initialMode: 'signin' | 'signup';
    onSuccess?: () => void;
    showSubtext?: boolean;
    embedded?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hasGoogleWebClientId() {
    return Boolean(process.env.EXPO_PUBLIC_WEB_CLIENT_ID?.trim());
}

function getGoogleSignInErrorMessage(error: unknown): string {
    const code =
        typeof (error as { code?: unknown } | null)?.code === 'string'
            ? (error as { code: string }).code
            : null;
    const message =
        typeof (error as { message?: unknown } | null)?.message === 'string'
            ? (error as { message: string }).message
            : '';

    if (code === statusCodes.IN_PROGRESS) {
        return 'Đăng nhập Google đang được xử lý. Vui lòng đợi một chút.';
    }

    if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return 'Thiết bị chưa sẵn sàng Google Play Services. Vui lòng cập nhật và thử lại.';
    }

    if (code === '10' || message.includes('DEVELOPER_ERROR')) {
        return 'Google Sign-In Android chưa cấu hình đúng SHA-1/SHA-256 hoặc OAuth client.';
    }

    if (message.includes('idToken') || message.includes('webClientId')) {
        return 'Google Sign-In chưa trả về ID token. Kiểm tra Web Client ID và cấu hình OAuth Android.';
    }

    return 'Đăng nhập Google thất bại. Vui lòng thử lại.';
}

export default function AuthScreen({
    initialMode,
    onSuccess,
    showSubtext = false,
    embedded = false,
}: Props): React.JSX.Element {
    const { signIn, signUp, signInWithGoogle, loading } = useAuthStore();
    const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
    const [view, setView] = useState<'auth' | 'forgot-password'>('auth');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [errors, setErrors] = useState<{
        email?: string;
        phoneNumber?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    // Khởi tạo Google Sign-In một lần khi màn hình mount
    useEffect(() => {
        configureGoogleSignIn();
        if (!hasGoogleWebClientId()) {
            console.warn(
                '[google-signin] Missing EXPO_PUBLIC_WEB_CLIENT_ID. Android sign-in may not return an idToken.',
            );
        }
    }, []);

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            if (!hasGoogleWebClientId()) {
                throw new Error(
                    'Google Sign-In chưa được cấu hình. Thiếu EXPO_PUBLIC_WEB_CLIENT_ID.',
                );
            }

            await GoogleSignin.hasPlayServices({
                showPlayServicesUpdateDialog: true,
            });
            const response = await GoogleSignin.signIn();

            if (response.type !== 'success') {
                return;
            }

            const idToken = response.data.idToken;

            if (!idToken) {
                throw new Error(
                    'Google Sign-In không trả về ID token. Kiểm tra Web Client ID và OAuth Android.',
                );
            }

            const { device_id, device_name, platform } =
                await getDeviceMetadata();
            const success = await signInWithGoogle({
                google_token: idToken,
                device_id,
                device_name,
                platform,
            });

            if (success) {
                clearForm();
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.replace(
                        useAuthStore.getState().postLoginCompleted
                            ? APP_TABS_ROUTE
                            : '/post-login',
                    );
                }
            }
        } catch (error: any) {
            // Người dùng tự huỷ → không báo lỗi
            if (
                error?.code === statusCodes.SIGN_IN_CANCELLED ||
                error?.code === '-5'
            ) {
                return;
            }
            console.error('[Google Sign-In]', error);
            const googleErrorMessage = getGoogleSignInErrorMessage(error);
            if (
                googleErrorMessage !==
                'Đăng nhập Google thất bại. Vui lòng thử lại.'
            ) {
                appToast.showError('Lỗi', googleErrorMessage);
                return;
            }
            appToast.showError(
                'Lỗi',
                'Đăng nhập Google thất bại. Vui lòng thử lại.',
            );
        } finally {
            setGoogleLoading(false);
        }
    };

    const clearForm = () => {
        setEmail('');
        setPhoneNumber('');
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setShowConfirmPassword(false);
        setErrors({});
    };

    const switchMode = (newMode: 'signin' | 'signup') => {
        if (newMode === mode) return;
        clearForm();
        setMode(newMode);
    };

    const handleAction = async () => {
        const newErrors: {
            email?: string;
            phoneNumber?: string;
            password?: string;
            confirmPassword?: string;
        } = {};

        const normalizedEmail = email.trim();
        const normalizedPassword = password.trim();

        if (!normalizedEmail) {
            newErrors.email = 'Vui lòng nhập email.';
        } else if (!EMAIL_REGEX.test(normalizedEmail)) {
            newErrors.email = 'Email không đúng định dạng.';
        }

        if (!normalizedPassword) {
            newErrors.password = 'Vui lòng nhập mật khẩu.';
        } else if (normalizedPassword.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
        }

        const normalizedPhoneNumber =
            mode === 'signup' ? toVietnamE164(phoneNumber) : null;

        if (mode === 'signup') {
            if (!phoneNumber.trim()) {
                newErrors.phoneNumber = 'Vui lòng nhập số điện thoại.';
            } else if (!normalizedPhoneNumber) {
                newErrors.phoneNumber =
                    'Số điện thoại phải đúng định dạng Việt Nam.';
            }

            if (!confirmPassword) {
                newErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu.';
            } else if (normalizedPassword !== confirmPassword.trim()) {
                newErrors.confirmPassword = 'Mật khẩu nhập lại không khớp.';
            }
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        try {
            const { device_id, device_name, platform } =
                await getDeviceMetadata();

            let success = false;

            if (mode === 'signin') {
                success = await signIn({
                    email: normalizedEmail,
                    password: normalizedPassword,
                    device_id,
                    device_name,
                    platform,
                });
            } else {
                success = await signUp({
                    email: normalizedEmail,
                    password: normalizedPassword,
                    phone_number: normalizedPhoneNumber ?? undefined,
                });
            }

            if (!success) {
                return;
            }

            if (mode === 'signin') {
                clearForm();
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.replace(
                        useAuthStore.getState().postLoginCompleted
                            ? APP_TABS_ROUTE
                            : '/post-login',
                    );
                }
                return;
            }

            appToast.showSuccess(
                'Thành công',
                'Đăng ký tài khoản thành công. Vui lòng đăng nhập để tiếp tục.',
            );
            clearForm();
            setMode('signin');
        } catch {
        } finally {
            clearForm();
        }
    };

    if (view === 'forgot-password') {
        const forgotContent = (
            <ForgotPasswordFlow
                initialEmail={email}
                onBackToAuth={() => setView('auth')}
                embedded={embedded}
            />
        );

        if (embedded) {
            return <View style={{ flex: 1 }}>{forgotContent}</View>;
        }

        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
                <StatusBar
                    barStyle='dark-content'
                    backgroundColor={colors.bg}
                />
                {forgotContent}
            </SafeAreaView>
        );
    }

    const Wrapper = embedded ? View : SafeAreaView;

    return (
        <Wrapper style={{ flex: 1, backgroundColor: colors.bg }}>
            {!embedded && (
                <StatusBar
                    barStyle='dark-content'
                    backgroundColor={colors.bg}
                />
            )}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={s.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                    keyboardDismissMode='interactive'
                    automaticallyAdjustKeyboardInsets
                >
                    <View style={s.headerSection}>
                        <View style={s.deco1} />
                        <View style={s.deco2} />

                        <LinearGradient
                            colors={gradients.brandDuo}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={s.logoBox}
                        >
                            <Svg
                                width={28}
                                height={28}
                                viewBox='0 0 24 24'
                                fill='none'
                            >
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
                            <Text style={{ color: colors.primary }}>
                                chăm sóc
                            </Text>{' '}
                            sức khỏe
                        </Text>
                        {showSubtext && (
                            <Text style={s.headerSub}>
                                Tạo tài khoản hoặc đăng nhập để tiếp tục
                            </Text>
                        )}
                    </View>

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

                    <View>
                        {mode === 'signin' ? (
                            <SignInForm
                                key='signin'
                                email={email}
                                setEmail={setEmail}
                                password={password}
                                setPassword={setPassword}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                                loading={loading}
                                handleAction={handleAction}
                                errors={errors}
                                onForgotPassword={() =>
                                    setView('forgot-password')
                                }
                                onGoogleSignIn={handleGoogleSignIn}
                                googleLoading={googleLoading}
                            />
                        ) : (
                            <RegisterForm
                                key='signup'
                                email={email}
                                setEmail={setEmail}
                                phoneNumber={phoneNumber}
                                setPhoneNumber={(value) =>
                                    setPhoneNumber(
                                        sanitizeVietnamPhoneInput(value),
                                    )
                                }
                                password={password}
                                setPassword={setPassword}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                                confirmPassword={confirmPassword}
                                setConfirmPassword={setConfirmPassword}
                                showConfirmPassword={showConfirmPassword}
                                setShowConfirmPassword={setShowConfirmPassword}
                                loading={loading}
                                handleAction={handleAction}
                                errors={errors}
                            />
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Wrapper>
    );
}
