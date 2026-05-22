import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import { ExpandMore, Group } from '@mui/icons-material';
import { BarChart3, Building2, Radio } from 'lucide-react';
import { WorkforceIntelligencePanel } from './WorkforceIntelligencePanel';
import type { TimeTrackingWorkforceIntel } from './timeTrackingWorkforceIntel';
import { ttPremiumSx } from './timeTrackingStyles';

export interface TeamTimeStats {
  totalHours: number;
  activeProjects: number;
  completedTasks: number;
  averageProgress: number;
  totalTeamMembers: number;
  activeTeamMembers: number;
  assignedTeamMembers: number;
  departmentBreakdown: Record<string, number>;
}

export interface TeamAnalyticsZoneProps {
  stats: TeamTimeStats;
  activeJobsCount: number;
  hasTeamMembers: boolean;
  workforceIntel: TimeTrackingWorkforceIntel;
  onOpenTeamView: () => void;
}

type AnalyticsTab = 'overview' | 'departments' | 'activity' | 'intelligence';

function StatCell({ label, value, tip }: { label: string; value: string | number; tip?: string }) {
  const cell = (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 2.5, border: '1px solid #e8ecf1', bgcolor: '#fff', textAlign: 'center' }}>
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8' }}>{label}</Typography>
      <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', mt: 0.25, letterSpacing: '-0.02em' }}>{value}</Typography>
    </Paper>
  );
  return tip ? (
    <Tooltip title={tip} arrow>
      {cell}
    </Tooltip>
  ) : (
    cell
  );
}

export function TeamAnalyticsZone({
  stats,
  activeJobsCount,
  hasTeamMembers,
  workforceIntel,
  onOpenTeamView,
}: TeamAnalyticsZoneProps) {
  const [tab, setTab] = useState<AnalyticsTab>('overview');

  return (
    <Accordion
      defaultExpanded={false}
      disableGutters
      elevation={0}
      sx={{
        ...ttPremiumSx,
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 1.25, minHeight: 44, '& .MuiAccordionSummary-content': { my: 0.75 } }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <BarChart3 size={16} color="#6366f1" />
          <Box>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Team analytics</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>{stats.totalTeamMembers} members</Typography>
          </Box>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 1.25, pt: 0, pb: 1.25 }}>
        <Tabs
          value={tab}
          onChange={(_, v: AnalyticsTab) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 32,
            mb: 1,
            '& .MuiTab-root': { minHeight: 32, py: 0.25, fontSize: '0.6875rem', fontWeight: 700, textTransform: 'none' },
          }}
        >
          <Tab value="overview" label="Overview" />
          <Tab value="departments" label="Departments" icon={<Building2 size={12} />} iconPosition="start" />
          <Tab value="activity" label="Activity" icon={<Radio size={12} />} iconPosition="start" />
          <Tab value="intelligence" label="Intelligence" />
        </Tabs>

        {tab === 'overview' && (
          <Stack spacing={1}>
            <Grid container spacing={0.75}>
              <Grid item xs={6} sm={3}>
                <StatCell label="Hours" value={`${stats.totalHours}h`} tip="All projects today" />
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCell label="Active projects" value={stats.activeProjects} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCell label="Team" value={stats.totalTeamMembers} tip={`${stats.assignedTeamMembers} assigned`} />
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCell label="Avg progress" value={`${stats.averageProgress}%`} />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              {hasTeamMembers ? (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Group />}
                  onClick={onOpenTeamView}
                  sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2 }}
                >
                  View team progress
                </Button>
              ) : (
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Import employees via HR to enable team management.
                </Typography>
              )}
            </Box>
          </Stack>
        )}

        {tab === 'departments' && (
          <Grid container spacing={0.75}>
            {Object.keys(stats.departmentBreakdown).length === 0 ? (
              <Grid item xs={12}>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', py: 2, textAlign: 'center' }}>No department data yet.</Typography>
              </Grid>
            ) : (
              Object.entries(stats.departmentBreakdown).map(([dept, count]) => (
                <Grid item xs={6} sm={4} md={3} key={dept}>
                  <StatCell label={dept} value={count} tip="members" />
                </Grid>
              ))
            )}
          </Grid>
        )}

        {tab === 'activity' && (
          <Grid container spacing={0.75}>
            <Grid item xs={6} sm={3}>
              <StatCell label="Active members" value={stats.activeTeamMembers} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCell label="Completed tasks" value={stats.completedTasks} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCell label="Total jobs" value={activeJobsCount} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCell
                label="Utilization"
                value={`${Math.round((stats.assignedTeamMembers / stats.totalTeamMembers) * 100) || 0}%`}
              />
            </Grid>
          </Grid>
        )}

        {tab === 'intelligence' && <WorkforceIntelligencePanel data={workforceIntel} />}
      </AccordionDetails>
    </Accordion>
  );
}
