import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { appToast } from '@/src/lib/toast';
import { authService } from '@/src/services/auth.services';
import { shared } from '@/src/styles/shared';
import { colors, radius, shadows, typography } from '@/src/styles/tokens';

type ForgotErrors = {
    email?: string;
    otp?: string;
    password?: string;
    confirmPassword?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordFlow({
    initialEmail,
    onBackToAuth,
}: {
    initialEmail: string;
    onBackToAuth: () => void;
}): React.JSX.Element {
    const [step, setStep] = useState<'email' | 'reset'>('email');
    const [email, setEmail] = useState(initialEmail);
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const [activeOtpIndex, setActiveOtpIndex] = useState(0);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<ForgotErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const resetToken = useRef<string | null>(null);
    const otpRefs = useRef<(TextInput | null)[]>([]);

    const setFieldError = (field: keyof ForgotErrors, value?: string) => {
        setErrors((current) => ({ ...current, [field]: value }));
    };

    const resetPasswordState = () => {
        setStep('email');
        setOtpValues(['', '', '', '', '', '']);
        setActiveOtpIndex(0);
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
        setShowPassword(false);
        setShowConfirmPassword(false);
        resetToken.current = null;
    };

    const requestOtp = async (showSuccessToast = true) => {
        if (!EMAIL_REGEX.test(email.trim())) {
            setErrors({ email: 'Email không đúng định dạng.' });
            return;
        }

        try {
            setIsLoading(true);
            const res = await authService.forgotPassword(email.trim());

            resetToken.current = res.reset_token;
            setErrors({});
            setOtpValues(['', '', '', '', '', '']);
            setNewPassword('');
            setConfirmPassword('');
            setStep('reset');

            if (showSuccessToast) {
                appToast.showSuccess(
                    'Thành công',
                    'Mã OTP đã được gửi đến email của bạn.',
                );
            }
        } catch (error) {
            appToast.showError(
                'Lỗi',
                'Email không tồn tại hoặc có lỗi xảy ra. Vui lòng thử lại.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOtp = async () => {
        await requestOtp(true);
    };

    const handleResendOtp = async () => {
        await requestOtp(false);
    };

    const handleOtpChange = (value: string, index: number) => {
        const digit = value.replace(/\D/g, '').slice(0, 1);
        const nextOtp = [...otpValues];
        nextOtp[index] = digit;
        setOtpValues(nextOtp);
        setFieldError('otp');

        if (digit && index < 5) {
            setActiveOtpIndex(index + 1);
            otpRefs.current[index + 1]?.focus();
            return;
        }

        setActiveOtpIndex(index);
    };

    const handleOtpKeyPress = (key: string, index: number, value: string) => {
        if (key !== 'Backspace') return;

        if (value) {
            setActiveOtpIndex(index);
            return;
        }

        if (index > 0) {
            setActiveOtpIndex(index - 1);
            otpRefs.current[index - 1]?.focus();
        }
    };

    useEffect(() => {
        if (step !== 'reset') return;

        const nextEmptyIndex = otpValues.findIndex((item) => !item);
        setActiveOtpIndex(
            nextEmptyIndex === -1 ? otpValues.length - 1 : nextEmptyIndex,
        );
    }, [otpValues, step]);

    useEffect(() => {
        if (step !== 'reset' || isLoading) return;

        otpRefs.current[activeOtpIndex]?.focus();
    }, [activeOtpIndex, isLoading, step]);

    const handleResetPassword = async () => {
        const nextErrors: ForgotErrors = {};

        if (otpValues.join('').length < 6) {
            nextErrors.otp = 'Mã OTP không đúng. Vui lòng thử lại.';
        }

        if (newPassword.length < 6) {
            nextErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
        }

        if (!confirmPassword) {
            nextErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu mới.';
        } else if (newPassword !== confirmPassword) {
            nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
        }

        if (!resetToken.current) {
            nextErrors.otp =
                'Phiên đặt lại mật khẩu không hợp lệ. Vui lòng gửi lại OTP.';
        }

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        try {
            setIsLoading(true);
            const res = await authService.resetPassword(
                resetToken.current!,
                email.trim(),
                otpValues.join(''),
                newPassword,
            );

            appToast.showSuccess(
                'Thành công',
                res.message || 'Đặt lại mật khẩu thành công.',
            );

            resetPasswordState();
            onBackToAuth();
        } catch (error) {
            console.log(error);
            appToast.showError(
                'Lỗi',
                'Đặt lại mật khẩu thất bại. Vui lòng thử lại.',
            );
            resetPasswordState();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
        >
            <Pressable
                onPress={
                    step === 'email' ? onBackToAuth : () => setStep('email')
                }
                style={styles.backButton}
            >
                <Ionicons name='chevron-back' size={20} color={colors.text2} />
            </Pressable>

            <View style={styles.body}>
                <View
                    style={[
                        styles.iconWrap,
                        {
                            backgroundColor:
                                step === 'email' ? colors.primaryBg : '#F0FDF4',
                        },
                    ]}
                >
                    <Ionicons
                        name={
                            step === 'email'
                                ? 'lock-closed-outline'
                                : 'mail-outline'
                        }
                        size={28}
                        color={step === 'email' ? colors.primary : '#16A34A'}
                    />
                </View>

                {step === 'email' ? (
                    <>
                        <Text style={styles.title}>Quên mật khẩu?</Text>
                        <Text style={styles.description}>
                            Nhập email đã đăng ký. Chúng tôi sẽ gửi mã OTP để
                            xác nhận danh tính.
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                EMAIL ĐÃ ĐĂNG KÝ
                            </Text>
                            <View style={styles.inputWrap}>
                                <Ionicons
                                    name='mail-outline'
                                    size={18}
                                    color={colors.text2}
                                    style={styles.leadingIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder='example@gmail.com'
                                    placeholderTextColor={colors.text3}
                                    value={email}
                                    onChangeText={(value) => {
                                        setEmail(value);
                                        setFieldError('email');
                                    }}
                                    keyboardType='email-address'
                                    autoCapitalize='none'
                                    editable={!isLoading}
                                />
                            </View>
                            {errors.email ? (
                                <Text style={styles.errorText}>
                                    {errors.email}
                                </Text>
                            ) : null}
                        </View>

                        <Pressable
                            style={[
                                shared.btnFilled,
                                styles.primaryButton,
                                isLoading && styles.loadingButton,
                            ]}
                            onPress={handleSendOtp}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator
                                    size='small'
                                    color='#fff'
                                    style={{ marginRight: 8 }}
                                />
                            ) : null}
                            <Text style={shared.btnFilledText}>
                                {isLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
                            </Text>
                        </Pressable>
                    </>
                ) : (
                    <>
                        <Text style={styles.title}>Kiểm tra email</Text>
                        <Text style={[styles.description, { marginBottom: 6 }]}>
                            Mã OTP đã gửi tới
                        </Text>
                        <Text style={styles.emailHighlight}>{email}</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                MÃ OTP (6 CHỮ SỐ)
                            </Text>
                            <View style={styles.otpRow}>
                                {otpValues.map((value, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => {
                                            otpRefs.current[index] = ref;
                                        }}
                                        style={[
                                            styles.otpBox,
                                            index === activeOtpIndex &&
                                                styles.otpBoxActive,
                                        ]}
                                        value={value}
                                        onChangeText={(text) =>
                                            handleOtpChange(text, index)
                                        }
                                        onFocus={() => setActiveOtpIndex(index)}
                                        onKeyPress={({ nativeEvent }) =>
                                            handleOtpKeyPress(
                                                nativeEvent.key,
                                                index,
                                                value,
                                            )
                                        }
                                        maxLength={1}
                                        keyboardType='number-pad'
                                        caretHidden
                                        editable={!isLoading}
                                    />
                                ))}
                            </View>
                            <View style={styles.otpFooter}>
                                <Text style={styles.errorTiny}>
                                    {errors.otp || ' '}
                                </Text>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.resendButton,
                                        isLoading &&
                                            styles.resendButtonDisabled,
                                        pressed &&
                                            !isLoading &&
                                            styles.resendButtonPressed,
                                    ]}
                                    onPress={handleResendOtp}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.resendButtonText}>
                                        Gửi lại mã
                                    </Text>
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>MẬT KHẨU MỚI</Text>
                            <View style={styles.inputWrap}>
                                <Ionicons
                                    name='lock-closed-outline'
                                    size={18}
                                    color={colors.text2}
                                    style={styles.leadingIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder='Tối thiểu 6 ký tự'
                                    placeholderTextColor={colors.text3}
                                    value={newPassword}
                                    onChangeText={(value) => {
                                        setNewPassword(value);
                                        setFieldError('password');
                                        setFieldError('confirmPassword');
                                    }}
                                    secureTextEntry={!showPassword}
                                    editable={!isLoading}
                                />
                                <Pressable
                                    onPress={() =>
                                        setShowPassword(!showPassword)
                                    }
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
                            {errors.password ? (
                                <Text style={styles.errorText}>
                                    {errors.password}
                                </Text>
                            ) : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                XÁC NHẬN MẬT KHẨU
                            </Text>
                            <View style={styles.inputWrap}>
                                <Ionicons
                                    name='lock-closed-outline'
                                    size={18}
                                    color={colors.text2}
                                    style={styles.leadingIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder='Nhập lại mật khẩu mới'
                                    placeholderTextColor={colors.text3}
                                    value={confirmPassword}
                                    onChangeText={(value) => {
                                        setConfirmPassword(value);
                                        setFieldError('confirmPassword');
                                    }}
                                    secureTextEntry={!showConfirmPassword}
                                    editable={!isLoading}
                                />
                                <Pressable
                                    onPress={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword,
                                        )
                                    }
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
                            {errors.confirmPassword ? (
                                <Text style={styles.errorText}>
                                    {errors.confirmPassword}
                                </Text>
                            ) : null}
                        </View>

                        <Pressable
                            style={[
                                shared.btnFilled,
                                styles.primaryButton,
                                { marginTop: 20 },
                                isLoading && styles.loadingButton,
                            ]}
                            onPress={handleResetPassword}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator
                                    size='small'
                                    color='#fff'
                                    style={{ marginRight: 8 }}
                                />
                            ) : null}
                            <Text style={shared.btnFilledText}>
                                {isLoading
                                    ? 'Đang xử lý...'
                                    : 'Đặt lại mật khẩu'}
                            </Text>
                        </Pressable>
                    </>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 4,
        paddingBottom: 32,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    body: {
        paddingTop: 40,
    },
    iconWrap: {
        width: 60,
        height: 60,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontFamily: typography.font.black,
        fontSize: 22,
        lineHeight: 30,
        color: colors.text,
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    description: {
        fontFamily: typography.font.regular,
        fontSize: 13,
        lineHeight: 21,
        color: colors.text2,
        marginBottom: 28,
    },
    inputGroup: {
        marginBottom: 18,
    },
    inputLabel: {
        fontFamily: typography.font.bold,
        fontSize: 11,
        lineHeight: 16,
        color: colors.text2,
        letterSpacing: 0.4,
        marginBottom: 8,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg,
        paddingHorizontal: 16,
        paddingVertical: 14,
        ...shadows.card,
    },
    leadingIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        padding: 0,
        fontFamily: typography.font.medium,
        fontSize: 14,
        color: colors.text,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        marginTop: 8,
    },
    loadingButton: {
        backgroundColor: 'rgba(37, 99, 235, 0.72)',
        opacity: 0.88,
    },
    footerText: {
        marginTop: 20,
        textAlign: 'center',
        fontFamily: typography.font.regular,
        fontSize: 12,
        lineHeight: 18,
        color: colors.text3,
    },
    footerLink: {
        color: colors.primary,
        fontFamily: typography.font.semiBold,
    },
    errorText: {
        marginTop: 6,
        marginLeft: 2,
        color: colors.cDanger,
        fontFamily: typography.font.medium,
        fontSize: 12,
        lineHeight: 18,
    },
    emailHighlight: {
        fontFamily: typography.font.bold,
        fontSize: 13,
        lineHeight: 20,
        color: colors.primary,
        marginBottom: 24,
    },
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    otpBox: {
        width: 42,
        height: 48,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 12,
        backgroundColor: colors.bg,
        textAlign: 'center',
        fontFamily: typography.font.bold,
        fontSize: 18,
        color: colors.text,
    },
    otpBoxActive: {
        borderColor: colors.primary,
    },
    otpFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginTop: 8,
        gap: 12,
    },
    resendButton: {
        minWidth: 112,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: colors.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resendButtonPressed: {
        opacity: 0.82,
        transform: [{ scale: 0.98 }],
    },
    resendButtonDisabled: {
        opacity: 0.55,
    },
    resendButtonText: {
        fontFamily: typography.font.semiBold,
        fontSize: 12,
        lineHeight: 16,
        color: colors.primary,
    },
    errorTiny: {
        flex: 1,
        minHeight: 16,
        color: colors.cDanger,
        fontFamily: typography.font.medium,
        fontSize: 11,
        lineHeight: 16,
        paddingTop: 8,
    },
});
