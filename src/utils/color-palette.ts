// src/utils/color-palette.ts

// Avatar Gradient Palette
export const AVATAR_PALETTES: [string, string][] = [
    ['#2563EB', '#0EA5E9'],
    ['#0EA5E9', '#14B8A6'],
    ['#14B8A6', '#22C55E'],
    ['#1D4ED8', '#14B8A6'],
    ['#0891B2', '#2563EB'],
    ['#0F766E', '#10B981'],
    ['#0F172A', '#475569'],
    ['#0284C7', '#06B6D4'],
];

export interface CategoryColor {
    color: string;
    bg: string;
}

export const CATEGORY_PALETTES: CategoryColor[] = [
    { color: '#2563EB', bg: '#EFF6FF' },
    { color: '#0EA5E9', bg: '#F0F9FF' },
    { color: '#14B8A6', bg: '#F0FDFA' },
    { color: '#0F766E', bg: '#ECFDF5' },
    { color: '#22C55E', bg: '#F0FDF4' },
    { color: '#F59E0B', bg: '#FFFBEB' },
    { color: '#EA580C', bg: '#FFF7ED' },
    { color: '#475569', bg: '#F1F5F9' },
    { color: '#1D4ED8', bg: '#DBEAFE' },
    { color: '#06B6D4', bg: '#ECFEFF' },
];

export const SPECIALTY_COLORS: Record<string, CategoryColor> = {
    cardiology: { color: '#2563EB', bg: '#EFF6FF' },
    general: { color: '#14B8A6', bg: '#F0FDFA' },
    internal: { color: '#0EA5E9', bg: '#F0F9FF' },
    dermatology: { color: '#06B6D4', bg: '#ECFEFF' },
    pediatrics: { color: '#22C55E', bg: '#F0FDF4' },
    neurology: { color: '#1D4ED8', bg: '#DBEAFE' },
    orthopedic: { color: '#F59E0B', bg: '#FFFBEB' },
    ent: { color: '#14B8A6', bg: '#F0FDFA' },
    obstetrics: { color: '#0EA5E9', bg: '#F0F9FF' },
    dental: { color: '#0891B2', bg: '#ECFEFF' },
    ophthalmology: { color: '#2563EB', bg: '#EFF6FF' },
    endocrine: { color: '#EA580C', bg: '#FFF7ED' },
    gastro: { color: '#22C55E', bg: '#F0FDF4' },
    other: { color: '#64748B', bg: '#F1F5F9' },
};

export function getAvatarGradient(index: number): [string, string] {
    return AVATAR_PALETTES[index % AVATAR_PALETTES.length];
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
