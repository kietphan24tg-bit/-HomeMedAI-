const test = require('node:test');
const assert = require('node:assert/strict');

const {
    createRefreshCoordinator,
    shouldAttemptRefresh,
    shouldSkipRefresh,
} = require('../../.tmp/auth-tests/src/api/refresh-core.js');

test('shouldAttemptRefresh accepts 401 and 403 only', () => {
    assert.equal(shouldAttemptRefresh(401), true);
    assert.equal(shouldAttemptRefresh(403), true);
    assert.equal(shouldAttemptRefresh(400), false);
    assert.equal(shouldAttemptRefresh(undefined), false);
});

test('shouldSkipRefresh excludes auth endpoints and missing urls', () => {
    assert.equal(shouldSkipRefresh(undefined), true);
    assert.equal(shouldSkipRefresh('/auth/login'), true);
    assert.equal(shouldSkipRefresh('/users/me'), false);
});

test('refresh coordinator serializes concurrent refresh attempts', async () => {
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
});

test('refresh coordinator clears session when refresh token is missing', async () => {
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
});
