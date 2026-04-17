import apiClient from '../api/client';
import type { FamilyRole } from '../types/family-domain';
import { toVietnamE164 } from '../utils/phone';
export const familiesServices = {
    createFamily: async ({
        name,
        address,
        avatar_url,
        owner_profile_full_name,
    }: {
        name: string;
        address: string | null;
        avatar_url: string | null;
        owner_profile_full_name: string;
    }) => {
        const res = await apiClient.post('/families', {
            name,
            address,
            avatar_url,
            owner_profile_full_name,
        });
        return res.data;
    },
    getMyFamilies: async () => {
        const res = await apiClient.get('/families');
        return res.data;
    },
    getFamilyById: async (id: string) => {
        const res = await apiClient.get(`/families/${id}`);
        return res.data;
    },
    getInvites: async ({
        status = 'pending',
        page = 1,
        limit = 10,
    }: {
        status: string;
        page: number;
        limit: number;
    }) => {
        const res = await apiClient.get(
            `/families/invites?status=${status}&page=${page}&limit=${limit}`,
        );
        return res.data;
        //response trả về nên có
        // "total": 47,
        //"page": 1,
        //"limit": 10,
        //"data": []
    },
    previewInviteCode: async (invite_code: string) => {
        const res = await apiClient.get('/families/invite/preview', {
            params: { invite_code },
        });
        return res.data;
    },
    findUserByPhoneNumber: async (
        family_id: string,
        phone_number: string,
        dry_run = true,
    ) => {
        const normalizedPhoneNumber = toVietnamE164(phone_number);

        const res = await apiClient.post(
            `/families/${family_id}/invite-by-phone`,
            {
                phone_number: normalizedPhoneNumber ?? phone_number,
                dry_run,
            },
        );
        return res.data;
    },
    inviteUser: async (
        family_id: string,
        phone_number: string,
        user_id: string,
        role: FamilyRole,
        dry_run = true,
    ) => {
        const normalizedPhoneNumber = toVietnamE164(phone_number);

        const res = await apiClient.post(
            `/families/${family_id}/invite-by-phone`,
            {
                phone_number: normalizedPhoneNumber ?? phone_number,
                user_id,
                role,
                dry_run,
            },
        );
        return res.data;
    },
    acceptInvite: async ({
        invite_id,
        full_name,
        profile_id,
    }: {
        invite_id: string;
        full_name: string;
        profile_id?: string;
    }) => {
        const res = await apiClient.post(`/families/join`, {
            action: 'accept',
            invite_id,
            full_name,
            profile_id,
        });
        return res.data;
    },
    rejectInvite: async ({ invite_id }: { invite_id: string }) => {
        const res = await apiClient.post(`/families/join`, {
            action: 'reject',
            invite_id,
        });
        return res.data;
    },
    getMembers: async (family_id: string) => {
        const res = await apiClient.get(`/families/${family_id}/members`);
        return res.data;
    },
    getMedicineInventory: async (family_id: string) => {
        const res = await apiClient.get(
            `/families/${family_id}/medicine-inventory`,
        );
        return res.data;
    },
    patchFamily: async (family_id: string, data: any) => {
        const res = await apiClient.patch(`/families/${family_id}`, data);
        return res.data;
    },
    addMedicineInventory: async (family_id: string, data: any) => {
        const res = await apiClient.post(
            `/families/${family_id}/medicine-inventory`,
            data,
        );
        return res.data;
    },
    patchMedicineInventory: async (
        item_id: string,
        data: Record<string, unknown>,
    ) => {
        const res = await apiClient.patch(
            `/medicine-inventory/${item_id}`,
            data,
        );
        return res.data;
    },
    rotateInviteCode: async (family_id: string) => {
        const res = await apiClient.post(
            `/families/${family_id}/invite/rotate`,
        );
        return res.data;
    },
    getProfiles: async (family_id: string) => {
        const res = await apiClient.get(`/families/${family_id}/profiles`);
        return res.data;
    },
    createProfile: async (family_id: string, data: any) => {
        const res = await apiClient.post(
            `/families/${family_id}/profiles`,
            data,
        );
        return res.data;
    },
    patchMember: async (
        membership_id: string,
        data: Record<string, unknown>,
    ) => {
        const res = await apiClient.patch(
            `/family-memberships/${membership_id}`,
            data,
        );
        return res.data;
    },
    deleteMember: async (membership_id: string) => {
        const res = await apiClient.delete(
            `/family-memberships/${membership_id}`,
        );
        return res.data;
    },

    listMedicineSchedules: async (item_id: string) => {
        const res = await apiClient.get(
            `/medicine-inventory/${item_id}/schedules`,
        );
        return res.data;
    },
    createMedicineSchedule: async (
        item_id: string,
        data: {
            profile_id: string;
            remind_time: string;
            remind_tz?: string;
            title?: string | null;
            dosage_per_time?: number | string | null;
            rrule?: string | null;
        },
    ) => {
        const res = await apiClient.post(
            `/medicine-inventory/${item_id}/schedules`,
            data,
        );
        return res.data;
    },
    patchMedicineSchedule: async (
        schedule_id: string,
        data: Record<string, unknown>,
    ) => {
        const res = await apiClient.patch(
            `/medicine-inventory/schedules/${schedule_id}`,
            data,
        );
        return res.data;
    },
    deleteMedicineSchedule: async (schedule_id: string) => {
        await apiClient.delete(`/medicine-inventory/schedules/${schedule_id}`);
    },
};
