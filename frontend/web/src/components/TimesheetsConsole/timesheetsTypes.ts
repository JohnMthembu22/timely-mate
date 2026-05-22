export type LedgerFilterStatus = 'All' | 'Approved' | 'Pending';

export interface TimesheetLedgerEntry {
  id: string;
  code: string;
  project: string;
  description: string;
  duration: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Draft';
}

export interface TimesheetLedgerGroup {
  date: string;
  totalHours: string;
  entries: TimesheetLedgerEntry[];
}
