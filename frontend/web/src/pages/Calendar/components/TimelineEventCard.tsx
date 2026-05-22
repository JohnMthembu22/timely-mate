import React from 'react';
import { Box, Chip, Typography, alpha, useTheme } from '@mui/material';
import { format } from 'date-fns';
import {
  Flag,
  CalendarClock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Video,
  Factory,
  ListTodo,
} from 'lucide-react';
import {
  OPS_CATEGORY_COLORS,
  OPS_CATEGORY_LABELS,
  type OpsRiskLevel,
  type OpsTimelineCategory,
} from '../calendarOpsTypes';
import { allowBacklogDrop } from '../calendarDragUtils';

export interface TimelineEventCardData {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  opsCategory?: OpsTimelineCategory;
  type?: 'meeting' | 'task' | 'production';
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'in_progress' | 'completed';
  riskLevel?: OpsRiskLevel;
  location?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

function resolveCategory(ev: TimelineEventCardData): OpsTimelineCategory {
  if (ev.opsCategory) return ev.opsCategory;
  if (ev.type === 'production') return 'production';
  if (ev.type === 'task') return 'task';
  return 'meeting';
}

const categoryIcon = (cat: OpsTimelineCategory) => {
  switch (cat) {
    case 'milestone':
      return <Flag size={14} />;
    case 'deadline':
      return <CalendarClock size={14} />;
    case 'shift':
      return <Users size={14} />;
    case 'approval':
      return <CheckCircle2 size={14} />;
    case 'risk':
      return <AlertTriangle size={14} />;
    case 'production':
      return <Factory size={14} />;
    case 'task':
      return <ListTodo size={14} />;
    default:
      return <Video size={14} />;
  }
};

const statusMeta = (s?: TimelineEventCardData['status']) => {
  if (s === 'completed') return { label: 'Done', bg: alpha('#34d399', 0.15), color: '#059669' };
  if (s === 'in_progress') return { label: 'In progress', bg: alpha('#3b82f6', 0.12), color: '#2563eb' };
  return { label: 'Planned', bg: alpha('#94a3b8', 0.12), color: '#475569' };
};

const priorityMeta = (p?: TimelineEventCardData['priority']) => {
  if (p === 'high') return { label: 'High', bg: alpha('#f87171', 0.12), color: '#dc2626' };
  if (p === 'low') return { label: 'Low', bg: alpha('#34d399', 0.12), color: '#059669' };
  return { label: 'Medium', bg: alpha('#fbbf24', 0.12), color: '#d97706' };
};

export function TimelineEventCard({
  event,
  compact,
  runwayCompact,
  onClick,
}: {
  event: TimelineEventCardData;
  /** @deprecated use runwayCompact */
  compact?: boolean;
  runwayCompact?: boolean;
  onClick?: () => void;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isRunway = runwayCompact ?? compact;
  const cat = resolveCategory(event);
  const accent = OPS_CATEGORY_COLORS[cat];
  const status = statusMeta(event.status);
  const priority = priorityMeta(event.priority);

  return (
    <Box
      draggable={event.draggable}
      onDragStart={event.onDragStart}
      onDragEnter={isRunway ? allowBacklogDrop : undefined}
      onDragOver={isRunway ? allowBacklogDrop : undefined}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      sx={{
        width: '100%',
        minWidth: 0,
        maxWidth: '100%',
        borderRadius: isRunway ? '6px' : '8px',
        border: '1px solid',
        borderColor: isDark ? alpha(accent, 0.3) : alpha(accent, 0.22),
        borderLeftWidth: 3,
        borderLeftColor: accent,
        bgcolor: isDark ? alpha('#0f172a', 0.9) : '#ffffff',
        boxShadow: isDark
          ? '0 4px 16px rgba(0,0,0,0.3)'
          : '0 1px 2px rgba(15, 23, 42, 0.05), 0 4px 12px rgba(15, 23, 42, 0.06)',
        p: isRunway ? 1.25 : 1.75,
        cursor: onClick || event.draggable ? 'pointer' : 'default',
        overflow: 'hidden',
        transition: 'transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease',
        '&:hover':
          onClick || event.draggable
            ? {
                transform: 'translateY(-2px)',
                boxShadow: isDark
                  ? '0 10px 28px rgba(0,0,0,0.4)'
                  : '0 6px 20px rgba(15, 23, 42, 0.12)',
                borderColor: alpha(accent, 0.45),
              }
            : {},
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, minWidth: 0 }}>
        <Box sx={{ color: accent, display: 'flex', flexShrink: 0, mt: 0.15 }}>{categoryIcon(cat)}</Box>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: isRunway ? '0.75rem' : '0.875rem',
            lineHeight: 1.35,
            flex: 1,
            minWidth: 0,
            color: 'text.primary',
            display: '-webkit-box',
            WebkitLineClamp: isRunway ? 2 : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
          }}
        >
          {event.title}
        </Typography>
      </Box>

      <StackBadges
        isRunway={isRunway}
        cat={cat}
        accent={accent}
        status={status}
        priority={priority}
        riskLevel={event.riskLevel}
      />

      {!isRunway && event.description ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1, lineHeight: 1.45, wordBreak: 'break-word' }}
        >
          {event.description}
        </Typography>
      ) : null}

      {!isRunway ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.25, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {format(new Date(event.startDate), 'MMM d, yyyy · h:mm a')}
            {event.endDate !== event.startDate ? ` – ${format(new Date(event.endDate), 'h:mm a')}` : ''}
          </Typography>
          {event.location ? (
            <Typography variant="caption" color="text.secondary">
              · {event.location}
            </Typography>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}

function StackBadges({
  isRunway,
  cat,
  accent,
  status,
  priority,
  riskLevel,
}: {
  isRunway: boolean;
  cat: OpsTimelineCategory;
  accent: string;
  status: { label: string; bg: string; color: string };
  priority: { label: string; bg: string; color: string };
  riskLevel?: OpsRiskLevel;
}) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: isRunway ? 0.75 : 1 }}>
      <Chip
        size="small"
        label={OPS_CATEGORY_LABELS[cat]}
        sx={{
          height: 20,
          fontSize: '0.625rem',
          fontWeight: 700,
          bgcolor: alpha(accent, 0.12),
          color: accent,
          borderRadius: '4px',
        }}
      />
      <Chip
        size="small"
        label={status.label}
        sx={{
          height: 20,
          fontSize: '0.625rem',
          fontWeight: 700,
          bgcolor: status.bg,
          color: status.color,
          borderRadius: '4px',
        }}
      />
      <Chip
        size="small"
        label={priority.label}
        sx={{
          height: 20,
          fontSize: '0.625rem',
          fontWeight: 700,
          bgcolor: priority.bg,
          color: priority.color,
          borderRadius: '4px',
        }}
      />
      {riskLevel ? (
        <Chip
          size="small"
          label={`Risk ${riskLevel}`}
          sx={{
            height: 20,
            fontSize: '0.625rem',
            fontWeight: 700,
            bgcolor: alpha('#f87171', 0.12),
            color: '#dc2626',
            borderRadius: '4px',
            textTransform: 'capitalize',
          }}
        />
      ) : null}
    </Box>
  );
}
