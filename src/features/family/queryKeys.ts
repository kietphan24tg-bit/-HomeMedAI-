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
    detail: (id: string) => [...familyQueryKeys.all, 'detail', id] as const,
    members: (id: string) => [...familyQueryKeys.all, 'members', id] as const,
    medicineInventory: (id: string) =>
        [...familyQueryKeys.all, 'medicine-inventory', id] as const,
    profiles: (id: string) => [...familyQueryKeys.all, 'profiles', id] as const,
};
