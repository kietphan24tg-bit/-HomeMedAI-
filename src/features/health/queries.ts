import { useQuery } from '@tanstack/react-query';
import { healthQueryKeys } from './queryKeys';
import { healthProfileServices } from '../../services/healthProfile.services';

export function useHealthProfileQuery(profileId: string) {
    return useQuery({
        queryKey: healthQueryKeys.profile(profileId),
        queryFn: () => healthProfileServices.getHealthProfile(profileId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}

export function useProfileQuery(profileId: string | null) {
    return useQuery({
        queryKey: profileId ? healthQueryKeys.detail(profileId) : ['disabled'],
        queryFn: () =>
            profileId ? healthProfileServices.getProfile(profileId) : null,
        enabled: !!profileId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
    });
}
