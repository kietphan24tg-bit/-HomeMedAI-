/**
 * Dùng chung cho follow_up_appointments, vaccination_doses, appointment_reminders
 * Phải đồng bộ với BE enum: follow_up_remind_before_unit
 */
export type RemindBeforeUnit = 'MINUTES' | 'HOURS' | 'DAYS' | 'WEEKS';
