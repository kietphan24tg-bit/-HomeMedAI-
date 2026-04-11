export const medicineInventoryQueryKeys = {
    all: ['medicineInventory'] as const,
    detail: (itemId: string) =>
        [...medicineInventoryQueryKeys.all, 'detail', itemId] as const,
};
