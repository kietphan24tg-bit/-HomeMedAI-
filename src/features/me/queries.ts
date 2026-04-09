import {
    queryOptions,
    useQuery,
    type UseQueryOptions,
} from '@tanstack/react-query';
import { meQueryKeys } from './queryKeys';
import { meService } from './service';
import {
    getMedicalRecordsFromOverview,
    getVaccinationsFromOverview,
    type MedicalRecordLike,
    type MeOverview,
    type VaccinationLike,
} from './types';

type MeOverviewQueryOptions<TData = MeOverview> = Omit<
    UseQueryOptions<
        MeOverview,
        Error,
        TData,
        ReturnType<typeof meQueryKeys.overview>
    >,
    'queryKey' | 'queryFn'
>;

export function getMeOverviewQueryOptions() {
    return queryOptions({
        queryKey: meQueryKeys.overview(),
        queryFn: meService.getOverview,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 60,
    });
}

export function useMeOverviewQuery(
    options?: MeOverviewQueryOptions,
) {
    return useQuery({
        ...getMeOverviewQueryOptions(),
        ...options,
    });
}

export function useMyVaccinationsQuery(
    options?: MeOverviewQueryOptions<VaccinationLike[]>,
) {
    return useQuery({
        ...getMeOverviewQueryOptions(),
        select: getVaccinationsFromOverview,
        ...options,
    });
}

export function useMyMedicalRecordsQuery(
    options?: MeOverviewQueryOptions<MedicalRecordLike[]>,
) {
    return useQuery({
        ...getMeOverviewQueryOptions(),
        select: getMedicalRecordsFromOverview,
        ...options,
    });
}
