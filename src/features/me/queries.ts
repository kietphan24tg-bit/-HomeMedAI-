import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { meQueryKeys } from './queryKeys';
import { meService } from './service';
import type { MedicalRecordLike, MeOverview, VaccinationLike } from './types';

export function useMeOverviewQuery(
    options?: Omit<UseQueryOptions<MeOverview>, 'queryKey' | 'queryFn'>,
) {
    return useQuery({
        queryKey: meQueryKeys.overview(),
        queryFn: meService.getOverview,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 60,
        ...options,
    });
}

export function useMyVaccinationsQuery(
    options?: Omit<UseQueryOptions<VaccinationLike[]>, 'queryKey' | 'queryFn'>,
) {
    return useQuery({
        queryKey: meQueryKeys.vaccinations(),
        queryFn: meService.getVaccinations,
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 20,
        ...options,
    });
}

export function useMyMedicalRecordsQuery(
    options?: Omit<
        UseQueryOptions<MedicalRecordLike[]>,
        'queryKey' | 'queryFn'
    >,
) {
    return useQuery({
        queryKey: meQueryKeys.medicalRecords(),
        queryFn: meService.getMedicalRecords,
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 20,
        ...options,
    });
}
