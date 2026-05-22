import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import { AlertTriangle, Play, Sparkles, Square, X } from 'lucide-react';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import type { TimeTrackingJobRow, AssignmentQuickAction } from './timeTrackingTypes';
import { enrichAssignmentIntel, getHealthStyle, getPressureStyle } from './assignmentIntel';
import { ttType } from './timeTrackingStyles';

export interface AssignmentDetailDialogProps {
  job: TimeTrackingJobRow | null;
  index: number;
  open: boolean;
  onClose: () => void;
  isCheckedIn: boolean;
  onJobToggle: (jobId: string, isRunning: boolean) => void;
  onQuickAction: (jobId: string, action: AssignmentQuickAction) => void;
}

function Metric({ value, tip }: { value: string; tip: string }) {
  return (
    <Tooltip title={tip} arrow>
      <Box sx={{ p: 1.25, borderRadius: 2, border: '1px solid #e8ecf1', bgcolor: '#fafbfc', textAlign: 'center' }}>
        <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>{value}</Typography>
      </Box>
    </Tooltip>
  );
}

export function AssignmentDetailDialog({
  job,
  index,
  open,
  onClose,
  isCheckedIn,
  onJobToggle,
  onQuickAction,
}: AssignmentDetailDialogProps) {
  if (!job) return null;

  const intel = enrichAssignmentIntel(job, index);
  const health = getHealthStyle(intel.projectHealth);
  const pressure = getPressureStyle(intel.workloadPressure);
  const liveElapsed = useElapsedTimer(
    job.isRunning,
    job.trackingStartedAt ?? null,
    job.trackingBaseMs ?? 0
  );
  const assignees = job.assignedMembers ?? [];
  const statusTip = [
    health.label,
    pressure.label,
    intel.overdueRisk !== 'none' ? `Risk: ${intel.overdueRisk}` : '',
    intel.blockers.length ? intel.blockers.join(' · ') : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 0.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ minWidth: 0, pr: 2 }}>
            <Typography sx={{ ...ttType.title, fontSize: '1.125rem' }}>{job.name}</Typography>
            <Typography sx={{ ...ttType.meta, mt: 0.35 }}>{job.team}</Typography>
            {assignees.length > 0 && (
              <Stack direction="row" spacing={-0.5} sx={{ mt: 1 }}>
                {assignees.map((name) => (
                  <Tooltip key={name} title={name}>
                    <Avatar sx={{ width: 26, height: 26, fontSize: '0.5625rem', fontWeight: 700, border: '2px solid #fff' }}>
                      {name
                        .split(/\s+/)
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </Avatar>
                  </Tooltip>
                ))}
              </Stack>
            )}
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="Close">
            <X size={18} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={1}>
          <Grid item xs={3}>
            <Metric value={job.isRunning ? liveElapsed : job.timeSpent} tip="Time logged" />
          </Grid>
          <Grid item xs={3}>
            <Metric value={`${intel.aiProductivityScore}`} tip="AI productivity score" />
          </Grid>
          <Grid item xs={3}>
            <Metric value={`${job.progress}%`} tip="Progress" />
          </Grid>
          <Grid item xs={3}>
            <Metric value={intel.etaCompletion} tip="ETA" />
          </Grid>
        </Grid>

        <Box sx={{ mt: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={job.progress}
            sx={{
              height: 6,
              borderRadius: 99,
              bgcolor: '#f1f5f9',
              '& .MuiLinearProgress-bar': { borderRadius: 99, bgcolor: health.color },
            }}
          />
        </Box>

        <Tooltip title={statusTip}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.25 }}>
            <Sparkles size={14} color="#8b5cf6" />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
              {health.label} · {pressure.label}
              {intel.overdueRisk !== 'none' && (
                <>
                  {' '}
                  <AlertTriangle size={12} style={{ verticalAlign: 'middle', color: '#dc2626' }} />
                </>
              )}
            </Typography>
          </Stack>
        </Tooltip>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5, gap: 0.75 }}>
        <Button
          variant="contained"
          disableElevation
          startIcon={job.isRunning ? <Square size={14} /> : <Play size={14} />}
          disabled={!isCheckedIn && !job.isRunning}
          onClick={() => onJobToggle(job.id, job.isRunning)}
          sx={{ textTransform: 'none', fontWeight: 700, bgcolor: job.isRunning ? '#e11d48' : '#0f172a', borderRadius: 2 }}
        >
          {job.isRunning ? 'Stop' : 'Start'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            onQuickAction(job.id, 'assist');
            onClose();
          }}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, color: '#b45309', borderColor: alpha('#f59e0b', 0.4) }}
        >
          Assist
        </Button>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
