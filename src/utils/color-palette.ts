// src/utils/color-palette.ts

// ── Avatar Gradient Palette (for person avatars) ──
export const AVATAR_PALETTES: [string, string][] = [
    ['#2563EB', '#0D9488'], // 0: Blue → Teal
    ['#7C3AED', '#EC4899'], // 1: Purple → Pink
    ['#D97706', '#F59E0B'], // 2: Amber → Yellow
    ['#0D9488', '#06B6D4'], // 3: Teal → Cyan
    ['#E11D48', '#F43F5E'], // 4: Rose
    ['#059669', '#10B981'], // 5: Emerald
    ['#4F46E5', '#818CF8'], // 6: Indigo
    ['#C026D3', '#E879F9'], // 7: Fuchsia
];

// ── Category Color Palette (for list items, tags, icons) ──
export interface CategoryColor {
    color: string;
    bg: string;
}

export const CATEGORY_PALETTES: CategoryColor[] = [
    { color: '#2563EB', bg: '#EFF6FF' }, // 0: Blue
    { color: '#0D9488', bg: '#F0FDFA' }, // 1: Teal
    { color: '#D97706', bg: '#FFFBEB' }, // 2: Amber
    { color: '#7C3AED', bg: '#F5F3FF' }, // 3: Purple
    { color: '#16A34A', bg: '#F0FDF4' }, // 4: Green
    { color: '#E11D48', bg: '#FFF1F2' }, // 5: Rose
    { color: '#EA580C', bg: '#FFF7ED' }, // 6: Orange
    { color: '#0EA5E9', bg: '#F0F9FF' }, // 7: Sky
    { color: '#6366F1', bg: '#EEF2FF' }, // 8: Indigo
    { color: '#EC4899', bg: '#FDF2F8' }, // 9: Pink
];

// ── Medical Specialty Color Map ──
export const SPECIALTY_COLORS: Record<string, CategoryColor> = {
    cardiology: { color: '#2563EB', bg: '#EFF6FF' },
    general: { color: '#0D9488', bg: '#F0FDFA' },
    internal: { color: '#D97706', bg: '#FFFBEB' },
    dermatology: { color: '#7C3AED', bg: '#F5F3FF' },
    pediatrics: { color: '#16A34A', bg: '#F0FDF4' },
    neurology: { color: '#E11D48', bg: '#FFF1F2' },
    orthopedic: { color: '#D97706', bg: '#FFFBEB' },
    ent: { color: '#0D9488', bg: '#F0FDFA' },
    obstetrics: { color: '#EC4899', bg: '#FDF2F8' },
    dental: { color: '#0EA5E9', bg: '#F0F9FF' },
    ophthalmology: { color: '#6366F1', bg: '#EEF2FF' },
    endocrine: { color: '#F59E0B', bg: '#FFFBEB' },
    gastro: { color: '#84CC16', bg: '#F7FEE7' },
    other: { color: '#64748B', bg: '#F1F5F9' },
};

// ── Helper Functions ──

/** Get avatar gradient by index (wraps around) */
export function getAvatarGradient(index: number): [string, string] {
    return AVATAR_PALETTES[index % AVATAR_PALETTES.length];
}

/** Get category color by index (wraps around) */
export function getCategoryColor(index: number): CategoryColor {
    return CATEGORY_PALETTES[index % CATEGORY_PALETTES.length];
}

/** Get specialty color by category key */
export function getSpecialtyColor(category: string): CategoryColor {
    return SPECIALTY_COLORS[category] ?? SPECIALTY_COLORS['other'];
}

/** Hash a string to a deterministic number */
export function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

/** Get avatar gradient by string key (deterministic) */
export function getAvatarGradientByKey(key: string): [string, string] {
    return getAvatarGradient(hashString(key));
}

/** Get category color by string key (deterministic) */
export function getCategoryColorByKey(key: string): CategoryColor {
    return getCategoryColor(hashString(key));
}

/** Derive all record color fields from a category */
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
