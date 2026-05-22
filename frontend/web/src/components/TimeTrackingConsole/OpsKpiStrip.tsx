import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useAnimatedNumber } from '../ProjectsConsole/useAnimatedNumber';
import type { TimeTrackingWorkforceIntel } from './timeTrackingWorkforceIntel';

function KpiCell({ label, value, suffix, accent }: { label: string; value: number; suffix?: string; accent: string }) {
  const n = useAnimatedNumber(value);
  return (
    <Box
      sx={{
        flex: '1 1 100px',
        minWidth: 88,
        p: 0.85,
        borderRadius: 1.5,
        border: '1px solid #e8edf4',
        bgcolor: '#fff',
        position: 'relative',
        overflow: 'hidden',
        '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 2, bgcolor: accent },
      }}
    >
      <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.06em' }}>{label}</Typography>
      <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', mt: 0.2, lineHeight: 1.1 }}>
        {n}
        {suffix}
      </Typography>
    </Box>
  );
}

export function OpsKpiStrip({ intel }: { intel: TimeTrackingWorkforceIntel }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 0.85,
        borderRadius: 2,
        border: '1px solid #e5eaf1',
        bgcolor: '#fff',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
        <KpiCell label="Active crew" value={intel.activeEmployees} accent="#10b981" />
        <KpiCell label="Live timers" value={intel.activeTimers} accent="#0ea5e9" />
        <KpiCell label="Utilization" value={intel.workforceUtilization} suffix="%" accent="#6366f1" />
        <KpiCell label="OT alerts" value={intel.overtimeAlertCount} accent="#f59e0b" />
        <KpiCell label="Late in" value={intel.lateCheckInCount} accent="#ef4444" />
        <KpiCell label="Anomalies" value={intel.anomalyCount} accent="#8b5cf6" />
      </Box>
    </Paper>
  );
}
