/** Extended categories for business operations timeline (beyond meeting/task/production). */
export type OpsTimelineCategory =
  | 'milestone'
  | 'deadline'
  | 'shift'
  | 'approval'
  | 'risk'
  | 'meeting'
  | 'task'
  | 'production';

export type OpsRiskLevel = 'low' | 'medium' | 'high';

export const OPS_CATEGORY_LABELS: Record<OpsTimelineCategory, string> = {
  milestone: 'Milestone',
  deadline: 'Deadline',
  shift: 'Workforce shift',
  approval: 'Approval',
  risk: 'Risk',
  meeting: 'Meeting',
  task: 'Task',
  production: 'Production',
};

export const OPS_CATEGORY_COLORS: Record<OpsTimelineCategory, string> = {
  milestone: '#a78bfa',
  deadline: '#f59e0b',
  shift: '#38bdf8',
  approval: '#34d399',
  risk: '#f87171',
  meeting: '#60a5fa',
  task: '#94a3b8',
  production: '#f472b6',
};
