import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  Edit2,
  MoreVertical,
  Search,
  Shield,
  ShieldAlert,
  X,
} from 'lucide-react';
import type { EnrichedLedgerEntry } from './ledgerEnrichment';
import type { SmartLedgerFilter } from './timesheetsAuditMock';

const statusStyles = {
  Approved: { bg: 'rgba(16, 185, 129, 0.08)', color: '#059669', border: 'rgba(16, 185, 129, 0.2)' },
  Pending: { bg: 'rgba(245, 158, 11, 0.08)', color: '#d97706', border: 'rgba(245, 158, 11, 0.2)' },
  Rejected: { bg: 'rgba(239, 68, 68, 0.08)', color: '#dc2626', border: 'rgba(239, 68, 68, 0.2)' },
  Draft: { bg: 'rgba(148, 163, 184, 0.12)', color: '#64748b', border: 'rgba(148, 163, 184, 0.25)' },
};

const timeStateStyle = {
  standard: { color: '#334155', bg: '#f8fafc' },
  overtime: { color: '#b45309', bg: '#fffbeb' },
  underreported: { color: '#0369a1', bg: '#e0f2fe' },
  duplicate: { color: '#b91c1c', bg: '#fef2f2' },
};

const auditStyle = {
  cleared: { label: 'Cleared', color: '#059669', icon: Shield },
  review: { label: 'Review', color: '#d97706', icon: Shield },
  flagged: { label: 'Flagged', color: '#dc2626', icon: ShieldAlert },
};

type SortKey = 'date' | 'employee' | 'project' | 'duration' | 'status';
type SortDir = 'asc' | 'desc';

export interface TimesheetLedgerTableProps {
  entries: EnrichedLedgerEntry[];
  smartFilter: SmartLedgerFilter;
  onSmartFilterChange: (f: SmartLedgerFilter) => void;
  onEntryAction?: (entryId: string) => void;
  emptyMessage: string;
}

export function TimesheetLedgerTable({
  entries,
  smartFilter,
  onSmartFilterChange,
  onEntryAction,
  emptyMessage,
}: TimesheetLedgerTableProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [statusOverrides, setStatusOverrides] = useState<Record<string, EnrichedLedgerEntry['status']>>({});
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuEntryId, setMenuEntryId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  const getStatus = (e: EnrichedLedgerEntry) => statusOverrides[e.id] ?? e.status;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = entries.map((e) => ({ ...e, status: getStatus(e) }));

    if (q) {
      list = list.filter(
        (e) =>
          e.employeeName.toLowerCase().includes(q) ||
          e.project.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.code.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'employee':
          cmp = a.employeeName.localeCompare(b.employeeName);
          break;
        case 'project':
          cmp = a.project.localeCompare(b.project);
          break;
        case 'duration':
          cmp = a.hoursNumeric - b.hoursNumeric;
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        default:
          cmp = a.groupDate.localeCompare(b.groupDate);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [entries, search, sortKey, sortDir, statusOverrides]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (sortDir === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />) : null;

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApprove = (id: string) => {
    setStatusOverrides((p) => ({ ...p, [id]: 'Approved' }));
  };

  const handleReject = (id: string) => {
    setStatusOverrides((p) => ({ ...p, [id]: 'Rejected' }));
    setRejectComment('');
  };

  const SMART_FILTERS: SmartLedgerFilter[] = ['All', 'Approved', 'Pending', 'Anomalies', 'Overtime', 'Compliance'];

  return (
    <Paper elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e8edf4', overflow: 'hidden' }}>
      <Box sx={{ p: 1.25, borderBottom: '1px solid #f1f5f9', bgcolor: '#fafbfc' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ md: 'center' }}>
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>Timesheet log ledger</Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>{filtered.length} entries · expandable audit rows</Typography>
          </Box>
          <TextField
            size="small"
            placeholder="Search employee, project, code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={14} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: '100%', md: 280 }, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
          />
        </Stack>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1 }}>
          {SMART_FILTERS.map((f) => (
            <Chip
              key={f}
              label={f}
              size="small"
              onClick={() => onSmartFilterChange(f)}
              sx={{
                fontWeight: 800,
                fontSize: '0.625rem',
                cursor: 'pointer',
                bgcolor: smartFilter === f ? '#0f172a' : '#fff',
                color: smartFilter === f ? '#fff' : '#475569',
              }}
            />
          ))}
        </Stack>
      </Box>

      {filtered.length === 0 ? (
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.875rem', color: '#64748b' }}>{emptyMessage}</Typography>
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow
                sx={{
                  '& th': {
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    color: '#64748b',
                    bgcolor: '#f8fafc',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    py: 1.25,
                    borderBottom: '1px solid #e2e8f0',
                  },
                }}
              >
                <TableCell width={40} />
                <TableCell>
                  <Button size="small" onClick={() => toggleSort('employee')} sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.625rem', color: '#64748b', minWidth: 0, p: 0 }}>
                    Employee <SortIcon col="employee" />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => toggleSort('project')} sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.625rem', color: '#64748b', minWidth: 0, p: 0 }}>
                    Project <SortIcon col="project" />
                  </Button>
                </TableCell>
                <TableCell>Activity</TableCell>
                <TableCell align="center">
                  <Button size="small" onClick={() => toggleSort('duration')} sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.625rem', color: '#64748b', minWidth: 0, p: 0 }}>
                    Time <SortIcon col="duration" />
                  </Button>
                </TableCell>
                <TableCell align="center">Audit</TableCell>
                <TableCell align="center">
                  <Button size="small" onClick={() => toggleSort('status')} sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.625rem', color: '#64748b', minWidth: 0, p: 0 }}>
                    Status <SortIcon col="status" />
                  </Button>
                </TableCell>
                <TableCell align="center" width={120}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((entry) => {
                const status = getStatus(entry);
                const pill = statusStyles[status];
                const ts = timeStateStyle[entry.timeState];
                const audit = auditStyle[entry.auditStatus];
                const AuditIcon = audit.icon;
                const isExpanded = expandedIds.has(entry.id);

                return (
                  <React.Fragment key={entry.id}>
                    <TableRow
                      hover
                      sx={{
                        bgcolor: entry.hasAnomaly ? alpha('#fef2f2', 0.35) : 'transparent',
                        '& td': { borderBottom: '1px solid #f8fafc', py: 1.25 },
                        transition: 'background 150ms ease',
                      }}
                    >
                      <TableCell>
                        <IconButton size="small" onClick={() => toggleExpand(entry.id)}>
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: '0.625rem', fontWeight: 800, bgcolor: alpha(entry.employeeColor, 0.15), color: entry.employeeColor }}>
                            {entry.employeeInitials}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>{entry.employeeName}</Typography>
                            <Typography sx={{ fontSize: '0.5625rem', color: '#94a3b8' }}>{entry.department}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={entry.projectLabel} size="small" sx={{ height: 20, fontWeight: 800, fontSize: '0.5625rem', bgcolor: '#eef2ff', color: '#4338ca', mb: 0.35 }} />
                        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#334155' }} noWrap>
                          {entry.project}
                        </Typography>
                        <Typography sx={{ fontSize: '0.5625rem', fontFamily: 'monospace', color: '#94a3b8' }}>{entry.code}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', maxWidth: 200 }} noWrap>
                          {entry.description}
                        </Typography>
                        {entry.hasAnomaly && (
                          <Tooltip title={entry.anomalyReason ?? 'AI anomaly'}>
                            <Chip
                              size="small"
                              icon={<AlertTriangle size={10} />}
                              label="AI flag"
                              sx={{ height: 18, mt: 0.35, fontSize: '0.5rem', fontWeight: 800, bgcolor: '#fef2f2', color: '#b91c1c' }}
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={entry.duration}
                          sx={{
                            height: 22,
                            fontWeight: 800,
                            fontSize: '0.6875rem',
                            bgcolor: ts.bg,
                            color: ts.color,
                            border: '1px solid',
                            borderColor: alpha(ts.color, 0.2),
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          icon={<AuditIcon size={10} />}
                          label={audit.label}
                          sx={{ height: 20, fontWeight: 800, fontSize: '0.5rem', color: audit.color, bgcolor: alpha(audit.color, 0.1) }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35, px: 0.75, py: 0.2, fontSize: '0.5625rem', fontWeight: 800, borderRadius: 0.5, border: '1px solid', textTransform: 'uppercase', bgcolor: pill.bg, color: pill.color, borderColor: pill.border }}>
                          {status}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.25} justifyContent="center">
                          {status !== 'Approved' && (
                            <Tooltip title="Approve">
                              <IconButton size="small" onClick={() => handleApprove(entry.id)} sx={{ color: '#059669' }}>
                                <Check size={14} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {status !== 'Rejected' && (
                            <Tooltip title="Reject">
                              <IconButton size="small" onClick={() => handleReject(entry.id)} sx={{ color: '#dc2626' }}>
                                <X size={14} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onEntryAction && (
                            <IconButton size="small" onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuEntryId(entry.id); }}>
                              <MoreVertical size={14} />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={8} sx={{ py: 0, border: 0 }}>
                        <Collapse in={isExpanded}>
                          <Box sx={{ px: 3, py: 1.25, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                            <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', mb: 0.5 }}>AUDIT TRAIL</Typography>
                            <Typography sx={{ fontSize: '0.6875rem', color: '#475569' }}>
                              Date: {entry.groupDate} · Time state: {entry.timeState} · {entry.anomalyReason ?? 'No anomalies'}
                            </Typography>
                            <TextField
                              size="small"
                              fullWidth
                              placeholder="Add approval comment…"
                              value={rejectComment}
                              onChange={(e) => setRejectComment(e.target.value)}
                              sx={{ mt: 1, '& .MuiOutlinedInput-root': { fontSize: '0.75rem', bgcolor: '#fff' } }}
                            />
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem
          onClick={() => {
            if (menuEntryId && onEntryAction) onEntryAction(menuEntryId);
            setMenuAnchor(null);
          }}
        >
          <Edit2 size={14} style={{ marginRight: 8 }} /> Quick edit
        </MenuItem>
      </Menu>
    </Paper>
  );
}
