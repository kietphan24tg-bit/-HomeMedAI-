export type CurrentUserAccount = {
    id?: string;
    email?: string | null;
    phone_number?: string | null;
    status?: string | null;
    created_at?: string | null;
    google_id?: string | null;
    [key: string]: unknown;
};

export type ProfileLike = Record<string, unknown> | null;
export type VaccinationLike = Record<string, unknown>;
export type MedicalRecordLike = Record<string, unknown>;

export type HealthProfileLike =
    | ({
          vaccines?: VaccinationLike[];
          vaccinations?: VaccinationLike[];
          medical_records?: MedicalRecordLike[];
      } & Record<string, unknown>)
    | null;

export type MeOverview = {
    user: CurrentUserAccount | null;
    profile: ProfileLike;
    health_profile: HealthProfileLike;
    post_login_flow_completed: boolean;
};

export function normalizeMeOverview(payload: unknown): MeOverview {
    if (payload && typeof payload === 'object' && 'user' in payload) {
        const overview = payload as Partial<MeOverview> &
            Record<string, unknown>;
        return {
            user:
                (overview.user as CurrentUserAccount | null | undefined) ??
                null,
            profile: (overview.profile as ProfileLike | undefined) ?? null,
            health_profile:
                (overview.health_profile as HealthProfileLike | undefined) ??
                null,
            post_login_flow_completed:
                typeof overview.post_login_flow_completed === 'boolean'
                    ? overview.post_login_flow_completed
                    : false,
        };
    }

    return {
        user: (payload as CurrentUserAccount | null) ?? null,
        profile: null,
        health_profile: null,
        post_login_flow_completed: false,
    };
}

export function getVaccinationsFromOverview(
    overview: MeOverview | null | undefined,
): VaccinationLike[] {
    const healthProfile = overview?.health_profile;

    if (!healthProfile) {
        return [];
    }

    const vaccinations = healthProfile.vaccinations;
    if (Array.isArray(vaccinations)) {
        return vaccinations;
    }

    const vaccines = healthProfile.vaccines;
    return Array.isArray(vaccines) ? vaccines : [];
}

export function getMedicalRecordsFromOverview(
    overview: MeOverview | null | undefined,
): MedicalRecordLike[] {
    const healthProfile = overview?.health_profile;
    const medicalRecords = healthProfile?.medical_records;
    return Array.isArray(medicalRecords) ? medicalRecords : [];
}
