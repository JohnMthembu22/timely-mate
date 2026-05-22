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

  const designProject = projects.find((p) => /design|ui|creative/i.test(p.name));
  const opsProject = projects.find((p) => /operation|process/i.test(p.name));
  const legalProject = projects.find((p) => /legal|hr|compliance/i.test(p.name));

  insights.push({
    id: 'sug-design',
    type: 'suggestion',
    headline: 'Suggested: Assign Design tasks to Creative Team.',
    detail: '3 open design tasks match Creative department capacity with 22% spare bandwidth.',
    department: 'Design',
    confidence: 86,
  });

  if (opsProject) {
    insights.push({
      id: 'sug-ops',
      type: 'rebalance',
      headline: `Suggested: Move 2 resources from ${opsProject.name}.`,
      detail: 'Operations lane is at 94% utilization — reassign to Platform or QA squads.',
      department: 'Operations',
      confidence: 79,
    });
  }

  insights.push({
    id: 'warn-legal',
    type: 'warning',
    headline: 'Warning: Legal team currently overloaded.',
    detail: legalProject
      ? `${legalProject.name} has approval bottlenecks and 2 overdue dependencies.`
      : 'Compliance approvals are blocking 2 downstream deliverables.',
    department: 'Legal',
    confidence: 91,
  });

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

  depts.slice(0, 1).forEach((d) => {
    insights.push({
      id: `sug-${d}`,
      type: 'suggestion',
      headline: `Prioritize ${d} high-impact work this sprint.`,
      detail: 'Model recommends locking deadlines for top 2 P1 items in this lane.',
      department: d,
      confidence: 72,
    });
  });

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
  if (queue.length === 0) {
    return [
      {
        id: 'demo-1',
        title: 'Brand guidelines review',
        projectId: 'demo',
        projectName: 'UI/UX Redesign',
        projectColor: '#8b5cf6',
        department: 'Design',
        priority: 'high',
        dueDate: new Date().toISOString().split('T')[0],
        dependency: 'Legal sign-off',
        assigneeSuggestion: 'Creative lead',
      },
      {
        id: 'demo-2',
        title: 'API contract finalization',
        projectId: 'demo',
        projectName: 'Platform Development',
        projectColor: '#3b82f6',
        department: 'Engineering',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
        assigneeSuggestion: 'Senior developer',
      },
    ];
  }
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
