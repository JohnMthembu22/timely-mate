import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Calendar,
  Download,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  RefreshCcw,
} from 'lucide-react';

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
}

const statusStyles: Record<
  TimesheetLedgerEntry['status'],
  { bg: string; color: string; border: string }
> = {
  Approved: { bg: 'rgba(16, 185, 129, 0.08)', color: '#059669', border: 'rgba(16, 185, 129, 0.2)' },
  Pending: { bg: 'rgba(245, 158, 11, 0.08)', color: '#d97706', border: 'rgba(245, 158, 11, 0.2)' },
  Rejected: { bg: 'rgba(239, 68, 68, 0.08)', color: '#dc2626', border: 'rgba(239, 68, 68, 0.2)' },
  Draft: { bg: 'rgba(148, 163, 184, 0.12)', color: '#64748b', border: 'rgba(148, 163, 184, 0.25)' },
};

const FILTER_CYCLE: LedgerFilterStatus[] = ['All', 'Approved', 'Pending'];

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
}) => {
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [menuEntryId, setMenuEntryId] = React.useState<string | null>(null);

  const handleFilterClick = () => {
    const idx = FILTER_CYCLE.indexOf(filterStatus);
    onFilterStatusChange(FILTER_CYCLE[(idx + 1) % FILTER_CYCLE.length]);
  };

  const openRowMenu = (event: React.MouseEvent<HTMLElement>, entryId: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuEntryId(entryId);
  };

  const closeRowMenu = () => {
    setMenuAnchor(null);
    setMenuEntryId(null);
  };

  const handleMenuEdit = () => {
    if (menuEntryId && onEntryAction) {
      onEntryAction(menuEntryId);
    }
    closeRowMenu();
  };

  return (
    <Box sx={{ bgcolor: 'rgba(248, 250, 252, 0.3)', py: 3, px: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: 1600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid #f1f5f9',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { md: 'center' },
            gap: 2,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', letterSpacing: '-0.02em' }}>
              Timesheet Log Ledger
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.25 }}>
              Review, audit, and filter historical time allocations across engineering and branding workflows.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.25} sx={{ alignSelf: { xs: 'stretch', md: 'auto' } }}>
            <Button
              variant="outlined"
              onClick={handleFilterClick}
              startIcon={<Filter size={14} />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.75rem',
                borderRadius: 2,
                borderColor: '#e2e8f0',
                color: '#334155',
                bgcolor: '#fff',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
                '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
              }}
            >
              Filter{filterStatus !== 'All' ? `: ${filterStatus}` : ''}
            </Button>
            <Button
              variant="contained"
              disableElevation
              onClick={onExport}
              startIcon={<Download size={14} />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.75rem',
                borderRadius: 2,
                bgcolor: '#0f172a',
                '&:hover': { bgcolor: '#1e293b' },
              }}
            >
              Export Ledger
            </Button>
          </Stack>
        </Paper>

        <Grid container spacing={3} alignItems="flex-start">
          {/* Main ledger */}
          <Grid item xs={12} lg={9}>
            <Stack spacing={3}>
              {groups.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    borderRadius: 3,
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <Typography sx={{ fontSize: '0.875rem', color: '#64748b' }}>{emptyMessage}</Typography>
                </Paper>
              ) : (
                groups.map((group, groupIdx) => (
                  <Paper
                    key={groupIdx}
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: '1px solid #f1f5f9',
                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: 'rgba(248, 250, 252, 0.7)',
                        px: 2.5,
                        py: 1.5,
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Calendar size={16} color="#94a3b8" />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', letterSpacing: '-0.01em' }}>
                          {group.date}
                        </Typography>
                      </Box>
                      <Typography
                        component="span"
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#64748b',
                          bgcolor: '#fff',
                          border: '1px solid rgba(226, 232, 240, 0.6)',
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                        }}
                      >
                        Total:{' '}
                        <Box component="strong" sx={{ color: '#1e293b', fontWeight: 700 }}>
                          {group.totalHours}
                        </Box>
                      </Typography>
                    </Box>

                    <TableContainer>
                      <Table size="small" sx={{ minWidth: 640 }}>
                        <TableHead>
                          <TableRow
                            sx={{
                              bgcolor: '#fff',
                              borderBottom: '1px solid #f1f5f9',
                              '& th': {
                                fontSize: '0.625rem',
                                fontWeight: 700,
                                color: '#94a3b8',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                py: 1.5,
                                borderBottom: '1px solid #f1f5f9',
                              },
                            }}
                          >
                            <TableCell sx={{ pl: 2.5, width: 96 }}>Task Code</TableCell>
                            <TableCell>Project Context</TableCell>
                            <TableCell>Activity Description</TableCell>
                            <TableCell align="center" sx={{ width: 96 }}>Duration</TableCell>
                            <TableCell align="center" sx={{ width: 112 }}>Status</TableCell>
                            <TableCell align="center" sx={{ width: 48, pr: 2 }} />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {group.entries.map((entry) => {
                            const pill = statusStyles[entry.status];
                            return (
                              <TableRow
                                key={entry.id}
                                hover
                                sx={{
                                  '& td': {
                                    fontSize: '0.75rem',
                                    py: 1.75,
                                    borderBottom: '1px solid #f8fafc',
                                  },
                                  '&:hover': { bgcolor: 'rgba(248, 250, 252, 0.5)' },
                                  '&:hover .row-action': { opacity: 1 },
                                }}
                              >
                                <TableCell
                                  sx={{
                                    pl: 2.5,
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    color: '#64748b',
                                  }}
                                >
                                  {entry.code}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    fontWeight: 600,
                                    color: '#1e293b',
                                    maxWidth: 140,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {entry.project}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: '#64748b',
                                    fontWeight: 500,
                                    maxWidth: 280,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {entry.description}
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, color: '#334155' }}>
                                  {entry.duration}
                                </TableCell>
                                <TableCell align="center">
                                  <Box
                                    component="span"
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                      px: 1,
                                      py: 0.25,
                                      fontSize: '0.625rem',
                                      fontWeight: 700,
                                      borderRadius: 0.5,
                                      border: '1px solid',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.04em',
                                      bgcolor: pill.bg,
                                      color: pill.color,
                                      borderColor: pill.border,
                                    }}
                                  >
                                    {entry.status === 'Approved' ? (
                                      <CheckCircle2 size={10} />
                                    ) : (
                                      <Clock size={10} />
                                    )}
                                    {entry.status}
                                  </Box>
                                </TableCell>
                                <TableCell align="center" sx={{ pr: 2 }}>
                                  {onEntryAction && (
                                    <IconButton
                                      size="small"
                                      className="row-action"
                                      onClick={(e) => openRowMenu(e, entry.id)}
                                      sx={{
                                        opacity: 0,
                                        color: '#94a3b8',
                                        transition: 'opacity 120ms ease',
                                        '&:hover': { color: '#475569' },
                                      }}
                                    >
                                      <MoreVertical size={14} />
                                    </IconButton>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                ))
              )}
            </Stack>
          </Grid>

          {/* Payroll sidebar */}
          <Grid item xs={12} lg={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid #f1f5f9',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.5625rem',
                      fontWeight: 700,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Payroll Lifecycle
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', mt: 0.25 }}>
                    Current Approval Period
                  </Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{payCycleLabel}</Typography>
                </Box>

                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.25,
                      bgcolor: 'rgba(248, 250, 252, 0.6)',
                      borderRadius: 2,
                      border: '1px solid rgba(241, 245, 249, 0.5)',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                      Approved Hours
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b' }}>
                      {approvedHours}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.25,
                      bgcolor: 'rgba(248, 250, 252, 0.6)',
                      borderRadius: 2,
                      border: '1px solid rgba(241, 245, 249, 0.5)',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                      Pending Audit
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706' }}>
                      {pendingHours}
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={1} sx={{ pt: 1, borderTop: '1px solid #f1f5f9' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    disableElevation
                    onClick={onCompileReport}
                    startIcon={<FileSpreadsheet size={14} />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      borderRadius: 2,
                      py: 1,
                      bgcolor: '#0f172a',
                      '&:hover': { bgcolor: '#1e293b' },
                    }}
                  >
                    Compile Cycle Report
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={onSync}
                    startIcon={<RefreshCcw size={14} />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      borderRadius: 2,
                      py: 1,
                      borderColor: '#e2e8f0',
                      color: '#475569',
                      '&:hover': { bgcolor: '#f8fafc' },
                    }}
                  >
                    Sync Remote Repos
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeRowMenu}>
        <MenuItem onClick={handleMenuEdit} sx={{ fontSize: '0.875rem' }}>
          Edit entry
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TimesheetsConsole;
