import React from 'react';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import { Clock, GripVertical, QrCode, Users } from 'lucide-react';
import { weekRunwayCardSx, weekRunwayPanelSx } from './weekRunwayStyles';
import { setBacklogDragData, type BacklogDragPayload } from '../calendarDragUtils';

export interface WeekRunwayBacklogItem {
  id: string;
  title: string;
  duration: string;
  dept: string;
  borderColor: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface WeekRunwaySidePanelProps {
  backlogItems: WeekRunwayBacklogItem[];
  selectedDate: Date;
  estHours: number;
  rosterCount: number;
  enableDrag?: boolean;
  onBacklogClick: (item: WeekRunwayBacklogItem) => void;
  onBacklogDragStart?: (e: React.DragEvent, item: WeekRunwayBacklogItem) => void;
}

const PRIORITY_COLORS = {
  high: { bg: alpha('#f87171', 0.12), color: '#dc2626', border: alpha('#f87171', 0.35) },
  medium: { bg: alpha('#fbbf24', 0.12), color: '#d97706', border: alpha('#fbbf24', 0.35) },
  low: { bg: alpha('#34d399', 0.12), color: '#059669', border: alpha('#34d399', 0.35) },
};

function BacklogCard({
  task,
  enableDrag,
  onClick,
  onDragStart,
}: {
  task: WeekRunwayBacklogItem;
  enableDrag?: boolean;
  onClick: () => void;
  onDragStart?: (e: React.DragEvent, task: WeekRunwayBacklogItem) => void;
}) {
  const theme = useTheme();
  const priority = task.priority ?? 'medium';
  const pri = PRIORITY_COLORS[priority];

  const handleDragStart = (e: React.DragEvent) => {
    if (!enableDrag) return;
    e.stopPropagation();
    const payload: BacklogDragPayload = {
      id: task.id,
      title: task.title,
      duration: task.duration,
      dept: task.dept,
      borderColor: task.borderColor,
    };
    setBacklogDragData(e, payload);
    onDragStart?.(e, task);
  };

  const suppressClickAfterDrag = (e: React.MouseEvent) => {
    if ((e.currentTarget as HTMLElement).dataset.wasDragged === '1') {
      e.preventDefault();
      e.stopPropagation();
      delete (e.currentTarget as HTMLElement).dataset.wasDragged;
    }
  };

  const markDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).dataset.wasDragged = '1';
    window.setTimeout(() => {
      delete (e.currentTarget as HTMLElement).dataset.wasDragged;
    }, 0);
  };

  return (
    <Paper
      component="div"
      role="button"
      tabIndex={0}
      elevation={0}
      draggable={enableDrag}
      onDragStart={handleDragStart}
      onDragEnd={markDragEnd}
      onClick={(e) => {
        suppressClickAfterDrag(e);
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        ...weekRunwayCardSx(theme),
        p: 2,
        width: '100%',
        minWidth: 0,
        textAlign: 'left',
        cursor: enableDrag ? 'grab' : 'pointer',
        borderLeftWidth: 4,
        borderLeftColor: task.borderColor,
        borderLeftStyle: 'solid',
        display: 'flex',
        gap: 1.25,
        alignItems: 'flex-start',
        transition: 'box-shadow 160ms ease, transform 160ms ease, border-color 160ms ease',
        '&:hover': {
          boxShadow: '0 8px 28px rgba(15, 23, 42, 0.1)',
          transform: 'translateY(-1px)',
          borderColor: alpha('#0f172a', 0.12),
        },
        '&:active': { cursor: enableDrag ? 'grabbing' : 'pointer' },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      {enableDrag ? (
        <GripVertical size={18} style={{ opacity: 0.4, flexShrink: 0, marginTop: 2 }} />
      ) : null}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '0.875rem',
            color: 'text.primary',
            lineHeight: 1.35,
            wordBreak: 'break-word',
          }}
        >
          {task.title}
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1.25 }}>
          <Chip
            label={task.dept}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.6875rem',
              fontWeight: 600,
              bgcolor: alpha('#64748b', 0.08),
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
          <Chip
            label={`${priority} priority`}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'capitalize',
              bgcolor: pri.bg,
              color: pri.color,
              border: `1px solid ${pri.border}`,
            }}
          />
          <Chip
            label={task.duration}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.6875rem',
              fontWeight: 600,
              bgcolor: alpha('#3b82f6', 0.08),
              color: '#2563eb',
            }}
          />
        </Stack>
      </Box>
    </Paper>
  );
}

function FocusMetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 2,
        borderRadius: '8px',
        bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.03) : '#f8fafc',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {icon}
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'text.primary' }}>{value}</Typography>
      </Box>
    </Box>
  );
}

/** Right operations column for Week Runway (backlog + focus target). */
export function WeekRunwaySidePanel({
  backlogItems,
  selectedDate,
  estHours,
  rosterCount,
  enableDrag = true,
  onBacklogClick,
  onBacklogDragStart,
}: WeekRunwaySidePanelProps) {
  const theme = useTheme();

  return (
    <Stack spacing={2.5} sx={{ width: '100%', minWidth: 0 }}>
      <Paper elevation={0} sx={{ ...weekRunwayPanelSx(theme), p: 2.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: 'text.primary', letterSpacing: '-0.02em' }}>
          Unassigned backlog
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mt: 0.75, mb: 2, lineHeight: 1.5 }}>
          {enableDrag
            ? 'Drag items onto a day in the week runway, or tap to schedule on the selected day.'
            : 'Tap a card to schedule on the selected day and open the operational block form.'}
        </Typography>
        <Stack spacing={1.5}>
          {backlogItems.length === 0 ? (
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontStyle: 'italic' }}>
              No unassigned items — you&apos;re caught up.
            </Typography>
          ) : (
            backlogItems.map((task) => (
              <BacklogCard
                key={task.id}
                task={task}
                enableDrag={enableDrag}
                onClick={() => onBacklogClick(task)}
                onDragStart={onBacklogDragStart}
              />
            ))
          )}
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ ...weekRunwayPanelSx(theme), p: 2.5 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            gap: 1,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.6875rem',
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Focus target
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: 'text.primary', mt: 0.5, lineHeight: 1.3 }}>
              {format(selectedDate, 'MMMM d, yyyy')}
            </Typography>
          </Box>
          <Tooltip title="Generate smart QR token">
            <IconButton
              size="small"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                flexShrink: 0,
              }}
            >
              <QrCode size={18} />
            </IconButton>
          </Tooltip>
        </Box>
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          <FocusMetricCard
            icon={<Clock size={20} color="#64748b" />}
            label="Estimated allocation"
            value={`${estHours} tracking hours`}
          />
          <FocusMetricCard
            icon={<Users size={20} color="#64748b" />}
            label="Staff rostered"
            value={`${Math.min(rosterCount, 12)} active personnel`}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}
