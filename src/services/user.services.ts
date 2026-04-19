import apiClient from '../api/client';

export type ProfileScope = 'all' | 'without_family' | 'with_family';

export type CreatePersonalProfilePayload = {
    full_name: string;
    dob?: string | null;
    gender?: string | null;
    height_cm?: string | null;
    weight_kg?: string | null;
    address?: string | null;
    avatar_url?: string | null;
};
export type PatchMyProfilePayload = Partial<CreatePersonalProfilePayload>;

export type PatchMyUserPayload = {
    phone_number?: string | null;
};

export type PatchMyHealthProfilePayload = {
    blood_type?: string | null;
    chronic_diseases?: string[] | null;
    allergies?: string[] | null;
    drug_allergies?: string[] | null;
    food_allergies?: string[] | null;
    emergency_contact?: string | null;
    emergency_contacts?:
        | {
              name?: string | null;
              phone?: string | null;
              relationship?: string | null;
          }[]
        | null;
    notes?: string | null;
};

const EXTENDED_HEALTH_PROFILE_KEYS = [
    'drug_allergies',
    'food_allergies',
    'emergency_contacts',
] as const;

function compactPayload<T extends Record<string, unknown>>(payload: T) {
    return Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined),
    ) as Partial<T>;
}

function uniqueStrings(values: unknown[]) {
    return Array.from(
        new Set(
            values.filter(
                (value): value is string =>
                    typeof value === 'string' && value.trim().length > 0,
            ),
        ),
    );
}

function hasExtendedHealthProfileFields(payload: PatchMyHealthProfilePayload) {
    return EXTENDED_HEALTH_PROFILE_KEYS.some((key) => key in payload);
}

function toLegacyHealthProfilePayload(payload: PatchMyHealthProfilePayload) {
    const hasAllergiesField = Object.prototype.hasOwnProperty.call(
        payload,
        'allergies',
    );
    const hasExtendedFields = hasExtendedHealthProfileFields(payload);
    const mergedAllergies = uniqueStrings([
        ...(payload.allergies ?? []),
        ...(payload.drug_allergies ?? []),
        ...(payload.food_allergies ?? []),
    ]);
    const emergencyContact =
        payload.emergency_contact ??
        payload.emergency_contacts
            ?.map((contact) =>
                [contact.name, contact.phone, contact.relationship]
                    .filter(Boolean)
                    .join(' - '),
            )
            .filter(Boolean)
            .join('\n') ??
        undefined;

    return compactPayload({
        blood_type: payload.blood_type,
        chronic_diseases: payload.chronic_diseases,
        allergies:
            mergedAllergies.length > 0
                ? mergedAllergies
                : payload.allergies === null
                  ? null
                  : hasAllergiesField || hasExtendedFields
                    ? []
                    : undefined,
        emergency_contact: emergencyContact,
        notes: payload.notes,
    });
}

function toCompleteLegacyHealthProfilePayload(
    payload: PatchMyHealthProfilePayload,
) {
    const legacyPayload = toLegacyHealthProfilePayload(payload);

    return {
        blood_type: Object.prototype.hasOwnProperty.call(
            legacyPayload,
            'blood_type',
        )
            ? legacyPayload.blood_type
            : null,
        chronic_diseases: legacyPayload.chronic_diseases ?? [],
        allergies: legacyPayload.allergies ?? [],
        emergency_contact: Object.prototype.hasOwnProperty.call(
            legacyPayload,
            'emergency_contact',
        )
            ? legacyPayload.emergency_contact
            : null,
        notes: Object.prototype.hasOwnProperty.call(legacyPayload, 'notes')
            ? legacyPayload.notes
            : null,
    };
}

function isServerError(error: unknown) {
    const status = (error as { response?: { status?: number } })?.response
        ?.status;
    return typeof status === 'number' && status >= 500;
}

export type UserMeResponse = {
    user: {
        id: string;
        email: string;
        status: string;
        created_at: string;
        google_id?: string;
        phone_number: string;
        deleted_at?: string;
    };
    profile: {
        id: string;
        owner_user_id: string;
        linked_user_id?: string;
        full_name: string;
        dob: string;
        gender: string;
        height_cm: string;
        weight_kg: string;
        address: string;
        avatar_url?: string;
        status: string;
        created_at: string;
        updated_at: string;
        deleted_at?: string;
    };
    health_profile: {
        profile_id: string;
        blood_type: string;
        chronic_diseases?: string[];
        allergies?: string[];
        drug_allergies?: string[];
        food_allergies?: string[];
        emergency_contacts?: {
            name: string;
            phone: string;
            relationship: string;
        }[];
        notes?: string;
        updated_at: string;
    };
    profiles?: any[];
};

export const userService = {
    getMe: async () => {
        const res = await apiClient.get<UserMeResponse>('/users/me', {
            timeout: 60000,
        });
        return res.data;
    },
    getMyProfiles: async (profile_scope: ProfileScope = 'all') => {
        const res = await apiClient.get('/users/me/profiles', {
            params: { profile_scope },
        });
        return res.data;
    },
    getProfilesWithoutFamily: async () => {
        const res = await apiClient.get('/users/me/profiles', {
            params: { profile_scope: 'without_family' },
        });
        return res.data;
    },
    getProfilesWithFamily: async () => {
        const res = await apiClient.get('/users/me/profiles', {
            params: { profile_scope: 'with_family' },
        });
        return res.data;
    },
    createPersonalProfile: async (payload: CreatePersonalProfilePayload) => {
        // console.log('Payload la: ', payload);

        const res = await apiClient.post('/users/me/personal-profile', payload);
        return res.data;
    },
    patchMyProfile: async (
        profileId: string,
        payload: PatchMyProfilePayload,
    ) => {
        const res = await apiClient.patch(`/profiles/${profileId}`, payload);
        return res.data;
    },
    patchMyUser: async (payload: PatchMyUserPayload) => {
        const res = await apiClient.patch('/users/me', payload);
        return res.data;
    },
    patchMyHealthProfile: async (
        profileId: string,
        payload: PatchMyHealthProfilePayload,
    ) => {
        try {
            const res = await apiClient.patch(
                `/profiles/${profileId}/health`,
                toLegacyHealthProfilePayload(payload),
            );
            return res.data;
        } catch (error) {
            if (!isServerError(error)) {
                throw error;
            }

            const res = await apiClient.patch(
                `/profiles/${profileId}/health`,
                toCompleteLegacyHealthProfilePayload(payload),
            );
            return res.data;
        }
    },
};
