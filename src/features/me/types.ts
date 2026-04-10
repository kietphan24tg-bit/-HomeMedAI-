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

function hasObjectData(value: unknown): boolean {
    return (
        !!value && typeof value === 'object' && Object.keys(value).length > 0
    );
}

function inferPostLoginCompleted(overview: Record<string, unknown>): boolean {
    const profile = overview.profile;
    const profiles = overview.profiles;
    const healthProfile = overview.health_profile;

    if (Array.isArray(profiles) && profiles.length > 0) {
        return true;
    }

    if (hasObjectData(profile)) {
        return true;
    }

    if (!hasObjectData(healthProfile)) {
        return false;
    }

    const health = healthProfile as Record<string, unknown>;
    return Boolean(
        health.profile_id ||
        health.id ||
        (Array.isArray(health.medical_records) &&
            health.medical_records.length > 0) ||
        (Array.isArray(health.vaccinations) &&
            health.vaccinations.length > 0) ||
        (Array.isArray(health.vaccines) && health.vaccines.length > 0),
    );
}

export function normalizeMeOverview(payload: unknown): MeOverview {
    if (payload && typeof payload === 'object' && 'user' in payload) {
        const overview = payload as Partial<MeOverview> &
            Record<string, unknown>;
        const explicitCompleted = overview.post_login_flow_completed;
        const inferredCompleted = inferPostLoginCompleted(overview);

        return {
            user:
                (overview.user as CurrentUserAccount | null | undefined) ??
                null,
            profile: (overview.profile as ProfileLike | undefined) ?? null,
            health_profile:
                (overview.health_profile as HealthProfileLike | undefined) ??
                null,
            post_login_flow_completed:
                typeof explicitCompleted === 'boolean'
                    ? explicitCompleted || inferredCompleted
                    : inferredCompleted,
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
