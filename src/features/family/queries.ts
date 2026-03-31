import { useQuery } from '@tanstack/react-query';
import { FAMILIES } from '@/src/data/family-data';
import { familiesServices } from '@/src/services/families.services';
import type { FamilyGroup } from '@/src/types/family';
import { familyQueryKeys } from './queryKeys';

const FALLBACK_ROLE = 'Thành viên';
const FALLBACK_ROLE_EMOJI = '👥';

function toArray(data: unknown): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as any)?.data)) return (data as any).data;
    if (Array.isArray((data as any)?.families)) return (data as any).families;
    return [];
}

function mapRoleEmoji(role: string) {
    const normalized = role.toLowerCase();
    if (normalized.includes('chủ')) return '👑';
    if (normalized.includes('cha') || normalized.includes('ba')) return '👨';
    if (normalized.includes('mẹ')) return '👩';
    if (normalized.includes('con')) return '🧒';
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
        name: family?.name ?? fallbackFamily?.name ?? 'Gia đình',
        memberCount: family?.member_count ?? members.length ?? 0,
        role,
        roleEmoji: mapRoleEmoji(role),
        gradientColors: family?.gradientColors ??
            fallbackFamily?.gradientColors ?? ['#1E3A5F', '#2563EB', '#0D9488'],
        iconName:
            family?.iconName ?? fallbackFamily?.iconName ?? 'home-outline',
        createdDate:
            family?.created_at ?? fallbackFamily?.createdDate ?? '--/----',
        members: fallbackFamily?.members ?? [],
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
