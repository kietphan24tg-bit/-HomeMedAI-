import { useEffect, useState } from 'react';
import { FAMILIES } from '@/src/data/family-data';
import { familiesServices } from '@/src/services/families.services';
import type { FamilyOption } from './home.types';

const FALLBACK_ROLE = 'Thành viên';

export function useHomeFamilies(mode: 'personal' | 'family') {
    const [familyOptions, setFamilyOptions] = useState<FamilyOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await familiesServices.getMyFamilies();
            const families = data ? data : [];

            const options = families.map((family: any, index: number) => {
                const members = Array.isArray(family?.members)
                    ? family.members
                    : [];
                const currentMember = members.find(
                    (member: any) => member.is_self,
                );
                const fallbackFamily = FAMILIES[index];

                return {
                    id: family?.id ?? `family-${index}`,
                    name: family?.name ?? 'Gia dình',
                    numberOfMembers: members.length,
                    role:
                        currentMember?.relation_role ||
                        currentMember?.role ||
                        FALLBACK_ROLE,
                    gradientColors: fallbackFamily?.gradientColors,
                    iconName: fallbackFamily?.iconName,
                };
            });

            setFamilyOptions(options);
        } catch (fetchError) {
            console.error('Error fetching families:', fetchError);
            setError('Không tải được danh sách gia đình.');
            setFamilyOptions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refetch();
    }, [mode]);

    return {
        familyOptions,
        isLoading,
        error,
        refetch,
    };
}
