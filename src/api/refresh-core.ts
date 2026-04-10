import type { TokenPayload } from '../auth/session-core';

const EXCLUDED_REFRESH_PATHS = [
    '/signin',
    '/signup',
    '/signout',
    '/rag/chat',
    '/auth/login',
    '/auth/register',
    '/auth/logout',
    '/auth/refresh',
    '/auth/google',
    '/auth/forgot-password',
    '/auth/reset-password',
] as const;

export function shouldSkipRefresh(url?: string) {
    return !url || EXCLUDED_REFRESH_PATHS.some((path) => url.includes(path));
}

export function shouldAttemptRefresh(status?: number) {
    return status === 401 || status === 403;
}

export type RefreshCoordinatorDeps = {
    getRefreshToken: () => Promise<string | null>;
    refresh: (refreshToken: string) => Promise<TokenPayload>;
    setAccessToken: (accessToken: string) => void;
    persistRefreshToken: (refreshToken: string) => Promise<void>;
    clearSession: () => Promise<void>;
    showSessionExpiredToast: () => void;
};

export function createRefreshCoordinator(deps: RefreshCoordinatorDeps) {
    let refreshAccessTokenPromise: Promise<string> | null = null;

    async function refreshAccessToken() {
        if (!refreshAccessTokenPromise) {
            refreshAccessTokenPromise = (async () => {
                const refreshToken = await deps.getRefreshToken();

                if (!refreshToken) {
                    throw new Error('No refresh token found');
                }

                const payload = await deps.refresh(refreshToken);
                const accessToken =
                    payload.access_token ?? payload.accessToken ?? null;
                const nextRefreshToken = payload.refresh_token ?? null;

                if (!accessToken) {
                    throw new Error('No access token returned');
                }

                if (!nextRefreshToken) {
                    throw new Error('No refresh token returned');
                }

                deps.setAccessToken(accessToken);
                await deps.persistRefreshToken(nextRefreshToken);

                return accessToken;
            })()
                .catch(async (error) => {
                    await deps.clearSession();
                    deps.showSessionExpiredToast();
                    throw error;
                })
                .finally(() => {
                    refreshAccessTokenPromise = null;
                });
        }

        return refreshAccessTokenPromise;
    }

    return {
        refreshAccessToken,
    };
}
