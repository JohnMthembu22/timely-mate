/** Operational insight categories — mock / future AI pipeline */
export type AiInsightCategory =
  | 'delayed_project'
  | 'productivity'
  | 'budget_risk'
  | 'attendance'
  | 'overtime'
  | 'forecast';

export type AiInsightPriority = 'critical' | 'high' | 'medium' | 'low';

export type AiInsightTrend = 'up' | 'down' | 'stable';

export interface AiOperationalInsight {
  id: string;
  category: AiInsightCategory;
  title: string;
  recommendation: string;
  priority: AiInsightPriority;
  /** Optional KPI string shown beside the card (e.g. "+8%", "3 days") */
  metric?: string;
  metricLabel?: string;
  trend?: AiInsightTrend;
  /** 0–100 mock confidence score */
  confidence: number;
  /** Relative time label for display */
  generatedAt: string;
  /** Optional CTA label — not wired to routes yet */
  actionLabel?: string;
}

export interface AiInsightsPanelProps {
  /** When omitted or empty, mock recommendations are shown (no live AI). */
  insights?: AiOperationalInsight[];
  /** Force mock dataset even if `insights` is passed (dev/demo). */
  useMockData?: boolean;
  title?: string;
  subtitle?: string;
  maxVisible?: number;
  onInsightClick?: (insight: AiOperationalInsight) => void;
  /** Compact layout for sidebars or embedded widgets */
  compact?: boolean;
}
