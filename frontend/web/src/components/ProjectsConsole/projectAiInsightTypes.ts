export type InsightSeverity = 'critical' | 'high' | 'warning' | 'opportunity' | 'info';

export type InsightCategory =
  | 'delay_prediction'
  | 'workload_imbalance'
  | 'overdue_tasks'
  | 'productivity'
  | 'bottleneck'
  | 'high_risk'
  | 'budget_overrun'
  | 'resource_allocation';

export interface InsightAction {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary';
}

export interface ProjectAiInsight {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  /** 1 = low, 4 = critical */
  severityLevel: 1 | 2 | 3 | 4;
  title: string;
  headline: string;
  summary: string;
  detail?: string;
  metric?: string;
  confidence?: number;
  projectId?: string;
  projectName?: string;
  team?: string;
  detectedAt?: string;
  actions: InsightAction[];
}

export const INSIGHT_CATEGORY_LABELS: Record<InsightCategory, string> = {
  delay_prediction: 'Delay prediction',
  workload_imbalance: 'Workload',
  overdue_tasks: 'Overdue',
  productivity: 'Productivity',
  bottleneck: 'Bottleneck',
  high_risk: 'High risk',
  budget_overrun: 'Budget',
  resource_allocation: 'Resources',
};
