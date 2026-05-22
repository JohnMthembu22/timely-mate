import { differenceInDays, format, parseISO } from 'date-fns';
import type {
  MilestoneProgressStatus,
  MilestoneRiskLevel,
  OperationalMilestone,
} from './projectMilestoneTypes';
import type { ProjectHubRow } from './projectHubTypes';

interface MilestoneProjectInput {
  id: string;
  name: string;
  endDate: string;
  progress: number;
  color: string;
  team: { name: string; role: string }[];
  projectTasks: {
    id: string;
    title: string;
    status: string;
    dueDate: string;
    assignee: { name: string } | null;
  }[];
}

const riskOrder: Record<MilestoneRiskLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function parseEnd(endDate: string): Date | null {
  try {
    return parseISO(endDate.includes('T') ? endDate : `${endDate}T12:00:00`);
  } catch {
    return null;
  }
}

function deriveRisk(
  progress: number,
  daysLeft: number,
  overdueTasks: number,
  blockers: number
): MilestoneRiskLevel {
  if (daysLeft < 0 || overdueTasks >= 3) return 'critical';
  if (daysLeft <= 7 && progress < 50) return 'high';
  if (blockers > 1 || (daysLeft <= 14 && progress < 60)) return 'medium';
  return 'low';
}

function deriveStatus(
  progress: number,
  daysLeft: number,
  blockers: number
): MilestoneProgressStatus {
  if (daysLeft < 0) return 'overdue';
  if (progress >= 100) return 'completed';
  if (blockers > 0 && progress < 70) return 'blocked';
  if (progress > 0 && progress < 100) return 'in_progress';
  return 'upcoming';
}

function formatCountdown(daysLeft: number): string {
  if (daysLeft < 0) return `${Math.abs(daysLeft)}d overdue`;
  if (daysLeft === 0) return 'Due today';
  if (daysLeft === 1) return '1 day left';
  return `${daysLeft} days left`;
}

function formatMilestoneDateLabel(endDate: string, daysLeft: number): string {
  const due = parseEnd(endDate);
  if (!due) return endDate;
  if (daysLeft < 0) return `Overdue · ${format(due, 'd MMM yyyy')}`;
  if (daysLeft === 0) return `Due today · ${format(due, 'h:mm a')}`;
  return `${format(due, 'd MMM yyyy')} · ${formatCountdown(daysLeft)}`;
}

export function buildOperationalMilestones(
  projects: MilestoneProjectInput[],
  hubById: Map<string, ProjectHubRow>
): OperationalMilestone[] {
  const milestones = projects.map((p) => {
    const due = parseEnd(p.endDate);
    const daysLeft = due ? differenceInDays(due, new Date()) : 30;
    const hub = hubById.get(p.id);
    const overdueTasks =
      hub?.overdueTasks ??
      p.projectTasks.filter(
        (t) => t.status !== 'completed' && t.dueDate && t.dueDate < new Date().toISOString().split('T')[0]
      ).length;
    const blockers =
      hub?.activeBlockers ??
      p.projectTasks.filter((t) => t.status === 'pending_review' || (!t.assignee && t.status !== 'completed'))
        .length;
    const progress = p.progress;
    const riskLevel = deriveRisk(progress, daysLeft, overdueTasks, blockers);
    const progressStatus = deriveStatus(progress, daysLeft, blockers);
    const ownerMember = p.team[0];
    const ownerName = ownerMember?.name ?? 'Unassigned lead';
    const initials = ownerName
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const unassignedDeps = p.projectTasks
      .filter((t) => !t.assignee && t.status !== 'completed')
      .slice(0, 2)
      .map((t) => t.title);
    const pendingDeps = p.projectTasks
      .filter((t) => t.status === 'pending_review')
      .slice(0, 1)
      .map((t) => `${t.title} (approval)`);

    const dependencies = [...pendingDeps, ...unassignedDeps];
    let dependencyWarning: string | undefined;
    if (pendingDeps.length > 0) {
      dependencyWarning = `Approval gate blocking · ${pendingDeps[0]}`;
    } else if (unassignedDeps.length > 0) {
      dependencyWarning = `${unassignedDeps.length} unassigned task${unassignedDeps.length > 1 ? 's' : ''} on critical path`;
    } else if (daysLeft <= 10 && progress < 55) {
      dependencyWarning = 'Third-party / cross-team dependency may slip delivery';
    }

    let completionForecast = hub?.completionPrediction ?? 'On track';
    if (daysLeft < 0) {
      completionForecast = `Recovery window · +${Math.max(3, Math.round((70 - progress) / 8))}d estimated`;
    } else if (progress >= 85) {
      completionForecast = `Forecast delivery · ${due ? format(due, 'd MMM') : 'on plan'}`;
    }

    const timelinePosition = Math.min(100, Math.max(4, progress));
    const isOverdue = daysLeft < 0;
    const state = riskLevel === 'critical' || riskLevel === 'high' ? 'at-risk' : 'normal';

    return {
      id: p.id,
      projectId: p.id,
      title: `${p.name} · delivery checkpoint`,
      date: formatMilestoneDateLabel(p.endDate, daysLeft),
      dateIso: p.endDate,
      state,
      progress,
      projectColor: p.color,
      projectName: p.name,
      progressStatus,
      riskLevel,
      dependencyWarning,
      dependencies,
      completionForecast,
      owner: {
        name: ownerName,
        initials,
        role: ownerMember?.role ?? 'Project lead',
      },
      daysRemaining: daysLeft,
      isOverdue,
      countdownLabel: formatCountdown(daysLeft),
      timelinePosition,
      detail: `${p.name} is at ${progress}% with ${blockers} active blocker${blockers !== 1 ? 's' : ''} and ${overdueTasks} overdue task${overdueTasks !== 1 ? 's' : ''}. ${dependencyWarning ?? 'No critical dependency flags.'}`,
      blockers:
        blockers > 0
          ? [
              `${blockers} open blocker${blockers > 1 ? 's' : ''}`,
              ...(overdueTasks > 0 ? [`${overdueTasks} overdue assignments`] : []),
            ]
          : ['No active blockers'],
    } satisfies OperationalMilestone;
  });

  return milestones.sort((a, b) => {
    if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
  });
}
