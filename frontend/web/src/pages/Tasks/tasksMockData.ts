import type { AiTaskSuggestion, Task } from './types';

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Complete Project Report',
    description: 'Write and submit the quarterly project report for executive review.',
    status: 'TODO',
    assignee: 'employee@timelymate.com',
    assigneeName: 'Alex Morgan',
    createdBy: 'admin@timelymate.com',
    priority: 'high',
    dueDate: daysFromNow(-2),
    project: 'Platform Development',
  },
  {
    id: '2',
    title: 'Client Meeting Prep',
    description: 'Prepare agenda, slides, and demo environment for enterprise client call.',
    status: 'IN_PROGRESS',
    assignee: 'leader@timelymate.com',
    assigneeName: 'Jordan Lee',
    createdBy: 'admin@timelymate.com',
    priority: 'urgent',
    dueDate: daysFromNow(0),
    project: 'Customer Success',
  },
  {
    id: '3',
    title: 'Code Review — Auth module',
    description: 'Review pull requests from team members; focus on session persistence.',
    status: 'TODO',
    assignee: 'employee@timelymate.com',
    assigneeName: 'Alex Morgan',
    createdBy: 'leader@timelymate.com',
    priority: 'medium',
    dueDate: daysFromNow(2),
    project: 'Platform Development',
  },
  {
    id: '4',
    title: 'Update expense policy docs',
    description: 'Align procurement thresholds with finance memo Q2-2026.',
    status: 'TODO',
    assignee: 'admin@timelymate.com',
    assigneeName: 'Sam Patel',
    createdBy: 'admin@timelymate.com',
    priority: 'low',
    dueDate: daysFromNow(14),
    project: 'Operations',
  },
  {
    id: '5',
    title: 'Onboard freelancer — design',
    description: 'Send SOW, provision accounts, and schedule kickoff.',
    status: 'IN_PROGRESS',
    assignee: 'leader@timelymate.com',
    assigneeName: 'Jordan Lee',
    createdBy: 'admin@timelymate.com',
    priority: 'high',
    dueDate: daysFromNow(1),
    project: 'Brand Re-design',
  },
  {
    id: '6',
    title: 'Deploy staging hotfix',
    description: 'Patch notification batching regression; verify in staging.',
    status: 'COMPLETED',
    assignee: 'employee@timelymate.com',
    assigneeName: 'Alex Morgan',
    createdBy: 'leader@timelymate.com',
    priority: 'urgent',
    dueDate: daysFromNow(-5),
    project: 'Platform Development',
  },
];

export const MOCK_AI_TASK_SUGGESTIONS: AiTaskSuggestion[] = [
  {
    id: 'ai-1',
    title: 'Schedule steering review for overdue report',
    reason: 'Quarterly report is 2 days overdue with high priority — align stakeholders.',
    suggestedPriority: 'urgent',
    suggestedDueDays: 0,
    confidence: 92,
  },
  {
    id: 'ai-2',
    title: 'Block focus time before client meeting',
    reason: 'Urgent in-progress task due today — protect 90 minutes for prep.',
    suggestedPriority: 'high',
    suggestedDueDays: 0,
    confidence: 88,
  },
  {
    id: 'ai-3',
    title: 'Pair on auth PR reviews',
    reason: 'Medium priority code review due in 48h — reduce bus factor.',
    suggestedPriority: 'medium',
    suggestedDueDays: 1,
    confidence: 76,
  },
  {
    id: 'ai-4',
    title: 'Confirm freelancer compliance checklist',
    reason: 'High priority onboarding due tomorrow — legal + IT sign-off.',
    suggestedPriority: 'high',
    suggestedDueDays: 1,
    confidence: 81,
  },
];
