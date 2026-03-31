import { router } from 'expo-router';
import { create } from 'zustand';
import * as SecureStore from '@/src/lib/secureStore';
import { meQueryKeys } from '@/src/features/me/queryKeys';
import { normalizeMeOverview } from '@/src/features/me/types';
import { appQueryClient } from '@/src/lib/query-client';
import { appToast } from '@/src/lib/toast';
import { authService } from '@/src/services/auth.services';
import type {
    AuthStore,
    SignInParams,
    SignInWithGoogleParams,
} from '@/src/types/useAuthStore.type';
import type { User } from '@/src/types/user';

const REFRESH_TOKEN = 'refresh_token';
const HAS_SEEN_ONBOARDING = 'has_seen_onboarding';

function cacheMe(data: unknown) {
    appQueryClient.setQueryData(
        meQueryKeys.overview(),
        normalizeMeOverview(data),
    );
}

export const useAuthStore = create<AuthStore>((set, get) => {
    return {
        accessToken: null,
        user: null,
        loading: false,
        initialized: false,
        hasSeenOnboarding: false,
        setAccessToken: (token: string | null) => set({ accessToken: token }),
        clearStore: () => {
            SecureStore.deleteItemAsync(REFRESH_TOKEN).catch((error) => {
                console.log(error);
            });
            appQueryClient.removeQueries({ queryKey: meQueryKeys.all });
            set({ user: null, accessToken: null });
        },
        bootstrap: async () => {
            if (get().initialized) {
                return !!get().accessToken;
            }

            try {
                set({ loading: true });
                const hasSeenOnboarding = Boolean(
                    await SecureStore.getItemAsync(HAS_SEEN_ONBOARDING),
                );
                const refreshToken =
                    await SecureStore.getItemAsync(REFRESH_TOKEN);

                if (!refreshToken) {
                    set({ initialized: true, hasSeenOnboarding });
                    return false;
                }

                const res = await authService.refresh(refreshToken);
                const accessToken = res.access_token ?? res.accessToken ?? null;

                if (!accessToken) {
                    throw new Error('No access token returned');
                }

                set({ accessToken, hasSeenOnboarding });
                const account = await authService.fetchMe();
                cacheMe(account);
                set({ user: account, initialized: true });

                await SecureStore.setItemAsync(
                    REFRESH_TOKEN,
                    res.refresh_token,
                );
                return true;
            } catch (error) {
                console.log(error);
                await SecureStore.deleteItemAsync(REFRESH_TOKEN).catch(
                    (deleteError) => {
                        console.log(deleteError);
                    },
                );
                appToast.showError(
                    'Error',
                    'Phi�n dang nh?p d� h?t h?n. Vui l�ng dang nh?p l?i!',
                );
                set({
                    user: null,
                    accessToken: null,
                    initialized: true,
                    hasSeenOnboarding: Boolean(
                        await SecureStore.getItemAsync(HAS_SEEN_ONBOARDING),
                    ),
                });
                return false;
            } finally {
                set({ loading: false });
            }
        },
        signUp: async ({
            email,
            password,
            phone_number,
        }: Pick<User, 'email' | 'password' | 'phone_number'>) => {
            try {
                set({ loading: true });
                await authService.signUp({ email, password, phone_number });
                return true;
            } catch (error) {
                console.log(error);
                appToast.showError(
                    'Error',
                    '�ang k� th?t b?i. Vui l�ng th? l?i.',
                );
                return false;
            } finally {
                set({ loading: false });
            }
        },
        signIn: async ({
            email,
            password,
            device_id,
            device_name,
            platform,
            fcm_token,
        }: SignInParams) => {
            try {
                set({ loading: true });
                const res = await authService.signIn({
                    email,
                    password,
                    device_id,
                    device_name,
                    platform,
                    fcm_token,
                });
                await SecureStore.setItemAsync(
                    REFRESH_TOKEN,
                    res.refresh_token,
                );
                set({
                    accessToken: res.access_token,
                    initialized: true,
                    hasSeenOnboarding: true,
                });
                await get().fetchMe();
                return true;
            } catch (error) {
                console.log(error);
                appToast.showError(
                    'Error',
                    '�ang nh?p th?t b?i. Vui l�ng th? l?i.',
                );
                return false;
            } finally {
                set({ loading: false });
            }
        },
        signInWithGoogle: async ({
            google_token,
            device_id,
            device_name,
            platform,
            fcm_token,
        }: SignInWithGoogleParams) => {
            try {
                set({ loading: true });
                const res = await authService.signInWithGoogle({
                    google_token,
                    device_id,
                    device_name,
                    platform,
                    fcm_token,
                });
                await SecureStore.setItemAsync(
                    REFRESH_TOKEN,
                    res.refresh_token,
                );
                set({
                    accessToken: res.access_token,
                    initialized: true,
                    hasSeenOnboarding: true,
                });
                await get().fetchMe();
            } catch (error) {
                console.log(error);

                appToast.showError(
                    'Error',
                    '�ang nh?p th?t b?i. Vui l�ng th? l?i.',
                );
            } finally {
                set({ loading: false });
            }
        },
        signOut: async () => {
            try {
                await authService.signOut();
                await SecureStore.deleteItemAsync(REFRESH_TOKEN);
                get().clearStore();
                appToast.showSuccess('Success', '�ang xu?t th�nh c�ng!');
            } catch (error) {
                console.log(error);
                appToast.showError(
                    'Error',
                    '�ang xu?t th?t b?i. Vui l�ng th? l?i.',
                );
            }
        },
        fetchMe: async () => {
            try {
                set({ loading: true });
                const account = await authService.fetchMe();
                cacheMe(account);
                set({ user: account });
            } catch (error) {
                console.log(error);
            } finally {
                set({ loading: false });
            }
        },
        refresh: async () => {
            try {
                set({ loading: true });
                const refreshToken =
                    await SecureStore.getItemAsync(REFRESH_TOKEN);

                if (refreshToken) {
                    const res = await authService.refresh(refreshToken);
                    const accessToken =
                        res.access_token ?? res.accessToken ?? null;

                    if (!accessToken) {
                        throw new Error('No access token returned');
                    }

                    set({ accessToken });
                    if (!get().user) {
                        await get().fetchMe();
                    }

                    await SecureStore.setItemAsync(
                        REFRESH_TOKEN,
                        res.refresh_token,
                    );
                    return true;
                } else {
                    throw new Error('No refresh token found');
                }
            } catch (error) {
                console.log(error);
                appToast.showError(
                    'Error',
                    'Phi�n dang nh?p d� h?t h?n. Vui l�ng dang nh?p l?i!',
                );
                get().clearStore();
                router.push('/auth');
                return false;
            } finally {
                set({ loading: false });
            }
        },
    };
});
