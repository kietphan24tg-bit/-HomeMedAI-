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

export type MeHealthMetric = {
    id?: string;
    profile_id?: string;
    metric_type?: 'bp' | 'weight' | 'glucose' | string;
    measured_at?: string | null;
    systolic?: number | string | null;
    diastolic?: number | string | null;
    heart_rate?: number | string | null;
    weight_kg?: number | string | null;
    glucose_mmol_l?: number | string | null;
    status?: string | null;
    notes?: string | null;
    created_at?: string | null;
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
          health_metrics?: MeHealthMetric[];
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

// ============================================================================
// UTILITY FUNCTIONS FOR DATA SANITIZATION
// ============================================================================

const ERROR_PLACEHOLDER = '-- (Không rõ)';

/**
 * Safely parse numeric values from strings or numbers
 * Handles excessively long strings and invalid values
 * Returns null if invalid, number if valid
 */
function safeParseNumeric(value: unknown): number | null {
    // If already a valid number, return it
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    // If it's a string, try to parse it
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return null;

        // Skip if string is too long (likely corrupted data)
        if (trimmed.length > 50) {
            console.warn(
                '[Data Sanitization] Skipping excessively long numeric string:',
                trimmed.substring(0, 50),
            );
            return null;
        }

        const parsed = parseFloat(trimmed);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

/**
 * Format a numeric value for display
 * Returns error placeholder if invalid
 */
function formatNumericDisplay(value: unknown, precision = 1): string {
    const parsed = safeParseNumeric(value);
    if (parsed === null) {
        return ERROR_PLACEHOLDER;
    }
    return parsed.toFixed(precision);
}

/**
 * Sanitize a profile object and fix bad numeric data
 */
function sanitizeProfile(profile: unknown): MeProfile | null {
    if (!profile || typeof profile !== 'object') {
        return null;
    }

    const p = profile as Record<string, unknown>;
    return {
        id: typeof p.id === 'string' ? p.id : undefined,
        owner_user_id:
            typeof p.owner_user_id === 'string' ? p.owner_user_id : undefined,
        linked_user_id:
            typeof p.linked_user_id === 'string' ? p.linked_user_id : undefined,
        full_name: typeof p.full_name === 'string' ? p.full_name : undefined,
        dob: typeof p.dob === 'string' ? p.dob : undefined,
        gender: typeof p.gender === 'string' ? p.gender : undefined,
        // Fix height_cm - convert bad numeric strings
        height_cm: safeParseNumeric(p.height_cm),
        // Fix weight_kg - convert bad numeric strings
        weight_kg: safeParseNumeric(p.weight_kg),
        address: typeof p.address === 'string' ? p.address : undefined,
        avatar_url: typeof p.avatar_url === 'string' ? p.avatar_url : undefined,
        status: typeof p.status === 'string' ? p.status : undefined,
        created_at: typeof p.created_at === 'string' ? p.created_at : undefined,
        updated_at: typeof p.updated_at === 'string' ? p.updated_at : undefined,
        deleted_at: typeof p.deleted_at === 'string' ? p.deleted_at : undefined,
    };
}

/**
 * Sanitize medicine inventory items and fix bad numeric data
 */
function sanitizeMedicineInventory(
    items: unknown[],
): MeMedicineInventoryItem[] {
    if (!Array.isArray(items)) return [];

    return items
        .filter(
            (item): item is Record<string, unknown> =>
                !!item && typeof item === 'object',
        )
        .map((item) => ({
            id: typeof item.id === 'string' ? item.id : undefined,
            profile_id:
                typeof item.profile_id === 'string'
                    ? item.profile_id
                    : undefined,
            medicine_name:
                typeof item.medicine_name === 'string'
                    ? item.medicine_name
                    : undefined,
            medicine_type:
                typeof item.medicine_type === 'string'
                    ? item.medicine_type
                    : undefined,
            expiry_date:
                typeof item.expiry_date === 'string'
                    ? item.expiry_date
                    : undefined,
            // Fix quantity_stock - convert bad numeric strings
            quantity_stock: safeParseNumeric(item.quantity_stock),
            unit: typeof item.unit === 'string' ? item.unit : undefined,
            // Fix min_stock_alert - convert bad numeric strings
            min_stock_alert: safeParseNumeric(item.min_stock_alert),
            instruction:
                typeof item.instruction === 'string'
                    ? item.instruction
                    : undefined,
            // Fix dosage_value - convert bad numeric strings
            dosage_value: safeParseNumeric(item.dosage_value),
            dosage_unit:
                typeof item.dosage_unit === 'string'
                    ? item.dosage_unit
                    : undefined,
            // Fix dosage_per_use_value - convert bad numeric strings
            dosage_per_use_value: safeParseNumeric(item.dosage_per_use_value),
            dosage_per_use_unit:
                typeof item.dosage_per_use_unit === 'string'
                    ? item.dosage_per_use_unit
                    : undefined,
            use_tags: Array.isArray(item.use_tags)
                ? item.use_tags.filter(
                      (tag): tag is string => typeof tag === 'string',
                  )
                : undefined,
            storage_location:
                typeof item.storage_location === 'string'
                    ? item.storage_location
                    : undefined,
            expiry_alert_days_before:
                typeof item.expiry_alert_days_before === 'number'
                    ? item.expiry_alert_days_before
                    : undefined,
            low_stock_alert_enabled:
                typeof item.low_stock_alert_enabled === 'boolean'
                    ? item.low_stock_alert_enabled
                    : undefined,
            created_at:
                typeof item.created_at === 'string'
                    ? item.created_at
                    : undefined,
            updated_at:
                typeof item.updated_at === 'string'
                    ? item.updated_at
                    : undefined,
            alert_low_stock:
                typeof item.alert_low_stock === 'boolean'
                    ? item.alert_low_stock
                    : undefined,
            alert_expiring:
                typeof item.alert_expiring === 'boolean'
                    ? item.alert_expiring
                    : undefined,
            alert_expired:
                typeof item.alert_expired === 'boolean'
                    ? item.alert_expired
                    : undefined,
            medicine_reminder:
                item.medicine_reminder &&
                typeof item.medicine_reminder === 'object'
                    ? (item.medicine_reminder as MeMedicineReminder)
                    : undefined,
        }));
}

/**
 * Sanitize health profile and fix bad numeric data
 */
function sanitizeHealthProfile(healthProfile: unknown): HealthProfileLike {
    if (!healthProfile || typeof healthProfile !== 'object') {
        return null;
    }

    const hp = healthProfile as Record<string, unknown>;
    return {
        profile_id:
            typeof hp.profile_id === 'string' ? hp.profile_id : undefined,
        blood_type:
            typeof hp.blood_type === 'string'
                ? hp.blood_type || null
                : hp.blood_type === null
                  ? null
                  : undefined,
        chronic_diseases: Array.isArray(hp.chronic_diseases)
            ? hp.chronic_diseases.filter(
                  (item): item is string =>
                      typeof item === 'string' && item.trim().length > 0,
              )
            : undefined,
        allergies: Array.isArray(hp.allergies)
            ? hp.allergies.filter(
                  (item): item is string =>
                      typeof item === 'string' && item.trim().length > 0,
              )
            : undefined,
        drug_allergies: Array.isArray(hp.drug_allergies)
            ? hp.drug_allergies.filter(
                  (item): item is string =>
                      typeof item === 'string' && item.trim().length > 0,
              )
            : undefined,
        food_allergies: Array.isArray(hp.food_allergies)
            ? hp.food_allergies.filter(
                  (item): item is string =>
                      typeof item === 'string' && item.trim().length > 0,
              )
            : undefined,
        emergency_contacts: Array.isArray(hp.emergency_contacts)
            ? hp.emergency_contacts.filter(
                  (item): item is MeEmergencyContact =>
                      !!item && typeof item === 'object',
              )
            : undefined,
        notes:
            typeof hp.notes === 'string'
                ? hp.notes || null
                : hp.notes === null
                  ? null
                  : undefined,
        updated_at:
            typeof hp.updated_at === 'string' ? hp.updated_at : undefined,
        vaccines: Array.isArray(hp.vaccines) ? hp.vaccines : undefined,
        vaccinations: Array.isArray(hp.vaccinations)
            ? hp.vaccinations.filter(
                  (item): item is MeVaccination =>
                      !!item && typeof item === 'object',
              )
            : undefined,
        medical_records: Array.isArray(hp.medical_records)
            ? hp.medical_records.filter(
                  (item): item is MeMedicalRecord =>
                      !!item && typeof item === 'object',
              )
            : undefined,
        medicine_inventory: sanitizeMedicineInventory(
            hp.medicine_inventory as unknown[],
        ),
        appointment_reminders: Array.isArray(hp.appointment_reminders)
            ? hp.appointment_reminders.filter(
                  (item): item is MeAppointmentReminder =>
                      !!item && typeof item === 'object',
              )
            : undefined,
        health_metrics: Array.isArray(hp.health_metrics)
            ? hp.health_metrics.filter(
                  (item): item is MeHealthMetric =>
                      !!item && typeof item === 'object',
              )
            : undefined,
    };
}

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

        const profile = entry.profile as Record<string, unknown>;
        const linkedUserId = profile.linked_user_id;
        return typeof linkedUserId === 'string' && linkedUserId === userId;
    });

    const ownedEntry = profiles.find((entry) => {
        if (!entry.profile || typeof entry.profile !== 'object') {
            return false;
        }

        const profile = entry.profile as Record<string, unknown>;
        const ownerUserId = profile.owner_user_id;
        return typeof ownerUserId === 'string' && ownerUserId === userId;
    });

    return linkedEntry ?? ownedEntry ?? profiles[0];
}

function getProfileId(profile: unknown): string | null {
    if (!profile || typeof profile !== 'object') {
        return null;
    }

    const id = (profile as Record<string, unknown>).id;
    return typeof id === 'string' ? id : null;
}

function findProfileBundleByProfileId(
    profiles: MeProfileBundle[],
    profileId: string | null,
): MeProfileBundle | null {
    if (!profileId) {
        return null;
    }

    return (
        profiles.find((entry) => getProfileId(entry.profile) === profileId) ??
        null
    );
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
        const explicitProfile =
            (overview.profile as ProfileLike | undefined) ?? null;
        const explicitProfileBundle = findProfileBundleByProfileId(
            rawProfiles,
            getProfileId(explicitProfile),
        );
        const primaryBundle =
            explicitProfileBundle ?? getPrimaryProfileBundle(rawProfiles, user);

        // Sanitize and normalize profile data
        let profile = explicitProfile ?? primaryBundle?.profile ?? null;
        profile = sanitizeProfile(profile);

        // Sanitize and normalize health profile data
        let healthProfile =
            explicitProfileBundle?.health_profile ??
            primaryBundle?.health_profile ??
            (overview.health_profile as HealthProfileLike | undefined) ??
            null;
        healthProfile = sanitizeHealthProfile(healthProfile);

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

// ============================================================================
// EXPORT UTILITIES FOR USE IN COMPONENTS
// ============================================================================

export { ERROR_PLACEHOLDER, formatNumericDisplay, safeParseNumeric };
