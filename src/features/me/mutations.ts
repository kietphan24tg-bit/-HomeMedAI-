import { useMutation } from '@tanstack/react-query';
import { appQueryClient } from '@/src/lib/query-client';
import {
    userService,
    type CreatePersonalProfilePayload,
    type PatchMyHealthProfilePayload,
    type PatchMyProfilePayload,
} from '@/src/services/user.services';
import { meQueryKeys } from './queryKeys';
import type { MeOverview } from './types';

type UpsertMyProfileInput = {
    profileId: string | null;
    payload: CreatePersonalProfilePayload;
};

function toProfileLikePayload(payload: CreatePersonalProfilePayload) {
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

export function useCreateMyProfileMutation() {
    return useMutation({
        mutationFn: (payload: CreatePersonalProfilePayload) =>
            userService.createPersonalProfile(payload),
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
        onSuccess: (response, variables) => {
            const serverHealthProfile =
                response && typeof response === 'object'
                    ? (response as Record<string, unknown>)
                    : null;
            const fallbackHealthProfile = {
                ...variables.payload,
                profile_id: variables.profileId,
            };
            const nextHealthProfile =
                serverHealthProfile ?? fallbackHealthProfile;

            appQueryClient.setQueryData(
                meQueryKeys.overview(),
                (old: MeOverview | undefined) =>
                    updateOverviewHealthProfileCache(old, nextHealthProfile),
            );
            appQueryClient.invalidateQueries({
                queryKey: meQueryKeys.overview(),
            });
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
