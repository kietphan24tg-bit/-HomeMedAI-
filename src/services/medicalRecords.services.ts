import apiClient from '../api/client';

export interface CreateMedicalRecordPayload {
    diagnosis_name?: string;
    diagnosis_slug?: string;
    doctor_name?: string;
    hospital_name?: string;
    visit_date?: string;
    specialty?: string;
    notes?: string;
}

export interface UpdateMedicalRecordPayload extends CreateMedicalRecordPayload {}

export interface MedicalAttachmentPayload {
    file_name: string;
    file_type: string;
    file_url: string;
}

export const medicalRecordsServices = {
    // Get all medical records for a profile
    getMedicalRecords: async (profileId: string) => {
        const res = await apiClient.get(
            `/profiles/${profileId}/medical-records`,
        );
        return res.data;
    },

    // Create a new medical record
    createMedicalRecord: async (
        profileId: string,
        payload: CreateMedicalRecordPayload,
    ) => {
        const res = await apiClient.post(
            `/profiles/${profileId}/medical-records`,
            payload,
        );
        return res.data;
    },

    // Get a specific medical record
    getMedicalRecord: async (recordId: string) => {
        const res = await apiClient.get(`/medical-records/${recordId}`);
        return res.data;
    },

    // Update a medical record
    updateMedicalRecord: async (
        recordId: string,
        payload: UpdateMedicalRecordPayload,
    ) => {
        const res = await apiClient.patch(
            `/medical-records/${recordId}`,
            payload,
        );
        return res.data;
    },

    // Delete a medical record (soft delete by default)
    deleteMedicalRecord: async (recordId: string, hard = false) => {
        const res = await apiClient.delete(`/medical-records/${recordId}`, {
            params: { hard },
        });
        return res.data;
    },

    // Get attachments for a medical record
    getMedicalAttachments: async (recordId: string) => {
        const res = await apiClient.get(
            `/medical-records/${recordId}/attachments`,
        );
        return res.data;
    },

    // Add attachment to medical record
    addMedicalAttachment: async (
        recordId: string,
        payload: MedicalAttachmentPayload,
    ) => {
        const res = await apiClient.post(
            `/medical-records/${recordId}/attachments`,
            payload,
        );
        return res.data;
    },

    // Delete attachment
    deleteMedicalAttachment: async (attachmentId: string) => {
        const res = await apiClient.delete(
            `/medical-attachments/${attachmentId}`,
        );
        return res.data;
    },

    // Download medical file
    downloadMedicalFile: async (attachmentId: string) => {
        const res = await apiClient.get(`/files/medical/${attachmentId}`, {
            responseType: 'blob',
        });
        return res.data;
    },
};
