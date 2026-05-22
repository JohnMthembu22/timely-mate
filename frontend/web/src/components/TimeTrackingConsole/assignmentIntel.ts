import type { TimeTrackingJobRow } from './timeTrackingTypes';

export type ProjectHealth = 'on_track' | 'at_risk' | 'critical';
export type WorkloadPressure = 'low' | 'moderate' | 'high' | 'critical';
export type OverdueRisk = 'none' | 'low' | 'medium' | 'high';

export interface AssignmentIntel {
  aiProductivityScore: number;
  etaCompletion: string;
  workloadPressure: WorkloadPressure;
  projectHealth: ProjectHealth;
  overdueRisk: OverdueRisk;
  teamDependencies: number;
  blockers: string[];
  complexityScore: number;
}

const pressureStyle: Record<WorkloadPressure, { label: string; color: string }> = {
  low: { label: 'Low pressure', color: '#10b981' },
  moderate: { label: 'Moderate', color: '#0ea5e9' },
  high: { label: 'High load', color: '#f59e0b' },
  critical: { label: 'Critical', color: '#ef4444' },
};

const healthStyle: Record<ProjectHealth, { label: string; color: string }> = {
  on_track: { label: 'On track', color: '#10b981' },
  at_risk: { label: 'At risk', color: '#f59e0b' },
  critical: { label: 'Critical', color: '#ef4444' },
};

export function getPressureStyle(p: WorkloadPressure) {
  return pressureStyle[p];
}

export function getHealthStyle(h: ProjectHealth) {
  return healthStyle[h];
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % 997;
  return h;
}

export function enrichAssignmentIntel(job: TimeTrackingJobRow, index: number): AssignmentIntel {
  const h = hashId(job.id) + index;
  const progress = job.progress;

  const aiProductivityScore = 62 + (h % 34);
  const workloadPressure: WorkloadPressure =
    progress < 35 ? 'critical' : progress < 55 ? 'high' : progress < 75 ? 'moderate' : 'low';
  const projectHealth: ProjectHealth =
    progress >= 70 ? 'on_track' : progress >= 40 ? 'at_risk' : 'critical';
  const overdueRisk: OverdueRisk =
    progress < 30 ? 'high' : progress < 50 ? 'medium' : progress < 70 ? 'low' : 'none';

  const etaHours = Math.max(1, Math.round((100 - progress) / 12));
  const etaCompletion =
    job.isRunning
      ? `~${etaHours}h remaining (live)`
      : progress >= 95
        ? 'Complete today'
        : `ETA ${etaHours}h`;

  const blockers =
    progress < 50 && h % 3 === 0
      ? ['Awaiting client sign-off', 'Dependency on field install']
      : progress < 65 && h % 2 === 0
        ? ['Resource constraint']
        : [];

  return {
    aiProductivityScore,
    etaCompletion,
    workloadPressure,
    projectHealth,
    overdueRisk,
    teamDependencies: 1 + (h % 4),
    blockers,
    complexityScore: 3 + (h % 6),
  };
}
