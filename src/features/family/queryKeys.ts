export const familyQueryKeys = {
    all: ['families'] as const,
    list: () => [...familyQueryKeys.all, 'list'] as const,
    invites: (params?: { status?: string; page?: number; limit?: number }) =>
        [
            ...familyQueryKeys.all,
            'invites',
            params?.status ?? 'pending',
            params?.page ?? 1,
            params?.limit ?? 20,
        ] as const,
};
