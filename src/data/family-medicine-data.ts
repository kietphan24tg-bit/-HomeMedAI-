export type FamilyMedicineItem = {
    id: string;
    familyId: string;
    name: string;
    qty: number;
    unit: string;
    exp: string;
    location: string;
    note?: string;
    group?: string;
    dose?: string;
    lowThreshold: number;
    originalQty: number;
    form?: string;
    reminder?: string;
};

export const FAMILY_MEDICINES: FamilyMedicineItem[] = [
    {
        id: 'tc1',
        familyId: 'phan-family',
        name: 'Paracetamol 500mg',
        qty: 8,
        unit: 'viên',
        exp: '2026-04-20',
        location: 'Tủ phòng khách',
        note: 'Dùng khi sốt, đau đầu',
        group: 'Giảm đau · Hạ sốt',
        dose: '1-2 viên/lần',
        lowThreshold: 10,
        originalQty: 20,
        form: 'Viên nén',
        reminder: 'ON • T3,T5 07:00/20:00',
    },
    {
        id: 'tc2',
        familyId: 'phan-family',
        name: 'Amoxicillin 500mg',
        qty: 6,
        unit: 'viên',
        exp: '2026-03-25',
        location: 'Tủ phòng ngủ',
        note: 'Dùng hết liệu trình',
        group: 'Kháng sinh',
        dose: '1 viên x 3 lần/ngày',
        lowThreshold: 6,
        originalQty: 21,
    },
    {
        id: 'tc3',
        familyId: 'phan-family',
        name: 'Dầu gió Eagle',
        qty: 2,
        unit: 'chai',
        exp: '2026-03-30',
        location: 'Tủ phòng khách',
        group: 'Ngoài da',
        dose: 'Bôi ngoài da',
        lowThreshold: 1,
        originalQty: 3,
    },
    {
        id: 'tc4',
        familyId: 'phan-family',
        name: 'Siro ho Prospan',
        qty: 1,
        unit: 'chai',
        exp: '2026-07-15',
        location: 'Tủ bếp',
        note: 'Lắc đều trước khi dùng',
        group: 'Hô hấp · Ho · Cảm',
        dose: '5ml x 3 lần/ngày',
        lowThreshold: 2,
        originalQty: 3,
    },
    {
        id: 'tc5',
        familyId: 'phan-family',
        name: 'Vitamin C 1000mg',
        qty: 12,
        unit: 'viên',
        exp: '2026-08-10',
        location: 'Tủ phòng khách',
        note: 'Uống sau ăn',
        group: 'Vitamin · Bổ sung',
        dose: '1 viên/ngày',
        lowThreshold: 8,
        originalQty: 30,
        form: 'Viên sủi',
        reminder: 'ON • Mỗi ngày 08:00',
    },
    {
        id: 'tc6',
        familyId: 'phan-family',
        name: 'Berberin 50mg',
        qty: 30,
        unit: 'viên',
        exp: '2027-01-10',
        location: 'Tủ phòng khách',
        note: 'Đau bụng, tiêu chảy',
        group: 'Tiêu hóa',
        dose: '2 viên/lần',
        lowThreshold: 10,
        originalQty: 30,
    },
];

export function getFamilyMedicines(familyId: string) {
    return FAMILY_MEDICINES.filter((item) => item.familyId === familyId);
}
