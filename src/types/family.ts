// src/types/family.ts

export interface FamilyMember {
    id: string;
    profileId?: string;
    healthProfileId?: string;
    /** OWNER | ADMIN | MEMBER từ API */
    familyRole?: string;
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
    bloodType?: string;
    chronicIllness?: string;
    allergies?: string;
    drugAllergies?: string;
    foodAllergies?: string;
    importantMedicalNote?: string;
    emergencyContacts?: {
        id?: string;
        name?: string | null;
        relationship?: string | null;
        phone?: string | null;
    }[];
    recordCount?: number;
    vaccineDoseCount?: number;
    vaccineTotalCount?: number;
    vaccinations?: Record<string, unknown>[];
    medicalRecords?: Record<string, unknown>[];
    healthMetrics?: Record<string, unknown>[];
    records?: {
        title: string;
        desc: string;
        tag: string;
        date: string;
    }[];
    medications?: {
        name: string;
        desc: string;
        type: 'blue' | 'teal' | 'rose';
    }[];
}

export interface FamilyGroup {
    id: string;
    name: string;
    memberCount: number;
    /** Vai trò hiển thị (quan hệ / nhãn) */
    role: string;
    /** OWNER | ADMIN | MEMBER — quyền từ API */
    familyRole?: string;
    roleEmoji: string;
    gradientColors: [string, string, string];
    iconName: string;
    members: FamilyMember[];
    createdDate: string;
    invite_code?: string;
    address?: string;
    avatarUrl?: string | null;
}
