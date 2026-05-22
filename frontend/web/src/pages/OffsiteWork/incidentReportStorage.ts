import type { FieldIncidentReport } from './incidentReportTypes';

const STORAGE_KEY = 'offsiteIncidentReports';

function normalizeReport(raw: FieldIncidentReport): FieldIncidentReport {
  return {
    ...raw,
    injuriesReported: raw.injuriesReported ?? false,
    workStopped: raw.workStopped ?? false,
    authoritiesNotified: raw.authoritiesNotified ?? false,
    followUpRequired: raw.followUpRequired ?? false,
    photoEvidencePlanned: raw.photoEvidencePlanned ?? (raw.photos?.length ?? 0) > 0,
    photos: Array.isArray(raw.photos) ? raw.photos : undefined,
    incidentOccurredAt: raw.incidentOccurredAt ?? raw.reportedAt,
  };
}

export function loadIncidentReports(): FieldIncidentReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((r) => normalizeReport(r as FieldIncidentReport)) : [];
  } catch {
    return [];
  }
}

export function saveIncidentReports(reports: FieldIncidentReport[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch {
    /* quota */
  }
}

export function seedIncidentReportsIfEmpty(): FieldIncidentReport[] {
  const existing = loadIncidentReports();
  if (existing.length > 0) return existing;

  const now = Date.now();
  const seed: FieldIncidentReport[] = [
    {
      id: 'inc-1',
      referenceNumber: 'INC-20250521-1001',
      title: 'Scaffold guardrail gap — north elevation',
      siteName: 'Riverside Tower B',
      category: 'safety',
      severity: 'high',
      status: 'investigating',
      description: 'Missing mid-rail section on level 4 scaffold. Crew halted work on affected bay.',
      locationLabel: 'Level 4, north elevation',
      incidentOccurredAt: new Date(now - 2 * 3600000).toISOString(),
      immediateActions: 'Area cordoned with barrier tape. Toolbox talk held with crew. Line manager notified.',
      injuriesReported: false,
      workStopped: true,
      authoritiesNotified: false,
      followUpRequired: true,
      followUpNotes: 'Engineering inspection scheduled within 24h.',
      reportedByName: 'Field Supervisor',
      reportedAt: new Date(now - 2 * 3600000).toISOString(),
      updatedAt: new Date(now - 3600000).toISOString(),
    },
    {
      id: 'inc-2',
      referenceNumber: 'INC-20250521-1002',
      title: 'Generator fuel leak near compound',
      siteName: 'Metro Line Depot',
      category: 'environmental',
      severity: 'medium',
      status: 'open',
      description: 'Slow seep detected during morning rounds from diesel generator supply line.',
      environmentalConditions: 'Light rain, muddy access route',
      incidentOccurredAt: new Date(now - 5 * 3600000).toISOString(),
      immediateActions: 'Absorbent pads deployed. Fuel isolated. Environmental contractor en route.',
      injuriesReported: false,
      workStopped: false,
      authoritiesNotified: true,
      authorityReference: 'ENV-REF-4421',
      followUpRequired: true,
      reportedByName: 'Ops Lead',
      reportedAt: new Date(now - 5 * 3600000).toISOString(),
      updatedAt: new Date(now - 5 * 3600000).toISOString(),
    },
  ];
  saveIncidentReports(seed);
  return seed;
}
