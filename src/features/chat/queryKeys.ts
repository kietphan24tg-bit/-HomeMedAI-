export const chatQueryKeys = {
    all: ['chat'] as const,
    messages: () => [...chatQueryKeys.all, 'messages'] as const,
};
