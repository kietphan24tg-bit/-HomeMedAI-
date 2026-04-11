export const medicalRecordsQueryKeys = {
    all: ['medicalRecords'] as const,
    list: (profileId: string) =>
        [...medicalRecordsQueryKeys.all, 'list', profileId] as const,
    detail: (recordId: string) =>
        [...medicalRecordsQueryKeys.all, 'detail', recordId] as const,
    attachments: (recordId: string) =>
        [...medicalRecordsQueryKeys.all, 'attachments', recordId] as const,
};
