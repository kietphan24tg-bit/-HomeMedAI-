export type CurrentUserAccount = {
    id?: string;
    email?: string | null;
    status?: string | null;
    created_at?: string | null;
    google_id?: string | null;
    phone_number?: string | null;
    deleted_at?: string | null;
    [key: string]: unknown;
};

export type MeProfile = {
    id?: string;
    owner_user_id?: string | null;
    linked_user_id?: string | null;
    full_name?: string | null;
    dob?: string | null;
    gender?: string | null;
    height_cm?: string | number | null;
    weight_kg?: string | number | null;
    address?: string | null;
    avatar_url?: string | null;
    status?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
    [key: string]: unknown;
};

export type MeEmergencyContact = {
    name?: string | null;
    phone?: string | null;
    relationship?: string | null;
    [key: string]: unknown;
};

export type MeMedicalRecord = {
    id?: string;
    profile_id?: string;
    created_by?: string | null;
    title?: string | null;
    diagnosis_name?: string | null;
    diagnosis_slug?: string | null;
    doctor_name?: string | null;
    hospital_name?: string | null;
    visit_date?: string | null;
    specialty?: string | null;
    symptoms?: string[];
    test_results?: string | null;
    doctor_advice?: string | null;
    notes?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
    [key: string]: unknown;
};

export type MeVaccinationDose = {
    id?: string;
    user_vaccination_id?: string;
    dose_index?: number;
    administered_at?: string | null;
    scheduled_at?: string | null;
    location?: string | null;
    reaction?: string | null;
    proof_url?: string | null;
    reminder_enabled?: boolean;
    remind_before_value?: number;
    remind_before_unit?: string | null;
    dose_status?: string | null;
    is_overdue?: boolean;
    [key: string]: unknown;
};

export type MeVaccination = {
    id?: string;
    profile_id?: string;
    recommendation_id?: string | null;
    recommendation_name?: string | null;
    recommendation_total_doses?: number;
    user_id?: string | null;
    status?: string | null;
    created_at?: string | null;
    doses_administered_count?: number;
    doses?: MeVaccinationDose[];
    [key: string]: unknown;
};

export type MeMedicineReminder = {
    id?: string;
    medicine_inventory_id?: string;
    enabled?: boolean;
    start_date?: string | null;
    repeat_every_value?: number;
    repeat_every_unit?: string | null;
    active_days?: number[];
    times?: string[];
    remind_before_minutes?: number;
    created_at?: string | null;
    updated_at?: string | null;
    [key: string]: unknown;
};

export type MeMedicineInventoryItem = {
    id?: string;
    profile_id?: string;
    medicine_name?: string | null;
    medicine_type?: string | null;
    expiry_date?: string | null;
    quantity_stock?: string | number | null;
    unit?: string | null;
    min_stock_alert?: string | number | null;
    instruction?: string | null;
    dosage_value?: string | number | null;
    dosage_unit?: string | null;
    dosage_per_use_value?: string | number | null;
    dosage_per_use_unit?: string | null;
    use_tags?: string[];
    storage_location?: string | null;
    expiry_alert_days_before?: number;
    low_stock_alert_enabled?: boolean;
    created_at?: string | null;
    updated_at?: string | null;
    alert_low_stock?: boolean;
    alert_expiring?: boolean;
    alert_expired?: boolean;
    medicine_reminder?: MeMedicineReminder | null;
    [key: string]: unknown;
};

export type MeAppointmentReminder = {
    id?: string;
    profile_id?: string;
    reminder_type?: string | null;
    title?: string | null;
    hospital_name?: string | null;
    department?: string | null;
    appointment_at?: string | null;
    remind_before_value?: number;
    remind_before_unit?: string | null;
    vaccine_name?: string | null;
    dose_number?: number;
    total_doses?: number;
    status?: string | null;
    note?: string | null;
    follow_up_appointment_id?: string | null;
    vaccination_dose_id?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    [key: string]: unknown;
};

export type ProfileLike = MeProfile | Record<string, unknown> | null;

export type HealthProfileLike =
    | ({
          profile_id?: string;
          blood_type?: string | null;
          chronic_diseases?: string[];
          allergies?: string[];
          drug_allergies?: string[];
          food_allergies?: string[];
          emergency_contacts?: MeEmergencyContact[];
          notes?: string | null;
          updated_at?: string | null;
          vaccines?: Record<string, unknown>[];
          vaccinations?: MeVaccination[];
          medical_records?: MeMedicalRecord[];
          medicine_inventory?: MeMedicineInventoryItem[];
          appointment_reminders?: MeAppointmentReminder[];
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
