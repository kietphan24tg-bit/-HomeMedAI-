import apiClient from '../api/client';

export type NotificationApiItem = {
    id: string;
    category: string;
    status?: string | null;
    title?: string | null;
    body?: string | null;
    remind_time?: string | null;
    scheduled_at?: string | null;
    medicine_name?: string | null;
    dosage_per_time?: string | null;
    profile_id: string;
    profile_name?: string | null;
    family_name?: string | null;
};

export type NotificationListResponse = {
    items: NotificationApiItem[];
};

export type ScheduleComplianceOutcome = 'taken' | 'skipped';

export type ScheduleComplianceResponse = {
    success: boolean;
    message: string;
};

export const notificationsService = {
    getMyNotifications: async () => {
        const res =
            await apiClient.get<NotificationListResponse>('/notifications/me');
        return res.data;
    },

    logScheduleCompliance: async (
        scheduleId: string,
        outcome: ScheduleComplianceOutcome,
    ) => {
        const res = await apiClient.post<ScheduleComplianceResponse>(
            `/notifications/me/schedules/${scheduleId}/compliance`,
            { outcome },
        );
        return res.data;
    },
};
