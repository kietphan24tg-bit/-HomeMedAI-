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

export type HealthProfileLike =
    | ({
          vaccines?: Record<string, unknown>[];
          vaccinations?: Record<string, unknown>[];
          medical_records?: Record<string, unknown>[];
      } & Record<string, unknown>)
    | null;

export type MeProfileBundle = {
    profile: ProfileLike;
    health_profile: HealthProfileLike;
};

export type MeOverview = {
    user: CurrentUserAccount | null;
    profile: ProfileLike;
    health_profile: HealthProfileLike;
    profiles?: MeProfileBundle[];
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

function isProfileBundle(value: unknown): value is MeProfileBundle {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const entry = value as Record<string, unknown>;
    return 'profile' in entry || 'health_profile' in entry;
}

function getPrimaryProfileBundle(
    profiles: MeProfileBundle[],
    user: CurrentUserAccount | null,
): MeProfileBundle | null {
    if (!profiles.length) {
        return null;
    }

    const userId = user?.id;
    if (!userId) {
        return profiles[0];
    }

    const linkedEntry = profiles.find((entry) => {
        if (!entry.profile || typeof entry.profile !== 'object') {
            return false;
        }

        const linkedUserId = (entry.profile as Record<string, unknown>)
            .linked_user_id;
        return typeof linkedUserId === 'string' && linkedUserId === userId;
    });

    return linkedEntry ?? profiles[0];
}

export function normalizeMeOverview(payload: unknown): MeOverview {
    if (payload && typeof payload === 'object' && 'user' in payload) {
        const overview = payload as Partial<MeOverview> &
            Record<string, unknown>;
        const explicitCompleted = overview.post_login_flow_completed;
        const user =
            (overview.user as CurrentUserAccount | null | undefined) ?? null;
        const rawProfiles = Array.isArray(overview.profiles)
            ? overview.profiles.filter(isProfileBundle)
            : [];
        const primaryBundle = getPrimaryProfileBundle(rawProfiles, user);
        const profile =
            primaryBundle?.profile ??
            (overview.profile as ProfileLike | undefined) ??
            null;
        const healthProfile =
            primaryBundle?.health_profile ??
            (overview.health_profile as HealthProfileLike | undefined) ??
            null;
        const inferredCompleted = inferPostLoginCompleted({
            ...overview,
            profile,
            health_profile: healthProfile,
            profiles: rawProfiles,
        });

        return {
            user,
            profile,
            health_profile: healthProfile,
            profiles: rawProfiles,
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
