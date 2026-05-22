import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Avatar,
  alpha,
} from '@mui/material';
import { Activity, Radio } from 'lucide-react';
import type { OperationsFeedItem } from './projectActivityFeed';
import { feedKindMeta, formatFeedTime, pulseFeedItem } from './projectActivityFeed';
import { sectionHeaderSx, sectionShellSx, sectionSubtitleSx, sectionTitleSx } from './projectsConsoleStyles';

export interface OperationsActivityFeedProps {
  items: OperationsFeedItem[];
  onItemClick?: (projectId: string) => void;
  maxHeight?: number;
}

export function OperationsActivityFeed({
  items,
  onItemClick,
  maxHeight,
}: OperationsActivityFeedProps) {
  const [feed, setFeed] = useState(items);

  useEffect(() => {
    setFeed(items);
  }, [items]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFeed((prev) => pulseFeedItem(prev));
    }, 8000);
    return () => window.clearInterval(id);
  }, []);

  const liveCount = feed.filter((f) => f.isLive).length;

  return (
    <Paper
      elevation={0}
      sx={{
        ...sectionShellSx,
        flex: '1 1 48%',
        minHeight: { xs: 220, lg: 0 },
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
    >
      <Box sx={sectionHeaderSx}>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Activity size={17} color="#0d9488" />
            <Typography sx={sectionTitleSx}>Operations activity feed</Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.35,
                borderRadius: 99,
                bgcolor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#10b981',
                  animation: 'feed-pulse 2s ease-in-out infinite',
                  '@keyframes feed-pulse': {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.4, transform: 'scale(1.35)' },
                  },
                }}
              />
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#059669' }}>
                Live
              </Typography>
            </Box>
          </Stack>
          <Typography sx={sectionSubtitleSx}>
            Slack-style operational stream — assignments, milestones, approvals, risks, and team moves.
          </Typography>
        </Box>
        {liveCount > 0 && (
          <Chip
            size="small"
            icon={<Radio size={10} />}
            label={`${liveCount} active`}
            sx={{ fontWeight: 700, fontSize: '0.6875rem', bgcolor: '#f0fdf4', color: '#166534' }}
          />
        )}
      </Box>

      <Stack
        spacing={0}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          ...(maxHeight != null ? { maxHeight } : {}),
        }}
      >
        {feed.length === 0 ? (
          <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8', p: 3, textAlign: 'center' }}>
            Waiting for operational events…
          </Typography>
        ) : (
          feed.map((item, idx) => {
            const meta = feedKindMeta(item.kind);
            const initials = item.actor
              .split(/\s+/)
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <Box
                key={item.id}
                onClick={() => onItemClick?.(item.projectId)}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  px: { xs: 1.25, sm: 1.5 },
                  py: 1.25,
                  cursor: onItemClick ? 'pointer' : 'default',
                  borderBottom: idx < feed.length - 1 ? '1px solid #f8fafc' : 'none',
                  borderLeft: '3px solid',
                  borderLeftColor: meta.color,
                  bgcolor: item.isLive ? alpha(meta.color, 0.04) : 'transparent',
                  transition: 'background 200ms ease',
                  position: 'relative',
                  '&:hover': { bgcolor: '#fafbfc' },
                  ...(item.isLive && {
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: meta.color,
                      boxShadow: `0 0 8px ${alpha(meta.color, 0.6)}`,
                      animation: 'feed-pulse 2s ease-in-out infinite',
                    },
                  }),
                }}
              >
                <Avatar
                  src={item.actorAvatar}
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    bgcolor: meta.color,
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" flexWrap="wrap" gap={0.5} alignItems="center" sx={{ mb: 0.35 }}>
                    <Chip
                      size="small"
                      label={meta.label}
                      sx={{
                        height: 18,
                        fontSize: '0.5625rem',
                        fontWeight: 800,
                        bgcolor: meta.bg,
                        color: meta.color,
                      }}
                    />
                    <Chip
                      size="small"
                      label={item.department}
                      sx={{ height: 18, fontSize: '0.5625rem', fontWeight: 600, bgcolor: '#f8fafc' }}
                    />
                    <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: '#94a3b8', ml: 'auto' }}>
                      {formatFeedTime(item.timestamp)}
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#0f172a', lineHeight: 1.45 }}>
                    <Box component="span" sx={{ fontWeight: 800 }}>
                      {item.actor}
                    </Box>{' '}
                    {item.message}{' '}
                    {item.highlight && (
                      <Box component="span" sx={{ fontWeight: 700, color: '#475569' }}>
                        {item.highlight}
                      </Box>
                    )}
                  </Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', mt: 0.35, fontWeight: 600 }}>
                    {item.projectName}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
      </Stack>
    </Paper>
  );
}
