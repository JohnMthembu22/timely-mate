import type { DashboardProjectTile } from '../../components/MainDashboardContent/MainDashboardContent';
import { deriveProjectMetrics, type ProjectDisplayStatus, type BudgetHealth } from '../../components/ProjectCard/projectMetrics';

export type ProjectHealthStatus = ProjectDisplayStatus;

export interface ProjectHealthRow {
  id: string;
  title: string;
  progress: number;
  status: ProjectHealthStatus;
  dueDate: string;
  teamSize: number;
  riskScore: number;
  budgetHealth: BudgetHealth;
  budgetLabel: string;
  aiRecommendation: string;
}

export interface LiveActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  kind: 'job' | 'clock' | 'notification' | 'system';
}

export interface WorkforceSnapshotData {
  totalPeople: number;
  departments: number;
  activeJobs: number;
  clockedIn: boolean;
  sessionLabel: string;
  topDepartments: { name: string; count: number }[];
}

export function deriveProjectHealth(projects: DashboardProjectTile[]): ProjectHealthRow[] {
  return projects.map((p) => {
    const m = deriveProjectMetrics(p.id, p.progress, p.teamSize);
    return {
      id: p.id,
      title: p.title,
      progress: p.progress,
      status: p.status ?? m.status,
      dueDate: p.dueDate,
      teamSize: p.teamSize,
      riskScore: p.riskScore ?? m.riskScore,
      budgetHealth: p.budgetHealth ?? m.budgetHealth,
      budgetLabel: p.budgetLabel ?? m.budgetLabel,
      aiRecommendation: p.aiRecommendation ?? m.aiRecommendation,
    };
  });
}

export function deriveAiInsights(params: {
  projects: DashboardProjectTile[];
  employeeCount: number;
  departmentCount: number;
  activeJobCount: number;
  isClockedIn: boolean;
  unreadNotifications: number;
}): { id: string; text: string; priority: 'high' | 'medium' | 'low' }[] {
  const insights: { id: string; text: string; priority: 'high' | 'medium' | 'low' }[] = [];
  const atRisk = params.projects.filter((p) => p.progress < 65).length;
  const critical = params.projects.filter((p) => p.progress < 35).length;

  if (critical > 0) {
    insights.push({
      id: 'critical-projects',
      text: `${critical} project${critical > 1 ? 's' : ''} below 35% progress — prioritize resource allocation.`,
      priority: 'high',
    });
  } else if (atRisk > 0) {
    insights.push({
      id: 'at-risk',
      text: `${atRisk} workspace${atRisk > 1 ? 's' : ''} trending behind plan. Review timelines in Critical projects.`,
      priority: 'medium',
    });
  }

  if (params.activeJobCount === 0) {
    insights.push({
      id: 'no-jobs',
      text: 'No active timers — start time tracking to feed live operations data.',
      priority: 'medium',
    });
  } else {
    insights.push({
      id: 'active-jobs',
      text: `${params.activeJobCount} active workspace${params.activeJobCount > 1 ? 's' : ''} on the board — monitor health scores below.`,
      priority: 'low',
    });
  }

  if (!params.isClockedIn) {
    insights.push({
      id: 'clock-in',
      text: 'You are not clocked in. Attendance context is paused until you start your session.',
      priority: 'high',
    });
  }

  if (params.unreadNotifications > 0) {
    insights.push({
      id: 'notifications',
      text: `${params.unreadNotifications} unread notification${params.unreadNotifications > 1 ? 's' : ''} — review Messages for team signals.`,
      priority: 'medium',
    });
  }

  if (params.employeeCount > 0) {
    insights.push({
      id: 'workforce',
      text: `Workforce roster: ${params.employeeCount} people across ${params.departmentCount || 1} department${params.departmentCount !== 1 ? 's' : ''}.`,
      priority: 'low',
    });
  }

  return insights.slice(0, 5);
}

export function buildLiveActivityFeed(params: {
  clockRecords: { id: string; clockIn: string; clockOut: string | null }[];
  jobNames: string[];
  notificationItems: { id: number; title: string; description: string; time: string; read: boolean }[];
  legacyActivities: { id: string; description: string; timestamp: string; status: string }[];
}): LiveActivityItem[] {
  const items: LiveActivityItem[] = [];

  params.notificationItems
    .filter((n) => !n.read)
    .slice(0, 4)
    .forEach((n) => {
      items.push({
        id: `notif-${n.id}`,
        title: n.title,
        detail: n.description,
        time: n.time,
        kind: 'notification',
      });
    });

  [...params.clockRecords].reverse().slice(0, 3).forEach((r) => {
    items.push({
      id: `clock-${r.id}`,
      title: r.clockOut ? 'Clocked out' : 'Clocked in',
      detail: r.clockOut ? `${r.clockIn} → ${r.clockOut}` : r.clockIn,
      time: 'Today',
      kind: 'clock',
    });
  });

  params.jobNames.slice(0, 3).forEach((name, i) => {
    items.push({
      id: `job-${i}`,
      title: 'Active workspace',
      detail: name,
      time: 'Live',
      kind: 'job',
    });
  });

  params.legacyActivities.forEach((a) => {
    items.push({
      id: a.id,
      title: a.description,
      detail: a.status,
      time: a.timestamp,
      kind: 'system',
    });
  });

  return items.slice(0, 12);
}

export function buildWorkforceSnapshot(
  employees: { department?: string }[],
  departmentCount: number,
  activeJobCount: number,
  isClockedIn: boolean
): WorkforceSnapshotData {
  const deptMap = new Map<string, number>();
  employees.forEach((e) => {
    const d = e.department?.trim() || 'General';
    deptMap.set(d, (deptMap.get(d) || 0) + 1);
  });
  const topDepartments = [...deptMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return {
    totalPeople: employees.length,
    departments: departmentCount,
    activeJobs: activeJobCount,
    clockedIn: isClockedIn,
    sessionLabel: isClockedIn ? 'Active' : 'Not clocked in',
    topDepartments,
  };
}
