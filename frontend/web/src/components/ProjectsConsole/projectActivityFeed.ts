import { format, parseISO, differenceInMinutes } from 'date-fns';

export type ActivityFeedKind =
  | 'assignment'
  | 'milestone'
  | 'overdue'
  | 'approval'
  | 'project_update'
  | 'comment'
  | 'risk'
  | 'allocation';

export interface OperationsFeedItem {
  id: string;
  kind: ActivityFeedKind;
  actor: string;
  actorAvatar?: string;
  message: string;
  highlight?: string;
  projectName: string;
  projectId: string;
  department: string;
  timestamp: Date;
  isLive?: boolean;
}

interface FeedProject {
  id: string;
  name: string;
  team: { name: string; avatar?: string; role: string }[];
  notes: { author: string; content: string; avatar?: string }[];
  projectTasks: {
    id: string;
    title: string;
    assignee: { name: string } | null;
    status: string;
    dueDate: string;
    priority: string;
  }[];
  endDate: string;
  progress: number;
}

const DEPT_MAP: Record<string, string> = {
  Platform: 'Engineering',
  UI: 'Design',
  Financial: 'Finance',
  Legal: 'Legal',
  Operation: 'Operations',
  Brand: 'Marketing',
  Process: 'Operations',
};

function inferDepartment(projectName: string): string {
  for (const [key, dept] of Object.entries(DEPT_MAP)) {
    if (projectName.includes(key)) return dept;
  }
  return 'Operations';
}

export function buildOperationsFeed(projects: FeedProject[]): OperationsFeedItem[] {
  const items: OperationsFeedItem[] = [];
  const now = new Date();

  projects.forEach((p, pi) => {
    const dept = inferDepartment(p.name);
    p.projectTasks.forEach((t, ti) => {
      if (t.status === 'pending_review') {
        items.push({
          id: `feed-rev-${p.id}-${t.id}`,
          kind: 'approval',
          actor: t.assignee?.name ?? 'Team member',
          message: 'submitted for review',
          highlight: t.title,
          projectName: p.name,
          projectId: p.id,
          department: dept,
          timestamp: new Date(now.getTime() - (pi * 12 + ti) * 60000 * 4),
        });
      }
      const today = now.toISOString().split('T')[0];
      if (t.dueDate < today && t.status !== 'completed') {
        items.push({
          id: `feed-od-${p.id}-${t.id}`,
          kind: 'overdue',
          actor: 'Deadline monitor',
          message: 'overdue warning for',
          highlight: t.title,
          projectName: p.name,
          projectId: p.id,
          department: dept,
          timestamp: new Date(now.getTime() - (pi * 8 + ti) * 60000 * 6),
          isLive: true,
        });
      }
      if (!t.assignee && t.status !== 'completed') {
        items.push({
          id: `feed-asn-${p.id}-${t.id}`,
          kind: 'assignment',
          actor: 'Assignment queue',
          message: 'needs owner for',
          highlight: t.title,
          projectName: p.name,
          projectId: p.id,
          department: dept,
          timestamp: new Date(now.getTime() - (pi * 5 + ti) * 60000 * 3),
        });
      }
    });

    if (p.progress >= 100 || p.progress >= 85) {
      items.push({
        id: `feed-ms-${p.id}`,
        kind: 'milestone',
        actor: 'Milestone tracker',
        message: 'checkpoint reached on',
        highlight: `${p.name} delivery`,
        projectName: p.name,
        projectId: p.id,
        department: dept,
        timestamp: new Date(now.getTime() - pi * 60000 * 45),
      });
    }

    p.notes.slice(0, 1).forEach((n) => {
      items.push({
        id: `feed-cmt-${p.id}`,
        kind: 'comment',
        actor: n.author,
        message: 'commented',
        highlight: n.content.slice(0, 60) + (n.content.length > 60 ? '…' : ''),
        projectName: p.name,
        projectId: p.id,
        department: dept,
        timestamp: new Date(now.getTime() - pi * 60000 * 90),
      });
    });
  });

  return items
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 20);
}

export function formatFeedTime(date: Date): string {
  const mins = differenceInMinutes(new Date(), date);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return format(date, 'MMM d · h:mm a');
}

export function feedKindMeta(kind: ActivityFeedKind): {
  color: string;
  bg: string;
  label: string;
} {
  const map: Record<ActivityFeedKind, { color: string; bg: string; label: string }> = {
    assignment: { color: '#2563eb', bg: 'rgba(37,99,235,0.1)', label: 'Assignment' },
    milestone: { color: '#059669', bg: 'rgba(5,150,105,0.1)', label: 'Milestone' },
    overdue: { color: '#dc2626', bg: 'rgba(220,38,38,0.1)', label: 'Overdue' },
    approval: { color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', label: 'Approval' },
    project_update: { color: '#0891b2', bg: 'rgba(8,145,178,0.1)', label: 'Update' },
    comment: { color: '#475569', bg: 'rgba(71,85,105,0.1)', label: 'Comment' },
    risk: { color: '#ea580c', bg: 'rgba(234,88,12,0.1)', label: 'Risk' },
    allocation: { color: '#4f46e5', bg: 'rgba(79,70,229,0.1)', label: 'Allocation' },
  };
  return map[kind];
}

/** Rotate a live event for mock real-time feel */
export function pulseFeedItem(items: OperationsFeedItem[]): OperationsFeedItem[] {
  if (items.length === 0) return items;
  const clone = [...items];
  const liveIdx = Math.floor(Date.now() / 8000) % Math.min(clone.length, 6);
  return clone.map((item, i) => ({
    ...item,
    isLive: i === liveIdx,
    timestamp: i === liveIdx ? new Date() : item.timestamp,
  }));
}
