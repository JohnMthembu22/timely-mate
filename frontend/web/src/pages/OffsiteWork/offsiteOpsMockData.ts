import { addMinutes, format } from 'date-fns';
import type { Employee } from '../../contexts/EmployeeContext';
import type { ScannedItem, SiteLocation } from './types';
import type {
  ActiveRouteTrack,
  AiOperationalInsight,
  FieldTimelineEvent,
  OperationalAlert,
  OperationalScanRecord,
  OffsiteFieldTask,
  ScanAnalytics,
  ScanPurpose,
  SmartReportingBundle,
  TimelineEventCategory,
  WorkforceTrackEmployee,
} from './offsiteOpsTypes';

const SCAN_PURPOSE_LABELS: Record<ScanPurpose, string> = {
  equipment: 'Equipment',
  asset: 'Asset tracking',
  material: 'Material verify',
  check_in: 'Staff check-in',
  task: 'Task verify',
  installation: 'Installation proof',
  barcode: 'Barcode',
  nfc: 'NFC tap',
  qr: 'QR verify',
  geolocation: 'GPS verify',
};

export function buildWorkforceTracking(
  employees: Employee[],
  locations: SiteLocation[]
): {
  crew: WorkforceTrackEmployee[];
  routes: ActiveRouteTrack[];
  alerts: OperationalAlert[];
  clockedInCount: number;
} {
  const siteA = locations[0]?.name ?? 'Site A — Depot';
  const siteB = locations[1]?.name ?? 'Site B — Installation';
  const siteC = locations[2]?.name ?? 'Site C — Inspection';

  const roster =
    employees.length > 0
      ? employees.slice(0, 6)
      : [
          { id: 'w1', name: 'Jordan Mbeki', position: 'Field Lead' },
          { id: 'w2', name: 'Sarah Naidoo', position: 'Installation Tech' },
          { id: 'w3', name: 'Priya Patel', position: 'Logistics Coord.' },
          { id: 'w4', name: 'David Okafor', position: 'Inspector' },
        ];

  const statuses: WorkforceTrackEmployee['attendance'][] = [
    'on_site',
    'en_route',
    'late',
    'clocked_in',
    'on_site',
    'en_route',
  ];

  const crew: WorkforceTrackEmployee[] = roster.map((e, i) => {
    const names = e.name.split(' ');
    const initials = names.map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    const attendance = statuses[i % statuses.length];
    const target = i % 3 === 0 ? siteB : i % 3 === 1 ? siteC : siteA;
    return {
      id: e.id,
      name: e.name,
      role: 'position' in e ? e.position : 'Field operative',
      initials,
      lat: -26.12 + i * 0.02,
      lng: 28.04 + i * 0.015,
      mapX: 12 + (i % 3) * 28 + (i * 7) % 15,
      mapY: 18 + Math.floor(i / 2) * 22,
      attendance,
      movement: attendance === 'en_route' || attendance === 'late' ? 'moving' : 'stationary',
      currentRoute: i % 2 === 0 ? 'Johannesburg South' : 'Northern corridor',
      travelDurationMin: 18 + i * 6,
      etaArrival: format(addMinutes(new Date(), 12 + i * 8), 'HH:mm'),
      siteArrivalActual: attendance === 'on_site' ? format(addMinutes(new Date(), -20), 'HH:mm') : undefined,
      targetSite: target,
      checkInVerified: attendance === 'on_site' || attendance === 'clocked_in',
      gpsVerified: attendance !== 'offline',
      geofence: attendance === 'late' ? 'approaching' : attendance === 'on_site' ? 'inside' : i === 4 ? 'exit' : 'none',
      clockedInAt: attendance !== 'offline' ? format(addMinutes(new Date(), -120 - i * 15), 'HH:mm') : undefined,
    };
  });

  const routes: ActiveRouteTrack[] = [
    {
      id: 'route-jhb-s',
      name: 'Johannesburg South',
      driver: crew[0]?.name ?? 'Jordan Mbeki',
      from: 'Central depot',
      to: siteB,
      distanceKm: 24,
      durationMin: 38,
      delayMin: 12,
      status: 'delayed',
      path: [
        { x: 8, y: 75 },
        { x: 25, y: 60 },
        { x: 45, y: 45 },
        { x: 68, y: 32 },
      ],
    },
    {
      id: 'route-north',
      name: 'Northern corridor',
      driver: crew[1]?.name ?? 'Sarah Naidoo',
      from: siteA,
      to: siteC,
      distanceKm: 16,
      durationMin: 28,
      delayMin: 0,
      status: 'on_time',
      path: [
        { x: 20, y: 25 },
        { x: 40, y: 30 },
        { x: 62, y: 38 },
        { x: 82, y: 42 },
      ],
    },
  ];

  const alerts: OperationalAlert[] = [
    {
      id: 'alert-late',
      message: '2 staff members are late to Site B.',
      severity: 'warning',
      category: 'late',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'alert-route',
      message: 'Route delay detected on Johannesburg South (+12 min).',
      severity: 'warning',
      category: 'route',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    {
      id: 'alert-geo',
      message: 'Geofence exit detected — Priya Patel left Site C perimeter.',
      severity: 'critical',
      category: 'geofence',
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    },
  ];

  return {
    crew,
    routes,
    alerts,
    clockedInCount: crew.filter((c) => c.attendance !== 'offline').length,
  };
}

export function buildAiOperationalInsights(locations: SiteLocation[]): AiOperationalInsight[] {
  const siteB = locations[1]?.name ?? 'Site B';
  return [
    {
      id: 'ai-route-jhb',
      headline: 'Johannesburg South route can save 34 minutes',
      detail: 'Reorder stops: Site C before Site B to avoid peak-hour congestion on N12.',
      severity: 'info',
      category: 'route',
      recommendation: 'Apply optimized sequence to active crews',
      actions: [
        { id: 'apply-route', label: 'Apply route', variant: 'primary' },
        { id: 'preview', label: 'Preview map', variant: 'secondary' },
      ],
      metric: '-34 min',
    },
    {
      id: 'ai-overtime',
      headline: 'Team B may exceed overtime limits',
      detail: 'Projected 2.4h OT if current installation pace continues past 17:00.',
      severity: 'warning',
      category: 'overtime',
      recommendation: 'Reassign one installer or defer non-critical tasks',
      actions: [
        { id: 'rebalance', label: 'Rebalance crew', variant: 'primary' },
        { id: 'notify', label: 'Notify supervisor' },
      ],
      metric: '+2.4h OT',
    },
    {
      id: 'ai-weather',
      headline: 'Rain may delay Site Installation tomorrow',
      detail: '62% precipitation forecast 14:00–18:00 — exterior work at risk.',
      severity: 'warning',
      category: 'weather',
      siteName: siteB,
      recommendation: 'Schedule indoor commissioning or reschedule exterior tasks',
      actions: [
        { id: 'reschedule', label: 'Reschedule', variant: 'primary' },
        { id: 'contingency', label: 'Set contingency' },
      ],
    },
    {
      id: 'ai-workforce',
      headline: 'Workforce imbalance on northern corridor',
      detail: '3 crews stacked on Site A while Site C inspection queue is unstaffed.',
      severity: 'critical',
      category: 'workforce',
      recommendation: 'Shift one crew from Site A to Site C within 45 minutes',
      actions: [
        { id: 'dispatch', label: 'Dispatch crew', variant: 'primary' },
        { id: 'ai-assign', label: 'AI auto-assign' },
      ],
    },
    {
      id: 'ai-material',
      headline: 'Material shortage risk — fibre termination kits',
      detail: 'Stock below reorder threshold at depot; 2 installations depend on SKU FT-220.',
      severity: 'warning',
      category: 'material',
      recommendation: 'Trigger procurement hold or swap SKU at Site B',
      actions: [{ id: 'order', label: 'Create order', variant: 'primary' }],
    },
    {
      id: 'ai-install-delay',
      headline: 'Installation delay predicted at Site B',
      detail: 'Progress curve 18% behind plan; SLA breach likely without crew add-on.',
      severity: 'critical',
      category: 'installation',
      siteName: siteB,
      recommendation: 'Add second installation team or extend shift window',
      actions: [
        { id: 'add-crew', label: 'Add crew', variant: 'primary' },
        { id: 'escalate', label: 'Escalate SLA' },
      ],
    },
    {
      id: 'ai-safety',
      headline: 'Safety compliance reminder — heat stress protocol',
      detail: 'Heat index above 32°C in field zone; mandatory hydration breaks every 90 min.',
      severity: 'info',
      category: 'safety',
      recommendation: 'Push toolbox talk to all on-site crews',
      actions: [{ id: 'broadcast', label: 'Broadcast alert', variant: 'primary' }],
    },
    {
      id: 'ai-delay-sites',
      headline: '2 sites behind execution curve',
      detail: 'Deferred inspections blocking route batching for afternoon window.',
      severity: 'warning',
      category: 'delay',
      recommendation: 'Prioritize close-out inspections before 16:00',
      actions: [{ id: 'prioritize', label: 'Prioritize sites' }],
    },
  ];
}

const PURPOSE_ROTATION: ScanPurpose[] = [
  'qr',
  'material',
  'equipment',
  'check_in',
  'installation',
  'asset',
  'task',
  'barcode',
];

export function enrichScanRecords(scans: ScannedItem[], locations: SiteLocation[]): OperationalScanRecord[] {
  const projects = ['Tower rollout', 'Fibre phase 2', 'Enterprise install', 'Maintenance batch'];
  const source =
    scans.length > 0
      ? scans
      : [
          { id: 'seed-1', type: 'qr' as const, data: 'SITE-B-QR-8842', timestamp: new Date(Date.now() - 8 * 60000).toISOString(), siteId: locations[1]?.id },
          { id: 'seed-2', type: 'object' as const, data: 'MAT-FT-220-991', timestamp: new Date(Date.now() - 22 * 60000).toISOString(), siteId: locations[0]?.id },
          { id: 'seed-3', type: 'qr' as const, data: 'CHECKIN-JORDAN-M', timestamp: new Date(Date.now() - 45 * 60000).toISOString() },
        ];
  return source.map((s, i) => {
    const purpose = s.type === 'qr' ? 'qr' : PURPOSE_ROTATION[i % PURPOSE_ROTATION.length];
    const site = locations.find((l) => l.id === s.siteId);
    return {
      id: s.id,
      purpose,
      label: SCAN_PURPOSE_LABELS[purpose],
      data: s.data,
      timestamp: s.timestamp,
      verified: !s.data.includes('MANUAL') && Math.random() > 0.15,
      projectName: projects[i % projects.length],
      siteName: site?.name ?? 'Field zone',
      assignee: 'Jordan Mbeki',
      format: purpose === 'nfc' ? 'nfc' : purpose === 'barcode' || purpose === 'material' ? 'barcode' : purpose === 'geolocation' ? 'gps' : 'qr',
    };
  });
}

export function buildScanAnalytics(records: OperationalScanRecord[]): ScanAnalytics {
  const verified = records.filter((r) => r.verified).length;
  const byPurpose: Record<string, number> = {};
  records.forEach((r) => {
    byPurpose[r.purpose] = (byPurpose[r.purpose] ?? 0) + 1;
  });
  return {
    todayTotal: records.length + 14,
    verifiedRate: records.length ? Math.round((verified / records.length) * 100) : 94,
    successStreak: 7,
    byPurpose,
  };
}

export function buildOffsiteFieldTasks(
  locations: SiteLocation[],
  employees: Employee[]
): OffsiteFieldTask[] {
  const sites = locations.length > 0 ? locations : [
    { id: 's1', name: 'Site A — Depot' },
    { id: 's2', name: 'Site B — Installation' },
    { id: 's3', name: 'Site C — Inspection' },
  ];
  const assignees = employees.length > 0 ? employees.slice(0, 4) : [
    { id: 'a1', name: 'Sarah Naidoo' },
    { id: 'a2', name: 'Jordan Mbeki' },
  ];

  const seeds: Omit<OffsiteFieldTask, 'id'>[] = [
    {
      title: 'Fibre cabinet installation',
      type: 'installation',
      priority: 'urgent',
      status: 'in_progress',
      siteId: sites[1]?.id,
      siteName: sites[1]?.name ?? 'Site B',
      assigneeId: assignees[0]?.id,
      assigneeName: assignees[0]?.name,
      supervisorName: 'Alex Morgan',
      travelDurationMin: 34,
      etaArrival: format(addMinutes(new Date(), 25), 'HH:mm'),
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      overdue: false,
      completionProof: false,
      hasImages: true,
      qrVerified: true,
      safetyChecklist: true,
      progress: 55,
    },
    {
      title: 'Safety inspection — rooftop',
      type: 'inspection',
      priority: 'high',
      status: 'assigned',
      siteId: sites[2]?.id,
      siteName: sites[2]?.name ?? 'Site C',
      assigneeId: assignees[1]?.id,
      assigneeName: assignees[1]?.name,
      supervisorName: 'Sam Rivera',
      travelDurationMin: 22,
      etaArrival: format(addMinutes(new Date(), 40), 'HH:mm'),
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      overdue: false,
      completionProof: false,
      hasImages: false,
      qrVerified: false,
      safetyChecklist: false,
      progress: 10,
    },
    {
      title: 'Deliver termination kits',
      type: 'delivery',
      priority: 'medium',
      status: 'unassigned',
      siteName: sites[0]?.name ?? 'Site A',
      siteId: sites[0]?.id,
      supervisorName: 'Alex Morgan',
      travelDurationMin: 18,
      etaArrival: '—',
      dueDate: format(addMinutes(new Date(), 180), 'yyyy-MM-dd'),
      overdue: true,
      completionProof: false,
      hasImages: false,
      qrVerified: false,
      safetyChecklist: false,
      progress: 0,
    },
    {
      title: 'Generator maintenance check',
      type: 'maintenance',
      priority: 'medium',
      status: 'pending_review',
      siteId: sites[0]?.id,
      siteName: sites[0]?.name ?? 'Site A',
      assigneeId: assignees[0]?.id,
      assigneeName: assignees[0]?.name,
      supervisorName: 'Sam Rivera',
      travelDurationMin: 0,
      etaArrival: format(addMinutes(new Date(), -30), 'HH:mm'),
      dueDate: format(addMinutes(new Date(), -60), 'yyyy-MM-dd'),
      overdue: false,
      completionProof: true,
      hasImages: true,
      qrVerified: true,
      safetyChecklist: true,
      progress: 100,
    },
    {
      title: 'Customer handover sign-off',
      type: 'general',
      priority: 'high',
      status: 'completed',
      siteId: sites[1]?.id,
      siteName: sites[1]?.name ?? 'Site B',
      assigneeId: assignees[1]?.id,
      assigneeName: assignees[1]?.name,
      supervisorName: 'Alex Morgan',
      travelDurationMin: 0,
      etaArrival: format(addMinutes(new Date(), -120), 'HH:mm'),
      dueDate: format(addMinutes(new Date(), -24 * 60), 'yyyy-MM-dd'),
      overdue: false,
      completionProof: true,
      hasImages: true,
      qrVerified: true,
      safetyChecklist: true,
      progress: 100,
    },
  ];

  return seeds.map((t, i) => ({ ...t, id: `offsite-task-${i + 1}` }));
}

const TIMELINE_CATEGORY_META: Record<
  TimelineEventCategory,
  { label: string; color: string }
> = {
  check_in: { label: 'Check-in', color: '#10b981' },
  site_arrival: { label: 'Site arrival', color: '#0ea5e9' },
  installation_complete: { label: 'Installation', color: '#8b5cf6' },
  scan: { label: 'Scan', color: '#6366f1' },
  issue: { label: 'Issue', color: '#ef4444' },
  approval: { label: 'Approval', color: '#14b8a6' },
  route_change: { label: 'Route', color: '#f59e0b' },
  delay: { label: 'Delay', color: '#dc2626' },
  photo_upload: { label: 'Photo', color: '#ec4899' },
};

export function buildFieldTimeline(
  locations: SiteLocation[],
  scans: { timestamp: string }[]
): FieldTimelineEvent[] {
  const siteA = locations[0]?.name ?? 'Site A — Depot';
  const siteB = locations[1]?.name ?? 'Site B — Installation';
  const siteC = locations[2]?.name ?? 'Site C — Inspection';
  const now = Date.now();

  const events: Omit<FieldTimelineEvent, 'id'>[] = [
    {
      category: 'check_in',
      actorName: 'Jordan Mbeki',
      actorInitials: 'JM',
      actorColor: '#6366f1',
      message: 'clocked in for field shift',
      siteName: siteA,
      timestamp: new Date(now - 3 * 3600000).toISOString(),
    },
    {
      category: 'site_arrival',
      actorName: 'Sarah Naidoo',
      actorInitials: 'SN',
      actorColor: '#10b981',
      message: 'arrived on site',
      detail: 'GPS verified · geofence entered',
      siteName: siteB,
      siteId: locations[1]?.id,
      timestamp: new Date(now - 95 * 60000).toISOString(),
      isLive: true,
    },
    {
      category: 'scan',
      actorName: 'Priya Patel',
      actorInitials: 'PP',
      actorColor: '#8b5cf6',
      message: 'performed material verification scan',
      detail: 'MAT-FT-220-991',
      siteName: siteB,
      timestamp: new Date(now - 72 * 60000).toISOString(),
    },
    {
      category: 'route_change',
      actorName: 'Mission control',
      actorInitials: 'MC',
      actorColor: '#0ea5e9',
      message: 'rerouted crew via Johannesburg South',
      detail: 'Saves est. 34 min',
      siteName: 'Route intelligence',
      timestamp: new Date(now - 58 * 60000).toISOString(),
    },
    {
      category: 'delay',
      actorName: 'David Okafor',
      actorInitials: 'DO',
      actorColor: '#f59e0b',
      message: 'reported delay en route',
      detail: '+18 min · traffic on N12',
      siteName: siteC,
      timestamp: new Date(now - 44 * 60000).toISOString(),
    },
    {
      category: 'photo_upload',
      actorName: 'Sarah Naidoo',
      actorInitials: 'SN',
      actorColor: '#ec4899',
      message: 'uploaded installation proof photos',
      detail: '4 images · cabinet mount',
      siteName: siteB,
      timestamp: new Date(now - 38 * 60000).toISOString(),
    },
    {
      category: 'installation_complete',
      actorName: 'Sarah Naidoo',
      actorInitials: 'SN',
      actorColor: '#8b5cf6',
      message: 'marked installation segment complete',
      siteName: siteB,
      timestamp: new Date(now - 28 * 60000).toISOString(),
    },
    {
      category: 'issue',
      actorName: 'Priya Patel',
      actorInitials: 'PP',
      actorColor: '#ef4444',
      message: 'reported field issue',
      detail: 'Missing termination kit at handoff',
      siteName: siteC,
      timestamp: new Date(now - 22 * 60000).toISOString(),
    },
    {
      category: 'approval',
      actorName: 'Alex Morgan',
      actorInitials: 'AM',
      actorColor: '#14b8a6',
      message: 'submitted completion for supervisor approval',
      siteName: siteB,
      timestamp: new Date(now - 12 * 60000).toISOString(),
      isLive: true,
    },
    {
      category: 'check_in',
      actorName: 'David Okafor',
      actorInitials: 'DO',
      actorColor: '#0284c7',
      message: 'GPS check-in verified',
      siteName: siteC,
      timestamp: new Date(now - 5 * 60000).toISOString(),
      isLive: true,
    },
  ];

  if (scans.length > 0) {
    events.unshift({
      category: 'scan',
      actorName: 'Field operative',
      actorInitials: 'FO',
      actorColor: '#6366f1',
      message: 'latest scan logged',
      siteName: siteB,
      timestamp: scans[0].timestamp,
      isLive: true,
    });
  }

  return events
    .map((e, i) => ({ ...e, id: `tl-${i}` }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export { TIMELINE_CATEGORY_META };

export function buildSmartReporting(locations: SiteLocation[]): SmartReportingBundle {
  const completionRate =
    locations.length > 0
      ? Math.round(
          (locations.filter((l) => l.status === 'completed').length / locations.length) * 100
        )
      : 67;

  return {
    executiveSummary:
      'Field operations are 94% on plan for the week. Route batching recovered 2.1h travel time; two sites need supervisor attention before SLA window closes.',
    aiSummary:
      'AI analysis: Northern corridor over-staffed (+1 crew recommended shift). Scan verification at 94% with improving trend. Overtime risk concentrated on Team B — consider deferring non-critical inspections Thursday.',
    metrics: [
      { id: 'prod', title: 'Field productivity', value: '87%', change: '+4.2%', changeUp: true, tone: 'positive' },
      { id: 'route', title: 'Route efficiency', value: '92%', change: '+6.1%', changeUp: true, tone: 'positive' },
      { id: 'att', title: 'Attendance', value: '96%', change: '-1.0%', changeUp: false, tone: 'neutral' },
      { id: 'site', title: 'Site completion', value: `${completionRate}%`, change: '+8%', changeUp: true, tone: 'positive' },
      { id: 'travel', title: 'Avg travel / job', value: '34m', change: '-12%', changeUp: true, tone: 'positive' },
      { id: 'ot', title: 'Overtime exposure', value: '2.4h', change: '+0.8h', changeUp: false, tone: 'warning' },
      { id: 'install', title: 'Install success', value: '91%', change: '+2%', changeUp: true, tone: 'positive' },
      { id: 'scan', title: 'Scan verification', value: '94%', change: '+3%', changeUp: true, tone: 'positive' },
    ],
    productivityTrend: [
      { label: 'Mon', value: 72 },
      { label: 'Tue', value: 78 },
      { label: 'Wed', value: 81 },
      { label: 'Thu', value: 87 },
      { label: 'Fri', value: 85 },
    ],
    routeEfficiency: [
      { label: 'W1', value: 88, value2: 92 },
      { label: 'W2', value: 90, value2: 94 },
      { label: 'W3', value: 91, value2: 96 },
      { label: 'W4', value: 92, value2: 97 },
    ],
    attendanceWeekly: [
      { label: 'Mon', value: 94 },
      { label: 'Tue', value: 97 },
      { label: 'Wed', value: 95 },
      { label: 'Thu', value: 96 },
      { label: 'Fri', value: 98 },
    ],
    siteCompletion: locations.length
      ? locations.map((l) => ({ label: l.name.split('—')[0]?.trim() ?? l.name.slice(0, 8), value: l.progress }))
      : [
          { label: 'Site A', value: 100 },
          { label: 'Site B', value: 55 },
          { label: 'Site C', value: 30 },
        ],
    scanStats: [
      { label: 'QR', value: 42 },
      { label: 'Material', value: 28 },
      { label: 'Check-in', value: 18 },
      { label: 'Asset', value: 12 },
    ],
  };
}

export { SCAN_PURPOSE_LABELS };
