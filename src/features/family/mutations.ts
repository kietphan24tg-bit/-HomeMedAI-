import { useMutation } from '@tanstack/react-query';
import { getApiErrorMessage, getApiErrorStatus } from '@/src/lib/api-error';
import { appQueryClient } from '@/src/lib/query-client';
import { appToast } from '@/src/lib/toast';
import { familiesServices } from '@/src/services/families.services';
import type { FamilyRole } from '@/src/types/family-domain';
import { familyQueryKeys } from './queryKeys';

export function useRejectFamilyInviteMutation() {
    return useMutation({
        mutationFn: ({ inviteId }: { inviteId: string }) =>
            familiesServices.respondInvite({
                action: 'reject',
                invite_id: inviteId,
            }),
        onSuccess: () => {
            appQueryClient.invalidateQueries({ queryKey: familyQueryKeys.all });
            appToast.showSuccess('Thành công', 'Đã từ chối lời mời.');
        },
        onError: (error) => {
            const status = getApiErrorStatus(error);
            if (status === 404) {
                appToast.showError(
                    'Lời mời không tồn tại',
                    'Lời mời có thể đã hết hạn hoặc đã được xử lý.',
                );
                return;
            }
            appToast.showError(
                'Lỗi',
                getApiErrorMessage(error, 'Không thể từ chối lời mời lúc này.'),
            );
        },
    });
}

export function useAcceptFamilyInviteMutation() {
    return useMutation({
        mutationFn: ({
            inviteId,
            fullName,
            profileId,
        }: {
            inviteId: string;
            fullName?: string | null;
            profileId?: string;
        }) =>
            familiesServices.respondInvite({
                action: 'accept',
                invite_id: inviteId,
                full_name: fullName ?? undefined,
                profile_id: profileId,
            }),
        onSuccess: () => {
            appQueryClient.invalidateQueries({ queryKey: familyQueryKeys.all });
            appToast.showSuccess('Thành công', 'Đã chấp nhận lời mời.');
        },
        onError: (error) => {
            const status = getApiErrorStatus(error);
            if (status === 409) {
                appToast.showInfo(
                    'Cần chọn hồ sơ',
                    'Tài khoản có nhiều hồ sơ. Vui lòng chọn một hồ sơ để tham gia.',
                );
                return;
            }
            if (status === 404) {
                appToast.showError(
                    'Lời mời không tồn tại',
                    'Lời mời có thể đã hết hạn hoặc đã được xử lý.',
                );
                return;
            }
            appToast.showError(
                'Lỗi',
                getApiErrorMessage(
                    error,
                    'Không thể chấp nhận lời mời lúc này.',
                ),
            );
        },
    });
}

export function useCreateFamilyMutation() {
    return useMutation({
        mutationFn: (data: {
            name: string;
            address: string | null;
            avatar_url: string | null;
            owner_profile_full_name: string;
        }) => familiesServices.createFamily(data),
        onSuccess: () => {
            appQueryClient.invalidateQueries({ queryKey: familyQueryKeys.all });
            appToast.showSuccess('Thành công', 'Đã tạo gia đình.');
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.detail?.[0]?.msg ||
                error?.response?.data?.message ||
                error?.message ||
                'Không thể tạo gia đình lúc này.';
            appToast.showError('Lỗi', message);
            console.error(
                'Create Family Error Details:',
                error?.response?.data || error,
            );
        },
    });
}

export function useSearchUserByPhoneMutation() {
    return useMutation({
        mutationFn: ({
            familyId,
            phoneNumber,
            dryRun = true,
        }: {
            familyId: string;
            phoneNumber: string;
            dryRun?: boolean;
        }) =>
            familiesServices.findUserByPhoneNumber(
                familyId,
                phoneNumber,
                dryRun,
            ),
    });
}

export function useInviteUserByPhoneMutation() {
    return useMutation({
        mutationFn: ({
            familyId,
            phoneNumber,
            userId,
            role,
            dryRun = false,
        }: {
            familyId: string;
            phoneNumber: string;
            userId: string;
            role: FamilyRole;
            dryRun?: boolean;
        }) =>
            familiesServices.inviteUser(
                familyId,
                phoneNumber,
                userId,
                role,
                dryRun,
            ),
        onSuccess: () => {
            appQueryClient.invalidateQueries({ queryKey: familyQueryKeys.all });
            appToast.showSuccess('Thành công', 'Đã gửi lời mời.');
        },
        onError: (error) => {
            const status = getApiErrorStatus(error);
            if (status === 409) {
                appToast.showInfo(
                    'Trạng thái hiện tại',
                    'Người này đã là thành viên hoặc đang có lời mời chờ xử lý.',
                );
                return;
            }
            if (status === 403) {
                appToast.showError(
                    'Không đủ quyền',
                    'Bạn cần quyền OWNER hoặc ADMIN để mời thành viên.',
                );
                return;
            }
            appToast.showError(
                'Lỗi',
                getApiErrorMessage(error, 'Không thể gửi lời mời.'),
            );
        },
    });
}

export function usePatchFamilyMutation() {
    return useMutation({
        mutationFn: ({ familyId, data }: { familyId: string; data: any }) =>
            familiesServices.patchFamily(familyId, data),
        onSuccess: () => {
            appQueryClient.invalidateQueries({ queryKey: familyQueryKeys.all });
            appToast.showSuccess('Thành công', 'Đã cập nhật gia đình.');
        },
        onError: () => {
            appToast.showError('Lỗi', 'Không thể cập nhật gia đình lúc này.');
        },
    });
}

export function useAddMedicineInventoryMutation() {
    return useMutation({
        mutationFn: ({ familyId, data }: { familyId: string; data: any }) =>
            familiesServices.addMedicineInventory(familyId, data),
        onSuccess: (_, variables) => {
            appQueryClient.invalidateQueries({
                queryKey: familyQueryKeys.medicineInventory(variables.familyId),
            });
            appToast.showSuccess('Thành công', 'Đã thêm thuốc.');
        },
        onError: () => {
            appToast.showError('Lỗi', 'Không thể thêm thuốc lúc này.');
        },
    });
}

export function usePatchMedicineInventoryMutation() {
    return useMutation({
        mutationFn: (vars: {
            itemId: string;
            familyId: string;
            data: Record<string, unknown>;
        }) => familiesServices.patchMedicineInventory(vars.itemId, vars.data),
        onSuccess: (_, variables) => {
            appQueryClient.invalidateQueries({
                queryKey: familyQueryKeys.medicineInventory(variables.familyId),
            });
            appToast.showSuccess('Thành công', 'Đã cập nhật thuốc.');
        },
        onError: () => {
            appToast.showError('Lỗi', 'Không thể cập nhật thuốc lúc này.');
        },
    });
}

export function useRotateInviteMutation() {
    return useMutation({
        mutationFn: ({ familyId }: { familyId: string }) =>
            familiesServices.rotateInviteCode(familyId),
        onSuccess: () => {
            appQueryClient.invalidateQueries({ queryKey: familyQueryKeys.all });
            appToast.showSuccess('Thành công', 'Đã đổi mã mời mới.');
        },
        onError: () => {
            appToast.showError('Lỗi', 'Không thể đổi mã mời lúc này.');
        },
    });
}

export function useDeleteMemberMutation() {
    return useMutation({
        mutationFn: ({ membershipId }: { membershipId: string }) =>
            familiesServices.deleteMember(membershipId),
        onSuccess: () => {
            appQueryClient.invalidateQueries({ queryKey: familyQueryKeys.all });
            appToast.showSuccess('Thành công', 'Đã xóa thành viên.');
        },
        onError: () => {
            appToast.showError('Lỗi', 'Không thể xóa thành viên lúc này.');
        },
    });
}

export function usePatchMemberMutation() {
    return useMutation({
        mutationFn: ({
            membershipId,
            ...data
        }: {
            membershipId: string;
        } & Record<string, unknown>) =>
            familiesServices.patchMember(membershipId, data),
        onSuccess: () => {
            appQueryClient.invalidateQueries({ queryKey: familyQueryKeys.all });
            appToast.showSuccess('Thành công', 'Đã cập nhật thông tin.');
        },
        onError: () => {
            appToast.showError('Lỗi', 'Không thể cập nhật thông tin lúc này.');
        },
    });
}

export function useCreateProfileInFamilyMutation() {
    return useMutation({
        mutationFn: ({
            familyId,
            data,
        }: {
            familyId: string;
            data: Record<string, unknown>;
        }) => familiesServices.createProfile(familyId, data),
        onSuccess: () => {
            appQueryClient.invalidateQueries({ queryKey: familyQueryKeys.all });
            appToast.showSuccess('Thành công', 'Đã tạo hồ sơ trong gia đình.');
        },
        onError: (error: any) => {
            const message =
                error?.response?.data?.detail?.[0]?.msg ||
                error?.response?.data?.message ||
                error?.message ||
                'Không thể tạo hồ sơ lúc này.';
            appToast.showError('Lỗi', String(message));
        },
    });
}
