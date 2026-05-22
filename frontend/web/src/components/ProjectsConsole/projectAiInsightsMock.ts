import type { ProjectAiInsight } from './projectAiInsightTypes';

/** Curated operational signals — mock AI, not connected to live models */
export function buildOperationalAiInsights(
  projectNames: { id: string; name: string }[]
): ProjectAiInsight[] {
  const byName = (needle: string) =>
    projectNames.find((p) => p.name.toLowerCase().includes(needle.toLowerCase()));

  const uiProject = byName('ui') ?? byName('design') ?? projectNames[0];
  const engProject = byName('platform') ?? byName('engineering') ?? projectNames[1];
  const legalProject = byName('legal') ?? byName('hr') ?? projectNames[2];
  const financeProject = byName('financial') ?? byName('finance') ?? projectNames[3];

  const insights: ProjectAiInsight[] = [
    {
      id: 'ai-delay-ui',
      category: 'delay_prediction',
      severity: 'critical',
      severityLevel: 4,
      title: 'Delay prediction',
      headline: uiProject
        ? `${uiProject.name} is likely to miss deadline by 3 days.`
        : 'UI/UX Redesign is likely to miss deadline by 3 days.',
      summary: 'Velocity dropped 22% over the last sprint; design review queue is the primary constraint.',
      detail:
        'Forecast model weights slip risk on open review tasks and dependency on brand sign-off. Recommend pulling forward stakeholder review by 48h and adding a backup designer for asset production.',
      metric: '87% confidence',
      confidence: 87,
      projectId: uiProject?.id,
      projectName: uiProject?.name ?? 'UI/UX Redesign',
      detectedAt: '12 min ago',
      actions: [
        { id: 'open', label: 'Open project', variant: 'primary' },
        { id: 'schedule', label: 'Adjust timeline', variant: 'secondary' },
      ],
    },
    {
      id: 'ai-workload-eng',
      category: 'workload_imbalance',
      severity: 'critical',
      severityLevel: 4,
      title: 'Workload imbalance',
      headline: 'Engineering team workload exceeds safe threshold.',
      summary: 'Three engineers above 92% utilization while QA and PM lanes have spare capacity.',
      detail:
        'Safe threshold is 85% rolling 7-day utilization. Shift 2 in-progress tasks from Platform squad to available QA pairing slots to rebalance without extending the milestone.',
      metric: '94% peak load',
      confidence: 91,
      team: 'Engineering',
      detectedAt: '28 min ago',
      actions: [
        { id: 'rebalance', label: 'Rebalance tasks', variant: 'primary' },
        { id: 'team', label: 'View roster', variant: 'secondary' },
      ],
    },
    {
      id: 'ai-overdue-tasks',
      category: 'overdue_tasks',
      severity: 'high',
      severityLevel: 3,
      title: 'Overdue tasks',
      headline: '7 tasks are past due across active pipelines.',
      summary: 'Highest concentration in in-progress workstreams with blocked external dependencies.',
      detail:
        '4 tasks overdue by 2+ days; 3 flagged today. Prioritize unblockers on API contract review and client approval gates before assigning new sprint work.',
      metric: '7 overdue',
      confidence: 96,
      detectedAt: '1 hr ago',
      actions: [
        { id: 'open', label: 'Review overdue', variant: 'primary' },
        { id: 'notify', label: 'Notify owners', variant: 'secondary' },
      ],
    },
    {
      id: 'ai-approval-legal',
      category: 'bottleneck',
      severity: 'high',
      severityLevel: 3,
      title: 'Bottleneck detection',
      headline: legalProject
        ? `${legalProject.name} waiting on approvals.`
        : 'Legal Initiative waiting on approvals.',
      summary: 'Compliance sign-off has been idle for 4 business days — downstream tasks are queued.',
      detail:
        'Approval chain shows legal → finance dual gate. Escalate to approvers with SLA breach in 24h or de-scope non-critical deliverables to protect milestone.',
      metric: '4d idle',
      confidence: 84,
      projectId: legalProject?.id,
      projectName: legalProject?.name ?? 'Legal Initiative',
      detectedAt: '2 hr ago',
      actions: [
        { id: 'escalate', label: 'Escalate approval', variant: 'primary' },
        { id: 'open', label: 'Open project', variant: 'secondary' },
      ],
    },
    {
      id: 'ai-budget-finance',
      category: 'budget_overrun',
      severity: 'warning',
      severityLevel: 2,
      title: 'Budget overrun alert',
      headline: financeProject
        ? `${financeProject.name} project budget usage increased 18%.`
        : 'Financial Analysis project budget usage increased 18%.',
      summary: 'Spend pace is ahead of plan due to contractor hours and tooling licenses.',
      detail:
        'Burn rate projects 6% overrun by phase-end if unchanged. Freeze discretionary tooling renewals and cap contractor hours to baseline for the next two weeks.',
      metric: '+18% vs plan',
      confidence: 79,
      projectId: financeProject?.id,
      projectName: financeProject?.name ?? 'Financial Analysis',
      detectedAt: '3 hr ago',
      actions: [
        { id: 'budget', label: 'Review budget', variant: 'primary' },
        { id: 'open', label: 'Open project', variant: 'secondary' },
      ],
    },
    {
      id: 'ai-risk-eng',
      category: 'high_risk',
      severity: 'warning',
      severityLevel: 2,
      title: 'High-risk project',
      headline: engProject
        ? `${engProject.name} flagged as high delivery risk.`
        : 'Platform Development flagged as high delivery risk.',
      summary: 'Progress below 40% with milestone in 9 days — dependency on third-party API stability.',
      detail:
        'Risk score combines schedule variance, open defect count, and external dependency latency. Activate war-room cadence and assign a dedicated unblock owner.',
      metric: 'Risk score 78',
      confidence: 82,
      projectId: engProject?.id,
      projectName: engProject?.name,
      detectedAt: '4 hr ago',
      actions: [
        { id: 'open', label: 'Mitigate risk', variant: 'primary' },
        { id: 'standup', label: 'Schedule sync', variant: 'secondary' },
      ],
    },
    {
      id: 'ai-productivity',
      category: 'productivity',
      severity: 'opportunity',
      severityLevel: 1,
      title: 'Team productivity',
      headline: 'Design squad throughput up 14% week-over-week.',
      summary: 'Faster review cycles and reduced context-switching are driving the gain.',
      detail:
        'Recommend documenting the standup format and WIP limits used this week as a playbook for Engineering and Marketing lanes.',
      metric: '+14% throughput',
      confidence: 74,
      team: 'Design',
      detectedAt: '5 hr ago',
      actions: [
        { id: 'playbook', label: 'Save playbook', variant: 'primary' },
        { id: 'share', label: 'Share with leads', variant: 'secondary' },
      ],
    },
    {
      id: 'ai-resource-alloc',
      category: 'resource_allocation',
      severity: 'info',
      severityLevel: 1,
      title: 'Resource allocation',
      headline: 'Reallocate 1 senior developer from low-priority maintenance to delivery lane.',
      summary: 'Model predicts 11% schedule recovery with minimal disruption to BAU work.',
      detail:
        'Maintenance backlog has no P1 items for 10 days. Temporary assignment to delivery sprint closes the critical path gap without hiring.',
      metric: '11% recovery',
      confidence: 71,
      detectedAt: '6 hr ago',
      actions: [
        { id: 'rebalance', label: 'Apply recommendation', variant: 'primary' },
        { id: 'simulate', label: 'Simulate impact', variant: 'secondary' },
      ],
    },
  ];

  return insights;
}
