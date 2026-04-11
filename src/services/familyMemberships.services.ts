import apiClient from '../api/client';

export type FamilyRole = 'OWNER' | 'MEMBER' | 'GUARDIAN';

export interface UpdateFamilyMembershipPayload {
    role: FamilyRole;
}

export const familyMembershipsServices = {
    // Update family member role
    updateMemberRole: async (
        memberId: string,
        payload: UpdateFamilyMembershipPayload,
    ) => {
        const res = await apiClient.patch(
            `/family-memberships/${memberId}`,
            payload,
        );
        return res.data;
    },

    // Remove member from family
    removeMember: async (memberId: string) => {
        const res = await apiClient.delete(`/family-memberships/${memberId}`);
        return res.data;
    },
};
