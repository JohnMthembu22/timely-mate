/** Shared project scoring for cards and health overview (mock until live analytics). */

export type ProjectDisplayStatus = 'on-track' | 'at-risk' | 'critical' | 'completed';

export type BudgetHealth = 'healthy' | 'warning' | 'critical';

export interface ProjectEnrichedMetrics {
  status: ProjectDisplayStatus;
  riskScore: number;
  budgetHealth: BudgetHealth;
  budgetUsedPercent: number;
  budgetLabel: string;
  aiRecommendation: string;
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % 997;
  return h;
}

export function deriveStatusFromProgress(progress: number): ProjectDisplayStatus {
  const p = Math.min(100, Math.max(0, progress));
  if (p >= 100) return 'completed';
  if (p < 35) return 'critical';
  if (p < 65) return 'at-risk';
  return 'on-track';
}

export function deriveProjectMetrics(
  id: string,
  progress: number,
  teamSize: number
): ProjectEnrichedMetrics {
  const status = deriveStatusFromProgress(progress);
  const h = hashId(id);
  const budgetUsedPercent = Math.min(98, Math.max(32, 45 + (h % 40) + Math.floor((100 - progress) / 5)));
  let budgetHealth: BudgetHealth = 'healthy';
  if (budgetUsedPercent >= 88) budgetHealth = 'critical';
  else if (budgetUsedPercent >= 72) budgetHealth = 'warning';

  const riskScore = Math.min(
    100,
    Math.max(
      5,
      Math.round((100 - progress) * 0.55 + (budgetUsedPercent > 80 ? 18 : 0) + (teamSize < 2 ? 12 : 0) + (h % 15))
    )
  );

  const aiRecommendation = pickAiRecommendation(status, progress, budgetUsedPercent, teamSize);

  return {
    status,
    riskScore,
    budgetHealth,
    budgetUsedPercent,
    budgetLabel: `${budgetUsedPercent}% budget used`,
    aiRecommendation,
  };
}

function pickAiRecommendation(
  status: ProjectDisplayStatus,
  progress: number,
  budgetUsed: number,
  teamSize: number
): string {
  if (status === 'completed') {
    return 'Project complete — archive deliverables and run a retrospective within 5 business days.';
  }
  if (status === 'critical') {
    if (budgetUsed >= 85) {
      return 'Critical path and budget pressure — freeze scope additions and schedule a steering review.';
    }
    return 'Delivery confidence is low — assign a single owner and rebaseline the next milestone.';
  }
  if (status === 'at-risk') {
    if (teamSize < 3) {
      return 'Capacity risk detected — add one contributor or extend the due date by one sprint.';
    }
    return 'Trending behind plan — confirm blockers in stand-up and escalate dependencies today.';
  }
  if (budgetUsed >= 80) {
    return 'Spend velocity is high — validate remaining POs before month-end close.';
  }
  if (progress >= 75) {
    return 'Strong momentum — prepare UAT entry criteria and stakeholder sign-off checklist.';
  }
  return 'On track — maintain current squad allocation and weekly health checks.';
}

export const STATUS_LABELS: Record<ProjectDisplayStatus, string> = {
  'on-track': 'On track',
  'at-risk': 'At risk',
  critical: 'Critical',
  completed: 'Completed',
};

export const STATUS_COLORS: Record<ProjectDisplayStatus, string> = {
  'on-track': '#34d399',
  'at-risk': '#fbbf24',
  critical: '#f87171',
  completed: '#38bdf8',
};

export const BUDGET_COLORS: Record<BudgetHealth, string> = {
  healthy: '#34d399',
  warning: '#fbbf24',
  critical: '#f87171',
};
