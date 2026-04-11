import { useQuery } from '@tanstack/react-query';
import { vaccinationQueryKeys } from './queryKeys';
import { vaccinationServices } from '../../services/vaccinations.services';

export function useVaccinationRecommendationsQuery() {
    return useQuery({
        queryKey: vaccinationQueryKeys.recommendations(),
        queryFn: () => vaccinationServices.getVaccinationRecommendations(),
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useProfileVaccinationsQuery(profileId: string) {
    return useQuery({
        queryKey: vaccinationQueryKeys.profileVaccinations(profileId),
        queryFn: () => vaccinationServices.getProfileVaccinations(profileId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}

export function useUserVaccinationQuery(userVaccinationId: string | null) {
    return useQuery({
        queryKey: userVaccinationId
            ? vaccinationQueryKeys.userVaccination(userVaccinationId)
            : ['disabled'],
        queryFn: () =>
            userVaccinationId
                ? vaccinationServices.getUserVaccination(userVaccinationId)
                : null,
        enabled: !!userVaccinationId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
    });
}

export function useVaccinationDosesQuery(userVaccinationId: string) {
    return useQuery({
        queryKey: vaccinationQueryKeys.doses(userVaccinationId),
        queryFn: () =>
            vaccinationServices.getVaccinationDoses(userVaccinationId),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
    });
}
