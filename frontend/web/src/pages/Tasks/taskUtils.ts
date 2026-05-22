import type { Task, TaskFiltersState, TaskGroupMode, TaskPriority, TaskStatus, DueWarning } from './types';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  PENDING_REVIEW: 'Pending review',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#94a3b8',
  medium: '#38bdf8',
  high: '#fbbf24',
  urgent: '#f87171',
};

export function getAssigneeInitials(name: string, email: string): string {
  const n = name?.trim();
  if (n) {
    const parts = n.split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function parseDueDate(dueDate: string): Date | null {
  if (!dueDate) return null;
  const d = new Date(dueDate.includes('T') ? dueDate : `${dueDate}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getDueWarning(task: Task): DueWarning {
  if (task.status === 'COMPLETED' || task.status === 'PENDING_REVIEW') return 'none';
  const d = parseDueDate(task.dueDate);
  if (!d) return 'none';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(d);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / (86400000));
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'due-today';
  if (diff <= 3) return 'due-soon';
  return 'ok';
}

export function formatDueLabel(dueDate: string): string {
  const d = parseDueDate(dueDate);
  if (!d) return 'No due date';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function filterTasks(tasks: Task[], filters: TaskFiltersState, userEmail?: string): Task[] {
  const q = filters.search.trim().toLowerCase();
  return tasks.filter((task) => {
    if (filters.myTasksOnly && userEmail && task.assignee !== userEmail) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) return false;
    if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) return false;
    if (filters.assignee && task.assignee !== filters.assignee) return false;

    const warning = getDueWarning(task);
    if (filters.dueFilter === 'overdue' && warning !== 'overdue') return false;
    if (filters.dueFilter === 'today' && warning !== 'due-today') return false;
    if (filters.dueFilter === 'week') {
      const d = parseDueDate(task.dueDate);
      if (!d) return false;
      const today = new Date();
      const week = new Date(today);
      week.setDate(week.getDate() + 7);
      if (d < today || d > week) return false;
    }

    if (q) {
      const hay = `${task.title} ${task.description} ${task.assigneeName} ${task.project}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export interface TaskGroup {
  key: string;
  label: string;
  tasks: Task[];
}

export function groupTasks(tasks: Task[], mode: TaskGroupMode): TaskGroup[] {
  const map = new Map<string, Task[]>();

  const add = (key: string, task: Task) => {
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(task);
  };

  tasks.forEach((task) => {
    switch (mode) {
      case 'status':
        add(task.status, task);
        break;
      case 'priority':
        add(task.priority, task);
        break;
      case 'assignee':
        add(task.assigneeName || task.assignee, task);
        break;
      case 'project':
        add(task.project || 'General', task);
        break;
      case 'due': {
        const w = getDueWarning(task);
        add(w, task);
        break;
      }
    }
  });

  const labelFor = (key: string, mode: TaskGroupMode): string => {
    if (mode === 'status') return STATUS_LABELS[key as TaskStatus] ?? key;
    if (mode === 'priority') return PRIORITY_LABELS[key as TaskPriority] ?? key;
    if (mode === 'due') {
      const labels: Record<DueWarning, string> = {
        overdue: 'Overdue',
        'due-today': 'Due today',
        'due-soon': 'Due soon',
        ok: 'Upcoming',
        none: 'No due date',
      };
      return labels[key as DueWarning] ?? key;
    }
    return key;
  };

  const order = (a: string, b: string): number => {
    if (mode === 'priority') {
      const orderP: TaskPriority[] = ['urgent', 'high', 'medium', 'low'];
      return orderP.indexOf(a as TaskPriority) - orderP.indexOf(b as TaskPriority);
    }
    if (mode === 'due') {
      const orderD: DueWarning[] = ['overdue', 'due-today', 'due-soon', 'ok', 'none'];
      return orderD.indexOf(a as DueWarning) - orderD.indexOf(b as DueWarning);
    }
    if (mode === 'status') {
      const orderS: TaskStatus[] = ['IN_PROGRESS', 'TODO', 'PENDING_REVIEW', 'COMPLETED'];
      return orderS.indexOf(a as TaskStatus) - orderS.indexOf(b as TaskStatus);
    }
    return a.localeCompare(b);
  };

  return [...map.entries()]
    .sort(([a], [b]) => order(a, b))
    .map(([key, groupTasks]) => ({
      key,
      label: labelFor(key, mode),
      tasks: groupTasks.sort((a, b) => {
        const pa = { urgent: 0, high: 1, medium: 2, low: 3 }[a.priority];
        const pb = { urgent: 0, high: 1, medium: 2, low: 3 }[b.priority];
        return pa - pb;
      }),
    }));
}
