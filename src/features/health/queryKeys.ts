export const healthQueryKeys = {
    all: ['health'] as const,
    profile: (profileId: string) =>
        [...healthQueryKeys.all, 'profile', profileId] as const,
    detail: (profileId: string) =>
        [...healthQueryKeys.all, 'detail', profileId] as const,
};
