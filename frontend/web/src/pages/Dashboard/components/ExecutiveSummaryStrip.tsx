import React, { memo } from 'react';
import { Box, Chip, Grid, Stack, Typography, alpha } from '@mui/material';
import { MetricsGrid, type MetricsGridItem } from '../../../components/MetricsGrid/MetricsGrid';
import { SessionMetricsTile } from '../../../components/MetricsGrid/SessionMetricsTile';
import { tmColors } from '../../../theme/designTokens';

export const ExecutiveSummaryStrip = memo(function ExecutiveSummaryStrip({
  metrics,
  atRiskCount,
  unreadCount,
  isClockedIn = false,
  clockInTime = null,
}: {
  metrics: MetricsGridItem[];
  atRiskCount: number;
  unreadCount: number;
  isClockedIn?: boolean;
  clockInTime?: string | null;
}) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary', letterSpacing: '-0.02em' }}>
            Executive summary
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            KPI pulse across workspaces, people, and session
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {atRiskCount > 0 && (
            <Chip
              label={`${atRiskCount} at-risk`}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.6875rem',
                bgcolor: alpha('#fbbf24', 0.15),
                color: '#fbbf24',
                border: `1px solid ${alpha('#fbbf24', 0.35)}`,
              }}
            />
          )}
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} unread`}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.6875rem',
                bgcolor: alpha(tmColors.neonBlue, 0.15),
                color: tmColors.neonBlueBright,
                border: `1px solid ${alpha(tmColors.neonBlue, 0.35)}`,
              }}
            />
          )}
          <Chip
            label="Live"
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.6875rem',
              bgcolor: alpha(tmColors.emerald, 0.15),
              color: tmColors.emerald,
              border: `1px solid ${alpha(tmColors.emerald, 0.35)}`,
              '&::before': {
                content: '""',
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: tmColors.emerald,
                boxShadow: `0 0 8px ${tmColors.emerald}`,
                mr: 0.5,
              },
            }}
          />
        </Stack>
      </Stack>
      <Grid container spacing={2.5}>
        <MetricsGrid metrics={metrics} embedded />
        <SessionMetricsTile isClockedIn={isClockedIn} clockInTime={clockInTime} />
      </Grid>
    </Box>
  );
});
