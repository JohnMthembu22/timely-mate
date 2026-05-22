import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  QrCode,
  Radio,
  Route,
  ShieldCheck,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { LiveIndicator } from '../../components/ProjectsConsole/ConsolePrimitives';
import type { FieldTimelineEvent, TimelineEventCategory } from './offsiteOpsTypes';
import { TIMELINE_CATEGORY_META } from './offsiteOpsMockData';
import { fieldHeaderSx, fieldLiveGlowSx, fieldPremiumShellSx, fieldSubtitleSx, fieldTitleSx } from './fieldOpsStyles';

const categoryIcon: Record<TimelineEventCategory, React.ElementType> = {
  check_in: UserCheck,
  site_arrival: MapPin,
  installation_complete: Wrench,
  scan: QrCode,
  issue: AlertTriangle,
  approval: ShieldCheck,
  route_change: Route,
  delay: Clock,
  photo_upload: Camera,
};

function TimelineEntry({
  event,
  isFirst,
  isLast,
  onSiteClick,
}: {
  event: FieldTimelineEvent;
  isFirst: boolean;
  isLast: boolean;
  onSiteClick?: () => void;
}) {
  const meta = TIMELINE_CATEGORY_META[event.category];
  const Icon = categoryIcon[event.category];

  return (
    <Stack direction="row" spacing={1.25} sx={{ position: 'relative', minHeight: 72 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
        {!isFirst && (
          <Box sx={{ width: 2, flex: 1, minHeight: 8, bgcolor: '#e2e8f0', borderRadius: 1 }} />
        )}
        <Box sx={{ position: 'relative' }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              fontSize: '0.6875rem',
              fontWeight: 800,
              bgcolor: alpha(event.actorColor, 0.15),
              color: event.actorColor,
              border: `2px solid ${event.isLive ? meta.color : '#fff'}`,
              boxShadow: event.isLive ? `0 0 12px ${alpha(meta.color, 0.45)}` : 'none',
              ...(event.isLive ? fieldLiveGlowSx : {}),
            }}
          >
            {event.actorInitials}
          </Avatar>
          <Box
            sx={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 18,
              height: 18,
              borderRadius: 1,
              bgcolor: '#fff',
              border: `1px solid ${alpha(meta.color, 0.35)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={10} color={meta.color} />
          </Box>
        </Box>
        {!isLast && (
          <Box sx={{ width: 2, flex: 1, minHeight: 8, bgcolor: '#e2e8f0', borderRadius: 1 }} />
        )}
      </Box>

      <Paper
        elevation={0}
        onClick={onSiteClick}
        sx={{
          flex: 1,
          p: 1.15,
          mb: isLast ? 0 : 1,
          borderRadius: 2,
          border: '1px solid',
          borderColor: event.isLive ? alpha(meta.color, 0.35) : '#e8edf4',
          bgcolor: event.isLive ? alpha(meta.color, 0.04) : '#fafbfc',
          cursor: onSiteClick ? 'pointer' : 'default',
          transition: 'all 180ms ease',
          '&:hover': onSiteClick
            ? {
                borderColor: meta.color,
                boxShadow: `0 6px 16px ${alpha(meta.color, 0.12)}`,
                transform: 'translateX(2px)',
              }
            : undefined,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={0.75}>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.5} flexWrap="wrap">
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>
                {event.actorName}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#475569' }}>{event.message}</Typography>
              {event.isLive && (
                <Chip
                  size="small"
                  icon={<Radio size={8} />}
                  label="Live"
                  sx={{
                    height: 18,
                    fontSize: '0.5rem',
                    fontWeight: 800,
                    bgcolor: alpha('#10b981', 0.12),
                    color: '#059669',
                    '& .MuiChip-icon': { color: '#10b981' },
                  }}
                />
              )}
            </Stack>
            {event.detail && (
              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', mt: 0.4, fontWeight: 600 }}>
                {event.detail}
              </Typography>
            )}
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.65 }} flexWrap="wrap">
              <Chip
                size="small"
                label={meta.label}
                sx={{
                  height: 20,
                  fontSize: '0.5625rem',
                  fontWeight: 800,
                  color: meta.color,
                  bgcolor: alpha(meta.color, 0.1),
                }}
              />
              <Stack direction="row" alignItems="center" spacing={0.35}>
                <Navigation size={10} color="#94a3b8" />
                <Typography sx={{ fontSize: '0.625rem', color: '#64748b', fontWeight: 600 }}>
                  {event.siteName}
                </Typography>
              </Stack>
            </Stack>
          </Box>
          <Stack alignItems="flex-end" spacing={0.25} sx={{ flexShrink: 0 }}>
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
              {format(new Date(event.timestamp), 'HH:mm')}
            </Typography>
            <Typography sx={{ fontSize: '0.5625rem', color: '#cbd5e1', fontWeight: 600 }}>
              {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}

export interface FieldActivityTimelineProps {
  events: FieldTimelineEvent[];
  onSiteClick?: (siteId: string) => void;
}

export function FieldActivityTimeline({ events, onSiteClick }: FieldActivityTimelineProps) {
  const [items, setItems] = useState(events);

  useEffect(() => {
    setItems(events);
  }, [events]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setItems((prev) => {
        if (prev.length === 0) return prev;
        const [head, ...rest] = prev;
        return [{ ...head, isLive: !head.isLive }, ...rest];
      });
    }, 8000);
    return () => window.clearInterval(id);
  }, []);

  const liveCount = items.filter((e) => e.isLive).length;

  return (
    <Paper elevation={0} sx={fieldPremiumShellSx}>
      <Box sx={fieldHeaderSx}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #0d9488 0%, #0ea5e9 100%)',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)',
            }}
          >
            <Radio size={18} color="#fff" />
          </Box>
          <Box>
            <Typography sx={fieldTitleSx}>Field activity timeline</Typography>
            <Typography sx={fieldSubtitleSx}>
              Mission log · check-ins · arrivals · scans · issues · approvals · routes
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center">
          {liveCount > 0 && (
            <Chip
              size="small"
              label={`${liveCount} live`}
              sx={{ height: 22, fontWeight: 800, fontSize: '0.625rem', bgcolor: '#ecfdf5', color: '#059669' }}
            />
          )}
          <LiveIndicator label="Streaming" />
        </Stack>
      </Box>

      <Box
        sx={{
          p: { xs: 1.25, sm: 1.5 },
          maxHeight: { xs: 420, md: 520 },
          overflow: 'auto',
          bgcolor: '#f8fafc',
        }}
      >
        {items.length === 0 ? (
          <Stack alignItems="center" py={4} spacing={1}>
            <CheckCircle2 size={32} color="#cbd5e1" />
            <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>
              Activity will stream here as crews operate in the field.
            </Typography>
          </Stack>
        ) : (
          items.map((event, idx) => (
            <TimelineEntry
              key={event.id}
              event={event}
              isFirst={idx === 0}
              isLast={idx === items.length - 1}
              onSiteClick={event.siteId && onSiteClick ? () => onSiteClick(event.siteId!) : undefined}
            />
          ))
        )}
      </Box>
    </Paper>
  );
}
