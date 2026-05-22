export type TeamActivityCategory =
  | 'check_in'
  | 'project_switch'
  | 'overtime_alert'
  | 'task_complete'
  | 'milestone'
  | 'break'
  | 'approval'
  | 'shift_change'
  | 'remote_check_in';

export interface TeamActivityEvent {
  id: string;
  category: TeamActivityCategory;
  actorName: string;
  actorInitials: string;
  actorColor: string;
  department: string;
  message: string;
  detail?: string;
  timestamp: string;
  isLive?: boolean;
}
