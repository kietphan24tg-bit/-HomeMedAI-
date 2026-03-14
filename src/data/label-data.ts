export type BadgeStatus =
    | 'new'
    | 'today'
    | 'good'
    | 'warning'
    | 'danger'
    | 'normal'
    | 'underweight'
    | 'overweight'
    | 'obese';

export interface Badge {
    label: string;
    status: BadgeStatus;
    color: string;
    bg: string;
}

// ===== BADGE COLORS =====

export const BADGE_COLORS: Record<BadgeStatus, { color: string; bg: string }> =
    {
        new: {
            color: '#2563EB',
            bg: '#DBEAFE',
        },

        today: {
            color: '#D97706',
            bg: '#FEF3C7',
        },

        good: {
            color: '#059669',
            bg: '#D1FAE5',
        },

        warning: {
            color: '#D97706',
            bg: '#FEF3C7',
        },

        danger: {
            color: '#DC2626',
            bg: '#FEE2E2',
        },

        normal: {
            color: '#059669',
            bg: '#D1FAE5',
        },

        underweight: {
            color: '#2563EB',
            bg: '#DBEAFE',
        },

        overweight: {
            color: '#D97706',
            bg: '#FEF3C7',
        },

        obese: {
            color: '#DC2626',
            bg: '#FEE2E2',
        },
    };

// ===== LABEL TEXT =====

export const LABEL_TEXT = {
    NEW: 'Mới',
    TODAY: 'Hôm nay',

    GOOD: 'Tốt',
    WARNING: 'Cần bổ sung',
    DANGER: 'Thiếu',

    NORMAL: 'Bình thường',
    UNDERWEIGHT: 'Thiếu cân',
    OVERWEIGHT: 'Thừa cân',
    OBESE: 'Béo phì',
};

// ===== HELPER =====

function createBadge(status: BadgeStatus, label: string): Badge {
    const color = BADGE_COLORS[status];

    return {
        label,
        status,
        color: color.color,
        bg: color.bg,
    };
}

// ===== RECORD BADGE =====

export function getRecordBadge(createdAt: Date): Badge | null {
    const now = new Date();

    const diffDays =
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays <= 7) {
        return createBadge('new', LABEL_TEXT.NEW);
    }

    return null;
}

// ===== MEDICATION BADGE =====

export function getMedicationBadge(hasTodayDose: boolean): Badge | null {
    if (hasTodayDose) {
        return createBadge('today', LABEL_TEXT.TODAY);
    }

    return null;
}

// ===== VACCINE BADGE =====

export function getVaccineBadge(percent: number): Badge {
    if (percent >= 80) {
        return createBadge('good', LABEL_TEXT.GOOD);
    }

    if (percent >= 40) {
        return createBadge('warning', LABEL_TEXT.WARNING);
    }

    return createBadge('danger', LABEL_TEXT.DANGER);
}

// ===== BMI BADGE =====

export function getBMIBadge(bmi: number): Badge {
    if (bmi < 18.5) {
        return createBadge('underweight', LABEL_TEXT.UNDERWEIGHT);
    }

    if (bmi < 25) {
        return createBadge('normal', LABEL_TEXT.NORMAL);
    }

    if (bmi < 30) {
        return createBadge('overweight', LABEL_TEXT.OVERWEIGHT);
    }

    return createBadge('obese', LABEL_TEXT.OBESE);
}
