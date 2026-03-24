import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { appToast } from '@/src/lib/toast';
import { authService } from '@/src/services/auth.services';
import type {
    AuthStore,
    SignInParams,
    SignInWithGoogleParams,
} from '@/src/types/useAuthStore.type';
import type { User } from '@/src/types/user';

const REFRESH_TOKEN = 'refresh_token';

export const useAuthStore = create<AuthStore>((set, get) => {
    return {
        accessToken: null,
        user: null,
        loading: false,
        setAccessToken: (token: string | null) => set({ accessToken: token }),
        clearStore: () => {
            SecureStore.deleteItemAsync(REFRESH_TOKEN).catch((error) => {
                console.log(error);
            });
            set({ user: null, accessToken: null });
        },
        signUp: async ({
            email,
            password,
        }: Pick<User, 'email' | 'password'>) => {
            try {
                set({ loading: true });
                await authService.signUp({ email, password });
                return true;
            } catch (error) {
                console.log(error);
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
                set({ accessToken: res.access_token });
                await get().fetchMe();
                return true;
            } catch (error) {
                console.log(error);
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
                set({ accessToken: res.access_token });
                await get().fetchMe();
            } catch (error) {
                console.log(error);

                appToast.showError(
                    'Error',
                    'Đăng nhập thất bại. Vui lòng thử lại.',
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
                appToast.showSuccess('Success', 'Đăng xuất thành công!');
            } catch (error) {
                console.log(error);
                appToast.showError(
                    'Error',
                    'Đăng xuất thất bại. Vui lòng thử lại.',
                );
            }
        },
        fetchMe: async () => {
            try {
                set({ loading: true });
                const res = await authService.fetchMe();
                set({ user: res.user });
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
                    set({ accessToken: res.accessToken });
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
                    'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!',
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
