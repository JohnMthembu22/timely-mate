export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed';

export type IncidentCategory =
  | 'safety'
  | 'equipment'
  | 'environmental'
  | 'security'
  | 'personnel'
  | 'other';

import type { IncidentPhotoAttachment } from './incidentReportPhotos';

export type { IncidentPhotoAttachment };

export interface FieldIncidentReport {
  id: string;
  referenceNumber?: string;
  title: string;
  siteId?: string;
  siteName?: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  description: string;
  locationLabel?: string;
  gpsCoordinates?: string;
  environmentalConditions?: string;
  incidentOccurredAt?: string;
  immediateActions?: string;
  equipmentInvolved?: string;
  contributingFactors?: string;
  peopleInvolved?: string;
  witnesses?: string;
  injuriesReported?: boolean;
  injuryDetails?: string;
  workStopped?: boolean;
  authoritiesNotified?: boolean;
  authorityReference?: string;
  followUpRequired?: boolean;
  followUpNotes?: string;
  /** @deprecated Use photos.length; kept for older stored reports */
  photoEvidencePlanned?: boolean;
  photos?: IncidentPhotoAttachment[];
  reporterContact?: string;
  reportedById?: string;
  reportedByName: string;
  reportedAt: string;
  updatedAt: string;
}

export const INCIDENT_CATEGORY_LABELS: Record<IncidentCategory, string> = {
  safety: 'Safety',
  equipment: 'Equipment',
  environmental: 'Environmental',
  security: 'Security',
  personnel: 'Personnel',
  other: 'Other',
};

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  open: 'Open',
  investigating: 'Investigating',
  resolved: 'Resolved',
  closed: 'Closed',
};
