import type { ProjectHubRow } from './projectHubTypes';
import type { AiRiskLevel, ProjectPriority } from './projectHubTypes';

export type ProjectSortMode =
  | 'ai-smart'
  | 'risk'
  | 'deadline'
  | 'workload'
  | 'name'
  | 'progress';

export type ProjectStatusFilter = 'all' | 'planning' | 'active' | 'delivery' | 'at-risk';

export type UtilizationFilter = 'all' | 'under' | 'optimal' | 'over';

export interface ProjectFilterState {
  search: string;
  department: string;
  status: ProjectStatusFilter;
  utilization: UtilizationFilter;
  sort: ProjectSortMode;
}

export const defaultProjectFilters: ProjectFilterState = {
  search: '',
  department: 'all',
  status: 'all',
  utilization: 'all',
  sort: 'ai-smart',
};

const riskOrder: Record<AiRiskLevel, number> = {
  critical: 0,
  elevated: 1,
  moderate: 2,
  low: 3,
};

const priorityOrder: Record<ProjectPriority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

function parseDueDays(dueLabel: string): number {
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const parts = dueLabel.trim().split(/\s+/);
  if (parts.length >= 2) {
    const day = parseInt(parts[0], 10);
    const mon = months[parts[1]];
    if (!Number.isNaN(day) && mon !== undefined) {
      const y = new Date().getFullYear();
      return Math.floor((new Date(y, mon, day).getTime() - Date.now()) / 86400000);
    }
  }
  return 999;
}

function projectStatus(p: ProjectHubRow): ProjectStatusFilter {
  if (p.priority === 'High' || p.aiRisk === 'critical' || p.aiRisk === 'elevated') return 'at-risk';
  if (p.progress >= 67) return 'delivery';
  if (p.progress >= 34) return 'active';
  return 'planning';
}

function matchesUtilization(p: ProjectHubRow, filter: UtilizationFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'under') return p.teamWorkload < 65;
  if (filter === 'optimal') return p.teamWorkload >= 65 && p.teamWorkload <= 85;
  return p.teamWorkload > 85;
}

export function filterAndSortProjects(
  projects: ProjectHubRow[],
  filters: ProjectFilterState
): ProjectHubRow[] {
  let list = [...projects];

  const q = filters.search.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        p.aiRiskLabel.toLowerCase().includes(q)
    );
  }

  if (filters.department !== 'all') {
    list = list.filter((p) => p.department === filters.department);
  }

  if (filters.status !== 'all') {
    list = list.filter((p) => projectStatus(p) === filters.status);
  }

  if (filters.utilization !== 'all') {
    list = list.filter((p) => matchesUtilization(p, filters.utilization));
  }

  switch (filters.sort) {
    case 'risk':
      list.sort(
        (a, b) =>
          riskOrder[a.aiRisk] - riskOrder[b.aiRisk] ||
          priorityOrder[a.priority] - priorityOrder[b.priority]
      );
      break;
    case 'deadline':
      list.sort((a, b) => parseDueDays(a.dueLabel) - parseDueDays(b.dueLabel));
      break;
    case 'workload':
      list.sort((a, b) => b.teamWorkload - a.teamWorkload);
      break;
    case 'progress':
      list.sort((a, b) => b.progress - a.progress);
      break;
    case 'name':
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'ai-smart':
    default:
      list.sort(
        (a, b) =>
          b.healthScore - a.healthScore ||
          riskOrder[a.aiRisk] - riskOrder[b.aiRisk] ||
          a.overdueTasks - b.overdueTasks
      );
      break;
  }

  return list;
}
