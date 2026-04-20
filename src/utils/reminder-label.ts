import { type RemindBeforeUnit } from '@/src/services/remindBefore.types';

const UNIT_LABELS: Record<RemindBeforeUnit, string> = {
    MINUTES: 'phút',
    HOURS: 'giờ',
    DAYS: 'ngày',
    WEEKS: 'tuần',
};

const LABEL_TO_UNIT: Record<string, RemindBeforeUnit> = {
    phút: 'MINUTES',
    phut: 'MINUTES',
    giờ: 'HOURS',
    gio: 'HOURS',
    ngay: 'DAYS',
    ngày: 'DAYS',
    tuần: 'WEEKS',
    tuan: 'WEEKS',
};

function normalizeUnitLabel(value: string): string {
    return value.trim().toLowerCase();
}

export function reminderPayloadToLabel(
    value: number,
    unit: RemindBeforeUnit,
): string {
    const unitLabel = UNIT_LABELS[unit] ?? 'ngày';
    return `${value} ${unitLabel}`;
}

export function reminderLabelToPayload(label: string): {
    reminder_enabled: boolean;
    remind_before_value?: number;
    remind_before_unit?: RemindBeforeUnit;
} {
    const normalized = label.trim().toLowerCase();
    if (
        !normalized ||
        normalized.includes('không') ||
        normalized.includes('khong')
    ) {
        return {
            reminder_enabled: false,
        };
    }

    const matched = normalized.match(
        /(\d+)\s*(phút|phut|giờ|gio|ngày|ngay|tuần|tuan)/i,
    );
    if (!matched) {
        return {
            reminder_enabled: true,
            remind_before_value: 1,
            remind_before_unit: 'DAYS',
        };
    }

    const remindValue = Number(matched[1]);
    const remindUnit = LABEL_TO_UNIT[normalizeUnitLabel(matched[2])] ?? 'DAYS';

    if (!Number.isFinite(remindValue) || remindValue <= 0) {
        return {
            reminder_enabled: true,
            remind_before_value: 1,
            remind_before_unit: remindUnit,
        };
    }

    return {
        reminder_enabled: true,
        remind_before_value: remindValue,
        remind_before_unit: remindUnit,
    };
}
