import { differenceInDays, format, parseISO } from 'date-fns';
import type { ProjectHubRow, AiRiskLevel, TaskTrend } from './projectHubTypes';

interface HubProjectInput {
  id: string;
  name: string;
  description: string;
  progress: number;
  color: string;
  tasks: number;
  completedTasks: number;
  endDate: string;
  team: { name: string; avatar: string; role: string }[];
  projectTasks: {
    id: string;
    dueDate: string;
    status: string;
    priority: 'low' | 'medium' | 'high';
    assignee: { name: string } | null;
  }[];
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % 997;
  return h;
}

function inferDepartment(project: HubProjectInput): string {
  const match = project.id.match(/dept-project-(.+)/);
  if (match) {
    return match[1]
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  const role = project.team[0]?.role ?? '';
  if (role.toLowerCase().includes('engineer')) return 'Engineering';
  if (role.toLowerCase().includes('design')) return 'Design';
  if (role.toLowerCase().includes('market')) return 'Marketing';
  return 'Operations';
}

function daysUntilEnd(endDate: string): number | null {
  try {
    const due = parseISO(endDate.includes('T') ? endDate : `${endDate}T12:00:00`);
    return differenceInDays(due, new Date());
  } catch {
    return null;
  }
}

function computeAiRisk(progress: number, daysLeft: number | null, overdue: number): AiRiskLevel {
  if (overdue >= 3 || (daysLeft !== null && daysLeft < 0)) return 'critical';
  if (daysLeft !== null && daysLeft < 7 && progress < 50) return 'elevated';
  if (progress < 35 || overdue > 0) return 'moderate';
  return 'low';
}

const aiRiskCopy: Record<AiRiskLevel, string> = {
  low: 'Low AI risk',
  moderate: 'Moderate risk',
  elevated: 'Elevated risk',
  critical: 'Critical risk',
};

export function buildProjectHubRow(
  project: HubProjectInput,
  priority: ProjectHubRow['priority'],
  dueLabel: string
): ProjectHubRow {
  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = project.projectTasks.filter(
    (t) =>
      t.status !== 'completed' &&
      t.dueDate &&
      t.dueDate < today
  ).length;

  const activeBlockers = project.projectTasks.filter(
    (t) =>
      t.status === 'pending_review' ||
      (!t.assignee && t.status !== 'completed' && t.priority === 'high')
  ).length;

  const daysLeft = daysUntilEnd(project.endDate);
  const aiRisk = computeAiRisk(project.progress, daysLeft, overdueTasks);
  const seed = hashId(project.id);

  const teamWorkload = Math.min(
    98,
    Math.max(
      42,
      55 +
        project.team.length * 6 +
        (project.tasks - project.completedTasks) * 3 +
        (seed % 18)
    )
  );

  const budgetUsage = Math.min(
    100,
    Math.max(
      12,
      Math.round(project.progress * 0.55 + (seed % 35) + overdueTasks * 4)
    )
  );

  let healthScore = project.progress;
  healthScore -= overdueTasks * 8;
  healthScore -= activeBlockers * 5;
  if (aiRisk === 'critical') healthScore -= 15;
  else if (aiRisk === 'elevated') healthScore -= 10;
  else if (aiRisk === 'moderate') healthScore -= 5;
  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

  let completionPrediction = 'On track';
  if (daysLeft !== null) {
    if (daysLeft < 0) completionPrediction = `${Math.abs(daysLeft)}d past due`;
    else if (project.progress >= 85) completionPrediction = `Forecast · ${format(parseISO(project.endDate.includes('T') ? project.endDate : `${project.endDate}T12:00:00`), 'd MMM')}`;
    else if (daysLeft <= 7 && project.progress < 60) completionPrediction = `Likely +${Math.max(1, Math.round((60 - project.progress) / 15))}d slip`;
    else completionPrediction = `ETA · ${dueLabel}`;
  }

  const completionRate =
    project.tasks > 0 ? (project.completedTasks / project.tasks) * 100 : 0;
  let taskTrend: TaskTrend = 'flat';
  let taskTrendLabel = 'Stable';
  if (completionRate >= 60) {
    taskTrend = 'up';
    taskTrendLabel = `+${Math.min(24, Math.round(completionRate / 4) + (seed % 8))}%`;
  } else if (overdueTasks > 0 || activeBlockers > 1) {
    taskTrend = 'down';
    taskTrendLabel = `-${Math.min(18, overdueTasks * 3 + activeBlockers * 2)}%`;
  }

  const trendSeries = Array.from({ length: 6 }, (_, i) => {
    const base = project.progress / 100;
    const wave = ((seed + i * 17) % 30) / 100;
    return Math.min(1, Math.max(0.15, base * 0.7 + wave * 0.35 + i * 0.04));
  });

  return {
    id: project.id,
    name: project.name,
    desc: project.description,
    progress: project.progress,
    tasks: `${project.completedTasks}/${project.tasks}`,
    priority,
    team: project.team.map((m) =>
      m.name
        .split(/\s+/)
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    ),
    teamMembers: project.team.slice(0, 5).map((m) => ({
      initials: m.name
        .split(/\s+/)
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      name: m.name,
      avatar: m.avatar,
    })),
    dueLabel,
    color: project.color,
    healthScore,
    aiRisk,
    aiRiskLabel: aiRiskCopy[aiRisk],
    teamWorkload,
    budgetUsage,
    completionPrediction,
    taskTrend,
    taskTrendLabel,
    trendSeries,
    activeBlockers,
    overdueTasks,
    department: inferDepartment(project),
  };
}
