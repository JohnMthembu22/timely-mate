export interface ProjectTag {
  id: string;
  name: string;
  color: string;
}

export type TaskStatus = {
  id: string;
  name: string;
  progress: number;
  status: 'notStarted' | 'inProgress' | 'paused' | 'completed';
};

export interface ARPreview {
  modelUrl: string;
  overlayData: {
    tasks: TaskStatus[];
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tags: ProjectTag[];
  arPreview?: ARPreview;
}
