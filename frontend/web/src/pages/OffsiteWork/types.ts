export type SiteStatus = 'active' | 'completed' | 'pending';

export type SiteType = 'visit' | 'installation' | 'inspection' | 'logistics' | 'general';

export interface SiteLocation {
  id: string;
  name: string;
  address: string;
  status: SiteStatus;
  lastUpdate: string;
  progress: number;
  siteType?: SiteType;
  assignedCrew?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ScannedItem {
  id: string;
  type: 'qr' | 'object';
  data: string;
  timestamp: string;
  siteId?: string;
}

export interface QueuedItem {
  id: string;
  data: string;
  timestamp: string;
  status: 'queued' | 'syncing' | 'completed' | 'error';
  retryCount: number;
}

export interface FieldWorker {
  id: string;
  name: string;
  role: string;
  status: 'on_site' | 'en_route' | 'clocked_in' | 'offline';
  siteName?: string;
  lastPing: string;
  utilization: number;
}

export interface RouteLeg {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  etaMinutes: number;
  traffic: 'clear' | 'moderate' | 'heavy';
  driver: string;
}

export interface FieldActivityItem {
  id: string;
  actor: string;
  message: string;
  highlight?: string;
  siteName: string;
  siteId?: string;
  kind: 'checkin' | 'scan' | 'inspection' | 'logistics' | 'alert' | 'sync';
  timestamp: string;
  isLive?: boolean;
}

export interface FieldAiInsight {
  id: string;
  headline: string;
  detail: string;
  severity: 'info' | 'warning' | 'critical';
  siteName?: string;
}

export interface FieldOpsMetric {
  id: string;
  label: string;
  value: number;
  display: string;
  suffix?: string;
  trend: string;
  trendUp: boolean;
  tone: 'positive' | 'warning' | 'critical' | 'neutral';
}
