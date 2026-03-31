export const familyQueryKeys = {
    all: ['families'] as const,
    list: () => [...familyQueryKeys.all, 'list'] as const,
};
