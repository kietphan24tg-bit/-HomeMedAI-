import { authService } from '@/src/services/auth.services';
import {
    getMedicalRecordsFromOverview,
    getVaccinationsFromOverview,
    normalizeMeOverview,
} from './types';

export const meService = {
    getOverview: async () => {
        const data = await authService.fetchMe();
        return normalizeMeOverview(data);
    },
    getVaccinations: async () => {
        const overview = await meService.getOverview();
        return getVaccinationsFromOverview(overview);
    },
    getMedicalRecords: async () => {
        const overview = await meService.getOverview();
        return getMedicalRecordsFromOverview(overview);
    },
};
