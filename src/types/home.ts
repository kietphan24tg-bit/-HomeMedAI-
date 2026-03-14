export interface StatCard {
    id: string;
    iconName: string;
    iconColor: string;
    iconBg: string;
    badgeBg: string;
    badgeColor: string;
    badgeText: string;
    value: string;
    valueColor?: string;
    valueSize?: number;
    label: string;
    sub?: string;
    progress?: number;
    progressColor?: string;
}

export interface FamilyMember {
    code: string;
    name: string;
    role: string;
    color: string;
    gradient: [string, string];
    status: string;
}

export interface ScheduleItem {
    id: number;
    initials: string;
    bg: string;
    gradient: [string, string];
    title: string;
    meta: string;
    time: string;
    day: string;
    color: string;
}

export interface MedItem {
    name: string;
    info: string;
    time: string;
    bg: string;
    iconColor: string;
    taken: boolean;
}

export interface ArticleItem {
    tag: string;
    title: string;
    bg: string;
    color: string;
    image: string;
}
