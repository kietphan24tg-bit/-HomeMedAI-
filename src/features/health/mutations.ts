import { useMutation } from '@tanstack/react-query';
import { healthQueryKeys } from './queryKeys';
import { appQueryClient } from '../../lib/query-client';
import { appToast } from '../../lib/toast';
import {
    healthProfileServices,
    type UpdateHealthProfilePayload,
    type UpdateProfilePayload,
} from '../../services/healthProfile.services';

export function useUpdateHealthProfileMutation() {
    return useMutation({
        mutationFn: ({
            profileId,
            data,
        }: {
            profileId: string;
            data: UpdateHealthProfilePayload;
        }) => healthProfileServices.updateHealthProfile(profileId, data),
        onSuccess: (_, variables) => {
            appQueryClient.invalidateQueries({
                queryKey: healthQueryKeys.profile(variables.profileId),
            });
            appToast.showSuccess(
                'Thành công',
                'Thông tin sức khỏe đã cập nhật',
            );
        },
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail ||
                    'Không thể cập nhật thông tin sức khỏe',
            );
        },
    });
}

export function useUpdateProfileMutation() {
    return useMutation({
        mutationFn: ({
            profileId,
            data,
        }: {
            profileId: string;
            data: UpdateProfilePayload;
        }) => healthProfileServices.updateProfile(profileId, data),
        onSuccess: (_, variables) => {
            appQueryClient.invalidateQueries({
                queryKey: healthQueryKeys.detail(variables.profileId),
            });
            appToast.showSuccess('Thành công', 'Hồ sơ đã cập nhật');
        },
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail || 'Không thể cập nhật hồ sơ',
            );
        },
    });
}

export function useLinkProfileMutation() {
    return useMutation({
        mutationFn: ({
            profileId,
            userId,
        }: {
            profileId: string;
            userId: string;
        }) => healthProfileServices.linkProfile(profileId, { user_id: userId }),
        onSuccess: (_, variables) => {
            appQueryClient.invalidateQueries({
                queryKey: healthQueryKeys.detail(variables.profileId),
            });
            appToast.showSuccess('Thành công', 'Hồ sơ đã liên kết');
        },
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail || 'Không thể liên kết hồ sơ',
            );
        },
    });
}

export function useDeleteProfileMutation() {
    return useMutation({
        mutationFn: (profileId: string) =>
            healthProfileServices.deleteProfile(profileId),
        onSuccess: () => {
            appQueryClient.invalidateQueries({
                queryKey: healthQueryKeys.all,
            });
            appToast.showSuccess('Thành công', 'Hồ sơ đã xóa');
        },
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail || 'Không thể xóa hồ sơ',
            );
        },
    });
}
