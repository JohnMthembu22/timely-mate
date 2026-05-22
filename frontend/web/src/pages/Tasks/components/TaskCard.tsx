import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  PlayArrow,
  CheckCircle,
} from '@mui/icons-material';
import { AlertCircle, Calendar, Flag } from 'lucide-react';
import type { Task, TaskPriority, TaskStatus } from '../types';
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  formatDueLabel,
  getAssigneeInitials,
  getDueWarning,
} from '../taskUtils';
import { glassCardSx } from '../../../theme/surfaces';
import { tmColors } from '../../../theme/designTokens';

const STATUS_CHIP_COLOR: Record<TaskStatus, 'default' | 'primary' | 'success' | 'warning'> = {
  TODO: 'default',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  PENDING_REVIEW: 'warning',
};

const DUE_STYLES = {
  overdue: { label: 'Overdue', color: '#f87171', bg: alpha('#f87171', 0.12) },
  'due-today': { label: 'Due today', color: '#fbbf24', bg: alpha('#fbbf24', 0.12) },
  'due-soon': { label: 'Due soon', color: '#fb923c', bg: alpha('#fb923c', 0.1) },
  ok: { label: 'On schedule', color: tmColors.emerald, bg: alpha(tmColors.emerald, 0.1) },
  none: { label: '', color: 'transparent', bg: 'transparent' },
};

export function TaskCard({
  task,
  canModify,
  canEdit,
  isAssignedToUser,
  onOpenMenu,
  onEdit,
  onStart,
  onComplete,
  onQuickStatus,
  onQuickPriority,
}: {
  task: Task;
  canModify: boolean;
  canEdit: boolean;
  isAssignedToUser: boolean;
  onOpenMenu: (e: React.MouseEvent<HTMLElement>) => void;
  onEdit: () => void;
  onStart: () => void;
  onComplete: () => void;
  onQuickStatus?: (status: TaskStatus) => void;
  onQuickPriority?: (priority: TaskPriority) => void;
}) {
  const theme = useTheme();
  const dueWarning = getDueWarning(task);
  const dueStyle = DUE_STYLES[dueWarning];
  const priorityColor = PRIORITY_COLORS[task.priority];

  return (
    <Box sx={{ ...glassCardSx(theme), p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
          <Tooltip title={task.assigneeName}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: '0.75rem',
                fontWeight: 700,
                bgcolor: alpha(tmColors.neonBlue, 0.2),
                color: tmColors.neonBlueBright,
                border: `2px solid ${alpha(tmColors.emerald, 0.4)}`,
              }}
            >
              {getAssigneeInitials(task.assigneeName, task.assignee)}
            </Avatar>
          </Tooltip>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'text.primary', lineHeight: 1.3 }} noWrap>
              {task.title}
            </Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary', fontWeight: 500 }} noWrap>
              {task.project}
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={onOpenMenu} aria-label="Task actions" sx={{ borderRadius: '3px' }}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Typography
        sx={{
          fontSize: '0.8125rem',
          color: 'text.secondary',
          lineHeight: 1.45,
          mb: 1.25,
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {task.description}
      </Typography>

      <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mb: 1, gap: 0.5 }}>
        <Chip
          size="small"
          label={STATUS_LABELS[task.status]}
          color={STATUS_CHIP_COLOR[task.status]}
          onClick={canModify && onQuickStatus ? () => {
            const next: TaskStatus =
              task.status === 'TODO' ? 'IN_PROGRESS' : task.status === 'IN_PROGRESS' ? 'COMPLETED' : 'TODO';
            onQuickStatus(next);
          } : undefined}
          sx={{ fontWeight: 700, fontSize: '0.625rem', cursor: canModify ? 'pointer' : 'default' }}
        />
        <Chip
          size="small"
          icon={<Flag size={12} />}
          label={PRIORITY_LABELS[task.priority]}
          onClick={canModify && onQuickPriority ? () => {
            const order: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
            const i = order.indexOf(task.priority);
            onQuickPriority(order[(i + 1) % order.length]);
          } : undefined}
          sx={{
            fontWeight: 700,
            fontSize: '0.625rem',
            bgcolor: alpha(priorityColor, 0.12),
            color: priorityColor,
            border: `1px solid ${alpha(priorityColor, 0.3)}`,
            cursor: canModify ? 'pointer' : 'default',
            '& .MuiChip-icon': { color: 'inherit' },
          }}
        />
        {dueWarning !== 'none' && dueWarning !== 'ok' && (
          <Chip
            size="small"
            icon={<AlertCircle size={12} />}
            label={dueStyle.label}
            sx={{
              fontWeight: 700,
              fontSize: '0.625rem',
              bgcolor: dueStyle.bg,
              color: dueStyle.color,
              '& .MuiChip-icon': { color: 'inherit' },
            }}
          />
        )}
      </Stack>

      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1.5 }}>
        <Calendar size={13} color={theme.palette.text.secondary} />
        <Typography sx={{ fontSize: '0.75rem', color: dueWarning === 'overdue' ? dueStyle.color : 'text.secondary', fontWeight: dueWarning === 'overdue' ? 700 : 500 }}>
          {formatDueLabel(task.dueDate)}
        </Typography>
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
        Created by {task.createdBy}
      </Typography>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={0.75}
        sx={{ pt: 1.25, borderTop: '1px solid', borderColor: 'divider', mt: 'auto' }}
      >
        {isAssignedToUser && (
          <>
            <Button
              size="small"
              variant="outlined"
              startIcon={<PlayArrow />}
              disabled={task.status === 'IN_PROGRESS'}
              onClick={onStart}
              sx={{ flex: 1, textTransform: 'none', fontWeight: 600, borderRadius: '3px' }}
            >
              Start
            </Button>
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              disabled={task.status === 'COMPLETED' || task.status === 'PENDING_REVIEW'}
              onClick={onComplete}
              sx={{ flex: 1, textTransform: 'none', fontWeight: 600, borderRadius: '3px' }}
            >
              Submit for review
            </Button>
          </>
        )}
        {canEdit && (
          <Button size="small" variant="text" onClick={onEdit} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Edit
          </Button>
        )}
      </Stack>
    </Box>
  );
}
