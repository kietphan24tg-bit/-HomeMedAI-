export const meQueryKeys = {
    all: ['me'] as const,
    overview: () => [...meQueryKeys.all, 'overview'] as const,
};
