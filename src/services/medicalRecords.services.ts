import apiClient from '../api/client';

export type MedicalRecordItem = {
    id: string;
    profile_id: string;
    title?: string | null;
    diagnosis_name?: string | null;
    doctor_name?: string | null;
    hospital_name?: string | null;
    visit_date?: string | null;
    specialty?: string | null;
    symptoms?: string[] | null;
    test_results?: string | null;
    doctor_advice?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
};

export const medicalRecordsQueryKeys = {
    all: ['medical-records'] as const,
    byProfile: (profileId: string) =>
        [...medicalRecordsQueryKeys.all, 'profile', profileId] as const,
};

export const medicalRecordsService = {
    listForProfile: async (profileId: string) => {
        const res = await apiClient.get<MedicalRecordItem[]>(
            `/profiles/${profileId}/medical-records`,
        );
        return res.data;
    },
    create: async (
        profileId: string,
        body: {
            title?: string | null;
            diagnosis_name?: string | null;
            doctor_name?: string | null;
            hospital_name?: string | null;
            visit_date?: string | null;
            specialty?: string | null;
            symptoms?: string[] | null;
            test_results?: string | null;
            doctor_advice?: string | null;
            notes?: string | null;
        },
    ) => {
        const res = await apiClient.post<MedicalRecordItem>(
            `/profiles/${profileId}/medical-records`,
            body,
        );
        return res.data;
    },
};
