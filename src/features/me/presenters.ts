import type { CurrentUserAccount, ProfileLike } from './types';

export type ProfileVM = {
    id: string | null;
    full_name: string | null;
    dob: string | null;
    gender: string | null;
    height_cm: number | null;
    weight_kg: number | null;
    address: string | null;
    avatar_url: string | null;
};

export type MeUserAndProfileVM = {
    user: CurrentUserAccount | null;
    profile: ProfileVM;
};

function toNullableString(value: unknown): string | null {
    return typeof value === 'string' ? value : null;
}

function toNullableNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

export function createEmptyProfileVM(): ProfileVM {
    return {
        id: null,
        full_name: null,
        dob: null,
        gender: null,
        height_cm: null,
        weight_kg: null,
        address: null,
        avatar_url: null,
    };
}

export function mapProfileLikeToVM(profile: ProfileLike): ProfileVM {
    if (!profile || typeof profile !== 'object') {
        return createEmptyProfileVM();
    }

    const raw = profile as Record<string, unknown>;
    return {
        id: toNullableString(raw.id),
        full_name: toNullableString(raw.full_name),
        dob: toNullableString(raw.dob),
        gender: toNullableString(raw.gender),
        height_cm: toNullableNumber(raw.height_cm),
        weight_kg: toNullableNumber(raw.weight_kg),
        address: toNullableString(raw.address),
        avatar_url: toNullableString(raw.avatar_url),
    };
}

export function mapMeUserAndProfileToVM(data: {
    user: CurrentUserAccount | null;
    profile: ProfileLike;
}): MeUserAndProfileVM {
    return {
        user: data.user ?? null,
        profile: mapProfileLikeToVM(data.profile),
    };
}
