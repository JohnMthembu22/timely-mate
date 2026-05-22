import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Grid,

} from '@mui/material';
import { Download, Filter, FileSpreadsheet, RefreshCcw, Shield } from 'lucide-react';
import { PayrollAuditIntelligence } from './PayrollAuditIntelligence';
import { AiPayrollIntelligencePanel } from './AiPayrollIntelligencePanel';
import { TimesheetLedgerTable } from './TimesheetLedgerTable';
import { SmartApprovalWorkflow } from './SmartApprovalWorkflow';
import { buildTimesheetsAuditBundle, type SmartLedgerFilter } from './timesheetsAuditMock';
import { buildPayrollIntelligenceBundle } from './payrollIntelligenceMock';
import { buildApprovalWorkflow } from './approvalWorkflowMock';
import { enrichLedgerGroups } from './ledgerEnrichment';
import { WorkforceCostAnalytics } from './WorkforceCostAnalytics';
import { MobileWorkforceOpsBar, type MobileWorkforceAction } from '../WorkforceOps/MobileWorkforceOpsBar';
import { wfGlowPulse, wfPageSx, wfPremiumSx } from '../WorkforceOps/workforceOpsStyles';
import type { LedgerFilterStatus, TimesheetLedgerEntry, TimesheetLedgerGroup } from './timesheetsTypes';

export type { LedgerFilterStatus, TimesheetLedgerEntry, TimesheetLedgerGroup };

export interface TimesheetsConsoleProps {
  groups: TimesheetLedgerGroup[];
  filterStatus: LedgerFilterStatus;
  onFilterStatusChange: (status: LedgerFilterStatus) => void;
  onExport: () => void;
  onEntryAction?: (entryId: string) => void;
  onCompileReport?: () => void;
  onSync?: () => void;
  payCycleLabel: string;
  approvedHours: string;
  pendingHours: string;
  emptyMessage?: string;
  onAuditNotify?: (title: string, message: string) => void;
}

function matchesSmartFilter(
  entry: TimesheetLedgerEntry,
  filter: SmartLedgerFilter
): boolean {
  if (filter === 'All') return true;
  if (filter === 'Approved') return entry.status === 'Approved';
  if (filter === 'Pending') return entry.status === 'Pending' || entry.status === 'Draft';
  if (filter === 'Anomalies') {
    return (
      entry.status === 'Draft' ||
      entry.status === 'Rejected' ||
      entry.description.toLowerCase().includes('retro')
    );
  }
  if (filter === 'Overtime') {
    const match = entry.duration.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) >= 8 : false;
  }
  if (filter === 'Compliance') {
    return entry.description.toLowerCase().includes('break') || entry.status === 'Pending';
  }
  return true;
}

const TimesheetsConsole: React.FC<TimesheetsConsoleProps> = ({
  groups,
  filterStatus,
  onFilterStatusChange,
  onExport,
  onEntryAction,
  onCompileReport,
  onSync,
  payCycleLabel,
  approvedHours,
  pendingHours,
  emptyMessage = 'No timesheet entries match your filters.',
  onAuditNotify,
}) => {
  const [smartFilter, setSmartFilter] = useState<SmartLedgerFilter>('All');
  const [mobileOfflineMode, setMobileOfflineMode] = useState(false);

  const auditBundle = useMemo(
    () => buildTimesheetsAuditBundle(approvedHours, pendingHours),
    [approvedHours, pendingHours]
  );

  const payrollBundle = useMemo(
    () => buildPayrollIntelligenceBundle(approvedHours, pendingHours),
    [approvedHours, pendingHours]
  );

  const allEnriched = useMemo(() => enrichLedgerGroups(groups), [groups]);

  const filteredEntries = useMemo(() => {
    return allEnriched.filter((e) => {
      const legacy =
        filterStatus === 'All' ||
        (filterStatus === 'Approved' && e.status === 'Approved') ||
        (filterStatus === 'Pending' && (e.status === 'Pending' || e.status === 'Draft'));
      return legacy && matchesSmartFilter(e, smartFilter);
    });
  }, [allEnriched, filterStatus, smartFilter]);

  const approvalBundle = useMemo(
    () =>
      buildApprovalWorkflow(
        allEnriched.map((e) => ({
          id: e.id,
          project: e.project,
          duration: e.duration,
          status: e.status,
        }))
      ),
    [allEnriched]
  );

  const handleMobileAction = (action: MobileWorkforceAction) => {
    const notify = (title: string, message: string) => onAuditNotify?.(title, message);
    const labels: Record<MobileWorkforceAction, [string, string]> = {
      offline: ['Offline capture', 'Timesheet entries saved locally until auto-sync.'],
      sync: ['Automatic sync', 'Syncing pending mobile entries to audit ledger.'],
      voice: ['Voice logging', 'Voice timesheet note recorded (pilot).'],
      approve: ['Mobile approval', 'Quick approval applied to selected queue item.'],
      field_capture: ['Field timesheet', 'Field hours captured with GPS proof placeholder.'],
      biometric: ['Biometric verify', 'Mobile verification attestation logged.'],
      whatsapp: ['WhatsApp approval', 'Approval request sent to manager thread.'],
      check_in: ['Quick check-in', 'Mobile attendance punch recorded.'],
    };
    const [t, m] = labels[action];
    notify(t, m);
  };

  const handleLegacyFilterClick = () => {
    const cycle: LedgerFilterStatus[] = ['All', 'Approved', 'Pending'];
    const idx = cycle.indexOf(filterStatus);
    onFilterStatusChange(cycle[(idx + 1) % cycle.length]);
  };

  return (
    <Box sx={wfPageSx}>
      <Box sx={{ maxWidth: 1600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 } }}>
        <PayrollAuditIntelligence bundle={auditBundle} />

        <AiPayrollIntelligencePanel bundle={payrollBundle} />

        <WorkforceCostAnalytics
          approvedHours={approvedHours}
          pendingHours={pendingHours}
          onExport={(format) => (format === 'csv' ? onExport() : onCompileReport?.())}
        />

        <SmartApprovalWorkflow bundle={approvalBundle} onNotify={onAuditNotify} />

        <Paper
          elevation={0}
          sx={{
            ...wfPremiumSx,
            ...wfGlowPulse,
            p: { xs: 1.25, sm: 1.5 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { md: 'center' },
            gap: 1.25,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
              Workforce audit console
            </Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', mt: 0.25 }}>
              Finance-ready ledger · inline approvals · AI anomaly detection
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.75} flexWrap="wrap">
            <Button
              variant="outlined"
              size="small"
              onClick={handleLegacyFilterClick}
              startIcon={<Filter size={14} />}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}
            >
              Status{filterStatus !== 'All' ? `: ${filterStatus}` : ''}
            </Button>
            <Button
              variant="contained"
              size="small"
              disableElevation
              onClick={onExport}
              startIcon={<Download size={14} />}
              sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#0f172a', borderRadius: 1.5 }}
            >
              Export audit
            </Button>
          </Stack>
        </Paper>

        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} lg={9}>
            <TimesheetLedgerTable
              entries={filteredEntries}
              smartFilter={smartFilter}
              onSmartFilterChange={setSmartFilter}
              onEntryAction={onEntryAction}
              emptyMessage={emptyMessage}
            />
          </Grid>

          <Grid item xs={12} lg={3}>
            <Stack spacing={2}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #e8edf4', bgcolor: '#fff' }}>
                <Typography sx={{ fontSize: '0.5625rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em' }}>
                  PAYROLL LIFECYCLE
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                  Approval period
                </Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>{payCycleLabel}</Typography>

                <Stack spacing={1} sx={{ mt: 1.5 }}>
                  <Box sx={{ p: 1.15, borderRadius: 2, bgcolor: '#f0fdf4', border: '1px solid #d1fae5' }}>
                    <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>Approved</Typography>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#059669' }}>{approvedHours}</Typography>
                  </Box>
                  <Box sx={{ p: 1.15, borderRadius: 2, bgcolor: '#fffbeb', border: '1px solid #fde68a' }}>
                    <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>Pending audit</Typography>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#d97706' }}>{pendingHours}</Typography>
                  </Box>
                </Stack>

                <Stack spacing={1} sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    disableElevation
                    onClick={onCompileReport}
                    startIcon={<FileSpreadsheet size={14} />}
                    sx={{ textTransform: 'none', fontWeight: 800, bgcolor: '#0f172a', borderRadius: 1.5 }}
                  >
                    Compile cycle report
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={onSync}
                    startIcon={<RefreshCcw size={14} />}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}
                  >
                    Sync remote repos
                  </Button>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: '1px solid #c7d2fe', bgcolor: '#f5f3ff' }}>
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
                  <Shield size={16} color="#4f46e5" />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#4338ca' }}>
                    Compliance tracking
                  </Typography>
                </Stack>
                <Typography sx={{ fontSize: '0.6875rem', color: '#475569', lineHeight: 1.45 }}>
                  Score {auditBundle.complianceScore}% · {payrollBundle.insights.filter((i) => i.severity === 'critical').length}{' '}
                  critical payroll signals.
                </Typography>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <MobileWorkforceOpsBar
        variant="timesheets"
        offlineMode={mobileOfflineMode}
        onToggleOffline={() => setMobileOfflineMode((prev) => !prev)}
        onAction={handleMobileAction}
      />
    </Box>
  );
};

export default TimesheetsConsole;
