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
  return [];
}
