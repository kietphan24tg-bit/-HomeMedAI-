import { useQuery } from '@tanstack/react-query';
import { FAMILIES } from '@/src/data/family-data';
import { familiesServices } from '@/src/services/families.services';
import type { FamilyGroup } from '@/src/types/family';
import {
    FAMILY_CARD_COLORS,
    getAvatarGradient,
} from '@/src/utils/color-palette';
import { familyQueryKeys } from './queryKeys';

const FALLBACK_ROLE = 'Thành viên';
const FALLBACK_ROLE_EMOJI = '👤';
const FAMILY_SYNC_INTERVAL_MS = 30000;

export type FamilyInviteSummary = {
    id: string;
    familyName: string;
    memberCount: number;
    inviterName: string;
    inviterRole: string;
    role: string;
    roleEmoji: string;
    invitedAt: string;
    gradient: [string, string];
    fullName: string | null;
};

function toArray(data: unknown): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as any)?.data)) return (data as any).data;
    if (Array.isArray((data as any)?.families)) return (data as any).families;
    if (Array.isArray((data as any)?.invites)) return (data as any).invites;
    return [];
}

function mapRoleEmoji(role: string) {
    const normalized = role.toLowerCase();
    if (normalized.includes('chủ')) return '👑';
    if (normalized.includes('cha') || normalized.includes('ba')) return '👨';
    if (normalized.includes('mẹ')) return '👩';
    if (normalized.includes('con')) return '👶';
    return FALLBACK_ROLE_EMOJI;
}

function parseProfileNumber(value: unknown): number {
    if (value === null || value === undefined || value === '') return 0;
    const n = Number.parseFloat(String(value));
    return Number.isFinite(n) ? n : 0;
}

function ageFromDateString(dob: string | null | undefined): number {
    if (!dob) return 0;
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return 0;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
    return Math.max(0, age);
}

function parseDateSafe(value: unknown): Date | null {
    if (typeof value !== 'string' || !value.trim()) {
        return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDisplayDate(value: unknown): string {
    const date = parseDateSafe(value);
    return date
        ? date.toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
          })
        : '--';
}

function stringValue(value: unknown): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }
    return '';
}

function displayGender(value: unknown): string {
    const normalized = stringValue(value).trim().toLowerCase();
    if (normalized === 'male' || normalized === 'nam') return 'Nam';
    if (normalized === 'female' || normalized === 'nữ' || normalized === 'nu') {
        return 'Nữ';
    }
    if (
        normalized === 'other' ||
        normalized === 'khác' ||
        normalized === 'khac'
    ) {
        return 'Khác';
    }
    return stringValue(value) || 'Khác';
}

function formatCreatedAt(iso: string | undefined): string {
    if (!iso) return '--/----';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
    return d.toLocaleDateString('vi-VN');
}

function mapMemberToCard(member: any, index: number): any {
    const p = member?.profile ?? {};
    const h = member?.health_profile ?? {};
    const fullName =
        p.full_name ?? member?.full_name ?? member?.name ?? 'Thành viên';
    const parts = fullName.split(/\s+/).filter(Boolean);
    const initials =
        parts.length >= 2
            ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
            : fullName.slice(0, 2).toUpperCase() || 'TV';

    const apiRoleRaw = member?.role;
    const apiRole =
        typeof apiRoleRaw === 'string' ? apiRoleRaw.toUpperCase() : 'MEMBER';

    let displayRole =
        member?.relation_role ??
        (apiRole === 'OWNER'
            ? 'Chủ gia đình'
            : apiRole === 'ADMIN'
              ? 'Quản trị viên'
              : apiRole === 'MEMBER'
                ? 'Thành viên'
                : String(apiRoleRaw ?? FALLBACK_ROLE));

    const chronic = Array.isArray(h.chronic_conditions)
        ? h.chronic_conditions.filter(Boolean).join(', ')
        : Array.isArray(h.chronic_diseases)
          ? h.chronic_diseases.filter(Boolean).join(', ')
          : '';
    const allergiesStr = Array.isArray(h.allergies)
        ? h.allergies.filter(Boolean).join(', ')
        : '';
    const drugAllergiesStr = Array.isArray(h.drug_allergies)
        ? h.drug_allergies.filter(Boolean).join(', ')
        : allergiesStr;
    const foodAllergiesStr = Array.isArray(h.food_allergies)
        ? h.food_allergies.filter(Boolean).join(', ')
        : '';
    const medicalRecords = Array.isArray(h.medical_records)
        ? h.medical_records
        : [];
    const vaccinations = Array.isArray(h.vaccinations)
        ? h.vaccinations
        : Array.isArray(h.vaccines)
          ? h.vaccines
          : [];
    const medicineInventory = Array.isArray(h.medicine_inventory)
        ? h.medicine_inventory
        : [];
    const healthMetrics = Array.isArray(h.health_metrics)
        ? h.health_metrics
        : [];

    const dob = p.date_of_birth ?? p.dob ?? undefined;

    return {
        id: member?.id ?? `member-${index}`,
        profileId:
            member?.profile_id ??
            member?.profile?.id ??
            member?.health_profile?.profile_id ??
            undefined,
        healthProfileId:
            member?.health_profile_id ??
            member?.health_profile?.id ??
            undefined,
        familyRole: apiRole,
        initials,
        name: fullName,
        role: displayRole,
        age: member?.age ?? ageFromDateString(dob),
        gender: displayGender(p.gender ?? member?.gender),
        city: member?.city ?? p.address?.split?.(',')?.[0] ?? '',
        gradientColors: member?.gradientColors ?? getAvatarGradient(index),
        isOwner: member?.is_owner ?? apiRole === 'OWNER',
        isOnline: member?.is_online ?? false,
        isSelf: member?.is_self ?? false,
        recordCount: member?.record_count ?? 0,
        vaccineDoseCount: member?.vaccine_dose_count ?? 0,
        vaccineTotalCount: member?.vaccine_total_count ?? 0,
        dob: formatDisplayDate(dob),
        height: parseProfileNumber(p.height_cm),
        weight: parseProfileNumber(p.weight_kg),
        address: p.address ?? undefined,
        bloodType: h.blood_type ?? undefined,
        chronicIllness: chronic || undefined,
        allergies: allergiesStr || undefined,
        drugAllergies: drugAllergiesStr || undefined,
        foodAllergies: foodAllergiesStr || undefined,
        importantMedicalNote: h.notes ?? h.important_medical_note ?? undefined,
        emergencyContacts: Array.isArray(h.emergency_contacts)
            ? h.emergency_contacts
            : undefined,
        medicalRecords,
        vaccinations,
        healthMetrics,
        medications: medicineInventory.map((item: any) => ({
            name: item?.medicine_name ?? item?.name ?? 'Thuốc',
            desc: [
                item?.medicine_type,
                item?.dosage_value && item?.dosage_unit
                    ? `${item.dosage_value} ${item.dosage_unit}`
                    : item?.instruction,
                item?.unit,
            ]
                .filter(Boolean)
                .join(' · '),
            type: 'teal',
        })),
    };
}

function mapFamilyToCard(family: any, index: number): FamilyGroup {
    const fallbackFamily =
        FAMILIES[index % Math.max(FAMILIES.length, 1)] ?? FAMILIES[0];
    const rawMembers = Array.isArray(family?.members) ? family.members : [];
    const members = rawMembers.map(mapMemberToCard);
    const currentMemberRaw = rawMembers.find((m: any) => m?.is_self);
    const selfCard = members.find((m: any) => m?.isSelf);

    const apiFamilyRole = currentMemberRaw?.role
        ? String(currentMemberRaw.role).toUpperCase()
        : 'MEMBER';

    const role =
        currentMemberRaw?.relation_role ||
        selfCard?.role ||
        (apiFamilyRole === 'OWNER'
            ? 'Chủ gia đình'
            : apiFamilyRole === 'ADMIN'
              ? 'Quản trị viên'
              : 'Thành viên');

    const count =
        typeof family?.member_count === 'number'
            ? family.member_count
            : members.length;

    return {
        id: family?.id ?? `family-${index}`,
        name: family?.name ?? fallbackFamily?.name ?? 'Gia đình',
        memberCount: count,
        role,
        familyRole: apiFamilyRole,
        roleEmoji: mapRoleEmoji(role),
        gradientColors: family?.gradientColors ??
            fallbackFamily?.gradientColors ?? [
                FAMILY_CARD_COLORS[index % FAMILY_CARD_COLORS.length],
                FAMILY_CARD_COLORS[index % FAMILY_CARD_COLORS.length],
                FAMILY_CARD_COLORS[index % FAMILY_CARD_COLORS.length],
            ],
        iconName:
            family?.iconName ?? fallbackFamily?.iconName ?? 'home-outline',
        createdDate: formatCreatedAt(
            family?.created_at ?? fallbackFamily?.createdDate,
        ),
        members: members.length > 0 ? members : [],
        invite_code: family?.invite_code,
        address: family?.address,
        avatarUrl: family?.avatar_url ?? fallbackFamily?.avatarUrl ?? null,
    };
}

function mapInviteToCard(invite: any, index: number): FamilyInviteSummary {
    const fallbackFamily =
        FAMILIES[index % Math.max(FAMILIES.length, 1)] ?? FAMILIES[0];
    const role = invite?.role ?? invite?.relation_role ?? 'Thành viên';

    return {
        id: String(invite?.id ?? `invite-${index}`),
        familyName:
            invite?.family_name ??
            invite?.family?.name ??
            fallbackFamily?.name ??
            'Gia đình',
        memberCount:
            invite?.member_count ??
            invite?.family?.member_count ??
            fallbackFamily?.memberCount ??
            0,
        inviterName:
            invite?.inviter_name ??
            invite?.invited_by_name ??
            invite?.created_by_name ??
            'Người thân',
        inviterRole:
            invite?.inviter_role ?? invite?.created_by_role ?? 'Chủ gia đình',
        role,
        roleEmoji: mapRoleEmoji(role),
        invitedAt:
            invite?.invited_at ??
            invite?.created_at ??
            invite?.sent_at ??
            'Vừa xong',
        gradient: (fallbackFamily?.gradientColors?.slice(0, 2) as [
            string,
            string,
        ]) ?? [
            FAMILY_CARD_COLORS[index % FAMILY_CARD_COLORS.length],
            FAMILY_CARD_COLORS[index % FAMILY_CARD_COLORS.length],
        ],
        fullName:
            invite?.full_name ??
            invite?.invitee_full_name ??
            invite?.profile_full_name ??
            null,
    };
}

export function useMyFamiliesQuery() {
    return useQuery({
        queryKey: familyQueryKeys.list(),
        queryFn: async () => {
            const res = await familiesServices.getMyFamilies();
            const families = toArray(res);
            return families.map(mapFamilyToCard);
        },
    });
}

export function useFamilyInvitesQuery(params?: {
    status?: string;
    page?: number;
    limit?: number;
}) {
    const normalizedParams = {
        status: params?.status ?? 'pending',
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
    };

    return useQuery({
        queryKey: familyQueryKeys.invites(normalizedParams),
        queryFn: async () => {
            const res = await familiesServices.getInvites(normalizedParams);
            const invites = toArray(res);
            return invites.map(mapInviteToCard);
        },
    });
}

export function useFamilyQuery(familyId: string) {
    return useQuery({
        queryKey: familyQueryKeys.detail(familyId),
        queryFn: async () => {
            if (!familyId) return null;
            const res = await familiesServices.getFamilyById(familyId);
            return mapFamilyToCard(res?.data || res, 0);
        },
        enabled: !!familyId,
        refetchInterval: FAMILY_SYNC_INTERVAL_MS,
    });
}

export function useFamilyMembersQuery(familyId: string) {
    return useQuery({
        queryKey: familyQueryKeys.members(familyId),
        queryFn: async () => {
            if (!familyId) return [];
            const res = await familiesServices.getMembers(familyId);
            const members = toArray(res);
            return members.map(mapMemberToCard);
        },
        enabled: !!familyId,
        refetchInterval: FAMILY_SYNC_INTERVAL_MS,
    });
}

export function useFamilyMedicineInventoryQuery(familyId: string) {
    return useQuery({
        queryKey: familyQueryKeys.medicineInventory(familyId),
        queryFn: async () => {
            if (!familyId) return [];
            const res = await familiesServices.getMedicineInventory(familyId);
            return toArray(res);
        },
        enabled: !!familyId,
        refetchInterval: FAMILY_SYNC_INTERVAL_MS,
    });
}

export function useFamilyProfilesQuery(familyId: string) {
    return useQuery({
        queryKey: familyQueryKeys.profiles(familyId),
        queryFn: async () => {
            if (!familyId) return [];
            const res = await familiesServices.getProfiles(familyId);
            return toArray(res);
        },
        enabled: !!familyId,
        refetchInterval: FAMILY_SYNC_INTERVAL_MS,
    });
}
