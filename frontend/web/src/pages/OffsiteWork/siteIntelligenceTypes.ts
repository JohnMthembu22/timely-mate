import type { SiteLocation, SiteStatus, SiteType } from './types';

export type SiteRiskLevel = 'low' | 'medium' | 'high';
export type SiteViewMode = 'list' | 'map';
export type SiteIntelFilter = 'all' | SiteStatus | SiteType | 'risk-high' | 'health-low';

export interface SiteIntelligence {
  siteId: string;
  healthScore: number;
  completionStatus: string;
  supervisor: string;
  workforceCount: number;
  riskLevel: SiteRiskLevel;
  estimatedCompletion: string;
  weather: { tempC: number; condition: string; windKph: number; icon: 'sun' | 'cloud' | 'rain' | 'wind' };
  safetyAlerts: { id: string; message: string; severity: 'info' | 'warning' | 'critical' }[];
  activeTasks: { id: string; title: string; assignee: string; due: string; status: 'open' | 'in_progress' | 'blocked' }[];
  materialDelivery: {
    status: 'in_transit' | 'delivered' | 'scheduled' | 'delayed';
    eta: string;
    items: number;
    carrier: string;
  };
  checkLogs: { id: string; person: string; action: 'check-in' | 'check-out'; time: string }[];
  sitePhotos: { id: string; label: string }[];
  droneImages: { id: string; label: string; capturedAt: string }[];
  mapCoords: { lat: number; lng: number };
}

export interface MapCluster {
  id: string;
  lat: number;
  lng: number;
  count: number;
  siteIds: string[];
  riskMax: SiteRiskLevel;
}

export interface SiteIntelRow {
  location: SiteLocation;
  intel: SiteIntelligence;
}
