import React, { memo } from 'react';
import { Box, Button, Grid, Stack, Typography, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Briefcase, TrendingUp, Users, Clock } from 'lucide-react';
import { ProjectCard, type ProjectCardProps } from '../ProjectCard/ProjectCard';
import type { MetricsGridItem } from '../MetricsGrid/MetricsGrid';
import { glassCardSx } from '../../theme/surfaces';
import { tmColors, tmGradients } from '../../theme/designTokens';
import { ExecutiveSummaryStrip } from '../../pages/Dashboard/components/ExecutiveSummaryStrip';
import { QuickActionsBar, type QuickActionItem } from '../../pages/Dashboard/components/QuickActionsBar';
import { AiInsightsPanel } from '../AiInsightsPanel';
import { ProjectHealthOverview } from '../../pages/Dashboard/components/ProjectHealthOverview';
import { WorkforceSnapshot } from '../../pages/Dashboard/components/WorkforceSnapshot';
import { LiveActivityFeed } from '../../pages/Dashboard/components/LiveActivityFeed';
import type { ProjectHealthRow } from '../../pages/Dashboard/dashboardOpsData';
import type { WorkforceSnapshotData } from '../../pages/Dashboard/dashboardOpsData';
import type { LiveActivityItem } from '../../pages/Dashboard/dashboardOpsData';

export type DashboardProjectTile = { id: string } & Omit<
  ProjectCardProps,
  'onCardClick' | 'onMenuClick'
>;

export interface MainDashboardContentProps {
  displayName: string;
  summaryLine?: string;
  lastUpdatedLabel?: string;
  metrics: MetricsGridItem[];
  projects: DashboardProjectTile[];
  attendanceSidebar: React.ReactNode;
  recentActivity?: React.ReactNode;
  onViewAllProjects?: () => void;
  onProjectCardClick?: (id: string) => void;
  onProjectMenuClick?: (id: string) => void;
  onProjectTrackClick?: (id: string) => void;
  quickActions?: QuickActionItem[];
  managementActions?: QuickActionItem[];
  projectHealth?: ProjectHealthRow[];
  workforce?: WorkforceSnapshotData;
  liveActivity?: LiveActivityItem[];
  atRiskCount?: number;
  unreadCount?: number;
  onViewAllActivities?: () => void;
  isClockedIn?: boolean;
  clockInTime?: string | null;
}

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
 * AI-powered operations command center — profile, executive KPIs, insights,
 * project health, critical projects, workforce, live feed, and attendance.
 */
export const MainDashboardContent = memo(function MainDashboardContent({
  displayName,
  summaryLine = 'Operations command center — live view of delivery, people, and signals.',
  lastUpdatedLabel = 'Last updated: Just now',
  metrics,
  projects,
  attendanceSidebar,
  recentActivity,
  onViewAllProjects,
  onProjectCardClick,
  onProjectMenuClick,
  onProjectTrackClick,
  quickActions = [],
  managementActions = [],
  projectHealth = [],
  workforce,
  liveActivity = [],
  atRiskCount = 0,
  unreadCount = 0,
  onViewAllActivities,
  isClockedIn = false,
  clockInTime = null,
}: MainDashboardContentProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        bgcolor: isDark ? 'background.default' : 'rgba(248, 250, 252, 0.65)',
        minHeight: '100vh',
        py: { xs: 2, md: 3 },
        px: { xs: 1.5, sm: 2.5, md: 4 },
        overflowX: 'hidden',
        maxWidth: '100%',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: theme.breakpoints.values.xl,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 2.5, md: 3 },
        }}
      >
        {/* Command center header */}
        <Box
          sx={{
            ...glassCardSx(theme),
            p: { xs: 2, md: 2.5 },
            background: isDark
              ? `linear-gradient(135deg, ${alpha(tmColors.charcoal800, 0.95)} 0%, ${alpha(tmColors.charcoal900, 0.98)} 100%)`
              : undefined,
            border: `1px solid ${isDark ? tmColors.borderSubtle : 'divider'}`,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: isClockedIn ? tmColors.emerald : '#fbbf24',
                    boxShadow: isClockedIn ? `0 0 10px ${tmColors.emerald}` : undefined,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: tmColors.neonBlueBright,
                  }}
                >
                  Operations command center
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: { xs: '1.35rem', md: '1.5rem' }, fontWeight: 700, color: 'text.primary', letterSpacing: '-0.03em' }}>
                Welcome back, {displayName}
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', mt: 0.5, maxWidth: 560 }}>
                {summaryLine}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: { xs: 'flex-start', md: 'flex-end' },
                  gap: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    bgcolor: isDark ? alpha('#fff', 0.04) : '#f8fafc',
                    border: '1px solid',
                    borderColor: 'divider',
                    px: 1.5,
                    py: 0.75,
                    borderRadius: '3px',
                  }}
                >
                  {lastUpdatedLabel}
                </Typography>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: '3px',
                    background: tmGradients.heroAccent,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    AI-assisted oversight
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {quickActions.length > 0 && (
          <QuickActionsBar primaryActions={quickActions} managementActions={managementActions} />
        )}

        <ExecutiveSummaryStrip
          metrics={metrics}
          atRiskCount={atRiskCount}
          unreadCount={unreadCount}
          isClockedIn={isClockedIn}
          clockInTime={clockInTime}
        />

        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          <Grid item xs={12} lg={7}>
            <AiInsightsPanel useMockData />
          </Grid>
          <Grid item xs={12} lg={5}>
            {workforce ? <WorkforceSnapshot data={workforce} clockInTime={clockInTime} /> : null}
          </Grid>
        </Grid>

        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          <Grid item xs={12}>
            <ProjectHealthOverview rows={projectHealth} onViewAll={onViewAllProjects} />
          </Grid>
        </Grid>

        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          <Grid item xs={12} lg={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>Critical projects</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.35 }}>
                  Active engineering and operations tasks requiring supervision
                </Typography>
              </Box>
              {onViewAllProjects && (
                <Button
                  onClick={onViewAllProjects}
                  sx={{
                    flexShrink: 0,
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    textTransform: 'none',
                    color: isDark ? tmColors.neonBlueBright : 'primary.main',
                  }}
                >
                  View all projects
                </Button>
              )}
            </Box>
            <Box
              role="region"
              aria-label="Critical projects list"
              sx={{
                maxHeight: { xs: 'min(48vh, 400px)', md: 'min(52vh, 440px)' },
                overflowY: 'auto',
                overflowX: 'hidden',
                pr: 0.75,
                borderRadius: '3px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: isDark ? alpha('#000', 0.2) : alpha('#fff', 0.5),
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-thumb': {
                  borderRadius: 3,
                  bgcolor: isDark ? alpha('#fff', 0.18) : alpha('#000', 0.15),
                },
              }}
            >
              <Grid container spacing={2} sx={{ p: { xs: 1.5, sm: 2 } }}>
                {projects.length === 0 ? (
                  <Grid item xs={12}>
                    <Box sx={{ ...glassCardSx(theme), p: 4, textAlign: 'center' }}>
                      <Typography sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>No active jobs</Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', mb: 2 }}>
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
                    <Grid item xs={12} sm={6} key={project.id}>
                      <ProjectCard
                        id={project.id}
                        title={project.title}
                        department={project.department}
                        progress={project.progress}
                        dueDate={project.dueDate}
                        teamSize={project.teamSize}
                        status={project.status}
                        riskScore={project.riskScore}
                        budgetHealth={project.budgetHealth}
                        budgetLabel={project.budgetLabel}
                        aiRecommendation={project.aiRecommendation}
                        onCardClick={onProjectCardClick ? () => onProjectCardClick(project.id) : undefined}
                        onMenuClick={
                          onProjectMenuClick
                            ? (e) => {
                                e.stopPropagation();
                                onProjectMenuClick(project.id);
                              }
                            : undefined
                        }
                        onTrackClick={
                          onProjectTrackClick
                            ? (e) => {
                                e.stopPropagation();
                                onProjectTrackClick(project.id);
                              }
                            : undefined
                        }
                      />
                    </Grid>
                  ))
                )}
              </Grid>
            </Box>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Box sx={{ position: { lg: 'sticky' }, top: { lg: 16 } }}>{attendanceSidebar}</Box>
          </Grid>
        </Grid>

        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          <Grid item xs={12}>
            <LiveActivityFeed
              items={liveActivity}
              onViewAll={onViewAllActivities}
              legacyActivitySlot={recentActivity}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
});
