import { StyleSheet } from 'react-native';
import {
    moderateScale,
    scale,
    scaleFont,
    verticalScale,
} from '@/src/styles/responsive';
import { buttonSystem, formSystem, inputSystem } from '@/src/styles/shared';
import { colors, radius, shadows, typography } from '@/src/styles/tokens';

/* ══════════════════════════════════════
   Shared Auth Styles — CareSync S4
   ══════════════════════════════════════ */
export const authStyles = StyleSheet.create({
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
        marginBottom: verticalScale(16),
    },
    inputLabel: {
        ...formSystem.fieldLabel,
        lineHeight: verticalScale(16),
        marginBottom: verticalScale(7),
    },
    inputWrap: {
        ...inputSystem.fieldIcon,
        backgroundColor: colors.card,
        minHeight: verticalScale(45),
        borderRadius: radius.sm,
        borderWidth: 1.5,
        borderColor: colors.border,
        paddingHorizontal: scale(13),
    },
    phonePrefix: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
        paddingRight: scale(10),
        marginRight: scale(2),
        borderRightWidth: 1,
        borderRightColor: colors.border,
    },
    phoneFlag: {
        fontSize: scaleFont(16),
    },
    phonePrefixText: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(14),
        color: colors.text,
    },
    inputIcon: {
        marginRight: scale(10),
        flexShrink: 0,
    },
    textInput: {
        ...inputSystem.text,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12.5),
        lineHeight: scaleFont(16),
        textAlignVertical: 'center',
    },

    /* ── Forgot ── */
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: verticalScale(14),
    },
    forgotText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11.5),
        color: colors.primary,
    },

    /* ── Primary Button ── */
    btnPrimary: {
        width: '100%',
        ...buttonSystem.primary,
        backgroundColor: colors.primary,
        minHeight: verticalScale(45),
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 5,
    },
    btnPrimaryContent: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
        backgroundColor: 'transparent',
    },
    btnPrimaryLoading: {
        backgroundColor: 'rgba(15, 110, 86, 0.72)',
        opacity: 0.88,
    },
    btnPrimaryText: {
        color: '#fff',
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13.5),
        letterSpacing: 0.1,
        backgroundColor: 'transparent',
        includeFontPadding: false,
    },

    /* ── OR Divider ── */
    orRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
        marginVertical: verticalScale(12),
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
        minHeight: verticalScale(45),
        paddingVertical: 0,
        paddingHorizontal: scale(14),
        borderRadius: moderateScale(11),
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
        fontSize: scaleFont(12.5),
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
    inputWrapError: {
        borderColor: colors.danger,
    },
    errorText: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11),
        color: colors.danger,
        marginTop: verticalScale(4),
        paddingLeft: scale(4),
    },
});

/* ── Shared Form Props ── */
export interface AuthFormProps {
    email: string;
    setEmail: (v: string) => void;
    password: string;
    setPassword: (v: string) => void;
    showPassword: boolean;
    setShowPassword: (v: boolean) => void;
    loading: boolean;
    handleAction: () => void;
    errors: {
        email?: string;
        phoneNumber?: string;
        password?: string;
        confirmPassword?: string;
    };
}

export interface SignInFormProps extends AuthFormProps {
    onForgotPassword: () => void;
}

export interface RegisterFormProps extends AuthFormProps {
    phoneNumber: string;
    setPhoneNumber: (v: string) => void;
    confirmPassword: string;
    setConfirmPassword: (v: string) => void;
    showConfirmPassword: boolean;
    setShowConfirmPassword: (v: boolean) => void;
}
