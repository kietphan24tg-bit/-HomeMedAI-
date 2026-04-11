// Metrics data types and mock data
import { colors } from '../styles/tokens';

export interface MetricReading {
    dateFull: string; // Format: "15/03/2026 · 08:00"
    date: string; // Format: "15/03"
    time: string; // Format: "08:00"
    value: string; // e.g., "130/85", "55", "5.4"
    status: string; // e.g., "Cao", "Bình thường"
    statusColor: string;
    badgeBg: string;
    badgeBorder: string;
    icon: string; // Ionicons name
    iconColor: string;
}

export interface MetricData {
    id: 'bp' | 'weight' | 'glucose';
    label: string;
    unit: string;
    latestValue: string;
    latestDate: string;
    latestStatus: string;
    statusColor: string;
    badgeBg: string;
    badgeBorder: string;
    icon: string;
    iconColor: string;
    readings: MetricReading[];
    chartData: {
        systolic?: number[]; // for BP
        diastolic?: number[]; // for BP
        values?: number[]; // for weight/glucose
        dates: string[];
    };
}

// Blood Pressure Mock Data
export const BP_DATA: MetricData = {
    id: 'bp',
    label: 'Huyết áp',
    unit: 'mmHg',
    latestValue: '130/85',
    latestDate: '15/03/2026 08:00',
    latestStatus: 'Hơi cao',
    statusColor: colors.danger,
    badgeBg: '#FEF2F2',
    badgeBorder: '#FECACA',
    icon: 'water-outline',
    iconColor: colors.danger,
    readings: [
        {
            dateFull: '15/03/2026 · 08:00',
            date: '15/03',
            time: '08:00',
            value: '130/85',
            status: 'Cao',
            statusColor: colors.danger,
            badgeBg: '#FEF2F2',
            badgeBorder: '#FECACA',
            icon: 'warning',
            iconColor: colors.warning,
        },
        {
            dateFull: '01/03/2026 · 07:30',
            date: '01/03',
            time: '07:30',
            value: '125/82',
            status: 'Bình thường',
            statusColor: colors.success,
            badgeBg: '#F0FDF4',
            badgeBorder: '#BBF7D0',
            icon: 'checkmark',
            iconColor: colors.success,
        },
        {
            dateFull: '15/02/2026 · 08:15',
            date: '15/02',
            time: '08:15',
            value: '128/80',
            status: 'Bình thường',
            statusColor: colors.success,
            badgeBg: '#F0FDF4',
            badgeBorder: '#BBF7D0',
            icon: 'checkmark',
            iconColor: colors.success,
        },
        {
            dateFull: '01/02/2026 · 07:45',
            date: '01/02',
            time: '07:45',
            value: '132/88',
            status: 'Cao',
            statusColor: colors.danger,
            badgeBg: '#FEF2F2',
            badgeBorder: '#FECACA',
            icon: 'warning',
            iconColor: colors.warning,
        },
        {
            dateFull: '15/01/2026 · 08:00',
            date: '15/01',
            time: '08:00',
            value: '135/85',
            status: 'Cao',
            statusColor: colors.danger,
            badgeBg: '#FEF2F2',
            badgeBorder: '#FECACA',
            icon: 'warning',
            iconColor: colors.warning,
        },
    ],
    chartData: {
        systolic: [135, 128, 125, 130, 140],
        diastolic: [85, 80, 82, 88, 85],
        dates: ['01/01', '15/01', '01/02', '15/02', '01/03', '15/03'],
    },
};

// Weight Mock Data
export const WEIGHT_DATA: MetricData = {
    id: 'weight',
    label: 'Cân nặng',
    unit: 'kg',
    latestValue: '55',
    latestDate: '15/03/2026 08:00',
    latestStatus: 'Bình thường',
    statusColor: colors.success,
    badgeBg: '#F0FDF4',
    badgeBorder: '#BBF7D0',
    icon: 'barbell-outline',
    iconColor: colors.primary,
    readings: [
        {
            dateFull: '15/03/2026 · 08:00',
            date: '015/03',
            time: '08:00',
            value: '55',
            status: 'Bình thường',
            statusColor: colors.success,
            badgeBg: '#F0FDF4',
            badgeBorder: '#BBF7D0',
            icon: 'checkmark',
            iconColor: colors.success,
        },
        {
            dateFull: '01/03/2026 · 07:30',
            date: '01/03',
            time: '07:30',
            value: '54',
            status: 'Bình thường',
            statusColor: colors.success,
            badgeBg: '#F0FDF4',
            badgeBorder: '#BBF7D0',
            icon: 'checkmark',
            iconColor: colors.success,
        },
        {
            dateFull: '15/02/2026 · 08:15',
            date: '15/02',
            time: '08:15',
            value: '55',
            status: 'Bình thường',
            statusColor: colors.success,
            badgeBg: '#F0FDF4',
            badgeBorder: '#BBF7D0',
            icon: 'checkmark',
            iconColor: colors.success,
        },
        {
            dateFull: '01/02/2026 · 07:45',
            date: '01/02',
            time: '07:45',
            value: '56',
            status: 'Thua cân',
            statusColor: colors.warning,
            badgeBg: '#FFFBEB',
            badgeBorder: '#FED7AA',
            icon: 'warning',
            iconColor: colors.warning,
        },
        {
            dateFull: '15/01/2026 · 08:00',
            date: '15/01',
            time: '08:00',
            value: '57',
            status: 'Thua cân',
            statusColor: colors.warning,
            badgeBg: '#FFFBEB',
            badgeBorder: '#FED7AA',
            icon: 'warning',
            iconColor: colors.warning,
        },
    ],
    chartData: {
        values: [57, 56, 55, 54, 55],
        dates: ['01/01', '15/01', '01/02', '15/02', '01/03', '15/03'],
    },
};

// Glucose Mock Data
export const GLUCOSE_DATA: MetricData = {
    id: 'glucose',
    label: 'Đường huyết',
    unit: 'mmol/L',
    latestValue: '5.4',
    latestDate: '10/03/2026 08:00',
    latestStatus: 'Bình thường',
    statusColor: colors.success,
    badgeBg: '#F0FDF4',
    badgeBorder: '#BBF7D0',
    icon: 'document-text-outline',
    iconColor: '#D97706',
    readings: [
        {
            dateFull: '10/03/2026 · 08:00',
            date: '10/03',
            time: '08:00',
            value: '5.4',
            status: 'Bình thường',
            statusColor: colors.success,
            badgeBg: '#F0FDF4',
            badgeBorder: '#BBF7D0',
            icon: 'checkmark',
            iconColor: colors.success,
        },
        {
            dateFull: '28/02/2026 · 07:30',
            date: '28/02',
            time: '07:30',
            value: '5.2',
            status: 'Bình thường',
            statusColor: colors.success,
            badgeBg: '#F0FDF4',
            badgeBorder: '#BBF7D0',
            icon: 'checkmark',
            iconColor: colors.success,
        },
        {
            dateFull: '15/02/2026 · 08:15',
            date: '15/02',
            time: '08:15',
            value: '5.6',
            status: 'Bình thường',
            statusColor: colors.success,
            badgeBg: '#F0FDF4',
            badgeBorder: '#BBF7D0',
            icon: 'checkmark',
            iconColor: colors.success,
        },
        {
            dateFull: '01/02/2026 · 07:45',
            date: '01/02',
            time: '07:45',
            value: '6.2',
            status: 'Cao',
            statusColor: colors.danger,
            badgeBg: '#FEF2F2',
            badgeBorder: '#FECACA',
            icon: 'warning',
            iconColor: colors.warning,
        },
        {
            dateFull: '15/01/2026 · 08:00',
            date: '15/01',
            time: '08:00',
            value: '6.0',
            status: 'Cao',
            statusColor: colors.danger,
            badgeBg: '#FEF2F2',
            badgeBorder: '#FECACA',
            icon: 'warning',
            iconColor: colors.warning,
        },
    ],
    chartData: {
        values: [6.0, 6.2, 5.6, 5.2, 5.4],
        dates: ['01/01', '15/01', '01/02', '15/02', '01/03', '10/03'],
    },
};

// Helper function to get metric data by ID
export function getMetricData(
    metricId: 'bp' | 'weight' | 'glucose',
): MetricData {
    switch (metricId) {
        case 'bp':
            return BP_DATA;
        case 'weight':
            return WEIGHT_DATA;
        case 'glucose':
            return GLUCOSE_DATA;
        default:
            return BP_DATA;
    }
}
