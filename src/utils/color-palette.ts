// src/utils/color-palette.ts
import { colors } from '../styles/tokens';

// ── Avatar colors — cool-spectrum, muted, health-appropriate ──
export const AVATAR_COLORS: string[] = [
    '#3B82F6',
    '#0D9488',
    '#6366F1',
    '#8B5CF6',
    '#059669',
    '#0891B2',
    '#7C3AED',
    '#2563EB',
];

// ── Family card colors — distinct, premium, diverse palette ──
export const FAMILY_CARD_COLORS: string[] = [
    '#0F6E56', // deep teal
    '#7C3AED', // violet
    '#0E7490', // cyan
    '#C2410C', // burnt orange
    '#1D4ED8', // royal blue
    '#15803D', // forest green
    '#9D174D', // rose
    '#854D0E', // amber-brown
];

/** @deprecated Use AVATAR_COLORS[i] directly */
export const AVATAR_PALETTES: [string, string][] = AVATAR_COLORS.map(
    (c) => [c, c] as [string, string],
);

// ── Category / specialty palette — aligned to semantic tokens ──

export interface CategoryColor {
    color: string;
    bg: string;
}

export const CATEGORY_PALETTES: CategoryColor[] = [
    { color: colors.primary, bg: colors.primaryBg },
    { color: colors.info, bg: colors.infoBg },
    { color: colors.secondary, bg: colors.secondaryBg },
    { color: colors.success, bg: colors.successBg },
    { color: '#0891B2', bg: '#ECFEFF' },
    { color: '#6366F1', bg: '#EEF2FF' },
    { color: colors.warning, bg: colors.warningBg },
    { color: colors.text3, bg: colors.divider },
];

export const SPECIALTY_COLORS: Record<string, CategoryColor> = {
    cardiology: { color: colors.primary, bg: colors.primaryBg },
    general: { color: colors.secondary, bg: colors.secondaryBg },
    internal: { color: colors.info, bg: colors.infoBg },
    dermatology: { color: '#0891B2', bg: '#ECFEFF' },
    pediatrics: { color: colors.success, bg: colors.successBg },
    neurology: { color: '#6366F1', bg: '#EEF2FF' },
    orthopedic: { color: colors.warning, bg: colors.warningBg },
    ent: { color: colors.secondary, bg: colors.secondaryBg },
    obstetrics: { color: colors.info, bg: colors.infoBg },
    dental: { color: '#0891B2', bg: '#ECFEFF' },
    ophthalmology: { color: colors.primary, bg: colors.primaryBg },
    endocrine: { color: colors.warning, bg: colors.warningBg },
    gastro: { color: colors.success, bg: colors.successBg },
    other: { color: colors.text3, bg: colors.divider },
};

// ── Helpers ──

export function getAvatarColor(index: number): string {
    return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function getAvatarGradient(index: number): [string, string] {
    const c = getAvatarColor(index);
    return [c, c];
}

export function getFamilyCardColor(index: number): string {
    return FAMILY_CARD_COLORS[index % FAMILY_CARD_COLORS.length];
}

export function getCategoryColor(index: number): CategoryColor {
    return CATEGORY_PALETTES[index % CATEGORY_PALETTES.length];
}

export function getSpecialtyColor(category: string): CategoryColor {
    return SPECIALTY_COLORS[category] ?? SPECIALTY_COLORS.other;
}

export function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

export function getAvatarColorByKey(key: string): string {
    return getAvatarColor(hashString(key));
}

export function getAvatarGradientByKey(key: string): [string, string] {
    return getAvatarGradient(hashString(key));
}

export function getCategoryColorByKey(key: string): CategoryColor {
    return getCategoryColor(hashString(key));
}

export function recordColors(category: string) {
    const cc = getSpecialtyColor(category);
    return {
        iconColor: cc.color,
        bg: cc.bg,
        dotColor: cc.color,
        tagColor: cc.color,
        tagBg: cc.bg,
    };
}
