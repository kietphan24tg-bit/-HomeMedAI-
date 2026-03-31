export const meQueryKeys = {
    all: ['me'] as const,
    overview: () => [...meQueryKeys.all, 'overview'] as const,
    vaccinations: () => [...meQueryKeys.all, 'vaccinations'] as const,
    medicalRecords: () => [...meQueryKeys.all, 'medical-records'] as const,
};
