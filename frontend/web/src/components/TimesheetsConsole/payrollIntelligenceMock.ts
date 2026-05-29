import { EMPTY_PAYROLL_INTELLIGENCE } from '../../utils/emptyData';

export type PayrollInsightSeverity = 'info' | 'warning' | 'critical';

export type PayrollInsightCategory =
  | 'projected_cost'
  | 'overtime_risk'
  | 'underreported'
  | 'unusual_activity'
  | 'attendance'
  | 'delayed_approval'
  | 'efficiency'
  | 'labor_breakdown';

export interface PayrollAiInsight {
  id: string;
  headline: string;
  detail: string;
  recommendation: string;
  severity: PayrollInsightSeverity;
  category: PayrollInsightCategory;
  metric?: string;
}

export interface LaborCostSlice {
  project: string;
  cost: number;
  hours: number;
  pct: number;
}

export interface PayrollIntelligenceBundle {
  projectedPayroll: { amount: string; budget: string; variance: string; weekDelta: number };
  overtimeRiskHours: number;
  underreportedHours: number;
  delayedApprovals: number;
  payrollEfficiency: number;
  insights: PayrollAiInsight[];
  costTrend: { label: string; actual: number; budget: number }[];
  otTrend: { label: string; hours: number }[];
  laborBreakdown: LaborCostSlice[];
}

export function buildPayrollIntelligenceBundle(
  approvedHours: string,
  pendingHours: string
): PayrollIntelligenceBundle {
  return EMPTY_PAYROLL_INTELLIGENCE;
  return {
    projectedPayroll: {
      amount: 'R 4 892 000',
      budget: 'R 4 780 000',
      variance: '+2.2% over budget',
      weekDelta: 3.1,
    },
    overtimeRiskHours: 128,
    underreportedHours: 14.5,
    delayedApprovals: 9,
    payrollEfficiency: 94,
    insights: [
      {
        id: 'pi-1',
        headline: 'Operations overtime increased 18% this week',
        detail: 'OT hours concentrated Tue–Thu on field install corridor. Three crews above soft cap.',
        recommendation: 'Cap non-critical OT after 18:00 and shift overflow to underutilized Creative squad.',
        severity: 'critical',
        category: 'overtime_risk',
        metric: '+18%',
      },
      {
        id: 'pi-2',
        headline: 'Potential duplicate time entries detected',
        detail: '4 overlapping punches within 12-minute windows — same employee, different project codes.',
        recommendation: 'Run dedupe audit and require manager attestation before cycle lock.',
        severity: 'critical',
        category: 'unusual_activity',
        metric: '4 dupes',
      },
      {
        id: 'pi-3',
        headline: 'Payroll costs projected to exceed budget',
        detail: `Forecast ${approvedHours} approved + ${pendingHours} pending pushes accrual R 102k above plan.`,
        recommendation: 'Freeze new allocations on Platform Sprint until Friday reconciliation.',
        severity: 'warning',
        category: 'projected_cost',
        metric: '+R 102k',
      },
      {
        id: 'pi-4',
        headline: 'Underreported hours — hybrid pod',
        detail: '14.5h gap between biometric clock-in and logged task time on remote check-ins.',
        recommendation: 'Prompt auto-sync from verification system and flag gaps > 30 min.',
        severity: 'warning',
        category: 'underreported',
        metric: '14.5h',
      },
      {
        id: 'pi-5',
        headline: 'Attendance inconsistencies on Friday cluster',
        detail: '7 late check-ins correlated with geofence override events.',
        recommendation: 'Review hybrid policy and send T-30 shift reminders.',
        severity: 'warning',
        category: 'attendance',
      },
      {
        id: 'pi-6',
        headline: 'Delayed approvals blocking payroll lock',
        detail: '9 entries pending > 48h — median manager queue time 6.2h vs 4.2h SLA.',
        recommendation: 'Escalate to backup approvers for Operations and UI/UX queues.',
        severity: 'warning',
        category: 'delayed_approval',
        metric: '9 late',
      },
      {
        id: 'pi-7',
        headline: 'Payroll efficiency improving',
        detail: 'Auto-submit from verified sessions reduced manual edits 22% cycle-over-cycle.',
        recommendation: 'Expand biometric auto-submit to remaining field crews.',
        severity: 'info',
        category: 'efficiency',
        metric: '94%',
      },
      {
        id: 'pi-8',
        headline: 'Project labor cost skew — Platform Sprint',
        detail: '34% of labor spend vs 22% budget allocation; infra under-absorbing planned hours.',
        recommendation: 'Rebalance task codes before compile cycle report.',
        severity: 'info',
        category: 'labor_breakdown',
      },
    ],
    costTrend: [
      { label: 'W1', actual: 62, budget: 65 },
      { label: 'W2', actual: 68, budget: 66 },
      { label: 'W3', actual: 71, budget: 68 },
      { label: 'W4', actual: 78, budget: 69 },
    ],
    otTrend: [
      { label: 'Mon', hours: 12 },
      { label: 'Tue', hours: 18 },
      { label: 'Wed', hours: 22 },
      { label: 'Thu', hours: 20 },
      { label: 'Fri', hours: 14 },
    ],
    laborBreakdown: [
      { project: 'Platform Sprint', cost: 96400, hours: 420, pct: 34 },
      { project: 'Field rollout', cost: 71200, hours: 310, pct: 25 },
      { project: 'Brand refresh', cost: 52800, hours: 230, pct: 19 },
      { project: 'Infra patch', cost: 38400, hours: 168, pct: 13 },
      { project: 'Support', cost: 25400, hours: 112, pct: 9 },
    ],
  };
}
