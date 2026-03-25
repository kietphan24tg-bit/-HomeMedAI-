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
    user: User | null;
    loading: boolean;
    initialized: boolean;
    hasSeenOnboarding: boolean;
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    clearStore: () => void;
    bootstrap: () => Promise<boolean>;
    signUp: ({
        email,
        password,
    }: Pick<User, 'email' | 'password'>) => Promise<boolean>;
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
    fetchMe: () => Promise<void>;
    refresh: () => Promise<boolean>;
}
