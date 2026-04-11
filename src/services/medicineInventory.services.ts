import apiClient from '../api/client';

export interface CreateMedicineInventoryPayload {
    family_id: string;
    medicine_name: string;
    medicine_type?: string;
    expiry_date?: string;
    quantity_stock?: number;
    unit?: string;
    min_stock_alert?: number;
    instruction?: string;
    expiry_alert_days_before?: number;
}

export interface UpdateMedicineInventoryPayload {
    medicine_name?: string;
    medicine_type?: string;
    expiry_date?: string;
    quantity_stock?: number;
    unit?: string;
    min_stock_alert?: number;
    instruction?: string;
    expiry_alert_days_before?: number;
}

export const medicineInventoryServices = {
    // Get a medicine item
    getMedicineItem: async (itemId: string) => {
        const res = await apiClient.get(`/medicine-inventory/${itemId}`);
        return res.data;
    },

    // Update a medicine item
    updateMedicineItem: async (
        itemId: string,
        payload: UpdateMedicineInventoryPayload,
    ) => {
        const res = await apiClient.patch(
            `/medicine-inventory/${itemId}`,
            payload,
        );
        return res.data;
    },

    // Delete a medicine item
    deleteMedicineItem: async (itemId: string) => {
        const res = await apiClient.delete(`/medicine-inventory/${itemId}`);
        return res.data;
    },
};
