export type ProjectPriority = 'High' | 'Medium' | 'Low';

export type AiRiskLevel = 'low' | 'moderate' | 'elevated' | 'critical';

export type TaskTrend = 'up' | 'down' | 'flat';

export interface ProjectTeamMember {
  initials: string;
  name?: string;
  avatar?: string;
}

export interface ProjectHubRow {
  id: string;
  name: string;
  desc: string;
  progress: number;
  tasks: string;
  priority: ProjectPriority;
  team: string[];
  teamMembers: ProjectTeamMember[];
  dueLabel: string;
  color: string;
  healthScore: number;
  aiRisk: AiRiskLevel;
  aiRiskLabel: string;
  teamWorkload: number;
  budgetUsage: number;
  completionPrediction: string;
  taskTrend: TaskTrend;
  taskTrendLabel: string;
  trendSeries: number[];
  activeBlockers: number;
  overdueTasks: number;
  department: string;
}
