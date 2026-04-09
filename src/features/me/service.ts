import { authService } from '@/src/services/auth.services';
import { normalizeMeOverview } from './types';

export const meService = {
    getOverview: async () => {
        const data = await authService.fetchMe();
        return normalizeMeOverview(data);
    },
};
