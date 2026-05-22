import type { AiProductivityInsightsBundle, AiProductivityInsight } from './aiProductivityInsightsTypes';
import type { TimeTrackingJobRow } from './timeTrackingTypes';

export function buildAiProductivityInsights(
  activeJobs: TimeTrackingJobRow[] = []
): AiProductivityInsightsBundle {
  const sprintJob = activeJobs.find((j) => /platform|sprint/i.test(j.name));
  const sprintName = sprintJob?.name ?? 'Platform Sprint';

  const insights: AiProductivityInsight[] = [
    {
      id: 'prod-eng-drop',
      headline: 'Engineering team productivity dropped 12% today',
      detail:
        'Deep-work blocks shortened vs 7-day baseline. Standup overrun and context-switching on infra tickets are the primary drivers.',
      recommendation: 'Protect a 90-minute focus block before noon and defer non-critical reviews to afternoon.',
      category: 'productivity',
      severity: 'warning',
      metric: '-12%',
      teamOrProject: 'Engineering',
      actions: [
        { id: 'focus-block', label: 'Schedule focus block', variant: 'primary' },
        { id: 'notify-lead', label: 'Notify team lead' },
      ],
    },
    {
      id: 'ot-uiux',
      headline: 'UI/UX team approaching overtime threshold',
      detail:
        'Projected +3.2h OT by Friday at current velocity. Two designers still on active timers past scheduled window.',
      recommendation: 'Cap evening work at 18:30 or redistribute handoff tasks to Platform squad.',
      category: 'overtime',
      severity: 'critical',
      metric: '+3.2h OT',
      teamOrProject: 'UI/UX',
      actions: [
        { id: 'rebalance', label: 'Rebalance workload', variant: 'primary' },
        { id: 'ot-alert', label: 'Send OT alert' },
      ],
    },
    {
      id: 'sprint-hours',
      headline: `${sprintName} likely to exceed allocated hours`,
      detail: sprintJob
        ? `Burn rate at ${sprintJob.progress}% complete with ${sprintJob.timeSpent} logged — forecast 18% over allocation.`
        : 'Sprint burn rate exceeds plan; forecast 18% over allocated hours without scope adjustment.',
      recommendation: 'Freeze scope additions and add a mid-sprint checkpoint with the briefed line manager.',
      category: 'workflow',
      severity: 'warning',
      metric: '+18% hrs',
      teamOrProject: sprintName,
      actions: [
        { id: 'checkpoint', label: 'Schedule checkpoint', variant: 'primary' },
        { id: 'scope-freeze', label: 'Flag scope freeze' },
      ],
    },
    {
      id: 'workload-balance',
      headline: 'Workload imbalance across delivery squads',
      detail:
        'Operations at 94% utilization while Creative holds 52% capacity. Three tasks queued behind a single reviewer.',
      recommendation: 'Shift one reviewer block to Creative and auto-assign overflow from the assignment hub.',
      category: 'workload',
      severity: 'info',
      metric: '42pt gap',
      teamOrProject: 'Cross-team',
      actions: [{ id: 'auto-assign', label: 'AI auto-balance', variant: 'primary' }],
    },
    {
      id: 'fatigue-cluster',
      headline: 'Fatigue cluster detected — 3 elevated risk scores',
      detail:
        'Consecutive long shifts plus low break compliance. Recovery scores dropped 8% since Monday.',
      recommendation: 'Mandate 15-minute recovery breaks and defer non-urgent installs for affected crew.',
      category: 'fatigue',
      severity: 'critical',
      metric: '3 at risk',
      actions: [
        { id: 'recovery', label: 'Push recovery breaks', variant: 'primary' },
        { id: 'wellness', label: 'Wellness broadcast' },
      ],
    },
    {
      id: 'efficiency-up',
      headline: 'Efficiency trend improving in Field operations',
      detail:
        'Scan-verify loop 6% faster week-over-week. Route batching recovered 47 minutes of travel time today.',
      recommendation: 'Replicate field batching playbook for urban install corridor next week.',
      category: 'efficiency',
      severity: 'info',
      metric: '+6%',
      teamOrProject: 'Field ops',
      actions: [{ id: 'share-playbook', label: 'Share playbook' }],
    },
    {
      id: 'workflow-under',
      headline: 'Underperforming workflow: manual timesheet edits',
      detail:
        '14 retroactive edits in 48h — pattern suggests approval bottlenecks on stop-workflow step.',
      recommendation: 'Enable one-tap stop + auto-submit for verified biometric sessions.',
      category: 'workflow',
      severity: 'warning',
      metric: '14 edits',
      actions: [
        { id: 'auto-submit', label: 'Enable auto-submit', variant: 'primary' },
        { id: 'audit', label: 'Run audit' },
      ],
    },
    {
      id: 'attendance-late',
      headline: 'Attendance concern — late cluster Tuesday / Friday',
      detail:
        '7 late check-ins (>15m) concentrated on hybrid staff. Geofence validation failed twice before manual override.',
      recommendation: 'Send pre-shift reminder at T-30 and review geofence radius for remote pods.',
      category: 'attendance',
      severity: 'warning',
      metric: '7 late',
      actions: [
        { id: 'reminder', label: 'Send reminders', variant: 'primary' },
        { id: 'geofence', label: 'Review geofence' },
      ],
    },
    {
      id: 'focus-rec',
      headline: 'Focus-time recommendation for deep work',
      detail:
        'Calendar analysis shows highest uninterrupted window 09:30–11:00. Protect for engineering critical path.',
      recommendation: 'Block focus time on calendars and silence non-critical notifications during window.',
      category: 'focus',
      severity: 'info',
      metric: '09:30–11:00',
      actions: [{ id: 'block-calendar', label: 'Block calendars', variant: 'primary' }],
    },
  ];

  const criticalCount = insights.filter((i) => i.severity === 'critical').length;
  const warningCount = insights.filter((i) => i.severity === 'warning').length;

  return {
    insights,
    efficiencyDelta: 4.2,
    criticalCount,
    warningCount,
  };
}
