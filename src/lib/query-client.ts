import { QueryClient } from '@tanstack/react-query';

export function createAppQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60,
                gcTime: 1000 * 60 * 10,
                retry: 1,
                refetchOnReconnect: true,
                refetchOnWindowFocus: false,
            },
        },
    });
}

export const appQueryClient = createAppQueryClient();
