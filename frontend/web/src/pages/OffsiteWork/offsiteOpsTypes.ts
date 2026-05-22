import type { SiteLocation } from './types';

export type WorkforceAttendance =
  | 'clocked_in'
  | 'on_site'
  | 'en_route'
  | 'late'
  | 'offline'
  | 'break';

export type GeofenceStatus = 'inside' | 'approaching' | 'exit' | 'none';

export interface WorkforceTrackEmployee {
  id: string;
  name: string;
  role: string;
  initials: string;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
  attendance: WorkforceAttendance;
  movement: 'moving' | 'stationary';
  currentRoute: string;
  travelDurationMin: number;
  etaArrival: string;
  siteArrivalActual?: string;
  targetSite: string;
  checkInVerified: boolean;
  gpsVerified: boolean;
  geofence: GeofenceStatus;
  clockedInAt?: string;
}

export interface ActiveRouteTrack {
  id: string;
  name: string;
  driver: string;
  from: string;
  to: string;
  distanceKm: number;
  durationMin: number;
  delayMin: number;
  status: 'on_time' | 'delayed' | 'completed';
  path: { x: number; y: number }[];
}

export interface OperationalAlert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  category: 'late' | 'route' | 'geofence' | 'attendance' | 'safety';
  timestamp: string;
}

export type AiInsightCategory =
  | 'delay'
  | 'route'
  | 'workforce'
  | 'weather'
  | 'installation'
  | 'material'
  | 'overtime'
  | 'safety';

export interface AiOperationalInsight {
  id: string;
  headline: string;
  detail: string;
  severity: 'info' | 'warning' | 'critical';
  category: AiInsightCategory;
  siteName?: string;
  recommendation: string;
  actions: { id: string; label: string; variant?: 'primary' | 'secondary' }[];
  metric?: string;
}

export type ScanPurpose =
  | 'equipment'
  | 'asset'
  | 'material'
  | 'check_in'
  | 'task'
  | 'installation'
  | 'barcode'
  | 'nfc'
  | 'qr'
  | 'geolocation';

export interface OperationalScanRecord {
  id: string;
  purpose: ScanPurpose;
  label: string;
  data: string;
  timestamp: string;
  verified: boolean;
  projectName?: string;
  siteName?: string;
  assignee?: string;
  format: 'qr' | 'barcode' | 'nfc' | 'gps' | 'manual';
}

export interface ScanAnalytics {
  todayTotal: number;
  verifiedRate: number;
  successStreak: number;
  byPurpose: Record<string, number>;
}

export type OffsiteTaskType =
  | 'installation'
  | 'inspection'
  | 'maintenance'
  | 'delivery'
  | 'general';

export type OffsiteTaskStatus =
  | 'unassigned'
  | 'assigned'
  | 'in_progress'
  | 'pending_review'
  | 'completed';

export type OffsiteTaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface OffsiteFieldTask {
  id: string;
  title: string;
  type: OffsiteTaskType;
  priority: OffsiteTaskPriority;
  status: OffsiteTaskStatus;
  siteId?: string;
  siteName: string;
  assigneeId?: string;
  assigneeName?: string;
  supervisorName: string;
  travelDurationMin: number;
  etaArrival: string;
  dueDate: string;
  overdue: boolean;
  completionProof: boolean;
  hasImages: boolean;
  qrVerified: boolean;
  safetyChecklist: boolean;
  progress: number;
}

export type TimelineEventCategory =
  | 'check_in'
  | 'site_arrival'
  | 'installation_complete'
  | 'scan'
  | 'issue'
  | 'approval'
  | 'route_change'
  | 'delay'
  | 'photo_upload';

export interface FieldTimelineEvent {
  id: string;
  category: TimelineEventCategory;
  actorName: string;
  actorInitials: string;
  actorColor: string;
  message: string;
  detail?: string;
  siteName: string;
  siteId?: string;
  timestamp: string;
  isLive?: boolean;
}

export interface ReportChartPoint {
  label: string;
  value: number;
  value2?: number;
}

export interface FieldReportMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  changeUp: boolean;
  tone: 'positive' | 'warning' | 'neutral' | 'critical';
}

export interface SmartReportingBundle {
  executiveSummary: string;
  aiSummary: string;
  metrics: FieldReportMetric[];
  productivityTrend: ReportChartPoint[];
  routeEfficiency: ReportChartPoint[];
  attendanceWeekly: ReportChartPoint[];
  siteCompletion: ReportChartPoint[];
  scanStats: ReportChartPoint[];
}

export const OFFSITE_TASK_COLUMNS: { id: OffsiteTaskStatus; label: string }[] = [
  { id: 'unassigned', label: 'Unassigned' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'pending_review', label: 'Pending review' },
  { id: 'completed', label: 'Completed' },
];
