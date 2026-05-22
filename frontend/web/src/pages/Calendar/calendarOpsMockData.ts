import { addDays, format } from 'date-fns';
import type { OpsRiskLevel, OpsTimelineCategory } from './calendarOpsTypes';

export interface OpsCalendarEventSeed {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  opsCategory: OpsTimelineCategory;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  riskLevel?: OpsRiskLevel;
  projectId?: string;
  location?: string;
}

/** Deterministic operational events for the timeline runway. */
export function buildOperationalMockEvents(anchor = new Date()): OpsCalendarEventSeed[] {
  const d = (offset: number, hour = 9) => {
    const day = addDays(anchor, offset);
    const h = String(hour).padStart(2, '0');
    const start = `${format(day, 'yyyy-MM-dd')}T${h}:00`;
    const end = `${format(day, 'yyyy-MM-dd')}T${String(hour + 1).padStart(2, '0')}:00`;
    return { start, end, day };
  };

  const m1 = d(2, 10);
  const m2 = d(7, 14);
  const m3 = d(14, 11);
  const m4 = d(-3, 9);
  const m5 = d(5, 16);
  const m6 = d(10, 8);
  const m7 = d(12, 15);

  return [
    {
      id: 'ops-milestone-1',
      title: 'Phase 2 go-live',
      description: 'Production milestone — client sign-off required',
      startDate: m1.start,
      endDate: m1.end,
      opsCategory: 'milestone',
      priority: 'high',
      status: 'in_progress',
      projectId: 'proj-alpha',
    },
    {
      id: 'ops-deadline-1',
      title: 'Sprint deliverables due',
      description: 'All open tasks must reach QA-ready state',
      startDate: m2.start,
      endDate: m2.end,
      opsCategory: 'deadline',
      priority: 'high',
      status: 'todo',
      riskLevel: 'medium',
    },
    {
      id: 'ops-shift-1',
      title: 'Field crew — morning shift',
      description: '6 technicians on-site · Site B',
      startDate: m3.start,
      endDate: `${format(addDays(anchor, 14), 'yyyy-MM-dd')}T17:00`,
      opsCategory: 'shift',
      priority: 'medium',
      status: 'in_progress',
      location: 'Site B',
    },
    {
      id: 'ops-approval-1',
      title: 'Budget reforecast approval',
      description: 'CFO + ops lead sign-off window',
      startDate: m4.start,
      endDate: m4.end,
      opsCategory: 'approval',
      priority: 'high',
      status: 'todo',
    },
    {
      id: 'ops-risk-1',
      title: 'Supply chain delay risk',
      description: 'Vendor SLA breach may slip milestone by 3 days',
      startDate: m5.start,
      endDate: m5.end,
      opsCategory: 'risk',
      priority: 'high',
      status: 'in_progress',
      riskLevel: 'high',
      projectId: 'proj-beta',
    },
    {
      id: 'ops-shift-2',
      title: 'Night coverage roster',
      description: 'Extended hours for launch week',
      startDate: m6.start,
      endDate: `${format(addDays(anchor, 10), 'yyyy-MM-dd')}T22:00`,
      opsCategory: 'shift',
      priority: 'medium',
      status: 'todo',
    },
    {
      id: 'ops-approval-2',
      title: 'Change request CR-1042',
      description: 'Scope adjustment for signage install',
      startDate: m7.start,
      endDate: m7.end,
      opsCategory: 'approval',
      priority: 'medium',
      status: 'todo',
    },
  ];
}
