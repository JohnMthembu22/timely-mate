/**
 * Keys that hold company operational data (not auth, theme, profile, or settings).
 */

export const OPERATIONAL_STORAGE_KEYS = [
  'timelymate_employees',
  'timelymate_projects',
  'timelymate_active_jobs',
  'timelymate_timesheet_entries',
  'timelymate_timesheets',
  'timelymate_clockin_records',
  'timelymate_notifications',
  'timelymate_procurement_vendors',
  'timelymate_conversations',
  'offsiteIncidentReports',
  'offsiteWorkLocations',
  'offsiteWorkScans',
  'offsiteWorkQueue',
  'offsiteWorkPhotos',
  'offsiteWorkAssignments',
  'timelymate_demo_seeded',
  'timelymate_demo_mode',
] as const;

function clearMessageThreads(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('timelymate_messages_')) keys.push(key);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

export function sanitizeSessionBackup(): void {
  try {
    const raw = localStorage.getItem('timelymate_session_backup');
    if (!raw) return;
    const parsed = JSON.parse(raw) as { employees?: unknown[] };
    if (!parsed || typeof parsed !== 'object') return;
    delete parsed.employees;
    localStorage.setItem('timelymate_session_backup', JSON.stringify(parsed));
  } catch {
    localStorage.removeItem('timelymate_session_backup');
  }
}

export function clearOperationalStorage(): void {
  try {
    OPERATIONAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    clearMessageThreads();
    sanitizeSessionBackup();
  } catch {
    /* ignore */
  }
}
