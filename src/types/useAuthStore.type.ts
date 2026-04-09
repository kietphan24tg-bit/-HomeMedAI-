import type { MeOverview } from '@/src/features/me/types';
import { type User } from './user';

export interface SignInParams {
    email?: string;
    password?: string;
    device_id: string;
    device_name: string;
    platform: string;
    fcm_token?: string;
}

export interface SignInWithGoogleParams {
    google_token: string;
    device_id: string;
    device_name: string;
    platform: string;
    fcm_token?: string;
}

export interface AuthStore {
    loading: boolean;
    initialized: boolean;
    hasSeenOnboarding: boolean;
    postLoginCompleted: boolean;
    accessToken: string | null;
    markOnboardingSeen: () => Promise<void>;
    syncMeOverview: () => Promise<MeOverview | null>;
    setAccessToken: (token: string | null) => void;
    clearSession: () => Promise<void>;
    bootstrap: () => Promise<boolean>;
    signUp: ({
        email,
        password,
        phone_number,
    }: Pick<User, 'email' | 'password' | 'phone_number'>) => Promise<boolean>;
    signIn: ({
        email,
        password,
        device_id,
        device_name,
        platform,
        fcm_token,
    }: SignInParams) => Promise<boolean>;
    signInWithGoogle: ({
        google_token,
        device_id,
        device_name,
        platform,
        fcm_token,
    }: SignInWithGoogleParams) => Promise<void>;
    signOut: () => Promise<void>;
}
