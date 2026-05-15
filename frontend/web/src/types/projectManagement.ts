import { User } from './auth';

export type TaskStatus = 'not_started' | 'in_progress' | 'paused' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ProjectTag {
  id: string;
  colorCode: string;
  name: string;
  projectId: string;
}

export interface TaskTimeline {
  startTime: string;
  endTime: string;
  duration: number;
  pausedAt?: string;
  resumedAt?: string;
  totalPausedTime: number;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: User[];
  createdBy: User;
  timeline: TaskTimeline;
  tags: string[];
  arData?: {
    modelUrl: string;
    position: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  };
}

export interface Meeting {
  id: string;
  projectId: string;
  title: string;
  startTime: string;
  endTime: string;
  attendees: User[];
  organizer: User;
  videoCallUrl?: string;
  recordingUrl?: string;
  whiteboard?: {
    id: string;
    snapshotUrl: string;
  };
}

export interface AITaskSuggestion {
  taskId: string;
  suggestedAssignees: Array<{
    user: User;
    confidenceScore: number;
    reasonCodes: string[];
  }>;
  workloadImpact: {
    currentWorkload: number;
    projectedWorkload: number;
  };
  expertiseMatch: {
    requiredSkills: string[];
    matchScore: number;
  };
}
