import { differenceInDays, parseISO } from 'date-fns';

export type AssignmentInsightType = 'suggestion' | 'warning' | 'rebalance';

export interface SmartAssignmentInsight {
  id: string;
  type: AssignmentInsightType;
  headline: string;
  detail: string;
  department?: string;
  confidence?: number;
}

export interface AssignmentQueueItem {
  id: string;
  /** Real task id when sourced from projectTasks; omitted for demo queue rows */
  taskId?: string;
  title: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  department: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  dependency?: string;
  assigneeSuggestion?: string;
}

export interface TeamAvailabilityLane {
  id: string;
  name: string;
  department: string;
  loadPercent: number;
  available: boolean;
  avatar?: string;
  role: string;
}

interface HubProject {
  id: string;
  name: string;
  color: string;
  endDate: string;
  team: { name: string; role: string; avatar?: string }[];
  projectTasks: {
    id: string;
    title: string;
    assignee: { name: string } | null;
    status: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
  }[];
}

interface HubEmployee {
  id: string;
  name: string;
  department: string;
  position: string;
  avatar?: string;
}

export function buildSmartAssignmentInsights(
  projects: HubProject[],
  employees: HubEmployee[]
): SmartAssignmentInsight[] {
  const insights: SmartAssignmentInsight[] = [];
  const depts = [...new Set(employees.map((e) => e.department))];

  const unassigned = projects.reduce(
    (n, p) => n + p.projectTasks.filter((t) => !t.assignee && t.status !== 'completed').length,
    0
  );
  if (unassigned > 0) {
    insights.push({
      id: 'sug-batch',
      type: 'suggestion',
      headline: `Batch-assign ${unassigned} unassigned task${unassigned > 1 ? 's' : ''} by department.`,
      detail: 'Use drag-and-drop lanes below or quick assign to clear the queue before EOD.',
      confidence: 88,
    });
  }

  return insights.slice(0, 5);
}

export function buildAssignmentQueue(projects: HubProject[]): AssignmentQueueItem[] {
  const queue: AssignmentQueueItem[] = [];
  projects.forEach((p) => {
    const dept = inferDept(p.name);
    p.projectTasks
      .filter((t) => !t.assignee && t.status !== 'completed')
      .forEach((t) => {
        queue.push({
          id: `${p.id}::${t.id}`,
          taskId: t.id,
          title: t.title,
          projectId: p.id,
          projectName: p.name,
          projectColor: p.color,
          department: dept,
          priority: t.priority,
          dueDate: t.dueDate,
          dependency: t.priority === 'high' ? 'Blocked on approval' : undefined,
          assigneeSuggestion: p.team[0]?.name,
        });
      });
  });
  if (queue.length === 0) return [];
  return queue.slice(0, 8);
}

export function buildTeamAvailability(
  employees: HubEmployee[],
  projects: HubProject[]
): TeamAvailabilityLane[] {
  const lanes: TeamAvailabilityLane[] = [];
  employees.slice(0, 10).forEach((emp, idx) => {
    const load = 48 + ((idx * 13 + projects.length * 5) % 48);
    lanes.push({
      id: emp.id,
      name: emp.name,
      department: emp.department,
      loadPercent: load,
      available: load < 85,
      avatar: emp.avatar,
      role: emp.position,
    });
  });
  return lanes;
}

function inferDept(name: string): string {
  if (/design|ui|creative/i.test(name)) return 'Design';
  if (/platform|engineer|develop/i.test(name)) return 'Engineering';
  if (/legal|compliance|hr/i.test(name)) return 'Legal';
  if (/financial|finance/i.test(name)) return 'Finance';
  if (/operation|process/i.test(name)) return 'Operations';
  if (/market|brand/i.test(name)) return 'Marketing';
  return 'Operations';
}

export function daysUntilLabel(dueDate: string): string {
  try {
    const due = parseISO(dueDate.includes('T') ? dueDate : `${dueDate}T12:00:00`);
    const days = differenceInDays(due, new Date());
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    return `${days}d left`;
  } catch {
    return dueDate;
  }
}
