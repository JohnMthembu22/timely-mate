import { EMPTY_TIMESHEETS_AUDIT } from '../../utils/emptyData';

export type AuditInsightSeverity = 'info' | 'warning' | 'critical';

export interface AuditInsight {
  id: string;
  title: string;
  detail: string;
  severity: AuditInsightSeverity;
  category: 'anomaly' | 'overtime' | 'compliance' | 'allocation' | 'approval' | 'forecast';
}

export interface TimesheetsAuditBundle {
  insights: AuditInsight[];
  payrollForecast: { label: string; amount: string; delta: string; confidence: number };
  anomalyCount: number;
  complianceScore: number;
  otExposureHours: number;
  pendingApprovals: number;
  allocationBalance: number;
}

export function buildTimesheetsAuditBundle(
  approvedHours: string,
  pendingHours: string
): TimesheetsAuditBundle {
  return EMPTY_TIMESHEETS_AUDIT;
  return {
    insights: [
      {
        id: 'ai-1',
        title: 'Retroactive edit cluster detected',
        detail: '14 entries modified after stop-workflow in 48h — review approval chain on Platform squad.',
        severity: 'warning',
        category: 'anomaly',
      },
      {
        id: 'ai-2',
        title: 'Overtime concentration — UI/UX',
        detail: 'Projected +18% OT vs budget; 3 members above soft cap before cycle close.',
        severity: 'critical',
        category: 'overtime',
      },
      {
        id: 'ai-3',
        title: 'Payroll forecast within 2.1% of plan',
        detail: `Approved ${approvedHours} locked; ${pendingHours} pending audit may shift accrual by Friday.`,
        severity: 'info',
        category: 'forecast',
      },
      {
        id: 'ai-4',
        title: 'Break compliance gap',
        detail: '2 shifts missing mandatory break attestation — finance hold recommended.',
        severity: 'warning',
        category: 'compliance',
      },
      {
        id: 'ai-5',
        title: 'Project allocation skew',
        detail: 'Platform Sprint absorbing 34% of hours vs 22% plan — rebalance before close.',
        severity: 'warning',
        category: 'allocation',
      },
      {
        id: 'ai-6',
        title: 'Approval velocity improving',
        detail: 'Median manager sign-off down to 4.2h from 6.1h last cycle.',
        severity: 'info',
        category: 'approval',
      },
    ],
    payrollForecast: {
      label: 'Projected cycle payout',
      amount: 'R 4 892 000',
      delta: '+2.1% vs plan',
      confidence: 94,
    },
    anomalyCount: 5,
    complianceScore: 91,
    otExposureHours: 128,
    pendingApprovals: 12,
    allocationBalance: 72,
  };
}

export type SmartLedgerFilter = 'All' | 'Approved' | 'Pending' | 'Anomalies' | 'Overtime' | 'Compliance';
