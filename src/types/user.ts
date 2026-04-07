/**
 * Auth-only user credentials.
 * Personal info (name, dob, height, etc.) lives in `Profile` from `family-domain.ts`.
 * Health info (blood_type, allergies, etc.) lives in `HealthProfile` from `family-domain.ts`.
 */
export interface User {
    email?: string;
    password?: string;
    phone_number?: string;
}
