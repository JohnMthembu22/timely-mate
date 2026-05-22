import type { TimesheetLedgerEntry, TimesheetLedgerGroup } from './timesheetsTypes';

export type AuditStatus = 'cleared' | 'review' | 'flagged';
export type TimeState = 'standard' | 'overtime' | 'underreported' | 'duplicate';

export interface EnrichedLedgerEntry extends TimesheetLedgerEntry {
  employeeName: string;
  employeeInitials: string;
  employeeColor: string;
  department: string;
  projectLabel: string;
  auditStatus: AuditStatus;
  hasAnomaly: boolean;
  anomalyReason?: string;
  timeState: TimeState;
  hoursNumeric: number;
  groupDate: string;
}

const NAMES = [
  'Alex Rivera',
  'Jordan Kim',
  'Sam Patel',
  'Taylor Brooks',
  'Morgan Lee',
  'Casey Nguyen',
];
const DEPTS = ['Engineering', 'Operations', 'UI/UX', 'Field', 'Creative', 'Platform'];
const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * (i + 1)) % 997;
  return h;
}

export function parseHours(duration: string): number {
  const match = duration.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

export function enrichLedgerGroups(groups: TimesheetLedgerGroup[]): EnrichedLedgerEntry[] {
  const flat: EnrichedLedgerEntry[] = [];

  groups.forEach((group) => {
    group.entries.forEach((entry, idx) => {
      const h = hashId(entry.id) + idx;
      const name = NAMES[h % NAMES.length];
      const parts = name.split(' ');
      const hoursNumeric = parseHours(entry.duration);
      const hasDuplicate = h % 11 === 0;
      const hasRetro = entry.description.toLowerCase().includes('retro');
      const isOt = hoursNumeric >= 8;
      const isUnder = hoursNumeric > 0 && hoursNumeric < 2 && h % 7 === 0;

      let timeState: TimeState = 'standard';
      if (hasDuplicate) timeState = 'duplicate';
      else if (isUnder) timeState = 'underreported';
      else if (isOt) timeState = 'overtime';

      const hasAnomaly =
        hasDuplicate ||
        hasRetro ||
        entry.status === 'Rejected' ||
        entry.status === 'Draft' ||
        isOt;

      let auditStatus: AuditStatus = 'cleared';
      if (entry.status === 'Pending') auditStatus = 'review';
      if (hasAnomaly && (hasDuplicate || entry.status === 'Rejected')) auditStatus = 'flagged';

      flat.push({
        ...entry,
        employeeName: name,
        employeeInitials: `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase(),
        employeeColor: COLORS[h % COLORS.length],
        department: DEPTS[h % DEPTS.length],
        projectLabel: entry.project.split(' ')[0] ?? entry.project,
        auditStatus,
        hasAnomaly,
        anomalyReason: hasDuplicate
          ? 'Overlapping punch window'
          : hasRetro
            ? 'Retroactive edit'
            : isOt
              ? 'Overtime threshold'
              : undefined,
        timeState,
        hoursNumeric,
        groupDate: group.date,
      });
    });
  });

  return flat;
}
