import { useQuery } from '@tanstack/react-query';
import { FAMILIES } from '@/src/data/family-data';
import { familiesServices } from '@/src/services/families.services';
import { gradients } from '@/src/styles/tokens';
import type { FamilyGroup } from '@/src/types/family';
import { familyQueryKeys } from './queryKeys';

const FALLBACK_ROLE = 'Th�nh vi�n';
const FALLBACK_ROLE_EMOJI = '??';

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
    if (normalized.includes('ch?')) return '??';
    if (normalized.includes('cha') || normalized.includes('ba')) return '??';
    if (normalized.includes('m?')) return '??';
    if (normalized.includes('con')) return '??';
    return FALLBACK_ROLE_EMOJI;
}

function mapFamilyToCard(family: any, index: number): FamilyGroup {
    const fallbackFamily =
        FAMILIES[index % Math.max(FAMILIES.length, 1)] ?? FAMILIES[0];
    const members = Array.isArray(family?.members) ? family.members : [];
    const currentMember = members.find((member: any) => member?.is_self);
    const role =
        currentMember?.relation_role ||
        currentMember?.role ||
        family?.my_role ||
        FALLBACK_ROLE;

    return {
        id: family?.id ?? `family-${index}`,
        name: family?.name ?? fallbackFamily?.name ?? 'Gia d�nh',
        memberCount: family?.member_count ?? members.length ?? 0,
        role,
        roleEmoji: mapRoleEmoji(role),
        gradientColors:
            family?.gradientColors ??
            fallbackFamily?.gradientColors ??
            gradients.family,
        iconName:
            family?.iconName ?? fallbackFamily?.iconName ?? 'home-outline',
        createdDate:
            family?.created_at ?? fallbackFamily?.createdDate ?? '--/----',
        members: fallbackFamily?.members ?? [],
    };
}

function mapInviteToCard(invite: any, index: number): FamilyInviteSummary {
    const fallbackFamily =
        FAMILIES[index % Math.max(FAMILIES.length, 1)] ?? FAMILIES[0];
    const role = invite?.role ?? invite?.relation_role ?? 'Th�nh vi�n';

    return {
        id: String(invite?.id ?? `invite-${index}`),
        familyName:
            invite?.family_name ??
            invite?.family?.name ??
            fallbackFamily?.name ??
            'Gia d�nh',
        memberCount:
            invite?.member_count ??
            invite?.family?.member_count ??
            fallbackFamily?.memberCount ??
            0,
        inviterName:
            invite?.inviter_name ??
            invite?.invited_by_name ??
            invite?.created_by_name ??
            'Ngu?i th�n',
        inviterRole:
            invite?.inviter_role ?? invite?.created_by_role ?? 'Ch? gia d�nh',
        role,
        roleEmoji: mapRoleEmoji(role),
        invitedAt:
            invite?.invited_at ??
            invite?.created_at ??
            invite?.sent_at ??
            'V?a xong',
        gradient: (fallbackFamily?.gradientColors?.slice(0, 2) as [
            string,
            string,
        ]) ?? [gradients.family[0], gradients.family[1]],
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
