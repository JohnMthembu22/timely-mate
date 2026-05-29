const INCIDENT_STORAGE_KEY = 'offsiteIncidentReports';
const PROJECTS_KEY = 'timelymate_projects';
const EMPLOYEES_KEY = 'timelymate_employees';
const ACTIVE_JOBS_KEY = 'timelymate_active_jobs';
const TIMESHEET_ENTRIES_KEY = 'timelymate_timesheet_entries';
const TIMESHEETS_KEY = 'timelymate_timesheets';

const PRESENTATION_TIMESHEET_ENTRY_IDS = new Set(['1', '2', '3']);

const LEGACY_INCIDENT_IDS = new Set(['inc-1', 'inc-2', 'inc-demo-1', 'inc-demo-2']);

const PRESENTATION_JOB_NAMES = new Set([
  'Platform Development Sprint',
  'UI/UX Redesign Project',
  'Brand Campaign Launch',
  'Revenue Optimization Initiative',
  'Feature Development Cycle',
  'Process Improvement Project',
  'Employee Engagement Program',
  'Financial Analysis Report',
]);

const PRESENTATION_PROJECT_NAMES = new Set([
  'Platform Development',
  'UI/UX Redesign',
  'Brand Campaign',
  'Revenue Optimization',
  'Feature Development',
  'Process Improvement',
  'Employee Engagement',
  'Financial Analysis',
]);

export function isPresentationEmployeeId(id: string): boolean {
  return id.startsWith('demo-emp-');
}

export function isPresentationEmployeeRecord(employee: { id?: string; email?: string }): boolean {
  const id = employee.id ?? '';
  const email = (employee.email ?? '').toLowerCase();
  return isPresentationEmployeeId(id) || email.endsWith('@demo.timelymate.app');
}

export function isPresentationSiteId(id: string): boolean {
  return id.startsWith('demo-site-');
}

export function isPresentationProjectId(id: string): boolean {
  return (
    id.startsWith('dept-project-') ||
    id.startsWith('sample-') ||
    id === 'demo' ||
    id.startsWith('demo-')
  );
}

export function isPresentationProjectRecord(project: { id?: string; name?: string }): boolean {
  const id = project.id ?? '';
  const name = project.name ?? '';
  return isPresentationProjectId(id) || PRESENTATION_PROJECT_NAMES.has(name);
}

export function isPresentationIncidentId(id: string): boolean {
  return LEGACY_INCIDENT_IDS.has(id) || id.startsWith('inc-demo-');
}

export function isPresentationActiveJob(job: { id?: string; name?: string }): boolean {
  return PRESENTATION_JOB_NAMES.has(job.name ?? '');
}

export function stripLegacyEmployees<T extends { id?: string; email?: string }>(employees: T[]): T[] {
  return employees.filter((e) => !isPresentationEmployeeRecord(e));
}

function readJsonArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJsonArray<T>(key: string, items: T[]): void {
  try {
    if (items.length === 0) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(items));
    }
  } catch {
    /* ignore */
  }
}

function stripPresentationProjectsFromStorage(): void {
  const projects = readJsonArray<{ id?: string; name?: string }>(PROJECTS_KEY);
  writeJsonArray(
    PROJECTS_KEY,
    projects.filter((p) => !isPresentationProjectRecord(p))
  );
}

function stripLegacyEmployeesFromStorage(): void {
  const employees = readJsonArray<{ id?: string; email?: string }>(EMPLOYEES_KEY);
  writeJsonArray(
    EMPLOYEES_KEY,
    employees.filter((e) => !isPresentationEmployeeRecord(e))
  );
}

function stripPresentationActiveJobsFromStorage(): void {
  const jobs = readJsonArray<{ id?: string; name?: string }>(ACTIVE_JOBS_KEY);
  writeJsonArray(
    ACTIVE_JOBS_KEY,
    jobs.filter((j) => !isPresentationActiveJob(j))
  );
}

function stripPresentationTimesheetsFromStorage(): void {
  const entries = readJsonArray<{ id?: string }>(TIMESHEET_ENTRIES_KEY);
  writeJsonArray(
    TIMESHEET_ENTRIES_KEY,
    entries.filter((e) => !PRESENTATION_TIMESHEET_ENTRY_IDS.has(String(e.id ?? '')))
  );

  const sheets = readJsonArray<{ id?: string }>(TIMESHEETS_KEY);
  writeJsonArray(
    TIMESHEETS_KEY,
    sheets.filter((e) => !PRESENTATION_TIMESHEET_ENTRY_IDS.has(String(e.id ?? '')))
  );
}

function stripPresentationIncidentsFromStorage(): void {
  try {
    const raw = localStorage.getItem(INCIDENT_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { id?: string }[];
    if (!Array.isArray(parsed)) return;
    writeJsonArray(
      INCIDENT_STORAGE_KEY,
      parsed.filter((r) => !isPresentationIncidentId(r.id ?? ''))
    );
  } catch {
    /* ignore */
  }
}

function stripPresentationOffsiteSitesFromStorage(): void {
  try {
    const locRaw = localStorage.getItem('offsiteWorkLocations');
    if (!locRaw) return;
    const sites = JSON.parse(locRaw) as { id?: string }[];
    if (!Array.isArray(sites)) return;
    writeJsonArray(
      'offsiteWorkLocations',
      sites.filter((s) => !isPresentationSiteId(s.id ?? ''))
    );
  } catch {
    /* ignore */
  }
}

/** Remove leftover demo rows from localStorage. */
export function stripLegacyDemoFromStorage(): void {
  stripLegacyEmployeesFromStorage();
  stripPresentationProjectsFromStorage();
  stripPresentationActiveJobsFromStorage();
  stripPresentationTimesheetsFromStorage();
  stripPresentationIncidentsFromStorage();
  stripPresentationOffsiteSitesFromStorage();
  try {
    localStorage.removeItem('timelymate_demo_seeded');
    localStorage.removeItem('timelymate_demo_mode');
  } catch {
    /* ignore */
  }
}
