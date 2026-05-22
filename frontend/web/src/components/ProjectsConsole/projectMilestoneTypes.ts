export type MilestoneProgressStatus =
  | 'completed'
  | 'in_progress'
  | 'upcoming'
  | 'blocked'
  | 'overdue';

export type MilestoneRiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** @deprecated Use progressStatus — kept for click handlers */
export type MilestoneLegacyState = 'at-risk' | 'normal';

export interface OperationalMilestone {
  id: string;
  projectId: string;
  title: string;
  date: string;
  dateIso: string;
  /** Legacy flag used by parent navigation */
  state: MilestoneLegacyState;
  progress: number;
  projectColor: string;
  projectName: string;
  progressStatus: MilestoneProgressStatus;
  riskLevel: MilestoneRiskLevel;
  dependencyWarning?: string;
  dependencies: string[];
  completionForecast: string;
  owner: { name: string; initials: string; role: string };
  daysRemaining: number;
  isOverdue: boolean;
  countdownLabel: string;
  timelinePosition: number;
  detail: string;
  blockers: string[];
}

export type ProjectMilestone = OperationalMilestone;
