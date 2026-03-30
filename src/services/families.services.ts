import apiClient from '../api/client';
import type { FamilyRole } from '../types/family-domain';
export const familiesServices = {
    createFamily: async ({
        name,
        address,
        avatar_url,
        owner_profile_full_name,
    }: {
        name: string;
        address: string;
        avatar_url: string;
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
    findUserByPhoneNumber: async (
        family_id: string,
        phone_number: string,
        dry_run = true,
    ) => {
        const res = await apiClient.post(
            `/families/${family_id}/invite-by-phone`,
            {
                phone_number,
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
        const res = await apiClient.post(
            `/families/${family_id}/invite-by-phone`,
            {
                phone_number,
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
    }: {
        invite_id: string;
        full_name: string;
    }) => {
        const res = await apiClient.post(`/families/join`, {
            action: 'accept',
            invite_id,
            full_name,
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
};
