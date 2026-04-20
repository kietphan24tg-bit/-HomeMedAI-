import apiClient from '../api/client';

export type VaccinationRecommendation = {
    id: string;
    code?: string;
    name: string;
    disease_name?: string | null;
    total_doses_required?: number;
};

export type UserVaccination = {
    id: string;
    recommendation_id?: string | null;
    recommendation_name?: string | null;
    recommendation_total_doses?: number;
    doses_administered_count?: number;
    doses?: Record<string, unknown>[];
};

export type VaccinationDose = {
    id: string;
    user_vaccination_id: string;
    dose_index: number;
    administered_at?: string | null;
    scheduled_at?: string | null;
    location?: string | null;
    proof_url?: string | null;
};

export const vaccinationsService = {
    listRecommendations: async () => {
        const res = await apiClient.get<VaccinationRecommendation[]>(
            '/vaccination-recommendations',
        );
        return res.data;
    },

    subscribeProfileVaccination: async (
        profileId: string,
        body: {
            recommendation_id: string;
        },
    ) => {
        const res = await apiClient.post<UserVaccination>(
            `/profiles/${profileId}/vaccinations`,
            body,
        );
        return res.data;
    },

    createDose: async (
        userVaccinationId: string,
        body: {
            dose_index: number;
            administered_at?: string | null;
            scheduled_at?: string | null;
            location?: string | null;
            proof_url?: string | null;
        },
    ) => {
        const res = await apiClient.post<VaccinationDose>(
            `/user-vaccinations/${userVaccinationId}/doses`,
            body,
        );
        return res.data;
    },
};
