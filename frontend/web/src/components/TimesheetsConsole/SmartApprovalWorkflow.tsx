import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Flag,
  Lock,
  Sparkles,
  X,
} from 'lucide-react';
import { LiveIndicator } from '../ProjectsConsole/ConsolePrimitives';
import type { ApprovalQueueItem, ApprovalWorkflowBundle } from './approvalWorkflowMock';

const typeLabel: Record<ApprovalQueueItem['type'], string> = {
  pending: 'Pending',
  manager_review: 'Manager review',
  flagged: 'Flagged',
  disputed: 'Disputed',
  compliance: 'Compliance',
  overtime: 'OT approval',
  payroll_lock: 'Payroll lock',
};

function QueueCard({
  item,
  onApprove,
  onReject,
}: {
  item: ApprovalQueueItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: item.escalated ? 'rgba(239,68,68,0.3)' : '#e8edf4',
        bgcolor: item.escalated ? alpha('#fef2f2', 0.4) : '#fff',
        overflow: 'hidden',
        transition: 'box-shadow 180ms ease',
        '&:hover': { boxShadow: '0 6px 16px rgba(15,23,42,0.06)' },
      }}
    >
      <Box sx={{ p: 1.15 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" alignItems="center">
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>{item.employeeName}</Typography>
              <Chip size="small" label={typeLabel[item.type]} sx={{ height: 18, fontSize: '0.5rem', fontWeight: 800 }} />
              {item.escalated && (
                <Chip size="small" icon={<Flag size={10} />} label="Escalated" sx={{ height: 18, fontSize: '0.5rem', fontWeight: 800, bgcolor: '#fef2f2', color: '#b91c1c' }} />
              )}
            </Stack>
            <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', mt: 0.25 }}>
              {item.project} · {item.hours} · {item.submittedAt}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setOpen((v) => !v)}>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </IconButton>
        </Stack>
        <Collapse in={open}>
          <Box sx={{ mt: 1, p: 1, borderRadius: 1.5, bgcolor: '#f5f3ff', border: '1px solid #e9d5ff' }}>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.35 }}>
              <Sparkles size={12} color="#7c3aed" />
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#6d28d9' }}>AI AUDIT</Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.6875rem', color: '#475569', lineHeight: 1.45 }}>{item.aiRecommendation}</Typography>
          </Box>
          <TextField
            size="small"
            fullWidth
            multiline
            minRows={2}
            placeholder="Manager comment…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mt: 1, '& .MuiOutlinedInput-root': { fontSize: '0.75rem' } }}
          />
        </Collapse>
        <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<Check size={12} />}
            onClick={() => onApprove(item.id)}
            sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.6875rem', bgcolor: '#059669', borderRadius: 1.5 }}
          >
            Approve
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<X size={12} />}
            onClick={() => onReject(item.id)}
            sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.6875rem', borderRadius: 1.5 }}
          >
            Reject
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}

export interface SmartApprovalWorkflowProps {
  bundle: ApprovalWorkflowBundle;
  onNotify?: (title: string, message: string) => void;
}

export function SmartApprovalWorkflow({ bundle, onNotify }: SmartApprovalWorkflowProps) {
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [sectionOpen, setSectionOpen] = useState(true);

  const visible = bundle.items.filter((i) => !resolved.has(i.id));

  const handleApprove = (id: string) => {
    setResolved((p) => new Set(p).add(id));
    onNotify?.('Approved', 'Timesheet entry approved and queued for payroll compile.');
  };

  const handleReject = (id: string) => {
    setResolved((p) => new Set(p).add(id));
    onNotify?.('Rejected', 'Entry returned to employee with audit comment.');
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e8edf4', overflow: 'hidden' }}>
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          bgcolor: '#0f172a',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Clock size={18} color="#a78bfa" />
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 800 }}>Smart approval workflow</Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
              {bundle.pendingCount} pending · {bundle.flaggedCount} flagged · {bundle.payrollLockLabel}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Chip size="small" icon={<Lock size={10} />} label={`${bundle.lockDaysRemaining}d to lock`} sx={{ height: 22, fontWeight: 800, fontSize: '0.5625rem', bgcolor: 'rgba(245,158,11,0.2)', color: '#fcd34d' }} />
          <LiveIndicator label="Queue live" />
          <IconButton size="small" onClick={() => setSectionOpen((v) => !v)} sx={{ color: '#cbd5e1' }}>
            {sectionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </IconButton>
        </Stack>
      </Box>
      <Collapse in={sectionOpen}>
        <Box sx={{ p: 1.25, maxHeight: 400, overflowY: 'auto' }}>
          <Stack spacing={0.75}>
            {visible.length === 0 ? (
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', py: 2 }}>
                Queue cleared for this session.
              </Typography>
            ) : (
              visible.map((item) => <QueueCard key={item.id} item={item} onApprove={handleApprove} onReject={handleReject} />)
            )}
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
}
