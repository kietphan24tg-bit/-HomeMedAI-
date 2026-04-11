import { useMutation } from '@tanstack/react-query';
import { medicineInventoryQueryKeys } from './queryKeys';
import { appQueryClient } from '../../lib/query-client';
import { appToast } from '../../lib/toast';
import {
    medicineInventoryServices,
    type UpdateMedicineInventoryPayload,
} from '../../services/medicineInventory.services';

export function useUpdateMedicineItemMutation() {
    return useMutation({
        mutationFn: ({
            itemId,
            data,
        }: {
            itemId: string;
            data: UpdateMedicineInventoryPayload;
        }) => medicineInventoryServices.updateMedicineItem(itemId, data),
        onSuccess: (_, variables) => {
            appQueryClient.invalidateQueries({
                queryKey: medicineInventoryQueryKeys.detail(variables.itemId),
            });
            appToast.showSuccess('Thành công', 'Thuốc đã cập nhật');
        },
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail || 'Không thể cập nhật thuốc',
            );
        },
    });
}

export function useDeleteMedicineItemMutation() {
    return useMutation({
        mutationFn: (itemId: string) =>
            medicineInventoryServices.deleteMedicineItem(itemId),
        onSuccess: () => {
            appQueryClient.invalidateQueries({
                queryKey: medicineInventoryQueryKeys.all,
            });
            appToast.showSuccess('Thành công', 'Thuốc đã xóa');
        },
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail || 'Không thể xóa thuốc',
            );
        },
    });
}
