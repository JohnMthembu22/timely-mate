export type ProductivityInsightCategory =
  | 'productivity'
  | 'workload'
  | 'fatigue'
  | 'efficiency'
  | 'overtime'
  | 'workflow'
  | 'attendance'
  | 'focus';

export type ProductivityInsightSeverity = 'info' | 'warning' | 'critical';

export interface ProductivityInsightAction {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary';
}

export interface AiProductivityInsight {
  id: string;
  headline: string;
  detail: string;
  recommendation: string;
  category: ProductivityInsightCategory;
  severity: ProductivityInsightSeverity;
  metric?: string;
  teamOrProject?: string;
  actions: ProductivityInsightAction[];
}

export interface AiProductivityInsightsBundle {
  insights: AiProductivityInsight[];
  efficiencyDelta: number;
  criticalCount: number;
  warningCount: number;
}
