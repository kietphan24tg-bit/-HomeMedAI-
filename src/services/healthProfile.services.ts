import apiClient from '../api/client';

export interface UpdateHealthProfilePayload {
    blood_type?: string;
    chronic_diseases?: string[];
    allergies?: string[];
    emergency_contact?: string;
    notes?: string;
}

export interface UpdateProfilePayload {
    status?: string;
    [key: string]: any;
}

export interface LinkProfilePayload {
    user_id: string;
}

export const healthProfileServices = {
    // Get health profile for a specific profile
    getHealthProfile: async (profileId: string) => {
        const res = await apiClient.get(`/profiles/${profileId}/health`);
        return res.data;
    },

    // Update health profile
    updateHealthProfile: async (
        profileId: string,
        payload: UpdateHealthProfilePayload,
    ) => {
        const res = await apiClient.patch(
            `/profiles/${profileId}/health`,
            payload,
        );
        return res.data;
    },

    // Get profile details
    getProfile: async (profileId: string) => {
        const res = await apiClient.get(`/profiles/${profileId}`);
        return res.data;
    },

    // Update profile
    updateProfile: async (profileId: string, payload: UpdateProfilePayload) => {
        const res = await apiClient.patch(`/profiles/${profileId}`, payload);
        return res.data;
    },

    // Link profile to user
    linkProfile: async (profileId: string, payload: LinkProfilePayload) => {
        const res = await apiClient.patch(
            `/profiles/${profileId}/link`,
            payload,
        );
        return res.data;
    },

    // Delete profile (soft delete)
    deleteProfile: async (profileId: string) => {
        const res = await apiClient.delete(`/profiles/${profileId}`);
        return res.data;
    },
};
