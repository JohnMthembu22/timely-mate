import React from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Briefcase, TrendingUp, Users, Clock } from 'lucide-react';
import { ProjectCard, type ProjectCardProps } from '../ProjectCard/ProjectCard';
import { MetricsGrid, type MetricsGridItem } from '../MetricsGrid/MetricsGrid';

export type DashboardProjectTile = { id: string } & Omit<
  ProjectCardProps,
  'onCardClick' | 'onMenuClick'
>;

export interface MainDashboardContentProps {
  displayName: string;
  summaryLine?: string;
  /** Label shown in the profile strip (e.g. “Last updated: …”). */
  lastUpdatedLabel?: string;
  metrics: MetricsGridItem[];
  /** Tiles for the critical-projects grid (two columns from `md`). */
  projects: DashboardProjectTile[];
  /** Right column — typically `PersonalAttendanceTools`. */
  attendanceSidebar: React.ReactNode;
  /** Optional block rendered under project cards (e.g. recent activity list). */
  recentActivity?: React.ReactNode;
  onViewAllProjects?: () => void;
  onProjectCardClick?: (id: string) => void;
  onProjectMenuClick?: (id: string) => void;
}

/** Demo dataset aligned with the Tailwind reference — use when no live jobs exist. */
export const MAIN_DASHBOARD_SAMPLE_PROJECTS: DashboardProjectTile[] = [
  {
    id: 'sample-platform',
    title: 'Platform Development Sprint',
    department: 'IT / Product',
    progress: 68,
    dueDate: '28 May 2026',
    teamSize: 5,
  },
  {
    id: 'sample-brand',
    title: 'Brand Re-design Protocol',
    department: 'Creative / Marketing',
    progress: 42,
    dueDate: '04 Jun 2026',
    teamSize: 3,
  },
  {
    id: 'sample-mobile',
    title: 'Mobile Messaging Architecture',
    department: 'IT Engineering',
    progress: 90,
    dueDate: '24 May 2026',
    teamSize: 4,
  },
  {
    id: 'sample-data',
    title: 'Data Integration Engine',
    department: 'Data Science',
    progress: 15,
    dueDate: '18 Jun 2026',
    teamSize: 2,
  },
];

/** Optional starter KPI row for demos / loading shells. */
export const MAIN_DASHBOARD_SAMPLE_METRICS: MetricsGridItem[] = [
  {
    title: 'Active Projects',
    value: '4',
    change: 'Critical path items',
    icon: Briefcase,
    iconColor: '#3b82f6',
    iconBg: '#eff6ff',
  },
  {
    title: 'Avg. Progress',
    value: '54%',
    change: 'Across workspace sample',
    icon: TrendingUp,
    iconColor: '#10b981',
    iconBg: '#ecfdf5',
  },
  {
    title: 'Contributors',
    value: '14',
    change: 'Allocated headcount',
    icon: Users,
    iconColor: '#f59e0b',
    iconBg: '#fffbeb',
  },
  {
    title: 'Cycle Focus',
    value: 'May ’26',
    change: 'Current delivery window',
    icon: Clock,
    iconColor: '#a855f7',
    iconBg: '#faf5ff',
  },
];

/**
 * Primary dashboard canvas: profile strip → KPI metrics → 4-column master grid
 * (`lg`: main stream 9 cols + contextual sidebar 3 cols). MUI equivalent of the Tailwind layout.
 */
export function MainDashboardContent({
  displayName,
  summaryLine = 'Here is a summary of your workspace performance today.',
  lastUpdatedLabel = 'Last updated: Just now',
  metrics,
  projects,
  attendanceSidebar,
  recentActivity,
  onViewAllProjects,
  onProjectCardClick,
  onProjectMenuClick,
}: MainDashboardContentProps) {
  const theme = useTheme();

  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        bgcolor: 'rgba(248, 250, 252, 0.65)',
        minHeight: '100vh',
        py: { xs: 3, md: 4 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: theme.breakpoints.values.xl, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Profile header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
            bgcolor: '#fff',
            p: 3,
            borderRadius: 3,
            border: '1px solid #f1f5f9',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', letterSpacing: '-0.02em' }}>
              Welcome back, {displayName}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#64748b', mt: 0.5 }}>{summaryLine}</Typography>
          </Box>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#94a3b8',
              bgcolor: '#f8fafc',
              border: '1px solid #f1f5f9',
              px: 1.5,
              py: 0.75,
              borderRadius: 2,
              flexShrink: 0,
            }}
          >
            {lastUpdatedLabel}
          </Typography>
        </Box>

        <MetricsGrid metrics={metrics} />

        {/* Master grid: 3 + 1 at lg */}
        <Grid container spacing={4}>
          <Grid item xs={12} lg={9}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                  Critical projects
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.5 }}>
                  Active engineering and operations tasks requiring supervision.
                </Typography>
              </Box>
              {onViewAllProjects && (
                <Button
                  onClick={onViewAllProjects}
                  sx={{
                    flexShrink: 0,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    color: '#2563eb',
                    '&:hover': { color: '#1d4ed8', bgcolor: 'transparent' },
                  }}
                >
                  View all projects
                </Button>
              )}
            </Box>

            <Grid container spacing={2.5}>
              {projects.length === 0 ? (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      bgcolor: '#fff',
                      border: '1px solid #f1f5f9',
                      borderRadius: 3,
                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
                      p: 4,
                      textAlign: 'center',
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5 }}>No active jobs</Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: '#94a3b8', mb: 2 }}>
                      Start tracking time on a job to populate this grid.
                    </Typography>
                    {onViewAllProjects && (
                      <Button variant="contained" onClick={onViewAllProjects} sx={{ textTransform: 'none', fontWeight: 600 }}>
                        Go to time tracking
                      </Button>
                    )}
                  </Box>
                </Grid>
              ) : (
                projects.map((project) => (
                  <Grid item xs={12} md={6} key={project.id}>
                    <ProjectCard
                      title={project.title}
                      department={project.department}
                      progress={project.progress}
                      dueDate={project.dueDate}
                      teamSize={project.teamSize}
                      onCardClick={
                        onProjectCardClick ? () => onProjectCardClick(project.id) : undefined
                      }
                      onMenuClick={
                        onProjectMenuClick ? () => onProjectMenuClick(project.id) : undefined
                      }
                    />
                  </Grid>
                ))
              )}
            </Grid>

            {recentActivity}
          </Grid>

          <Grid item xs={12} lg={3}>
            {attendanceSidebar}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
