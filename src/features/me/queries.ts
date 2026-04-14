import {
    queryOptions,
    useQuery,
    type UseQueryOptions,
} from '@tanstack/react-query';
import { meQueryKeys } from './queryKeys';
import { meService } from './service';
import {
    type CurrentUserAccount,
    type HealthProfileLike,
    type MeOverview,
    type ProfileLike,
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

export function useMeOverviewQuery(options?: MeOverviewQueryOptions) {
    return useQuery({
        ...getMeOverviewQueryOptions(),
        ...options,
    });
}

export type MeUserAndProfile = {
    user: CurrentUserAccount | null;
    profile: ProfileLike;
};

function selectMeUserAndProfile(overview: MeOverview): MeUserAndProfile {
    return {
        user: overview.user,
        profile: overview.profile,
    };
}

function selectMeHealthProfile(overview: MeOverview): HealthProfileLike {
    return overview.health_profile;
}

export function useMeUserAndProfileQuery(
    options?: MeOverviewQueryOptions<MeUserAndProfile>,
) {
    return useQuery({
        ...getMeOverviewQueryOptions(),
        select: selectMeUserAndProfile,
        ...options,
    });
}

export function useMeHealthProfileQuery(
    options?: MeOverviewQueryOptions<HealthProfileLike>,
) {
    return useQuery({
        ...getMeOverviewQueryOptions(),
        select: selectMeHealthProfile,
        ...options,
    });
}
