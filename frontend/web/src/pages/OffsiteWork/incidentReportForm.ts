import type { IncidentPhotoAttachment } from './incidentReportPhotos';
import type { FieldIncidentReport, IncidentCategory, IncidentSeverity } from './incidentReportTypes';

export interface IncidentReportFormState {
  title: string;
  incidentOccurredAtLocal: string;
  siteId: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  locationLabel: string;
  gpsCoordinates: string;
  environmentalConditions: string;
  description: string;
  immediateActions: string;
  equipmentInvolved: string;
  contributingFactors: string;
  peopleInvolved: string;
  witnesses: string;
  injuriesReported: boolean;
  injuryDetails: string;
  workStopped: boolean;
  authoritiesNotified: boolean;
  authorityReference: string;
  followUpRequired: boolean;
  followUpNotes: string;
  photos: IncidentPhotoAttachment[];
  reporterContact: string;
}

export function defaultIncidentFormState(): IncidentReportFormState {
  return {
    title: '',
    incidentOccurredAtLocal: toDatetimeLocalValue(new Date().toISOString()),
    siteId: '',
    category: 'safety',
    severity: 'medium',
    locationLabel: '',
    gpsCoordinates: '',
    environmentalConditions: '',
    description: '',
    immediateActions: '',
    equipmentInvolved: '',
    contributingFactors: '',
    peopleInvolved: '',
    witnesses: '',
    injuriesReported: false,
    injuryDetails: '',
    workStopped: false,
    authoritiesNotified: false,
    authorityReference: '',
    followUpRequired: true,
    followUpNotes: '',
    photos: [],
    reporterContact: '',
  };
}

export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return toDatetimeLocalValue(new Date().toISOString());
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export function generateIncidentReference(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const seq = String(Date.now()).slice(-4);
  return `INC-${y}${m}${day}-${seq}`;
}

export function validateIncidentForm(form: IncidentReportFormState): { valid: boolean; message?: string } {
  if (!form.title.trim()) return { valid: false, message: 'Incident title is required.' };
  if (!form.description.trim()) return { valid: false, message: 'Incident description is required.' };
  if (!form.immediateActions.trim()) {
    return { valid: false, message: 'Describe immediate actions taken on site.' };
  }
  if (form.injuriesReported && !form.injuryDetails.trim()) {
    return { valid: false, message: 'Provide injury / harm details when injuries are reported.' };
  }
  if (form.authoritiesNotified && !form.authorityReference.trim()) {
    return { valid: false, message: 'Include authority or case reference when authorities were notified.' };
  }
  return { valid: true };
}

export function buildIncidentReportFromForm(
  form: IncidentReportFormState,
  meta: {
    siteName?: string;
    reportedById?: string;
    reportedByName: string;
    siteId?: string;
  }
): FieldIncidentReport {
  const now = new Date().toISOString();
  return {
    id: `inc-${Date.now()}`,
    referenceNumber: generateIncidentReference(),
    title: form.title.trim(),
    siteId: meta.siteId,
    siteName: meta.siteName,
    category: form.category,
    severity: form.severity,
    status: 'open',
    description: form.description.trim(),
    locationLabel: form.locationLabel.trim() || undefined,
    gpsCoordinates: form.gpsCoordinates.trim() || undefined,
    environmentalConditions: form.environmentalConditions.trim() || undefined,
    incidentOccurredAt: fromDatetimeLocalValue(form.incidentOccurredAtLocal),
    immediateActions: form.immediateActions.trim(),
    equipmentInvolved: form.equipmentInvolved.trim() || undefined,
    contributingFactors: form.contributingFactors.trim() || undefined,
    peopleInvolved: form.peopleInvolved.trim() || undefined,
    witnesses: form.witnesses.trim() || undefined,
    injuriesReported: form.injuriesReported,
    injuryDetails: form.injuriesReported ? form.injuryDetails.trim() : undefined,
    workStopped: form.workStopped,
    authoritiesNotified: form.authoritiesNotified,
    authorityReference: form.authoritiesNotified ? form.authorityReference.trim() : undefined,
    followUpRequired: form.followUpRequired,
    followUpNotes: form.followUpRequired ? form.followUpNotes.trim() || undefined : undefined,
    photos: form.photos.length > 0 ? form.photos : undefined,
    photoEvidencePlanned: form.photos.length > 0,
    reporterContact: form.reporterContact.trim() || undefined,
    reportedById: meta.reportedById,
    reportedByName: meta.reportedByName,
    reportedAt: now,
    updatedAt: now,
  };
}
