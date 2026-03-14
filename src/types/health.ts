export interface VisitItem {
    iconName: string;
    iconColor: string;
    bg: string;
    title: string;
    sub: string;
    tag: string;
    tagBg: string;
    tagColor: string;
    date: string;
}

/** Extended record for the records-list detail screen */
export interface RecordItem {
    id: string;
    category: string; // cardiology | general | internal | dermatology | pediatrics …
    iconName: string;
    iconColor: string;
    bg: string;
    title: string;
    hospital: string;
    doctor?: string;
    diagnosis?: string;
    tag: string;
    tagBg: string;
    tagColor: string;
    dotColor: string;
    date: string; // dd/mm/yyyy
    isoDate: string; // yyyy-mm-dd
    location?: string;
}

export interface VaccineItem {
    name: string;
    date: string;
}

/** Extended vaccine for the vaccine detail screen */
export interface VaccineDose {
    num: number;
    date?: string;
    scheduled?: string;
    place?: string;
}

export interface VaccineDetailItem {
    id: string;
    name: string;
    abbr: string;
    total: number;
    doses: VaccineDose[];
}

export interface MedRowItem {
    name: string;
    sub: string;
    bg: string;
    iconColor: string;
}

/** Extended medicine for the medicine detail screen */
export interface MedicineItem {
    id: string;
    name: string;
    group: string;
    dose: string;
    freq: number;
    times: string[];
    meal: string;
    days: number;
    daysLeft: number;
    startDate: string;
    note?: string;
    active: boolean;
    totalPills: number;
    takenPills: number;
}

export interface HealthInfoItem {
    iconName: string;
    iconColor: string;
    iconBg: string;
    label: string;
    value?: string;
    valueColor?: string;
    tags?: { text: string; bg: string; color: string }[];
    emptyText?: string;
}

export interface TipItem {
    icon: string;
    title: string;
    sub: string;
}

export type NotiType = 'med' | 'vax' | 'appt';
export type NotiDay = 'today' | 'yesterday' | 'before';

export interface NotificationItem {
    id: string;
    day: NotiDay;
    type: NotiType;
    unread: boolean;
    title: string;
    body: string;
    time: string;
}
