import type { ProjectHubRow } from './projectHubTypes';

export type OperationalMetricTone = 'positive' | 'neutral' | 'warning' | 'critical' | 'info';

export interface OperationalMetric {
  id: string;
  label: string;
  value: number;
  displayValue: string;
  suffix?: string;
  tone: OperationalMetricTone;
  trend: number;
  trendLabel: string;
  sparkline: number[];
  hoverDetail: string;
  icon: 'health' | 'workforce' | 'risk' | 'delivery' | 'efficiency' | 'blocked' | 'approval' | 'productivity';
}

const riskWeight = { low: 0, moderate: 1, elevated: 2, critical: 3 };

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function buildOperationalMetrics(
  projects: ProjectHubRow[],
  employeeCount: number
): OperationalMetric[] {
  const n = projects.length;
  const avgHealth = n > 0 ? Math.round(avg(projects.map((p) => p.healthScore))) : 0;
  const avgWorkload = n > 0 ? Math.round(avg(projects.map((p) => p.teamWorkload))) : 0;
  const totalOverdue = projects.reduce((s, p) => s + p.overdueTasks, 0);
  const totalTasks = projects.reduce((s, p) => {
    const parts = p.tasks.split('/');
    return s + (parseInt(parts[1] ?? '0', 10) || 0);
  }, 0);
  const overduePct = totalTasks > 0 ? Math.round((totalOverdue / totalTasks) * 100) : 0;
  const criticalRisk = projects.filter((p) => riskWeight[p.aiRisk] >= 2).length;
  const deliveryConfidence = n > 0
    ? Math.max(0, Math.min(100, Math.round(avgHealth - criticalRisk * 6 - overduePct * 0.4)))
    : 0;
  const blockedPct =
    totalTasks > 0
      ? Math.round((projects.reduce((s, p) => s + p.activeBlockers, 0) / totalTasks) * 100)
      : 0;
  const efficiency = n > 0
    ? Math.round(
        avg(projects.map((p) => p.progress)) * 0.55 +
          avgHealth * 0.25 +
          (100 - avgWorkload) * 0.2
      )
    : 0;
  const approvalHours = 18 + (projects.reduce((s, p) => s + p.activeBlockers, 0) % 14);
  const productivityTrend = n > 0
    ? Math.round(avg(projects.map((p) => (p.taskTrend === 'up' ? 8 : p.taskTrend === 'down' ? -6 : 2))))
    : 0;

  const workforceUtil = employeeCount > 0
    ? Math.min(98, Math.round(avgWorkload * 0.85 + (employeeCount > 8 ? 8 : 4)))
    : avgWorkload;

  const mkSpark = (seed: number, base: number) =>
    Array.from({ length: 8 }, (_, i) =>
      Math.min(1, Math.max(0.12, base / 100 + ((seed + i * 13) % 22) / 100))
    );

  return [
    {
      id: 'health',
      label: 'Active project health',
      value: avgHealth,
      displayValue: `${avgHealth}`,
      suffix: '%',
      tone: avgHealth >= 72 ? 'positive' : avgHealth >= 50 ? 'warning' : 'critical',
      trend: avgHealth >= 65 ? 4.2 : -3.1,
      trendLabel: avgHealth >= 65 ? '+4.2% vs last week' : '-3.1% vs last week',
      sparkline: mkSpark(11, avgHealth),
      hoverDetail: `Portfolio health index across ${n} workspace${n !== 1 ? 's' : ''}. Weighted by progress, blockers, and AI risk.`,
      icon: 'health',
    },
    {
      id: 'workforce',
      label: 'Workforce utilisation',
      value: workforceUtil,
      displayValue: `${workforceUtil}`,
      suffix: '%',
      tone: workforceUtil > 88 ? 'warning' : workforceUtil > 70 ? 'positive' : 'info',
      trend: workforceUtil > 85 ? 2.8 : -1.4,
      trendLabel: workforceUtil > 85 ? '+2.8% capacity pressure' : 'Balanced load',
      sparkline: mkSpark(22, workforceUtil),
      hoverDetail: `${employeeCount} team members mapped · rolling 7-day utilisation vs assignment hub lanes.`,
      icon: 'workforce',
    },
    {
      id: 'overdue-risk',
      label: 'Overdue risk',
      value: overduePct,
      displayValue: `${overduePct}`,
      suffix: '%',
      tone: overduePct > 15 ? 'critical' : overduePct > 5 ? 'warning' : 'positive',
      trend: overduePct > 10 ? 5.6 : -2.2,
      trendLabel: overduePct > 10 ? '+5.6% risk exposure' : '-2.2% improved',
      sparkline: mkSpark(33, 100 - overduePct),
      hoverDetail: `${totalOverdue} overdue tasks across ${totalTasks} logged · SLA breach watch active.`,
      icon: 'risk',
    },
    {
      id: 'delivery',
      label: 'Delivery confidence',
      value: deliveryConfidence,
      displayValue: `${deliveryConfidence}`,
      suffix: '%',
      tone: deliveryConfidence >= 75 ? 'positive' : deliveryConfidence >= 55 ? 'neutral' : 'warning',
      trend: deliveryConfidence >= 70 ? 3.4 : -4.8,
      trendLabel: deliveryConfidence >= 70 ? 'High confidence band' : 'Review milestones',
      sparkline: mkSpark(44, deliveryConfidence),
      hoverDetail: `Composite score: health, ${criticalRisk} elevated-risk project${criticalRisk !== 1 ? 's' : ''}, milestone runway.`,
      icon: 'delivery',
    },
    {
      id: 'efficiency',
      label: 'Operational efficiency',
      value: efficiency,
      displayValue: `${efficiency}`,
      suffix: '%',
      tone: efficiency >= 68 ? 'positive' : 'neutral',
      trend: 1.9,
      trendLabel: '+1.9% throughput',
      sparkline: mkSpark(55, efficiency),
      hoverDetail: 'Blended progress velocity, health, and spare capacity across active pipelines.',
      icon: 'efficiency',
    },
    {
      id: 'blocked',
      label: 'Blocked tasks',
      value: blockedPct,
      displayValue: `${blockedPct}`,
      suffix: '%',
      tone: blockedPct > 12 ? 'critical' : blockedPct > 5 ? 'warning' : 'positive',
      trend: blockedPct > 8 ? 4.1 : -1.8,
      trendLabel: blockedPct > 8 ? '+4.1% queue friction' : 'Flow clearing',
      sparkline: mkSpark(66, 100 - blockedPct),
      hoverDetail: 'Tasks in pending review or unassigned high-priority work blocking delivery.',
      icon: 'blocked',
    },
    {
      id: 'approval',
      label: 'Approval turnaround',
      value: approvalHours,
      displayValue: `${approvalHours}`,
      suffix: 'h',
      tone: approvalHours > 24 ? 'warning' : 'positive',
      trend: approvalHours > 24 ? 6.2 : -3.5,
      trendLabel: approvalHours > 24 ? '+6.2h vs target' : 'Within SLA',
      sparkline: mkSpark(77, Math.max(20, 100 - approvalHours)),
      hoverDetail: 'Median hours from submit-for-review to approver action (mock operational baseline).',
      icon: 'approval',
    },
    {
      id: 'productivity',
      label: 'AI productivity trend',
      value: Math.abs(productivityTrend) + 62,
      displayValue: productivityTrend >= 0 ? `+${productivityTrend}` : `${productivityTrend}`,
      suffix: '%',
      tone: productivityTrend >= 0 ? 'positive' : 'warning',
      trend: productivityTrend,
      trendLabel: productivityTrend >= 0 ? 'Model uplift detected' : 'Velocity dip',
      sparkline: mkSpark(88, 62 + productivityTrend),
      hoverDetail: 'Mock AI-assisted throughput index from task completion and review cycle patterns.',
      icon: 'productivity',
    },
  ];
}
