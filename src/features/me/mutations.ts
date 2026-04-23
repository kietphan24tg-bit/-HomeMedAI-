import { useMutation } from '@tanstack/react-query';
import { syncFamilyQueries } from '@/src/features/family/sync';
import { appQueryClient } from '@/src/lib/query-client';
import {
    userService,
    type CreateHealthMetricReadingPayload,
    type CreatePersonalProfilePayload,
    type PatchMyHealthProfilePayload,
    type PatchMyProfilePayload,
    type PatchMyUserPayload,
} from '@/src/services/user.services';
import { meQueryKeys } from './queryKeys';
import type { MeOverview } from './types';

type UpsertMyProfileInput = {
    profileId: string | null;
    payload: CreatePersonalProfilePayload;
};

type CreateMyHealthMetricReadingInput = {
    profileId: string;
    payload: CreateHealthMetricReadingPayload;
};

function toProfileLikePayload(payload: Record<string, unknown>) {
    return {
        ...payload,
    } as Record<string, unknown>;
}

function updateOverviewProfileCache(
    previous: MeOverview | undefined,
    nextProfile: Record<string, unknown>,
): MeOverview | undefined {
    if (!previous) {
        return previous;
    }

    const mergedProfile = {
        ...((previous.profile as Record<string, unknown> | null) ?? {}),
        ...nextProfile,
    };

    return {
        ...previous,
        profile: mergedProfile,
    };
}

function updateOverviewUserCache(
    previous: MeOverview | undefined,
    nextUser: Record<string, unknown>,
): MeOverview | undefined {
    if (!previous) {
        return previous;
    }

    const mergedUser = {
        ...((previous.user as Record<string, unknown> | null) ?? {}),
        ...nextUser,
    };

    return {
        ...previous,
        user: mergedUser,
    };
}

function updateOverviewHealthProfileCache(
    previous: MeOverview | undefined,
    nextHealthProfile: Record<string, unknown>,
): MeOverview | undefined {
    if (!previous) {
        return previous;
    }

    const mergedHealthProfile = {
        ...((previous.health_profile as Record<string, unknown> | null) ?? {}),
        ...nextHealthProfile,
    };

    return {
        ...previous,
        health_profile: mergedHealthProfile,
        profiles: previous.profiles?.map((entry) => {
            const profileId =
                entry.profile && typeof entry.profile === 'object'
                    ? (entry.profile as Record<string, unknown>).id
                    : null;
            const healthProfileId =
                mergedHealthProfile.profile_id ?? previous.profile?.id;

            if (profileId && profileId === healthProfileId) {
                return {
                    ...entry,
                    health_profile: mergedHealthProfile,
                };
            }

            return entry;
        }),
    };
}

function extractHealthProfileResponse(response: unknown) {
    if (!response || typeof response !== 'object') {
        return null;
    }

    const record = response as Record<string, unknown>;
    if (record.health_profile && typeof record.health_profile === 'object') {
        return record.health_profile as Record<string, unknown>;
    }

    if (record.profile_id || record.blood_type || record.updated_at) {
        return record;
    }

    return null;
}

function extractUserResponse(response: unknown) {
    if (!response || typeof response !== 'object') {
        return null;
    }

    const record = response as Record<string, unknown>;
    if (record.user && typeof record.user === 'object') {
        return record.user as Record<string, unknown>;
    }

    if (record.id || record.email || record.phone_number) {
        return record;
    }

    return null;
}

function extractHealthMetricReadingResponse(response: unknown) {
    if (!response || typeof response !== 'object') {
        return null;
    }

    const record = response as Record<string, unknown>;
    if (
        record.health_metric_reading &&
        typeof record.health_metric_reading === 'object'
    ) {
        return record.health_metric_reading as Record<string, unknown>;
    }

    if (record.metric_type || record.measured_at || record.id) {
        return record;
    }

    return null;
}

function updateOverviewHealthMetricsCache(
    previous: MeOverview | undefined,
    nextMetric: Record<string, unknown>,
): MeOverview | undefined {
    if (!previous) {
        return previous;
    }

    const previousHealthProfile =
        (previous.health_profile as Record<string, unknown> | null) ?? {};
    const previousMetrics = Array.isArray(previousHealthProfile.health_metrics)
        ? previousHealthProfile.health_metrics.filter(
              (item): item is Record<string, unknown> =>
                  !!item && typeof item === 'object',
          )
        : [];
    const nextMetricId =
        typeof nextMetric.id === 'string' ? nextMetric.id : undefined;
    const nextMeasuredAt =
        typeof nextMetric.measured_at === 'string'
            ? nextMetric.measured_at
            : undefined;
    const nextMetricType =
        typeof nextMetric.metric_type === 'string'
            ? nextMetric.metric_type
            : undefined;

    const mergedMetrics = [
        nextMetric,
        ...previousMetrics.filter((item) => {
            if (nextMetricId && item.id === nextMetricId) {
                return false;
            }

            return !(
                !nextMetricId &&
                item.metric_type === nextMetricType &&
                item.measured_at === nextMeasuredAt
            );
        }),
    ];

    return updateOverviewHealthProfileCache(previous, {
        ...previousHealthProfile,
        profile_id:
            previousHealthProfile.profile_id ??
            nextMetric.profile_id ??
            previous.profile?.id,
        health_metrics: mergedMetrics,
    });
}

export function useCreateMyProfileMutation() {
    return useMutation({
        mutationFn: (payload: CreatePersonalProfilePayload) =>
            userService.createPersonalProfile(payload),
        onSuccess: () => {
            syncFamilyQueries();
        },
    });
}

export function usePatchMyProfileMutation() {
    return useMutation({
        mutationFn: ({
            profileId,
            payload,
        }: {
            profileId: string;
            payload: PatchMyProfilePayload;
        }) => userService.patchMyProfile(profileId, payload),
        onSuccess: (response, variables) => {
            const serverProfile =
                response && typeof response === 'object'
                    ? (response as Record<string, unknown>)
                    : null;
            const fallbackProfile = {
                ...toProfileLikePayload(variables.payload),
                id: variables.profileId,
            };
            const nextProfile = serverProfile ?? fallbackProfile;

            appQueryClient.setQueryData(
                meQueryKeys.overview(),
                (old: MeOverview | undefined) =>
                    updateOverviewProfileCache(old, nextProfile),
            );
            appQueryClient.invalidateQueries({
                queryKey: meQueryKeys.overview(),
            });
            syncFamilyQueries();
        },
    });
}

export function usePatchMyUserMutation() {
    return useMutation({
        mutationFn: (payload: PatchMyUserPayload) =>
            userService.patchMyUser(payload),
        onMutate: async (payload) => {
            await appQueryClient.cancelQueries({
                queryKey: meQueryKeys.overview(),
            });

            const previousOverview = appQueryClient.getQueryData<MeOverview>(
                meQueryKeys.overview(),
            );

            appQueryClient.setQueryData(
                meQueryKeys.overview(),
                (old: MeOverview | undefined) =>
                    updateOverviewUserCache(old, payload),
            );

            return { previousOverview };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousOverview) {
                appQueryClient.setQueryData(
                    meQueryKeys.overview(),
                    context.previousOverview,
                );
            }
        },
        onSuccess: (response, variables) => {
            const serverUser = extractUserResponse(response);
            const nextUser = serverUser
                ? {
                      ...variables,
                      ...serverUser,
                  }
                : variables;

            appQueryClient.setQueryData(
                meQueryKeys.overview(),
                (old: MeOverview | undefined) =>
                    updateOverviewUserCache(old, nextUser),
            );
            appQueryClient.invalidateQueries({
                queryKey: meQueryKeys.overview(),
            });
            syncFamilyQueries();
        },
    });
}

export function usePatchMyHealthProfileMutation() {
    return useMutation({
        mutationFn: ({
            profileId,
            payload,
        }: {
            profileId: string;
            payload: PatchMyHealthProfilePayload;
        }) => userService.patchMyHealthProfile(profileId, payload),
        onMutate: (variables) => {
            const optimisticHealthProfile = {
                ...variables.payload,
                profile_id: variables.profileId,
            };
            appQueryClient.setQueryData(
                meQueryKeys.overview(),
                (old: MeOverview | undefined) =>
                    updateOverviewHealthProfileCache(
                        old,
                        optimisticHealthProfile,
                    ),
            );
        },
        onSuccess: (response, variables) => {
            const serverHealthProfile = extractHealthProfileResponse(response);
            const fallbackHealthProfile = {
                ...variables.payload,
                profile_id: variables.profileId,
            };
            const nextHealthProfile = serverHealthProfile
                ? {
                      ...serverHealthProfile,
                      ...fallbackHealthProfile,
                  }
                : fallbackHealthProfile;

            appQueryClient.setQueryData(
                meQueryKeys.overview(),
                (old: MeOverview | undefined) =>
                    updateOverviewHealthProfileCache(old, nextHealthProfile),
            );
            appQueryClient.invalidateQueries({
                queryKey: meQueryKeys.overview(),
            });
            syncFamilyQueries();
        },
    });
}

export function useCreateMyHealthMetricReadingMutation() {
    return useMutation({
        mutationFn: ({
            profileId,
            payload,
        }: CreateMyHealthMetricReadingInput) =>
            userService.createHealthMetricReading(profileId, payload),
        onMutate: async (variables) => {
            await appQueryClient.cancelQueries({
                queryKey: meQueryKeys.overview(),
            });

            const previousOverview = appQueryClient.getQueryData<MeOverview>(
                meQueryKeys.overview(),
            );
            const optimisticMetric = {
                ...variables.payload,
                id: `temp-${Date.now()}`,
                profile_id: variables.profileId,
                status: variables.payload.status ?? 'Bình thường',
            };

            appQueryClient.setQueryData(
                meQueryKeys.overview(),
                (old: MeOverview | undefined) =>
                    updateOverviewHealthMetricsCache(old, optimisticMetric),
            );

            return { previousOverview };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousOverview) {
                appQueryClient.setQueryData(
                    meQueryKeys.overview(),
                    context.previousOverview,
                );
            }
        },
        onSuccess: (response, variables) => {
            const serverMetric = extractHealthMetricReadingResponse(response);
            const fallbackMetric = {
                ...variables.payload,
                profile_id: variables.profileId,
                status: variables.payload.status ?? 'Bình thường',
            };
            const nextMetric = serverMetric
                ? {
                      ...fallbackMetric,
                      ...serverMetric,
                  }
                : fallbackMetric;

            appQueryClient.setQueryData(
                meQueryKeys.overview(),
                (old: MeOverview | undefined) =>
                    updateOverviewHealthMetricsCache(old, nextMetric),
            );
            appQueryClient.invalidateQueries({
                queryKey: meQueryKeys.overview(),
            });
            syncFamilyQueries();
        },
    });
}

export function useUpsertMyProfileMutation() {
    const createMutation = useCreateMyProfileMutation();
    const patchMutation = usePatchMyProfileMutation();

    const mutation = useMutation({
        mutationFn: async ({ profileId, payload }: UpsertMyProfileInput) => {
            if (!profileId) {
                return createMutation.mutateAsync(payload);
            }

            return patchMutation.mutateAsync({ profileId, payload });
        },
        onSuccess: (response, variables) => {
            const serverProfile =
                response && typeof response === 'object'
                    ? (response as Record<string, unknown>)
                    : null;
            const fallbackProfile = {
                ...toProfileLikePayload(variables.payload),
                id: variables.profileId,
            };
            const nextProfile = serverProfile ?? fallbackProfile;

            appQueryClient.setQueryData(
                meQueryKeys.overview(),
                (old: MeOverview | undefined) =>
                    updateOverviewProfileCache(old, nextProfile),
            );
            appQueryClient.invalidateQueries({
                queryKey: meQueryKeys.overview(),
            });
        },
    });

    return {
        ...mutation,
        isPending:
            mutation.isPending ||
            createMutation.isPending ||
            patchMutation.isPending,
    };
}
