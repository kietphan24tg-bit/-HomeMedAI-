export type SessionOverviewLike =
    | {
          post_login_flow_completed?: boolean;
      }
    | null
    | undefined;

export type TokenPayload = Partial<{
    access_token: string;
    accessToken: string;
    refresh_token: string;
}>;

type SessionState = {
    accessToken: string | null;
    initialized: boolean;
    hasSeenOnboarding: boolean;
    postLoginCompleted: boolean;
    loading: boolean;
};

export function getPostLoginCompleted(overview: SessionOverviewLike) {
    return overview?.post_login_flow_completed ?? false;
}

export function getAccessTokenFromResponse(payload: TokenPayload) {
    return payload.access_token ?? payload.accessToken ?? null;
}

export function requireRefreshToken(payload: TokenPayload): string {
    if (!payload.refresh_token) {
        throw new Error('No refresh token returned');
    }

    return payload.refresh_token;
}

export type BootstrapSessionDeps<Overview extends SessionOverviewLike> = {
    getInitialized: () => boolean;
    getAccessToken: () => string | null;
    setState: (partial: Partial<SessionState>) => void;
    getHasSeenOnboarding: () => Promise<boolean>;
    getStoredRefreshToken: () => Promise<string | null>;
    refresh: (refreshToken: string) => Promise<TokenPayload>;
    persistRefreshToken: (refreshToken: string) => Promise<void>;
    syncMeOverview: () => Promise<Overview>;
    clearStoredRefreshToken: () => Promise<void>;
    clearQueryCache: () => void;
    showSessionExpiredToast: () => void;
};

export async function runBootstrapSession<Overview extends SessionOverviewLike>(
    deps: BootstrapSessionDeps<Overview>,
) {
    if (deps.getInitialized()) {
        return !!deps.getAccessToken();
    }

    let hasSeenOnboarding = false;

    try {
        deps.setState({ loading: true });
        hasSeenOnboarding = await deps.getHasSeenOnboarding();
        const refreshToken = await deps.getStoredRefreshToken();

        if (!refreshToken) {
            deps.setState({
                accessToken: null,
                initialized: true,
                hasSeenOnboarding,
                postLoginCompleted: false,
            });
            return false;
        }

        const payload = await deps.refresh(refreshToken);
        const accessToken = getAccessTokenFromResponse(payload);
        const nextRefreshToken = requireRefreshToken(payload);

        if (!accessToken) {
            throw new Error('No access token returned');
        }

        await deps.persistRefreshToken(nextRefreshToken);
        deps.setState({
            accessToken,
            initialized: false,
            hasSeenOnboarding,
            postLoginCompleted: false,
        });

        const overview = await deps.syncMeOverview();

        deps.setState({
            accessToken,
            initialized: true,
            hasSeenOnboarding,
            postLoginCompleted: getPostLoginCompleted(overview),
        });
        return true;
    } catch {
        await deps.clearStoredRefreshToken();
        deps.clearQueryCache();
        deps.showSessionExpiredToast();
        deps.setState({
            accessToken: null,
            initialized: true,
            hasSeenOnboarding,
            postLoginCompleted: false,
        });
        return false;
    } finally {
        deps.setState({ loading: false });
    }
}

export type InteractiveSessionDeps<Overview extends SessionOverviewLike> = {
    requestSession: () => Promise<TokenPayload>;
    persistRefreshToken: (refreshToken: string) => Promise<void>;
    setState: (partial: Partial<SessionState>) => void;
    syncMeOverview: () => Promise<Overview>;
    clearSession: () => Promise<void>;
    hasSeenOnboarding: boolean;
    showSignInError: () => void;
};

export async function runInteractiveSession<
    Overview extends SessionOverviewLike,
>(deps: InteractiveSessionDeps<Overview>) {
    let shouldRollbackSession = false;

    try {
        deps.setState({ loading: true });
        const payload = await deps.requestSession();
        const accessToken = getAccessTokenFromResponse(payload);
        const nextRefreshToken = requireRefreshToken(payload);

        if (!accessToken) {
            throw new Error('No access token returned');
        }

        shouldRollbackSession = true;
        await deps.persistRefreshToken(nextRefreshToken);
        deps.setState({
            accessToken,
            initialized: true,
            hasSeenOnboarding: deps.hasSeenOnboarding,
            postLoginCompleted: false,
        });
        await deps.syncMeOverview();
        shouldRollbackSession = false;
        return true;
    } catch {
        if (shouldRollbackSession) {
            await deps.clearSession();
        }
        deps.showSignInError();
        return false;
    } finally {
        deps.setState({ loading: false });
    }
}
