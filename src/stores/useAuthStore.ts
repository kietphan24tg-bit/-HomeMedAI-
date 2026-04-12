import { create } from 'zustand';
import { getMeOverviewQueryOptions } from '@/src/features/me/queries';
import type { MeOverview } from '@/src/features/me/types';
import { getDeviceMetadata } from '@/src/lib/device';
import { appQueryClient } from '@/src/lib/query-client';
import * as SecureStore from '@/src/lib/secureStore';
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

function getPostLoginCompleted(overview: MeOverview | null | undefined) {
    return overview?.post_login_flow_completed ?? false;
}

function getAccessTokenFromResponse(
    payload: Partial<{ access_token: string; accessToken: string }>,
) {
    return payload.access_token ?? payload.accessToken ?? null;
}

function requireRefreshToken(
    payload: Partial<{ refresh_token: string }>,
): string {
    if (!payload.refresh_token) {
        throw new Error('No refresh token returned');
    }

    return payload.refresh_token;
}

async function fetchMeOverview() {
    return appQueryClient.fetchQuery({
        ...getMeOverviewQueryOptions(),
        staleTime: 0,
    });
}

export const useAuthStore = create<AuthStore>((set, get) => {
    return {
        accessToken: null,
        loading: false,
        initialized: false,
        hasSeenOnboarding: false,
        postLoginCompleted: false,
        markOnboardingSeen: async () => {
            await SecureStore.setItemAsync(HAS_SEEN_ONBOARDING, 'true').catch(
                (error) => {
                    console.error(error);
                },
            );
            set({ hasSeenOnboarding: true });
        },
        syncMeOverview: async (options) => {
            try {
                const overview = await fetchMeOverview();
                set({
                    postLoginCompleted: getPostLoginCompleted(overview),
                });
                return overview;
            } catch (error) {
                console.error(error);
                if (options?.throwOnError) {
                    throw error;
                }
                return null;
            }
        },
        setAccessToken: (token: string | null) => set({ accessToken: token }),
        clearSession: async () => {
            await SecureStore.deleteItemAsync(REFRESH_TOKEN).catch((error) => {
                console.error(error);
            });
            appQueryClient.clear();
            set({
                accessToken: null,
                loading: false,
                postLoginCompleted: false,
            });
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
                    set({
                        accessToken: null,
                        initialized: true,
                        hasSeenOnboarding,
                        postLoginCompleted: false,
                    });
                    return false;
                }

                const res = await authService.refresh(refreshToken);
                const accessToken = getAccessTokenFromResponse(res);
                const nextRefreshToken = requireRefreshToken(res);

                if (!accessToken) {
                    throw new Error('No access token returned');
                }

                await SecureStore.setItemAsync(REFRESH_TOKEN, nextRefreshToken);
                set({
                    accessToken,
                    initialized: false,
                    hasSeenOnboarding,
                    postLoginCompleted: false,
                });

                const overview = await get().syncMeOverview({
                    throwOnError: true,
                });

                if (!overview) {
                    throw new Error('No me overview returned');
                }

                set({
                    accessToken,
                    initialized: true,
                    hasSeenOnboarding,
                    postLoginCompleted: getPostLoginCompleted(overview),
                });
                return true;
            } catch (error) {
                console.error(error);
                await SecureStore.deleteItemAsync(REFRESH_TOKEN).catch(
                    (deleteError) => {
                        console.error(deleteError);
                    },
                );
                appQueryClient.clear();
                appToast.showError(
                    'Error',
                    'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!',
                );
                set({
                    accessToken: null,
                    initialized: true,
                    hasSeenOnboarding: Boolean(
                        await SecureStore.getItemAsync(HAS_SEEN_ONBOARDING),
                    ),
                    postLoginCompleted: false,
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
                console.error(error);
                appToast.showError(
                    'Error',
                    'Đăng ký thất bại. Vui lòng thử lại.',
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
            let shouldRollbackSession = false;
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
                const accessToken = getAccessTokenFromResponse(res);
                const nextRefreshToken = requireRefreshToken(res);

                if (!accessToken) {
                    throw new Error('No access token returned');
                }

                shouldRollbackSession = true;
                await SecureStore.setItemAsync(REFRESH_TOKEN, nextRefreshToken);
                set({
                    accessToken,
                    initialized: true,
                    hasSeenOnboarding: get().hasSeenOnboarding,
                    postLoginCompleted: false,
                });

                const overview = await get().syncMeOverview({
                    throwOnError: true,
                });

                if (!overview) {
                    throw new Error('No me overview returned');
                }

                shouldRollbackSession = false;
                return true;
            } catch (error) {
                console.error(error);
                if (shouldRollbackSession) {
                    await get().clearSession();
                }
                appToast.showError(
                    'Error',
                    'Đăng nhập thất bại. Vui lòng thử lại.',
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
            let shouldRollbackSession = false;
            try {
                set({ loading: true });
                const res = await authService.signInWithGoogle({
                    google_token,
                    device_id,
                    device_name,
                    platform,
                    fcm_token,
                });
                const accessToken = getAccessTokenFromResponse(res);
                const nextRefreshToken = requireRefreshToken(res);

                if (!accessToken) {
                    throw new Error('No access token returned');
                }

                shouldRollbackSession = true;
                await SecureStore.setItemAsync(REFRESH_TOKEN, nextRefreshToken);
                set({
                    accessToken,
                    initialized: true,
                    hasSeenOnboarding: get().hasSeenOnboarding,
                    postLoginCompleted: false,
                });

                const overview = await get().syncMeOverview({
                    throwOnError: true,
                });

                if (!overview) {
                    throw new Error('No me overview returned');
                }

                shouldRollbackSession = false;
                return true;
            } catch (error) {
                console.error(error);
                if (shouldRollbackSession) {
                    await get().clearSession();
                }
                appToast.showError(
                    'Error',
                    'Đăng nhập thất bại. Vui lòng thử lại.',
                );
                return false;
            } finally {
                set({ loading: false });
            }
        },
        signOut: async () => {
            try {
                set({ loading: true });
                const refreshToken =
                    await SecureStore.getItemAsync(REFRESH_TOKEN);
                const { device_id } = await getDeviceMetadata();

                if (refreshToken && device_id) {
                    await authService.signOutWithDevice({
                        refresh_token: refreshToken,
                        device_id,
                    });
                } else {
                    await authService.signOut();
                }
            } catch (error) {
                const status = (error as any)?.response?.status;
                if (![401, 403, 404, 405].includes(status)) {
                    console.error(error);
                }
            } finally {
                await get().clearSession();
                appToast.showSuccess('Thành công', 'Đăng xuất thành công!');
            }
        },
    };
});
