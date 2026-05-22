import { addDays, format } from 'date-fns';
import type { SiteLocation } from './types';
import type { MapCluster, SiteIntelligence, SiteIntelRow, SiteRiskLevel } from './siteIntelligenceTypes';

const SUPERVISORS = ['Jordan Mbeki', 'Sarah Naidoo', 'David Okafor', 'Priya Patel', 'Alex Chen'];
const CONDITIONS = ['Clear', 'Partly cloudy', 'Light rain', 'Windy', 'Overcast'] as const;

function hashId(id: string): number {
  return id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
}

function mockCoords(loc: SiteLocation): { lat: number; lng: number } {
  if (loc.coordinates && (loc.coordinates.lat !== 0 || loc.coordinates.lng !== 0)) {
    return loc.coordinates;
  }
  const h = hashId(loc.id);
  return {
    lat: -26.2 + ((h % 100) / 100) * 4,
    lng: 28.0 + (((h >> 3) % 100) / 100) * 6,
  };
}

function riskFromProgress(progress: number, status: SiteLocation['status']): SiteRiskLevel {
  if (status === 'pending' && progress < 20) return 'medium';
  if (progress < 35) return 'high';
  if (progress < 60) return 'medium';
  return 'low';
}

export function buildSiteIntelligence(loc: SiteLocation): SiteIntelligence {
  const h = hashId(loc.id);
  const coords = mockCoords(loc);
  const progress = loc.progress;
  const risk = riskFromProgress(progress, loc.status);
  const health = Math.max(42, Math.min(98, 55 + Math.round(progress * 0.38) - (risk === 'high' ? 18 : risk === 'medium' ? 8 : 0)));

  const workforce = loc.status === 'active' ? 3 + (h % 5) : loc.status === 'pending' ? 0 : 1 + (h % 2);
  const eta = addDays(new Date(), loc.status === 'completed' ? 0 : 4 + (h % 12));

  const hasSafety = risk !== 'low' || h % 5 === 0;
  const safetyAlerts =
    hasSafety && h % 3 !== 0
      ? [
          {
            id: `sa-${loc.id}`,
            message: risk === 'high' ? 'PPE compliance spot-check due before 14:00' : 'Perimeter fencing inspection logged',
            severity: (risk === 'high' ? 'critical' : 'warning') as 'warning' | 'critical',
          },
        ]
      : h % 7 === 0
        ? [{ id: `sa-i-${loc.id}`, message: 'Toolbox talk completed · heat stress watch', severity: 'info' as const }]
        : [];

  return {
    siteId: loc.id,
    healthScore: health,
    completionStatus:
      loc.status === 'completed'
        ? 'Complete'
        : progress >= 90
          ? 'Close-out'
          : progress >= 50
            ? 'In execution'
            : 'Mobilizing',
    supervisor: SUPERVISORS[h % SUPERVISORS.length],
    workforceCount: workforce,
    riskLevel: risk,
    estimatedCompletion: format(eta, 'dd MMM yyyy'),
    weather: {
      tempC: 18 + (h % 14),
      condition: CONDITIONS[h % CONDITIONS.length],
      windKph: 8 + (h % 22),
      icon: h % 4 === 0 ? 'rain' : h % 3 === 0 ? 'cloud' : h % 5 === 0 ? 'wind' : 'sun',
    },
    safetyAlerts,
    activeTasks: [
      {
        id: `t1-${loc.id}`,
        title: loc.siteType === 'installation' ? 'Rack mount & power-up' : loc.siteType === 'inspection' ? 'QA walkthrough' : 'Site induction',
        assignee: loc.assignedCrew ?? 'Field crew',
        due: 'Today 16:00',
        status: progress < 40 ? 'in_progress' : 'open',
      },
      {
        id: `t2-${loc.id}`,
        title: 'Material receipt sign-off',
        assignee: 'Logistics',
        due: 'Tomorrow 09:00',
        status: h % 4 === 0 ? 'blocked' : 'open',
      },
    ].slice(0, loc.status === 'pending' ? 1 : 2),
    materialDelivery: {
      status: h % 5 === 0 ? 'delayed' : h % 3 === 0 ? 'in_transit' : progress > 70 ? 'delivered' : 'scheduled',
      eta: h % 5 === 0 ? 'Delayed +2h' : 'Today 13:40',
      items: 4 + (h % 8),
      carrier: h % 2 === 0 ? 'Fleet courier' : 'Depot dispatch',
    },
    checkLogs: [
      {
        id: `ci-${loc.id}`,
        person: SUPERVISORS[(h + 1) % SUPERVISORS.length],
        action: 'check-in',
        time: format(new Date(Date.now() - (2 + h % 4) * 3600000), 'HH:mm'),
      },
      ...(workforce > 0
        ? [
            {
              id: `co-${loc.id}`,
              person: 'Crew lead',
              action: 'check-out' as const,
              time: '—',
            },
          ]
        : []),
    ],
    sitePhotos: [
      { id: `ph1-${loc.id}`, label: 'Entry gate' },
      { id: `ph2-${loc.id}`, label: 'Work zone' },
    ],
    droneImages: [{ id: `dr1-${loc.id}`, label: 'Aerial survey', capturedAt: format(addDays(new Date(), -2), 'dd MMM') }],
    mapCoords: coords,
  };
}

export function buildSiteIntelRows(locations: SiteLocation[]): SiteIntelRow[] {
  return locations.map((location) => ({
    location,
    intel: buildSiteIntelligence(location),
  }));
}

export function buildMapClusters(rows: SiteIntelRow[]): MapCluster[] {
  const buckets = new Map<string, SiteIntelRow[]>();
  rows.forEach((row) => {
    const key = `${row.intel.mapCoords.lat.toFixed(1)}_${row.intel.mapCoords.lng.toFixed(1)}`;
    const list = buckets.get(key) ?? [];
    list.push(row);
    buckets.set(key, list);
  });

  const riskOrder: Record<SiteRiskLevel, number> = { low: 0, medium: 1, high: 2 };

  return Array.from(buckets.entries()).map(([key, group]) => {
    const lat = group.reduce((s, r) => s + r.intel.mapCoords.lat, 0) / group.length;
    const lng = group.reduce((s, r) => s + r.intel.mapCoords.lng, 0) / group.length;
    const riskMax = group.reduce<SiteRiskLevel>(
      (max, r) => (riskOrder[r.intel.riskLevel] > riskOrder[max] ? r.intel.riskLevel : max),
      'low'
    );
    return {
      id: `cluster-${key}`,
      lat,
      lng,
      count: group.length,
      siteIds: group.map((r) => r.location.id),
      riskMax,
    };
  });
}
