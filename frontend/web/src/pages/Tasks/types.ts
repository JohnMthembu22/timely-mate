export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING_REVIEW';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskGroupMode = 'status' | 'priority' | 'due' | 'assignee' | 'project';

export type DueWarning = 'overdue' | 'due-today' | 'due-soon' | 'ok' | 'none';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee: string;
  createdBy: string;
  priority: TaskPriority;
  dueDate: string;
  assigneeName: string;
  project: string;
}

export interface TaskFormValues {
  title: string;
  description: string;
  status: TaskStatus;
  assignee: string;
  priority: TaskPriority;
  dueDate: string;
  project?: string;
}

export interface TaskFiltersState {
  search: string;
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  assignee: string;
  dueFilter: 'all' | 'overdue' | 'today' | 'week';
  myTasksOnly: boolean;
}

export interface AiTaskSuggestion {
  id: string;
  title: string;
  reason: string;
  suggestedPriority: TaskPriority;
  suggestedDueDays: number;
  confidence: number;
}
