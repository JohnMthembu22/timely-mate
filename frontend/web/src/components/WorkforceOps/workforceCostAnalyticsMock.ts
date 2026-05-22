export type CostAnalyticsView =
  | 'department'
  | 'project'
  | 'overtime'
  | 'utilization'
  | 'forecast'
  | 'productivity'
  | 'profitability';

export interface CostSeriesPoint {
  label: string;
  value: number;
  value2?: number;
}

export interface WorkforceCostAnalyticsBundle {
  totalLaborCost: number;
  overtimeSpend: number;
  utilizationEfficiency: number;
  forecastVariance: string;
  operationalMargin: number;
  aiSummary: string;
  departmentCosts: CostSeriesPoint[];
  projectCosts: CostSeriesPoint[];
  overtimeTrend: CostSeriesPoint[];
  utilizationByDept: CostSeriesPoint[];
  forecastTrend: CostSeriesPoint[];
  productivityVsCost: CostSeriesPoint[];
  profitability: CostSeriesPoint[];
  costTrendWeekly: CostSeriesPoint[];
}

export function buildWorkforceCostAnalytics(
  approvedHours: string,
  pendingHours: string
): WorkforceCostAnalyticsBundle {
  return {
    totalLaborCost: 284200,
    overtimeSpend: 42800,
    utilizationEfficiency: 87,
    forecastVariance: '+2.2% vs budget',
    operationalMargin: 34,
    aiSummary: `Executive brief: Labor spend tracking ${approvedHours} approved with ${pendingHours} pending audit. Operations OT rose 18% WoW while Platform Sprint drives 34% of project labor. Utilization at 87% with margin holding at 34% — recommend deferring non-critical OT before cycle lock and rebalancing UI/UX underutilization against Field overload.`,
    departmentCosts: [
      { label: 'Engineering', value: 98200 },
      { label: 'Operations', value: 71200 },
      { label: 'Field', value: 54800 },
      { label: 'UI/UX', value: 38400 },
      { label: 'Creative', value: 21600 },
    ],
    projectCosts: [
      { label: 'Platform Sprint', value: 96400 },
      { label: 'Field rollout', value: 71200 },
      { label: 'Brand refresh', value: 52800 },
      { label: 'Infra patch', value: 38400 },
      { label: 'Support', value: 25400 },
    ],
    overtimeTrend: [
      { label: 'W1', value: 32 },
      { label: 'W2', value: 38 },
      { label: 'W3', value: 41 },
      { label: 'W4', value: 48 },
    ],
    utilizationByDept: [
      { label: 'Eng', value: 92 },
      { label: 'Ops', value: 94 },
      { label: 'Field', value: 88 },
      { label: 'UX', value: 68 },
      { label: 'Cr', value: 55 },
    ],
    forecastTrend: [
      { label: 'W1', value: 268, value2: 272 },
      { label: 'W2', value: 274, value2: 275 },
      { label: 'W3', value: 279, value2: 276 },
      { label: 'W4', value: 284, value2: 278 },
    ],
    productivityVsCost: [
      { label: 'Eng', value: 82, value2: 98 },
      { label: 'Ops', value: 78, value2: 71 },
      { label: 'Field', value: 85, value2: 55 },
      { label: 'UX', value: 91, value2: 38 },
    ],
    profitability: [
      { label: 'Platform', value: 42 },
      { label: 'Field', value: 28 },
      { label: 'Brand', value: 35 },
      { label: 'Infra', value: 22 },
      { label: 'Support', value: 31 },
    ],
    costTrendWeekly: [
      { label: 'Mon', value: 52 },
      { label: 'Tue', value: 58 },
      { label: 'Wed', value: 61 },
      { label: 'Thu', value: 64 },
      { label: 'Fri', value: 49 },
    ],
  };
}

export const COST_VIEW_META: Record<CostAnalyticsView, { title: string; subtitle: string }> = {
  department: { title: 'Labor cost by department', subtitle: 'Weekly accrual · $000s' },
  project: { title: 'Labor cost by project', subtitle: 'Allocation-weighted spend' },
  overtime: { title: 'Overtime expenditure', subtitle: 'Hours · trend by week' },
  utilization: { title: 'Utilization efficiency', subtitle: 'Capacity used % by department' },
  forecast: { title: 'Payroll forecasting', subtitle: 'Actual vs projected ($000s)' },
  productivity: { title: 'Productivity vs cost', subtitle: 'Score vs labor index' },
  profitability: { title: 'Operational profitability', subtitle: 'Margin % by workstream' },
};
