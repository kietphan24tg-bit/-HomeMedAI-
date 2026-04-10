const test = require('node:test');
const assert = require('node:assert/strict');

const {
    runBootstrapSession,
    runInteractiveSession,
} = require('../../.tmp/auth-tests/src/auth/session-core.js');

test('bootstrap marks session logged out when no refresh token exists', async () => {
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
        syncMeOverview: async () => ({ post_login_flow_completed: false }),
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
});

test('bootstrap clears invalid session when /me hydration fails', async () => {
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
});

test('interactive session rolls back when /me hydration fails after token setup', async () => {
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
});

test('interactive session succeeds when token setup and hydration both succeed', async () => {
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
});
