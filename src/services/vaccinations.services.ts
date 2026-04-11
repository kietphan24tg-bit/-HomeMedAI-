import apiClient from '../api/client';

export interface VaccinationDosePayload {
    dose_index: number;
    administered_at?: string;
    scheduled_at?: string;
    location?: string;
    proof_url?: string;
}

export const vaccinationServices = {
    // Get all vaccine recommendations
    getVaccinationRecommendations: async () => {
        const res = await apiClient.get('/vaccination-recommendations');
        return res.data;
    },

    // Get vaccinations for a profile
    getProfileVaccinations: async (profileId: string) => {
        const res = await apiClient.get(`/profiles/${profileId}/vaccinations`);
        return res.data;
    },

    // Subscribe to a vaccine
    subscribeToVaccine: async (profileId: string, recommendationId: string) => {
        const res = await apiClient.post(
            `/profiles/${profileId}/vaccinations`,
            {
                recommendation_id: recommendationId,
            },
        );
        return res.data;
    },

    // Get a specific vaccination subscription
    getUserVaccination: async (userVaccinationId: string) => {
        const res = await apiClient.get(
            `/user-vaccinations/${userVaccinationId}`,
        );
        return res.data;
    },

    // Update vaccination subscription status
    updateUserVaccination: async (
        userVaccinationId: string,
        status: string,
    ) => {
        const res = await apiClient.patch(
            `/user-vaccinations/${userVaccinationId}`,
            {
                status,
            },
        );
        return res.data;
    },

    // Get doses for a vaccination
    getVaccinationDoses: async (userVaccinationId: string) => {
        const res = await apiClient.get(
            `/user-vaccinations/${userVaccinationId}/doses`,
        );
        return res.data;
    },

    // Record a vaccine dose
    addVaccinationDose: async (
        userVaccinationId: string,
        payload: VaccinationDosePayload,
    ) => {
        const res = await apiClient.post(
            `/user-vaccinations/${userVaccinationId}/doses`,
            payload,
        );
        return res.data;
    },

    // Get a specific dose
    getVaccinationDose: async (doseId: string) => {
        const res = await apiClient.get(`/vaccination-doses/${doseId}`);
        return res.data;
    },

    // Update a dose
    updateVaccinationDose: async (
        doseId: string,
        payload: Partial<VaccinationDosePayload>,
    ) => {
        const res = await apiClient.patch(
            `/vaccination-doses/${doseId}`,
            payload,
        );
        return res.data;
    },

    // Delete a dose
    deleteVaccinationDose: async (doseId: string) => {
        const res = await apiClient.delete(`/vaccination-doses/${doseId}`);
        return res.data;
    },
};
