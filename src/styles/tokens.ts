// src/styles/tokens.ts
//
// COLOR SYSTEM DESIGN PRINCIPLES:
//   1. Brand teal (#0F6E56) → ONLY for buttons, active tabs, key icons, accent badges
//   2. Neutrals (bg, card, border, text) → PURE neutral gray — NO color tint whatsoever
//   3. Semantic colors → clean, recognizable (green=ok, red=danger, amber=warning, sky=info)
//   4. Family/Medicine cards: intentional full-color, separate from neutral surfaces
//
import { type ViewStyle } from 'react-native';
import { moderateScale, verticalScale } from './responsive';

export const colors = {
    // ── Brand ──────────────────────────────────────────────────────────────
    // Used ONLY on interactive/accent elements: CTA buttons, active tab indicators,
    // primary icon fills, selection states, pill badges.
    primary: '#0F6E56', // deep medical teal
    primaryLight: '#34C89A', // lighter teal – chips, outline badges
    primaryBg: '#E9F7F2', // very light teal tint – icon bg circles only (not page bg)

    // Secondary: a calm cornflower-slate for complementary links / info states
    secondary: '#2563EB', // classic medical blue (links, secondary actions)
    secondaryBg: '#EFF6FF', // blue wash – used sparingly

    // ── Semantic ───────────────────────────────────────────────────────────
    success: '#16A34A', // standard green – healthy, confirmed
    successBg: '#F0FDF4',
    warning: '#D97706', // amber – low stock, upcoming expiry
    warningBg: '#FFFBEB',
    danger: '#DC2626', // red – expired, critical alert
    dangerBg: '#FFF1F1',
    info: '#0284C7', // sky blue – informational, neutral notifs
    infoBg: '#F0F9FF',

    // ── Legacy aliases (keep for backward compat) ──────────────────────────
    /** @deprecated */ cMedical: '#0F6E56',
    /** @deprecated */ cMedicalBg: '#E9F7F2',
    /** @deprecated */ cReminder: '#D97706',
    /** @deprecated */ cReminderBg: '#FFFBEB',
    /** @deprecated */ cFamily: '#0F6E56',
    /** @deprecated */ cFamilyBg: '#E9F7F2',
    /** @deprecated */ cHealth: '#16A34A',
    /** @deprecated */ cHealthBg: '#F0FDF4',
    /** @deprecated */ cDanger: '#DC2626',
    /** @deprecated */ cDangerBg: '#FFF1F1',

    // ── Neutrals — PURE GRAY, ZERO COLOR TINT ─────────────────────────────
    // These must stay neutral so the brand color "pops" against them.
    bg: '#F8FAFC', // page background  – slate-50 (clean, clinical white)
    bgProfile: '#F8FAFC',
    bgHealth: '#F8FAFC',
    card: '#FFFFFF', // card surface      – pure white
    text: '#111827', // primary text      – near black (gray-900)
    text2: '#4B5563', // secondary text    – gray-600
    text3: '#9CA3AF', // placeholder/hint  – gray-400
    border: '#E5E7EB', // divider/border    – gray-200 (pure neutral)
    divider: '#F3F4F6', // very light separator – gray-100
} as const;

// ── Gradients ─────────────────────────────────────────────────────────────
// Brand gradients use the teal palette.
// Do NOT apply brand gradients to neutral backgrounds.
export const gradients = {
    brand: ['#0F6E56', '#1A9A7A'] as const, // teal CTA buttons
    brandSoft: ['#E9F7F2', '#EFF6FF'] as const, // very subtle bg (onboarding)
    brandDuo: ['#0F6E56', '#1A9A7A'] as const,
    family: ['#0F6E56', '#157A6E', '#1A9A7A'] as const,
    familyDuo: ['#0F6E56', '#1A9A7A'] as const,
    health: ['#15803D', '#16A34A'] as const,
    healthSoft: ['#F0FDF4', '#DCFCE7'] as const,
    warning: ['#D97706', '#F59E0B'] as const,
    danger: ['#DC2626', '#EF4444'] as const,
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

// Shadow uses pure slate so it doesn't tint card backgrounds
export const shadows: { card: ViewStyle } = {
    card: {
        shadowColor: '#1E293B', // slate-800 — neutral, no tint
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: verticalScale(2) },
        elevation: 3,
    },
};
