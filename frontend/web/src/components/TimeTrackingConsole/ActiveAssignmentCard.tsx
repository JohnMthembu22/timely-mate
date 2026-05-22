import React, { useState } from 'react';
import {
  Avatar,
  Box,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import {
  AlertTriangle,
  Camera,
  GitBranch,
  HelpCircle,
  Mic,
  MoreHorizontal,
  Pause,
  Play,
  Sparkles,
  Square,
} from 'lucide-react';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import type { TimeTrackingJobRow, AssignmentQuickAction } from './timeTrackingTypes';
import { enrichAssignmentIntel, getHealthStyle, getPressureStyle } from './assignmentIntel';
import { ttAssignmentCardSx, ttType } from './timeTrackingStyles';

function StatusDot({ color, pulse }: { color: string; pulse?: boolean }) {
  return (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        bgcolor: color,
        flexShrink: 0,
        ...(pulse && {
          boxShadow: `0 0 0 3px ${alpha(color, 0.25)}`,
          animation: 'status-pulse 2s ease-in-out infinite',
          '@keyframes status-pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.55 },
          },
        }),
      }}
    />
  );
}

function IntelIcon({
  title,
  icon: Icon,
  color,
  active,
}: {
  title: string;
  icon: React.ElementType;
  color: string;
  active?: boolean;
}) {
  return (
    <Tooltip title={title} arrow placement="top">
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: active ? color : '#94a3b8',
          bgcolor: active ? alpha(color, 0.08) : '#f8fafc',
          border: '1px solid',
          borderColor: active ? alpha(color, 0.2) : '#eef2f6',
        }}
      >
        <Icon size={14} strokeWidth={2} />
      </Box>
    </Tooltip>
  );
}

export interface ActiveAssignmentCardProps {
  job: TimeTrackingJobRow;
  index: number;
  isCheckedIn: boolean;
  onJobToggle: (jobId: string, isRunning: boolean) => void;
  onQuickAction: (jobId: string, action: AssignmentQuickAction) => void;
  onOpenDetails?: (job: TimeTrackingJobRow, index: number) => void;
}

export function ActiveAssignmentCard({
  job,
  index,
  isCheckedIn,
  onJobToggle,
  onQuickAction,
  onOpenDetails,
}: ActiveAssignmentCardProps) {
  const intel = enrichAssignmentIntel(job, index);
  const health = getHealthStyle(intel.projectHealth);
  const pressure = getPressureStyle(intel.workloadPressure);
  const liveElapsed = useElapsedTimer(
    job.isRunning,
    job.trackingStartedAt ?? null,
    job.trackingBaseMs ?? 0
  );
  const assignees = job.assignedMembers ?? [];
  const accent = job.isRunning ? '#4f46e5' : health.color;
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const blockerTip =
    intel.blockers.length > 0
      ? `Blockers: ${intel.blockers.join(' · ')}`
      : '';
  const metaTip = [
    `Health: ${health.label}`,
    `Load: ${pressure.label}`,
    `Complexity ${intel.complexityScore}/10`,
    intel.teamDependencies > 0 ? `${intel.teamDependencies} dependencies` : '',
    intel.etaCompletion,
    assignees.length ? `Team: ${assignees.join(', ')}` : '',
    blockerTip,
  ]
    .filter(Boolean)
    .join('\n');

  const secondaryActions: { action: AssignmentQuickAction; icon: React.ElementType; label: string; disabled?: boolean }[] = [
    { action: 'pause', icon: Pause, label: 'Pause timer', disabled: !job.isRunning },
    { action: 'voice', icon: Mic, label: 'Voice note' },
    { action: 'proof', icon: Camera, label: 'Field proof' },
    { action: 'assist', icon: HelpCircle, label: 'Request assist' },
  ];

  return (
    <Box sx={{ ...ttAssignmentCardSx({ isRunning: job.isRunning, accent }), pl: 2, pr: 1.5, py: 1.5 }}>
      {/* TOP — title, live state, key metric */}
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
        onClick={() => onOpenDetails?.(job, index)}
        sx={{ cursor: onOpenDetails ? 'pointer' : 'default', mb: 1.25 }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            {job.isRunning && <StatusDot color="#22c55e" pulse />}
            <Typography sx={{ ...ttType.title }} noWrap>
              {job.name}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.35 }}>
            <Typography sx={{ ...ttType.meta }} noWrap>
              {job.team}
            </Typography>
            {assignees.length > 0 && (
              <Stack direction="row" spacing={-0.5}>
                {assignees.slice(0, 4).map((name) => (
                  <Tooltip key={name} title={name}>
                    <Avatar
                      sx={{
                        width: 20,
                        height: 20,
                        fontSize: '0.5rem',
                        fontWeight: 700,
                        border: '1.5px solid #fff',
                        bgcolor: '#e2e8f0',
                        color: '#475569',
                      }}
                    >
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
          </Stack>
        </Box>

        <Tooltip title={metaTip} arrow placement="left">
          <Stack alignItems="flex-end" spacing={0.25} sx={{ flexShrink: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Sparkles size={13} color="#8b5cf6" />
              <Typography sx={{ ...ttType.metric, color: '#5b21b6' }}>{intel.aiProductivityScore}</Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: health.color }}>{health.label}</Typography>
          </Stack>
        </Tooltip>
      </Stack>

      {/* CENTER — progress, timer, indicators */}
      <Stack direction="row" spacing={1.25} alignItems="stretch" sx={{ mb: 1.25 }}>
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8' }}>{job.progress}%</Typography>
            {intel.overdueRisk !== 'none' && (
              <Tooltip title={`Overdue risk: ${intel.overdueRisk}`}>
                <AlertTriangle size={13} color="#dc2626" />
              </Tooltip>
            )}
          </Stack>
          <LinearProgress
            variant="determinate"
            value={job.progress}
            sx={{
              height: 4,
              borderRadius: 99,
              bgcolor: '#f1f5f9',
              '& .MuiLinearProgress-bar': {
                borderRadius: 99,
                bgcolor: job.isRunning ? '#6366f1' : health.color,
              },
            }}
          />
          <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
            <IntelIcon title={`AI score ${intel.aiProductivityScore}`} icon={Sparkles} color="#8b5cf6" active />
            <IntelIcon title={pressure.label} icon={GitBranch} color={pressure.color} active={intel.workloadPressure !== 'low'} />
            {intel.blockers.length > 0 && (
              <IntelIcon title={blockerTip} icon={AlertTriangle} color="#f59e0b" active />
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            width: 112,
            flexShrink: 0,
            px: 1,
            py: 0.85,
            borderRadius: 2,
            bgcolor: job.isRunning ? '#0f172a' : '#f8fafc',
            border: '1px solid',
            borderColor: job.isRunning ? alpha('#6366f1', 0.2) : '#eef2f6',
          }}
        >
          <Typography
            sx={{
              ...ttType.mono,
              fontSize: job.isRunning ? '1.125rem' : '0.9375rem',
              color: job.isRunning ? '#f8fafc' : '#0f172a',
              lineHeight: 1.1,
            }}
          >
            {job.isRunning ? liveElapsed : job.timeSpent}
          </Typography>
        </Box>
      </Stack>

      {/* BOTTOM — primary control + overflow menu */}
      <Stack direction="row" spacing={0.75} alignItems="center" onClick={(e) => e.stopPropagation()}>
        <IconButton
          onClick={() => onJobToggle(job.id, job.isRunning)}
          disabled={!isCheckedIn && !job.isRunning}
          sx={{
            flex: 1,
            borderRadius: 2,
            py: 0.85,
            bgcolor: job.isRunning ? alpha('#f43f5e', 0.08) : alpha('#4f46e5', 0.08),
            color: job.isRunning ? '#e11d48' : '#4f46e5',
            border: '1px solid',
            borderColor: job.isRunning ? alpha('#f43f5e', 0.2) : alpha('#4f46e5', 0.2),
            '&:hover': {
              bgcolor: job.isRunning ? alpha('#f43f5e', 0.14) : alpha('#4f46e5', 0.14),
            },
          }}
        >
          {job.isRunning ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </IconButton>
        <IconButton
          size="small"
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          sx={{
            border: '1px solid #eef2f6',
            borderRadius: 2,
            color: '#64748b',
          }}
        >
          <MoreHorizontal size={18} />
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{ paper: { sx: { minWidth: 168, borderRadius: 2, border: '1px solid #e8ecf1', boxShadow: '0 8px 24px rgba(15,23,42,0.08)' } } }}
        >
          {secondaryActions.map(({ action, icon: Icon, label, disabled }) => (
            <MenuItem
              key={action}
              disabled={disabled}
              onClick={() => {
                setMenuAnchor(null);
                onQuickAction(job.id, action);
              }}
              sx={{ py: 0.75 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Icon size={16} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 600 }}>{label}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </Stack>
    </Box>
  );
}
