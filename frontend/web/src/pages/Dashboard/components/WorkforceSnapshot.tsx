import React, { memo } from 'react';
import { Box, Grid, Stack, Typography, alpha } from '@mui/material';
import { Users, Building2, Briefcase, Timer } from 'lucide-react';
import { DashboardPanel } from './DashboardPanel';
import type { WorkforceSnapshotData } from '../dashboardOpsData';
import { tmColors } from '../../../theme/designTokens';
import { useElapsedTimer } from '../../../hooks/useElapsedTimer';

function StatCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: '3px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: (t) => (t.palette.mode === 'dark' ? alpha('#fff', 0.03) : alpha('#000', 0.02)),
      }}
    >
      <Box sx={{ color: tmColors.neonBlueBright, mb: 0.5 }}>{icon}</Box>
      <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
    </Box>
  );
}

function SessionStatValue({
  clockedIn,
  clockInTime,
  fallback,
}: {
  clockedIn: boolean;
  clockInTime: string | null;
  fallback: string;
}) {
  const elapsed = useElapsedTimer(clockedIn, clockInTime);
  return <>{clockedIn ? elapsed : fallback}</>;
}

export const WorkforceSnapshot = memo(function WorkforceSnapshot({
  data,
  clockInTime = null,
}: {
  data: WorkforceSnapshotData;
  clockInTime?: string | null;
}) {
  return (
    <DashboardPanel
      title="Workforce snapshot"
      subtitle="Headcount and session status across your org"
      accent="emerald"
    >
      <Grid container spacing={1.25} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <StatCell icon={<Users size={18} />} label="People" value={String(data.totalPeople)} />
        </Grid>
        <Grid item xs={6}>
          <StatCell icon={<Building2 size={18} />} label="Departments" value={String(data.departments)} />
        </Grid>
        <Grid item xs={6}>
          <StatCell icon={<Briefcase size={18} />} label="Active jobs" value={String(data.activeJobs)} />
        </Grid>
        <Grid item xs={6}>
          <StatCell
            icon={<Timer size={18} />}
            label="Session"
            value={
              data.clockedIn ? (
                <SessionStatValue clockedIn clockInTime={clockInTime} fallback="Off" />
              ) : (
                'Off'
              )
            }
          />
        </Grid>
      </Grid>
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
        Top departments
      </Typography>
      <Stack spacing={0.75}>
        {data.topDepartments.length === 0 ? (
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>Import employees in HR to populate.</Typography>
        ) : (
          data.topDepartments.map((d) => (
            <Stack key={d.name} direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.primary' }} noWrap>
                {d.name}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: tmColors.emerald }}>{d.count}</Typography>
            </Stack>
          ))
        )}
      </Stack>
    </DashboardPanel>
  );
});
