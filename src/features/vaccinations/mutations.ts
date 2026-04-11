import { useMutation } from '@tanstack/react-query';
import { vaccinationQueryKeys } from './queryKeys';
import { appQueryClient } from '../../lib/query-client';
import { appToast } from '../../lib/toast';
import {
    vaccinationServices,
    type VaccinationDosePayload,
} from '../../services/vaccinations.services';

export function useSubscribeToVaccineMutation() {
    return useMutation({
        mutationFn: ({
            profileId,
            recommendationId,
        }: {
            profileId: string;
            recommendationId: string;
        }) =>
            vaccinationServices.subscribeToVaccine(profileId, recommendationId),
        onSuccess: (_, variables) => {
            appQueryClient.invalidateQueries({
                queryKey: vaccinationQueryKeys.profileVaccinations(
                    variables.profileId,
                ),
            });
            appToast.showSuccess('Thành công', 'Đã theo dõi vắc-xin');
        },
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail || 'Không thể theo dõi vắc-xin',
            );
        },
    });
}

export function useUpdateUserVaccinationMutation() {
    return useMutation({
        mutationFn: ({
            userVaccinationId,
            status,
        }: {
            userVaccinationId: string;
            status: string;
        }) =>
            vaccinationServices.updateUserVaccination(
                userVaccinationId,
                status,
            ),
        onSuccess: (_, variables) => {
            appQueryClient.invalidateQueries({
                queryKey: vaccinationQueryKeys.userVaccination(
                    variables.userVaccinationId,
                ),
            });
            appToast.showSuccess(
                'Thành công',
                'Trạng thái vắc-xin đã cập nhật',
            );
        },
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail ||
                    'Không thể cập nhật trạng thái vắc-xin',
            );
        },
    });
}

export function useAddVaccinationDoseMutation() {
    return useMutation({
        mutationFn: ({
            userVaccinationId,
            payload,
        }: {
            userVaccinationId: string;
            payload: VaccinationDosePayload;
        }) =>
            vaccinationServices.addVaccinationDose(userVaccinationId, payload),
        onSuccess: (_, variables) => {
            appQueryClient.invalidateQueries({
                queryKey: vaccinationQueryKeys.doses(
                    variables.userVaccinationId,
                ),
            });
            appToast.showSuccess('Thành công', 'Liều vắc-xin đã được ghi lại');
        },
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail ||
                    'Không thể ghi lại liều vắc-xin',
            );
        },
    });
}

export function useUpdateVaccinationDoseMutation() {
    return useMutation({
        mutationFn: ({
            doseId,
            payload,
        }: {
            doseId: string;
            payload: Partial<VaccinationDosePayload>;
        }) => vaccinationServices.updateVaccinationDose(doseId, payload),
        onSuccess: () => {
            appQueryClient.invalidateQueries({
                queryKey: vaccinationQueryKeys.all,
            });
            appToast.showSuccess('Thành công', 'Liều vắc-xin đã cập nhật');
        },
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail ||
                    'Không thể cập nhật liều vắc-xin',
            );
        },
    });
}

export function useDeleteVaccinationDoseMutation() {
    return useMutation({
        mutationFn: (doseId: string) =>
            vaccinationServices.deleteVaccinationDose(doseId),
        onSuccess: () => {
            appQueryClient.invalidateQueries({
                queryKey: vaccinationQueryKeys.all,
            });
            appToast.showSuccess('Thành công', 'Liều vắc-xin đã xóa');
        },
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail || 'Không thể xóa liều vắc-xin',
            );
        },
    });
}
