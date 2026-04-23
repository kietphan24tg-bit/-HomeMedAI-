import type { QueryClient } from '@tanstack/react-query';
import { appQueryClient } from '@/src/lib/query-client';
import { familyQueryKeys } from './queryKeys';

export function syncFamilyQueries(queryClient: QueryClient = appQueryClient) {
    void queryClient.invalidateQueries({
        queryKey: familyQueryKeys.all,
    });
    void queryClient.refetchQueries({
        queryKey: familyQueryKeys.all,
        type: 'active',
    });
}
