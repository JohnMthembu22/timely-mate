import React, { useEffect, useState } from 'react';
import { Avatar, Box, Stack, Tooltip, Typography, alpha } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import type { TeamActivityEvent, TeamActivityCategory } from './teamActivityTypes';

function shortSummary(event: TeamActivityEvent): string {
  const first = event.actorName.split(/\s+/)[0] ?? event.actorName;
  switch (event.category) {
    case 'check_in':
      return `${first} checked in`;
    case 'project_switch':
      return `${first} switched project`;
    case 'overtime_alert':
      return `${first} — OT alert`;
    case 'task_complete':
      return `${first} completed task`;
    case 'milestone':
      return `${first} hit milestone`;
    case 'break':
      return `${first} started break`;
    case 'approval':
      return `${first} submitted for review`;
    case 'shift_change':
      return `${first} ended shift`;
    case 'remote_check_in':
      return `${first} remote check-in`;
    default:
      return event.message;
  }
}

const statusColor: Record<TeamActivityCategory, string> = {
  check_in: '#10b981',
  project_switch: '#6366f1',
  overtime_alert: '#f59e0b',
  task_complete: '#0ea5e9',
  milestone: '#8b5cf6',
  break: '#94a3b8',
  approval: '#64748b',
  shift_change: '#475569',
  remote_check_in: '#14b8a6',
};

function FeedEntry({ event }: { event: TeamActivityEvent }) {
  const summary = shortSummary(event);
  const color = statusColor[event.category];
  const timeLabel = event.timestamp
    ? formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })
    : 'now';
  const detailTip = [event.message, event.detail, event.department].filter(Boolean).join(' · ');

  return (
    <Tooltip title={detailTip} arrow placement="left">
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          py: 0.65,
          px: 0.5,
          mx: -0.5,
          borderRadius: 1.5,
          cursor: 'default',
          '&:hover': { bgcolor: '#f8fafc' },
        }}
      >
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          <Avatar
            sx={{
              width: 28,
              height: 28,
              fontSize: '0.5625rem',
              fontWeight: 700,
              bgcolor: alpha(event.actorColor, 0.12),
              color: event.actorColor,
            }}
          >
            {event.actorInitials}
          </Avatar>
          {event.isLive && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: '#22c55e',
                border: '1.5px solid #fff',
              }}
            />
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.3 }} noWrap>
            {summary}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: color,
            opacity: 0.85,
            flexShrink: 0,
          }}
        />
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 500,
            color: '#94a3b8',
            flexShrink: 0,
            minWidth: 48,
            textAlign: 'right',
          }}
        >
          {timeLabel}
        </Typography>
      </Stack>
    </Tooltip>
  );
}

export interface TeamActivityFeedProps {
  events: TeamActivityEvent[];
  maxHeight?: number;
  embedded?: boolean;
}

export function TeamActivityFeed({ events, maxHeight = 300, embedded = false }: TeamActivityFeedProps) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30000);
    return () => window.clearInterval(id);
  }, []);
  void tick;

  const content = (
    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.25 }}>
      {events.map((ev) => (
        <FeedEntry key={ev.id} event={ev} />
      ))}
    </Box>
  );

  if (embedded) return content;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight, minHeight: 0 }}>
      {content}
    </Box>
  );
}
