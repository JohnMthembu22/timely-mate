export interface TimeTrackingJobRow {
  id: string;
  name: string;
  team: string;
  progress: number;
  timeSpent: string;
  isRunning: boolean;
  trackingStartedAt?: string | null;
  trackingBaseMs?: number;
  status?: string;
  /** Display names of people assigned to this job */
  assignedMembers?: string[];
}

export type AssignmentQuickAction = 'pause' | 'voice' | 'proof' | 'assist';
