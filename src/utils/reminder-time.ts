/**
 * Backend stores `remind_time` as UTC wall clock (matches dispatcher).
 * Convert local "HH:MM" (device timezone) to UTC "HH:MM".
 */
export function localHHMMToUtcHHMM(localHHMM: string): string {
    const parts = localHHMM.trim().split(':');
    if (parts.length < 2) return '00:00';
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return '00:00';
    const d = new Date();
    d.setHours(h, m, 0, 0);
    const uh = d.getUTCHours();
    const um = d.getUTCMinutes();
    return `${String(uh).padStart(2, '0')}:${String(um).padStart(2, '0')}`;
}
