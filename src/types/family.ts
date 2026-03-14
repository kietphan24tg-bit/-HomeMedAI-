// src/types/family.ts

export interface FamilyMember {
    id: string;
    initials: string;
    name: string;
    role: string;
    age: number;
    gender: string;
    city: string;
    gradientColors: [string, string];
    isOwner?: boolean;
    isOnline?: boolean;
    isSelf?: boolean;
    dob?: string;
    height?: number;
    weight?: number;
    address?: string;
}

export interface FamilyGroup {
    id: string;
    name: string;
    memberCount: number;
    role: string;
    roleEmoji: string;
    gradientColors: [string, string, string];
    iconName: string;
    members: FamilyMember[];
    createdDate: string;
}
