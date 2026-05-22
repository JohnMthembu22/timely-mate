import React, { memo } from 'react';
import { Grid, Paper, Typography, Box, useTheme } from '@mui/material';
import { Clock } from 'lucide-react';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import { glassCardSx, metricLabelSx, metricValueSx } from '../../theme/surfaces';

/** Session KPI tile with its own timer — avoids re-rendering the full dashboard every second. */
export const SessionMetricsTile = memo(function SessionMetricsTile({
  isClockedIn,
  clockInTime,
}: {
  isClockedIn: boolean;
  clockInTime: string | null;
}) {
  const theme = useTheme();
  const elapsed = useElapsedTimer(isClockedIn, clockInTime);

  return (
    <Grid item xs={6} sm={6} md={6} lg={3}>
      <Paper
        elevation={0}
        sx={{
          ...glassCardSx(theme),
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography component="span" sx={metricLabelSx(theme)}>
            Session
          </Typography>
          <Typography variant="h4" sx={metricValueSx(theme)}>
            {isClockedIn ? elapsed : '—'}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', mt: 0.25 }}>
            {isClockedIn ? 'Elapsed today' : 'Clock in to track'}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            bgcolor: '#faf5ff',
          }}
        >
          <Clock size={22} color="#a855f7" strokeWidth={2} />
        </Box>
      </Paper>
    </Grid>
  );
});
