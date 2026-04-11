export const vaccinationQueryKeys = {
    all: ['vaccinations'] as const,
    recommendations: () =>
        [...vaccinationQueryKeys.all, 'recommendations'] as const,
    profileVaccinations: (profileId: string) =>
        [...vaccinationQueryKeys.all, 'profile', profileId] as const,
    userVaccination: (userVaccinationId: string) =>
        [...vaccinationQueryKeys.all, 'user', userVaccinationId] as const,
    doses: (userVaccinationId: string) =>
        [...vaccinationQueryKeys.all, 'doses', userVaccinationId] as const,
};
