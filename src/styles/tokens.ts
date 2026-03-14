// src/styles/tokens.ts
import { type ViewStyle } from 'react-native';

export const colors = {
    primary: '#2563EB',
    primaryLight: '#60A5FA',
    primaryBg: '#EFF6FF',
    secondary: '#14B8A6',
    secondaryBg: '#F0FDFA',

    cMedical: '#2563EB',
    cMedicalBg: '#EFF6FF',
    cReminder: '#F59E0B',
    cReminderBg: '#FFFBEB',
    cFamily: '#8B5CF6',
    cFamilyBg: '#F5F3FF',
    cHealth: '#22C55E',
    cHealthBg: '#F0FDF4',
    cDanger: '#EF4444',
    cDangerBg: '#FFF1F2',

    bg: '#F8FAFC',
    bgProfile: '#F8FAFC',
    bgHealth: '#F1F4F9',
    card: '#FFFFFF',
    text: '#0F172A',
    text2: '#64748B',
    text3: '#94A3B8',
    border: '#E2E8F0',
} as const;

export const radius = {
    lg: 20,
    md: 16,
    sm: 12,
    phone: 48,
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
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
};
