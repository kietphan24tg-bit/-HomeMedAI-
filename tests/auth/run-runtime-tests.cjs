const assert = require('node:assert/strict');

const {
    runBootstrapSession,
    runInteractiveSession,
} = require('../../.tmp/auth-tests/src/auth/session-core.js');
const {
    createRefreshCoordinator,
    shouldAttemptRefresh,
    shouldSkipRefresh,
} = require('../../.tmp/auth-tests/src/api/refresh-core.js');

async function runCase(name, fn) {
    try {
        await fn();
        console.log(`PASS ${name}`);
    } catch (error) {
        console.error(`FAIL ${name}`);
        throw error;
    }
}

async function main() {
    await runCase(
        'bootstrap marks session logged out when no refresh token exists',
        async () => {
            const updates = [];
            const result = await runBootstrapSession({
                getInitialized: () => false,
                getAccessToken: () => null,
                setState: (partial) => updates.push(partial),
                getHasSeenOnboarding: async () => true,
                getStoredRefreshToken: async () => null,
                refresh: async () => {
                    throw new Error('should not refresh');
                },
                persistRefreshToken: async () => {},
                syncMeOverview: async () => ({
                    post_login_flow_completed: false,
                }),
                clearStoredRefreshToken: async () => {},
                clearQueryCache: () => {},
                showSessionExpiredToast: () => {},
            });

            assert.equal(result, false);
            assert.deepEqual(updates[0], { loading: true });
            assert.deepEqual(updates[1], {
                accessToken: null,
                initialized: true,
                hasSeenOnboarding: true,
                postLoginCompleted: false,
            });
            assert.deepEqual(updates.at(-1), { loading: false });
        },
    );

    await runCase(
        'bootstrap clears invalid session when /me hydration fails',
        async () => {
            let cleared = false;
            let clearedCache = false;
            let toasted = false;

            const result = await runBootstrapSession({
                getInitialized: () => false,
                getAccessToken: () => null,
                setState: () => {},
                getHasSeenOnboarding: async () => true,
                getStoredRefreshToken: async () => 'refresh-token',
                refresh: async () => ({
                    access_token: 'access-token',
                    refresh_token: 'refresh-token-next',
                }),
                persistRefreshToken: async () => {},
                syncMeOverview: async () => {
                    throw new Error('hydrate failed');
                },
                clearStoredRefreshToken: async () => {
                    cleared = true;
                },
                clearQueryCache: () => {
                    clearedCache = true;
                },
                showSessionExpiredToast: () => {
                    toasted = true;
                },
            });

            assert.equal(result, false);
            assert.equal(cleared, true);
            assert.equal(clearedCache, true);
            assert.equal(toasted, true);
        },
    );

    await runCase(
        'interactive session rolls back when /me hydration fails after token setup',
        async () => {
            let rollbackCount = 0;
            let errorToastCount = 0;

            const result = await runInteractiveSession({
                requestSession: async () => ({
                    access_token: 'access-token',
                    refresh_token: 'refresh-token-next',
                }),
                persistRefreshToken: async () => {},
                setState: () => {},
                syncMeOverview: async () => {
                    throw new Error('hydrate failed');
                },
                clearSession: async () => {
                    rollbackCount += 1;
                },
                hasSeenOnboarding: true,
                showSignInError: () => {
                    errorToastCount += 1;
                },
            });

            assert.equal(result, false);
            assert.equal(rollbackCount, 1);
            assert.equal(errorToastCount, 1);
        },
    );

    await runCase(
        'interactive session succeeds when token setup and hydration both succeed',
        async () => {
            let rollbackCount = 0;

            const result = await runInteractiveSession({
                requestSession: async () => ({
                    access_token: 'access-token',
                    refresh_token: 'refresh-token-next',
                }),
                persistRefreshToken: async () => {},
                setState: () => {},
                syncMeOverview: async () => ({
                    post_login_flow_completed: true,
                }),
                clearSession: async () => {
                    rollbackCount += 1;
                },
                hasSeenOnboarding: true,
                showSignInError: () => {},
            });

            assert.equal(result, true);
            assert.equal(rollbackCount, 0);
        },
    );

    await runCase('shouldAttemptRefresh accepts 401 and 403 only', async () => {
        assert.equal(shouldAttemptRefresh(401), true);
        assert.equal(shouldAttemptRefresh(403), true);
        assert.equal(shouldAttemptRefresh(400), false);
        assert.equal(shouldAttemptRefresh(undefined), false);
    });

    await runCase(
        'shouldSkipRefresh excludes auth endpoints and missing urls',
        async () => {
            assert.equal(shouldSkipRefresh(undefined), true);
            assert.equal(shouldSkipRefresh('/auth/login'), true);
            assert.equal(shouldSkipRefresh('/users/me'), false);
        },
    );

    await runCase(
        'refresh coordinator serializes concurrent refresh attempts',
        async () => {
            let refreshCount = 0;

            const coordinator = createRefreshCoordinator({
                getRefreshToken: async () => 'refresh-token',
                refresh: async () => {
                    refreshCount += 1;
                    await new Promise((resolve) => setTimeout(resolve, 10));
                    return {
                        access_token: 'access-token-next',
                        refresh_token: 'refresh-token-next',
                    };
                },
                setAccessToken: () => {},
                persistRefreshToken: async () => {},
                clearSession: async () => {},
                showSessionExpiredToast: () => {},
            });

            const [tokenA, tokenB] = await Promise.all([
                coordinator.refreshAccessToken(),
                coordinator.refreshAccessToken(),
            ]);

            assert.equal(tokenA, 'access-token-next');
            assert.equal(tokenB, 'access-token-next');
            assert.equal(refreshCount, 1);
        },
    );

    await runCase(
        'refresh coordinator clears session when refresh token is missing',
        async () => {
            let cleared = 0;
            let toasted = 0;

            const coordinator = createRefreshCoordinator({
                getRefreshToken: async () => null,
                refresh: async () => ({
                    access_token: 'unused',
                    refresh_token: 'unused',
                }),
                setAccessToken: () => {},
                persistRefreshToken: async () => {},
                clearSession: async () => {
                    cleared += 1;
                },
                showSessionExpiredToast: () => {
                    toasted += 1;
                },
            });

            await assert.rejects(
                () => coordinator.refreshAccessToken(),
                /No refresh token found/,
            );
            assert.equal(cleared, 1);
            assert.equal(toasted, 1);
        },
    );

    console.log('Auth/session runtime tests passed.');
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
