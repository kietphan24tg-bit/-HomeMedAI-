import { useMutation } from '@tanstack/react-query';
import { medicalRecordsQueryKeys } from './queryKeys';
import { appQueryClient } from '../../lib/query-client';
import { appToast } from '../../lib/toast';
import {
    medicalRecordsServices,
    type CreateMedicalRecordPayload,
    type MedicalAttachmentPayload,
    type UpdateMedicalRecordPayload,
} from '../../services/medicalRecords.services';

export function useCreateMedicalRecordMutation() {
    return useMutation({
        mutationFn: ({
            profileId,
            data,
        }: {
            profileId: string;
            data: CreateMedicalRecordPayload;
        }) => medicalRecordsServices.createMedicalRecord(profileId, data),
        onSuccess: (_, variables) => {
            appQueryClient.invalidateQueries({
                queryKey: medicalRecordsQueryKeys.list(variables.profileId),
            });
            appToast.showSuccess('Thành công', 'Hồ sơ y tế đã được thêm');
        },
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail || 'Không thể thêm hồ sơ y tế',
            );
        },
    });
}

export function useUpdateMedicalRecordMutation() {
    return useMutation({
        mutationFn: ({
            recordId,
            data,
        }: {
            recordId: string;
            data: UpdateMedicalRecordPayload;
        }) => medicalRecordsServices.updateMedicalRecord(recordId, data),
        onSuccess: (_, variables) => {
            appQueryClient.invalidateQueries({
                queryKey: medicalRecordsQueryKeys.detail(variables.recordId),
            });
            appToast.showSuccess('Thành công', 'Hồ sơ y tế đã cập nhật');
        },
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail ||
                    'Không thể cập nhật hồ sơ y tế',
            );
        },
    });
}

export function useDeleteMedicalRecordMutation() {
    return useMutation({
        mutationFn: (recordId: string) =>
            medicalRecordsServices.deleteMedicalRecord(recordId),
        onSuccess: () => {
            appQueryClient.invalidateQueries({
                queryKey: medicalRecordsQueryKeys.all,
            });
            appToast.showSuccess('Thành công', 'Hồ sơ y tế đã xóa');
        },
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail || 'Không thể xóa hồ sơ y tế',
            );
        },
    });
}

export function useAddMedicalAttachmentMutation() {
    return useMutation({
        mutationFn: ({
            recordId,
            data,
        }: {
            recordId: string;
            data: MedicalAttachmentPayload;
        }) => medicalRecordsServices.addMedicalAttachment(recordId, data),
        onSuccess: (_, variables) => {
            appQueryClient.invalidateQueries({
                queryKey: medicalRecordsQueryKeys.attachments(
                    variables.recordId,
                ),
            });
            appToast.showSuccess('Thành công', 'Tệp đã được tải lên');
        },
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail || 'Không thể tải lên tệp',
            );
        },
    });
}

export function useDeleteMedicalAttachmentMutation() {
    return useMutation({
        mutationFn: (attachmentId: string) =>
            medicalRecordsServices.deleteMedicalAttachment(attachmentId),
        onSuccess: () => {
            appQueryClient.invalidateQueries({
                queryKey: medicalRecordsQueryKeys.all,
            });
            appToast.showSuccess('Thành công', 'Tệp đã xóa');
        },
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail || 'Không thể xóa tệp',
            );
        },
    });
}
