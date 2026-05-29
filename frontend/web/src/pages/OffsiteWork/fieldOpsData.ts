import { formatDistanceToNow } from 'date-fns';
import type { Employee } from '../../contexts/EmployeeContext';
import { getOffsiteAssignableEmployees } from '../../utils/offsiteWorkers';
import type {
  FieldActivityItem,
  FieldAiInsight,
  FieldOpsMetric,
  FieldWorker,
  QueuedItem,
  RouteLeg,
  ScannedItem,
  SiteLocation,
} from './types';

export function buildFieldMetrics(
  locations: SiteLocation[],
  scans: ScannedItem[],
  queue: QueuedItem[]
): FieldOpsMetric[] {
  const active = locations.filter((l) => l.status === 'active').length;
  const pending = locations.filter((l) => l.status === 'pending').length;
  const avgProgress =
    locations.length > 0
      ? Math.round(locations.reduce((s, l) => s + l.progress, 0) / locations.length)
      : 0;
  const queued = queue.filter((q) => q.status === 'queued' || q.status === 'syncing').length;
  const onTime = locations.length > 0 ? Math.min(98, 72 + active * 4 + avgProgress * 0.2) : 0;

  return [
    {
      id: 'teams',
      label: 'Field teams live',
      value: Math.max(active, pending, 1) + 2,
      display: String(Math.max(active + 2, 3)),
      trend: '+2 since 08:00',
      trendUp: true,
      tone: 'positive',
    },
    {
      id: 'sites',
      label: 'Active sites',
      value: active,
      display: String(active),
      trend: `${locations.length} total`,
      trendUp: true,
      tone: active > 0 ? 'positive' : 'neutral',
    },
    {
      id: 'visits',
      label: 'Visits today',
      value: scans.length + active,
      display: String(scans.length + Math.min(active, 4)),
      trend: '3 installations queued',
      trendUp: true,
      tone: 'neutral',
    },
    {
      id: 'inspections',
      label: 'Inspections due',
      value: pending,
      display: String(Math.max(pending, 0)),
      trend: pending > 0 ? 'Action required' : 'Clear',
      trendUp: pending === 0,
      tone: pending > 2 ? 'warning' : 'positive',
    },
    {
      id: 'logistics',
      label: 'Logistics pending',
      value: queued,
      display: String(queued),
      suffix: queued === 1 ? ' batch' : ' batches',
      trend: 'Last mile routing',
      trendUp: false,
      tone: queued > 3 ? 'warning' : 'neutral',
    },
    {
      id: 'ontime',
      label: 'On-time execution',
      value: Math.round(onTime),
      display: `${Math.round(onTime)}`,
      suffix: '%',
      trend: '+4.1% vs yesterday',
      trendUp: true,
      tone: onTime >= 80 ? 'positive' : 'warning',
    },
    {
      id: 'sync',
      label: 'Sync health',
      value: queue.length === 0 ? 100 : 88,
      display: queue.length === 0 ? '100' : '88',
      suffix: '%',
      trend: queue.length === 0 ? 'All devices synced' : `${queued} pending`,
      trendUp: queue.length === 0,
      tone: queue.length === 0 ? 'positive' : 'warning',
    },
    {
      id: 'alerts',
      label: 'Field alerts',
      value: pending + (avgProgress < 40 ? 1 : 0),
      display: String(pending + (locations.some((l) => l.progress < 35) ? 1 : 0)),
      trend: 'SLA watch active',
      trendUp: false,
      tone: pending > 0 ? 'critical' : 'positive',
    },
  ];
}

export function buildFieldWorkers(locations: SiteLocation[], employees: Employee[] = []): FieldWorker[] {
  const offsite = getOffsiteAssignableEmployees(employees);
  const crews =
    offsite.length > 0
      ? offsite.map((e) => ({ id: e.id, name: e.name, role: e.position }))
      : [
          { id: 'worker-0', name: 'Jordan Mbeki', role: 'Field lead' },
          { id: 'worker-1', name: 'Sarah Naidoo', role: 'Installation tech' },
        ];
  const statuses: FieldWorker['status'][] = ['on_site', 'en_route', 'clocked_in', 'on_site', 'en_route', 'offline'];

  return crews.map((c, i) => {
    const site = locations[i % Math.max(locations.length, 1)];
    return {
      id: c.id,
      name: c.name,
      role: c.role,
      status: locations.length === 0 && i > 2 ? 'offline' : statuses[i % statuses.length],
      siteName: site?.name,
      lastPing: formatDistanceToNow(new Date(Date.now() - (i + 1) * 4 * 60000), { addSuffix: true }),
      utilization: 55 + ((i * 17) % 40),
    };
  });
}

export function buildRouteLegs(locations: SiteLocation[]): RouteLeg[] {
  if (locations.length < 2) {
    return [];
    return [
      {
        id: 'r-demo-1',
        from: 'Depot · Central',
        to: 'Next site visit',
        distanceKm: 24,
        etaMinutes: 38,
        traffic: 'moderate',
        driver: 'Jordan Mbeki',
      },
      {
        id: 'r-demo-2',
        from: 'Site A',
        to: 'Warehouse handoff',
        distanceKm: 12,
        etaMinutes: 22,
        traffic: 'clear',
        driver: 'Priya Patel',
      },
    ];
  }
  return locations.slice(0, 3).map((loc, i) => {
    const next = locations[(i + 1) % locations.length];
    return {
      id: `route-${loc.id}`,
      from: loc.name,
      to: next.name,
      distanceKm: 8 + i * 6,
      etaMinutes: 18 + i * 12,
      traffic: i === 0 ? 'clear' : i === 1 ? 'moderate' : 'heavy',
      driver: loc.assignedCrew ?? 'Field crew',
    };
  });
}

export function buildFieldActivity(
  locations: SiteLocation[],
  scans: ScannedItem[]
): FieldActivityItem[] {
  const items: FieldActivityItem[] = [];

  locations.forEach((loc) => {
    items.push({
      id: `act-${loc.id}-status`,
      actor: loc.assignedCrew ?? 'Field team',
      message: 'updated checkpoint on',
      highlight: loc.name,
      siteName: loc.name,
      siteId: loc.id,
      kind: loc.status === 'active' ? 'checkin' : 'inspection',
      timestamp: loc.lastUpdate,
      isLive: loc.status === 'active',
    });
  });

  scans.slice(0, 5).forEach((s) => {
    items.push({
      id: `act-scan-${s.id}`,
      actor: 'QR terminal',
      message: s.type === 'qr' ? 'verified asset' : 'logged material',
      highlight: s.data,
      siteName: 'Field sync',
      kind: 'scan',
      timestamp: s.timestamp,
      isLive: true,
    });
  });

  if (items.length === 0) {
    return [];
    return [
      {
        id: 'act-seed-1',
        actor: 'Field command',
        message: 'standing by — deploy a site to activate workforce tracking, QR ops, and live routing',
        siteName: 'Operations hub',
        kind: 'alert',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'act-seed-2',
        actor: 'Logistics',
        message: 'depot handoff window open until',
        highlight: '16:00',
        siteName: 'Central depot',
        kind: 'logistics',
        timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      },
      {
        id: 'act-seed-3',
        actor: 'Route AI',
        message: 'travel batching ready once first site is active',
        siteName: 'Route intelligence',
        kind: 'sync',
        timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
      },
    ];
  }

  const now = Date.now();
  items.push(
    {
      id: 'act-ops-pulse',
      actor: 'Mission control',
      message: 'field execution pulse',
      highlight: `${locations.filter((l) => l.status === 'active').length} live · ${scans.length} scans`,
      siteName: 'Command center',
      kind: 'sync',
      timestamp: new Date(now - 2 * 60000).toISOString(),
      isLive: true,
    }
  );

  return items.slice(0, 14);
}

export function buildFieldAiInsights(locations: SiteLocation[]): FieldAiInsight[] {
  const insights: FieldAiInsight[] = [];

  const behind = locations.filter((l) => l.progress < 45 && l.status !== 'completed');
  if (behind.length > 0) {
    insights.push({
      id: 'insight-delay',
      headline: `${behind.length} site${behind.length > 1 ? 's' : ''} behind execution curve`,
      detail: 'Reallocate installation crew or defer non-critical inspections to protect SLA windows.',
      severity: 'warning',
      siteName: behind[0].name,
    });
  }

  const pending = locations.filter((l) => l.status === 'pending');
  if (pending.length > 0) {
    insights.push({
      id: 'insight-pending',
      headline: 'Pending activations blocking route batching',
      detail: 'Activate sites before 10:00 to optimize travel legs and reduce deadhead km.',
      severity: 'info',
      siteName: pending[0].name,
    });
  }

  insights.push(
    {
      id: 'insight-weather',
      headline: 'Weather window favorable until 16:00',
      detail: 'Prioritize exterior installations and drone inspections in the northern corridor.',
      severity: 'info',
    },
    {
      id: 'insight-logistics',
      headline: 'Consolidate QR scans at handoff points',
      detail: 'Batch material verification at depot exit cuts rescan rate by ~18% (mock benchmark).',
      severity: 'info',
    }
  );

  if (locations.some((l) => l.progress >= 90)) {
    insights.push({
      id: 'insight-close',
      headline: 'Close-out inspections ready for sign-off',
      detail: 'Trigger completion workflow and sync photos before crews leave geofence.',
      severity: 'info',
      siteName: locations.find((l) => l.progress >= 90)?.name,
    });
  }

  return insights.slice(0, 5);
}
