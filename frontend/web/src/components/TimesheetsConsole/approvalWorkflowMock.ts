export type ApprovalQueueType =
  | 'pending'
  | 'manager_review'
  | 'flagged'
  | 'disputed'
  | 'compliance'
  | 'overtime'
  | 'payroll_lock';

export interface ApprovalQueueItem {
  id: string;
  type: ApprovalQueueType;
  employeeName: string;
  project: string;
  hours: string;
  submittedAt: string;
  severity: 'info' | 'warning' | 'critical';
  aiRecommendation: string;
  escalated?: boolean;
  entryId?: string;
}

export interface ApprovalWorkflowBundle {
  payrollLockLabel: string;
  lockDaysRemaining: number;
  items: ApprovalQueueItem[];
  pendingCount: number;
  flaggedCount: number;
}

export function buildApprovalWorkflow(entries: { id: string; project: string; duration: string; status: string }[]): ApprovalWorkflowBundle {
  const pending = entries.filter((e) => e.status === 'Pending' || e.status === 'Draft');
  const names = ['Alex Rivera', 'Jordan Kim', 'Sam Patel', 'Taylor Brooks', 'Morgan Lee'];

  const items: ApprovalQueueItem[] = [
    ...pending.slice(0, 4).map((e, i) => ({
      id: `ap-p-${i}`,
      type: 'pending' as const,
      employeeName: names[i % names.length],
      project: e.project,
      hours: e.duration,
      submittedAt: `${2 + i}h ago`,
      severity: 'warning' as const,
      aiRecommendation: 'Verify task alignment with briefed project before approve.',
      entryId: e.id,
    })),
    {
      id: 'ap-mgr-1',
      type: 'manager_review',
      employeeName: 'Casey Nguyen',
      project: 'Platform Sprint',
      hours: '9.5 hrs',
      submittedAt: 'Yesterday',
      severity: 'info',
      aiRecommendation: 'Manager queue — within SLA, recommend batch approve with OT note.',
      escalated: false,
    },
    {
      id: 'ap-flag-1',
      type: 'flagged',
      employeeName: 'Taylor Brooks',
      project: 'Infra patch',
      hours: '8.0 hrs',
      submittedAt: '3h ago',
      severity: 'critical',
      aiRecommendation: 'Duplicate punch detected — hold until dedupe audit completes.',
      escalated: true,
    },
    {
      id: 'ap-dispute-1',
      type: 'disputed',
      employeeName: 'Morgan Lee',
      project: 'Brand refresh',
      hours: '6.5 hrs',
      submittedAt: '1d ago',
      severity: 'warning',
      aiRecommendation: 'Employee disputed rejection — schedule manager call within 24h.',
      escalated: true,
    },
    {
      id: 'ap-comp-1',
      type: 'compliance',
      employeeName: 'Sam Patel',
      project: 'Field rollout',
      hours: '7.0 hrs',
      submittedAt: '5h ago',
      severity: 'warning',
      aiRecommendation: 'Missing break attestation — compliance hold until corrected.',
    },
    {
      id: 'ap-ot-1',
      type: 'overtime',
      employeeName: 'Jordan Kim',
      project: 'Operations batch',
      hours: '10.5 hrs',
      submittedAt: '4h ago',
      severity: 'critical',
      aiRecommendation: 'OT exceeds soft cap — requires director sign-off per policy.',
      escalated: true,
    },
  ];

  return {
    payrollLockLabel: 'Cycle lock in 3 business days',
    lockDaysRemaining: 3,
    items,
    pendingCount: items.filter((i) => i.type === 'pending').length,
    flaggedCount: items.filter((i) => i.type === 'flagged' || i.type === 'disputed').length,
  };
}
