// src/styles/tokens.ts
import { type ViewStyle } from 'react-native';
import { moderateScale, verticalScale } from './responsive';

export const colors = {
    primary: '#2563EB',
    primaryLight: '#7CB6FF',
    primaryBg: '#EFF6FF',
    secondary: '#0F9D94',
    secondaryBg: '#ECFDF8',
    accent: '#38BDF8',
    accentBg: '#F0F9FF',

    cMedical: '#2563EB',
    cMedicalBg: '#EFF6FF',
    cReminder: '#F59E0B',
    cReminderBg: '#FFFBEB',
    cFamily: '#0F9D94',
    cFamilyBg: '#ECFDF8',
    cHealth: '#16A34A',
    cHealthBg: '#F0FDF4',
    cDanger: '#E11D48',
    cDangerBg: '#FFF1F2',

    bg: '#F8FAFC',
    bgProfile: '#F8FAFC',
    bgHealth: '#F4F7FB',
    card: '#FFFFFF',
    text: '#0F172A',
    text2: '#64748B',
    text3: '#94A3B8',
    border: '#E2E8F0',
} as const;

export const gradients = {
    brand: ['#2563EB', '#1D9BF0', '#0F9D94'] as const,
    brandDuo: ['#2563EB', '#0EA5E9'] as const,
    brandSoft: ['#EFF6FF', '#ECFDF8'] as const,
    family: ['#0F766E', '#0F9D94', '#14B8A6'] as const,
    familyDuo: ['#0F766E', '#14B8A6'] as const,
    health: ['#15803D', '#16A34A'] as const,
    healthSoft: ['#ECFDF5', '#DCFCE7'] as const,
    warning: ['#D97706', '#F59E0B'] as const,
    danger: ['#E11D48', '#F43F5E'] as const,
    success: ['#15803D', '#22C55E'] as const,
    neutral: ['#CBD5E1', '#CBD5E1'] as const,
} as const;

export const radius = {
    lg: moderateScale(20),
    md: moderateScale(16),
    sm: moderateScale(12),
    phone: moderateScale(48),
} as const;

export const typography = {
    font: {
        regular: 'Inter_400Regular',
        medium: 'Inter_500Medium',
        semiBold: 'Inter_600SemiBold',
        bold: 'Inter_700Bold',
        black: 'Inter_900Black',
    },
} as const;

export const shadows: { card: ViewStyle } = {
    card: {
        shadowColor: '#0f172a',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: verticalScale(2) },
        elevation: 3,
    },
};
