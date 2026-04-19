import apiClient from '../api/client';

export type ProfileScope = 'all' | 'without_family' | 'with_family';

export type CreatePersonalProfilePayload = {
    full_name: string;
    dob?: string | null;
    gender?: string | null;
    height_cm?: string | null;
    weight_kg?: string | null;
    address?: string | null;
    avatar_url?: string | null;
};
export type PatchMyProfilePayload = Partial<CreatePersonalProfilePayload>;

export type PatchMyUserPayload = {
    phone_number?: string | null;
};

export type PatchMyHealthProfilePayload = {
    blood_type?: string | null;
    chronic_diseases?: string[] | null;
    allergies?: string[] | null;
    drug_allergies?: string[] | null;
    food_allergies?: string[] | null;
    emergency_contact?: string | null;
    notes?: string | null;
    health_metrics?: Record<string, unknown>[] | null;
};

export type UserMeResponse = {
    user: {
        id: string;
        email: string;
        status: string;
        created_at: string;
        google_id?: string;
        phone_number: string;
        deleted_at?: string;
    };
    profile: {
        id: string;
        owner_user_id: string;
        linked_user_id?: string;
        full_name: string;
        dob: string;
        gender: string;
        height_cm: string;
        weight_kg: string;
        address: string;
        avatar_url?: string;
        status: string;
        created_at: string;
        updated_at: string;
        deleted_at?: string;
    };
    health_profile: {
        profile_id: string;
        blood_type: string;
        chronic_diseases?: string[];
        allergies?: string[];
        drug_allergies?: string[];
        food_allergies?: string[];
        emergency_contacts?: {
            name: string;
            phone: string;
            relationship: string;
        }[];
        notes?: string;
        updated_at: string;
    };
    profiles?: any[];
};

export const userService = {
    getMe: async () => {
        const res = await apiClient.get<UserMeResponse>('/users/me', {
            timeout: 60000,
        });
        return res.data;
    },
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
        // console.log('Payload la: ', payload);

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
    patchMyUser: async (payload: PatchMyUserPayload) => {
        const res = await apiClient.patch('/users/me', payload);
        return res.data;
    },
    patchMyHealthProfile: async (
        profileId: string,
        payload: PatchMyHealthProfilePayload,
    ) => {
        const res = await apiClient.patch(
            `/profiles/${profileId}/health`,
            payload,
        );
        return res.data;
    },
};
