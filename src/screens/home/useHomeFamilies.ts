import { useMemo } from 'react';
import { useMyFamiliesQuery } from '@/src/features/family/queries';
import type { FamilyOption } from './home.types';

export function useHomeFamilies(mode: 'personal' | 'family') {
    const {
        data: families = [],
        isLoading,
        isError,
        refetch,
    } = useMyFamiliesQuery();

    const familyOptions = useMemo<FamilyOption[]>(() => {
        return families.map((family) => ({
            id: family.id,
            name: family.name,
            numberOfMembers: family.memberCount,
            role: family.role,
            gradientColors: family.gradientColors,
            iconName: family.iconName,
        }));
    }, [families]);

    return {
        familyOptions,
        isLoading,
        error: isError ? 'Kh�ng t?i du?c danh s�ch gia d�nh.' : null,
        refetch: async () => {
            await refetch();
        },
        mode,
    };
}
