import type { AiProductivityInsightsBundle } from '../components/TimeTrackingConsole/aiProductivityInsightsTypes';
import type { ApprovalWorkflowBundle } from '../components/TimesheetsConsole/approvalWorkflowMock';
import type { PayrollIntelligenceBundle } from '../components/TimesheetsConsole/payrollIntelligenceMock';
import type { TimesheetsAuditBundle } from '../components/TimesheetsConsole/timesheetsAuditMock';
import type { WorkforceIntelligenceData } from '../pages/WorkforceIntelligence/workforceIntelligenceMockData';
import type { LiveFieldOpsSnapshot } from '../pages/OffsiteWork/liveFieldOpsTypes';

export const EMPTY_TIMESHEETS_AUDIT: TimesheetsAuditBundle = {
  insights: [],
  payrollForecast: { label: 'Forecast', amount: '—', delta: '—', confidence: 0 },
  anomalyCount: 0,
  complianceScore: 0,
  otExposureHours: 0,
  pendingApprovals: 0,
  allocationBalance: 0,
};

export const EMPTY_PAYROLL_INTELLIGENCE: PayrollIntelligenceBundle = {
  insights: [],
  laborBreakdown: [],
  projectedPayroll: { amount: '—', budget: '—', variance: '—', weekDelta: 0 },
  overtimeRiskHours: 0,
  underreportedHours: 0,
  delayedApprovals: 0,
  payrollEfficiency: 0,
  costTrend: [],
  otTrend: [],
};

export function emptyApprovalWorkflow(): ApprovalWorkflowBundle {
  return {
    payrollLockLabel: 'Payroll lock',
    lockDaysRemaining: 0,
    items: [],
    pendingCount: 0,
    flaggedCount: 0,
  };
}

export const EMPTY_AI_PRODUCTIVITY: AiProductivityInsightsBundle = {
  insights: [],
  efficiencyDelta: 0,
  criticalCount: 0,
  warningCount: 0,
};

export const EMPTY_WORKFORCE_INTELLIGENCE: WorkforceIntelligenceData = {
  attendance: { rate: 0, onTime: 0, late: 0, absent: 0, weekly: [] },
  productivity: { current: 0, delta: 0, trend: [] },
  overtime: { totalHours: 0, weekOverWeek: 0, byMember: [] },
  workload: { balanceIndex: 0, overloaded: 0, underutilized: 0, members: [] },
  teamHealth: { score: 0, status: 'stable', factors: [] },
  fatigue: [],
  topPerformers: [],
  recommendations: [],
};

export const EMPTY_LIVE_FIELD_OPS: LiveFieldOpsSnapshot = {
  updatedAt: new Date().toISOString(),
  metrics: [],
  pulses: [],
  activeRegions: [],
};
