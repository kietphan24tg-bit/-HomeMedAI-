import { useQuery } from '@tanstack/react-query';
import { medicineInventoryQueryKeys } from './queryKeys';
import { medicineInventoryServices } from '../../services/medicineInventory.services';

export function useMedicineItemQuery(itemId: string | null) {
    return useQuery({
        queryKey: itemId
            ? medicineInventoryQueryKeys.detail(itemId)
            : ['disabled'],
        queryFn: () =>
            itemId ? medicineInventoryServices.getMedicineItem(itemId) : null,
        enabled: !!itemId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
    });
}
