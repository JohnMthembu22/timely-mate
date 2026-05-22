import { differenceInDays, format, parseISO } from 'date-fns';
import type { ProjectAiInsight } from './projectAiInsightTypes';
import { buildOperationalAiInsights } from './projectAiInsightsMock';

export type { ProjectAiInsight } from './projectAiInsightTypes';

export interface ProjectActivityItem {
  id: string;
  relativeTime: string;
  actor: string;
  verb: string;
  subject: string;
  projectName: string;
  projectId: string;
  kind: 'assignment' | 'review' | 'milestone' | 'task' | 'comment';
}

export interface AssignmentSuggestion {
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  priority: 'low' | 'medium' | 'high';
  suggestedName: string;
  suggestedRole: string;
  loadPercent: number;
}

interface ConsoleProjectTask {
  id: string;
  title: string;
  assignee: { name: string; role: string } | null;
  status: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

interface ConsoleProjectInput {
  id: string;
  name: string;
  color: string;
  progress: number;
  endDate: string;
  team: { name: string; role: string }[];
  projectTasks: ConsoleProjectTask[];
  notes: { id: string; author: string; content: string; timestamp: string }[];
}

function daysUntil(endDate: string): number | null {
  try {
    const due = parseISO(endDate.includes('T') ? endDate : `${endDate}T12:00:00`);
    return differenceInDays(due, new Date());
  } catch {
    return null;
  }
}

/** Mock operational AI insights — maps project names when portfolio exists */
export function buildProjectInsights(projects: ConsoleProjectInput[]): ProjectAiInsight[] {
  const names = projects.map((p) => ({ id: p.id, name: p.name }));
  return buildOperationalAiInsights(names.length > 0 ? names : [
    { id: 'mock-ui', name: 'UI/UX Redesign' },
    { id: 'mock-eng', name: 'Platform Development' },
    { id: 'mock-legal', name: 'Legal Initiative' },
    { id: 'mock-fin', name: 'Financial Analysis' },
  ]);
}

export function buildProjectActivities(projects: ConsoleProjectInput[]): ProjectActivityItem[] {
  const items: ProjectActivityItem[] = [];

  projects.forEach((p) => {
    p.projectTasks.forEach((t) => {
      if (t.status === 'pending_review') {
        items.push({
          id: `rev-${p.id}-${t.id}`,
          relativeTime: 'Recently',
          actor: t.assignee?.name ?? 'Team member',
          verb: 'submitted for review',
          subject: t.title,
          projectName: p.name,
          projectId: p.id,
          kind: 'review',
        });
      }
      if (!t.assignee && t.status !== 'completed') {
        items.push({
          id: `un-${p.id}-${t.id}`,
          relativeTime: 'Queued',
          actor: 'System',
          verb: 'flagged unassigned task',
          subject: t.title,
          projectName: p.name,
          projectId: p.id,
          kind: 'assignment',
        });
      }
      if (t.status === 'in_progress') {
        items.push({
          id: `prog-${p.id}-${t.id}`,
          relativeTime: 'Active',
          actor: t.assignee?.name ?? 'Owner',
          verb: 'is executing',
          subject: t.title,
          projectName: p.name,
          projectId: p.id,
          kind: 'task',
        });
      }
    });

    p.notes.slice(0, 1).forEach((n) => {
      items.push({
        id: `note-${p.id}-${n.id}`,
        relativeTime: 'Earlier',
        actor: n.author,
        verb: 'added a project note',
        subject: n.content.slice(0, 48) + (n.content.length > 48 ? '…' : ''),
        projectName: p.name,
        projectId: p.id,
        kind: 'comment',
      });
    });

    const days = daysUntil(p.endDate);
    if (days !== null && days <= 21) {
      items.push({
        id: `ms-${p.id}`,
        relativeTime: days < 0 ? 'Overdue' : days === 0 ? 'Today' : `In ${days}d`,
        actor: 'Milestone engine',
        verb: 'tracked checkpoint',
        subject: `${p.name} delivery`,
        projectName: p.name,
        projectId: p.id,
        kind: 'milestone',
      });
    }
  });

  return items.slice(0, 12);
}

export function buildAssignmentSuggestions(projects: ConsoleProjectInput[]): AssignmentSuggestion[] {
  const suggestions: AssignmentSuggestion[] = [];

  projects.forEach((p) => {
    const openTasks = p.projectTasks.filter((t) => !t.assignee && t.status !== 'completed');
    openTasks.slice(0, 3).forEach((t, idx) => {
      const candidate = p.team[idx % Math.max(p.team.length, 1)];
      const load = 35 + ((idx + p.progress) % 45);
      suggestions.push({
        taskId: t.id,
        taskTitle: t.title,
        projectId: p.id,
        projectName: p.name,
        projectColor: p.color,
        priority: t.priority,
        suggestedName: candidate?.name ?? 'Available teammate',
        suggestedRole: candidate?.role ?? 'Contributor',
        loadPercent: Math.min(load, 92),
      });
    });
  });

  return suggestions.slice(0, 6);
}

export function formatMilestoneDate(endDate: string): string {
  try {
    const due = parseISO(endDate.includes('T') ? endDate : `${endDate}T12:00:00`);
    const days = differenceInDays(due, new Date());
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'In 1 day';
    return `In ${days} days · ${format(due, 'd MMM')}`;
  } catch {
    return endDate;
  }
}
