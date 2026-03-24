import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import ForgotPasswordFlow from '@/src/screens/auth/ForgotPasswordFlow';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { colors } from '@/src/styles/tokens';
import { authStyles as s } from './authStyles';
import RegisterForm from './RegisterForm';
import SignInForm from './SignInForm';

interface Props {
    initialMode: 'signin' | 'signup';
    onSuccess?: () => void;
    showSubtext?: boolean;
    embedded?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthScreen({
    initialMode,
    onSuccess,
    showSubtext = false,
    embedded = false,
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

    // Errors
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

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

    /* ── Helpers ── */
    //change mode animation
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

    const handleAction = async () => {
        const newErrors: {
            email?: string;
            password?: string;
            confirmPassword?: string;
        } = {};

        if (!email.trim()) {
            newErrors.email = 'Vui lòng nhập email.';
        } else if (!EMAIL_REGEX.test(email.trim())) {
            newErrors.email = 'Email không đúng định dạng.';
        }

        if (!password) {
            newErrors.password = 'Vui lòng nhập mật khẩu.';
        } else if (password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
        }

        if (mode === 'signup') {
            if (!confirmPassword) {
                newErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu.';
            } else if (password !== confirmPassword) {
                newErrors.confirmPassword = 'Mật khẩu nhập lại không khớp.';
            }
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
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
        } finally {
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setErrors({});
        }
    };

    /* ── Forgot Password Flow ── */

    if (view === 'forgot-password') {
        const forgotContent = (
            <ForgotPasswordFlow
                initialEmail={email}
                onBackToAuth={() => setView('auth')}
            />
        );
        if (embedded) return <View style={{ flex: 1 }}>{forgotContent}</View>;
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

    /* ── Main Auth Layout ── */

    const Wrapper = embedded ? View : SafeAreaView;

    return (
        <Wrapper style={{ flex: 1, backgroundColor: colors.bg }}>
            {!embedded && (
                <StatusBar
                    barStyle='dark-content'
                    backgroundColor={colors.bg}
                />
            )}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
            >
                {/* ── HEADER: Logo + Title ── */}
                <View style={s.headerSection}>
                    <View style={s.deco1} />
                    <View style={s.deco2} />

                    <LinearGradient
                        colors={['#2563EB', '#14B8A6']}
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
                        sức khoẻ
                    </Text>
                    <Text style={s.headerSub}>
                        Tạo tài khoản hoặc đăng nhập để tiếp tục
                    </Text>
                </View>

                {/* ── TABS ── */}
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

                {/* ── FORM (renders SignInForm or RegisterForm) ── */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    {mode === 'signin' ? (
                        <SignInForm
                            email={email}
                            setEmail={setEmail}
                            password={password}
                            setPassword={setPassword}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                            loading={loading}
                            handleAction={handleAction}
                            errors={errors}
                            onForgotPassword={() => setView('forgot-password')}
                        />
                    ) : (
                        <RegisterForm
                            email={email}
                            setEmail={setEmail}
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
                </Animated.View>
            </ScrollView>
        </Wrapper>
    );
}
