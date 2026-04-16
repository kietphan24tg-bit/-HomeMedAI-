import apiClient from '../api/client';

export type ProfileScope = 'all' | 'without_family' | 'with_family';

export type CreatePersonalProfilePayload = {
    full_name: string;
    dob?: string | null;
    gender?: string | null;
    height_cm?: number | null;
    weight_kg?: number | null;
    address?: string | null;
    avatar_url?: string | null;
};

export type PatchMyProfilePayload = Partial<CreatePersonalProfilePayload>;

export const userService = {
    getMyProfiles: async (profile_scope: ProfileScope = 'all') => {
        const res = await apiClient.get('/users/me/profiles', {
            params: { profile_scope },
        });
        return res.data;
    },
    getProfilesWithoutFamily: async () => {
        const res = await apiClient.get('/users/me/profiles', {
            params: { profile_scope: 'without_family' },
        });
        return res.data;
    },
    getProfilesWithFamily: async () => {
        const res = await apiClient.get('/users/me/profiles', {
            params: { profile_scope: 'with_family' },
        });
        return res.data;
    },
    createPersonalProfile: async (payload: CreatePersonalProfilePayload) => {
        const res = await apiClient.post('/users/me/personal-profile', payload);
        return res.data;
    },
    patchMyProfile: async (
        profileId: string,
        payload: PatchMyProfilePayload,
    ) => {
        const res = await apiClient.patch(`/profiles/${profileId}`, payload);
        return res.data;
    },
};
