import { type RemindBeforeUnit } from './remindBefore.types';
import apiClient from '../api/client';

export type AppointmentReminderType = {
    id: string;
    profile_id: string;
    type: 'checkup' | 'vaccine';
    title: string;
    hospital_name?: string | null;
    department?: string | null;
    appointment_at: string;
    remind_before_value: number;
    remind_before_unit: RemindBeforeUnit;
    vaccine_name?: string | null;
    dose_number?: number | null;
    total_doses?: number | null;
    status: string;
    note?: string | null;
    follow_up_appointment_id?: string | null;
    vaccination_dose_id?: string | null;
};

export const appointmentRemindersService = {
    listForProfile: async (profileId: string) => {
        const res = await apiClient.get<AppointmentReminderType[]>(
            `/profiles/${profileId}/appointment-reminders`,
        );
        return res.data;
    },

    create: async (
        profileId: string,
        body: {
            type: 'checkup' | 'vaccine';
            title: string;
            appointment_at: string;
            remind_before_value?: number;
            remind_before_unit?: RemindBeforeUnit;
            hospital_name?: string | null;
            department?: string | null;
            vaccine_name?: string | null;
            dose_number?: number | null;
            total_doses?: number | null;
            note?: string | null;
            follow_up_appointment_id?: string | null;
            vaccination_dose_id?: string | null;
        },
    ) => {
        const res = await apiClient.post<AppointmentReminderType>(
            `/profiles/${profileId}/appointment-reminders`,
            body,
        );
        return res.data;
    },

    patch: async (
        reminderId: string,
        body: Partial<{
            title: string;
            appointment_at: string;
            remind_before_value: number;
            remind_before_unit: RemindBeforeUnit;
            status: 'pending' | 'done' | 'missed';
        }>,
    ) => {
        const res = await apiClient.patch<AppointmentReminderType>(
            `/appointment-reminders/${reminderId}`,
            body,
        );
        return res.data;
    },

    delete: async (reminderId: string) => {
        await apiClient.delete(`/appointment-reminders/${reminderId}`);
    },
};
