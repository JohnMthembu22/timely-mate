import type { TeamActivityEvent } from './teamActivityTypes';

const DEPTS = ['Engineering', 'UI/UX', 'Operations', 'Field', 'Creative', 'Platform'];
const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

function minsAgo(m: number) {
  return new Date(Date.now() - m * 60000).toISOString();
}

export function buildTeamActivityFeed(employeeNames: string[] = []): TeamActivityEvent[] {
  const names = employeeNames.length >= 6 ? employeeNames.slice(0, 8) : [
    'Alex Rivera',
    'Jordan Kim',
    'Sam Patel',
    'Taylor Brooks',
    'Morgan Lee',
    'Casey Nguyen',
    'Riley Chen',
    'Jamie Ortiz',
  ];

  const pick = (i: number) => {
    const raw = names[i % names.length];
    const name = typeof raw === 'string' && raw.trim() ? raw.trim() : 'Team member';
    const parts = name.split(/\s+/).filter(Boolean);
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : (parts[0]?.slice(0, 2).toUpperCase() ?? 'TM');
    return {
      actorName: name,
      actorInitials: initials,
      actorColor: COLORS[i % COLORS.length],
      department: DEPTS[i % DEPTS.length],
    };
  };

  return [
    {
      id: 'ta-1',
      category: 'check_in',
      ...pick(0),
      message: 'Checked in via QR office scan',
      detail: 'Biometric confidence 98%',
      timestamp: minsAgo(2),
      isLive: true,
    },
    {
      id: 'ta-2',
      category: 'project_switch',
      ...pick(1),
      message: 'Switched project to Platform Sprint',
      detail: 'From Infrastructure patch queue',
      timestamp: minsAgo(5),
      isLive: true,
    },
    {
      id: 'ta-3',
      category: 'overtime_alert',
      ...pick(2),
      message: 'Overtime threshold warning triggered',
      detail: 'Projected +2.8h this pay cycle',
      timestamp: minsAgo(8),
    },
    {
      id: 'ta-4',
      category: 'task_complete',
      ...pick(3),
      message: 'Completed task: API gateway hardening',
      detail: 'Submitted for line manager review',
      timestamp: minsAgo(14),
    },
    {
      id: 'ta-5',
      category: 'milestone',
      ...pick(4),
      message: 'Productivity milestone — 90% weekly target',
      detail: 'Engineering squad average',
      timestamp: minsAgo(22),
    },
    {
      id: 'ta-6',
      category: 'break',
      ...pick(5),
      message: 'Started mandatory recovery break',
      detail: '15 min · heat-stress protocol',
      timestamp: minsAgo(28),
    },
    {
      id: 'ta-7',
      category: 'approval',
      ...pick(6),
      message: 'Timesheet approval submitted',
      detail: '42.5h · Platform + Field mix',
      timestamp: minsAgo(35),
    },
    {
      id: 'ta-8',
      category: 'shift_change',
      ...pick(7),
      message: 'Shift extended to close-out window',
      detail: 'Supervisor authorized +1h',
      timestamp: minsAgo(48),
    },
    {
      id: 'ta-9',
      category: 'remote_check_in',
      ...pick(0),
      message: 'Remote check-in verified (geofence)',
      detail: 'Hybrid pod · accuracy 96.8%',
      timestamp: minsAgo(55),
    },
    {
      id: 'ta-10',
      category: 'check_in',
      ...pick(1),
      message: 'Voice check-in confirmed',
      timestamp: minsAgo(72),
    },
  ];
}

export const ACTIVITY_CATEGORY_META: Record<
  TeamActivityEvent['category'],
  { label: string; color: string }
> = {
  check_in: { label: 'Check-in', color: '#10b981' },
  project_switch: { label: 'Project', color: '#6366f1' },
  overtime_alert: { label: 'OT alert', color: '#f59e0b' },
  task_complete: { label: 'Complete', color: '#0ea5e9' },
  milestone: { label: 'Milestone', color: '#8b5cf6' },
  break: { label: 'Break', color: '#94a3b8' },
  approval: { label: 'Approval', color: '#14b8a6' },
  shift_change: { label: 'Shift', color: '#64748b' },
  remote_check_in: { label: 'Remote', color: '#06b6d4' },
};
