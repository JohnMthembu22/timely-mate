import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  Grid,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Folder,
  Plus,
  LayoutGrid,
  Kanban,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  aiBadgeSx,
  consoleInnerSx,
  consolePageSx,
  consoleSplitLayoutSx,
  sectionHeaderSx,
  sectionShellSx,
  sectionSubtitleSx,
  sectionTitleSx,
  sidebarStackSx,
  workspaceGridSx,
} from './projectsConsoleStyles';
import { ConsoleLoadingSkeleton } from './ConsolePrimitives';
import type { ProjectAiInsight } from './projectAiInsightTypes';
import { ProjectAiInsightsSection } from './ProjectAiInsightsSection';
import { ProjectWorkspaceCard } from './ProjectWorkspaceCard';
import { SmartAssignmentHub } from './SmartAssignmentHub';
import { OperationsActivityFeed } from './OperationsActivityFeed';
import { OperationalAnalyticsStrip } from './OperationalAnalyticsStrip';
import { CriticalMilestonesPanel } from './CriticalMilestonesPanel';
import {
  ProjectsCommandFilters,
  type CommandQuickActionId,
} from './ProjectsCommandFilters';
import { buildOperationalMetrics } from './projectOperationalAnalytics';
import {
  defaultProjectFilters,
  filterAndSortProjects,
  type ProjectFilterState,
} from './projectConsoleFilters';
import type {
  AssignmentQueueItem,
  SmartAssignmentInsight,
  TeamAvailabilityLane,
} from './projectAssignmentHub';
export type { AssignmentQueueItem } from './projectAssignmentHub';
import type { OperationsFeedItem } from './projectActivityFeed';
import type { ProjectHubRow } from './projectHubTypes';
export type { ProjectHubRow, ProjectPriority } from './projectHubTypes';
export type { ProjectMilestone, OperationalMilestone } from './projectMilestoneTypes';
export type { CommandQuickActionId } from './ProjectsCommandFilters';

export type ProjectViewMode = 'grid' | 'board';

/** @deprecated Use buildOperationalMetrics — kept for parent compatibility */
export interface ProjectMetric {
  label: string;
  value: string;
  icon: 'folder' | 'layers' | 'alert' | 'trend';
  delta?: string;
  deltaUp?: boolean;
}

export interface ProjectsConsoleProps {
  projects: ProjectHubRow[];
  /** @deprecated Operational analytics are computed inside the console */
  metrics?: ProjectMetric[];
  milestones: import('./projectMilestoneTypes').OperationalMilestone[];
  insights: ProjectAiInsight[];
  assignmentInsights: SmartAssignmentInsight[];
  assignmentQueue: AssignmentQueueItem[];
  teamLanes: TeamAvailabilityLane[];
  operationsFeed: OperationsFeedItem[];
  departments: string[];
  projectOptions: { id: string; name: string }[];
  employeeCount?: number;
  viewMode: ProjectViewMode;
  onViewModeChange: (mode: ProjectViewMode) => void;
  onNewProject: () => void;
  onProjectClick: (projectId: string) => void;
  onProjectTasks?: (projectId: string) => void;
  onProjectMenu?: (event: React.MouseEvent<HTMLElement>, projectId: string) => void;
  onQuickAssign: (item: AssignmentQueueItem, teamMemberId: string) => void;
  onCommandAction?: (action: CommandQuickActionId) => void;
  onNotifyTeam?: (projectId: string) => void;
  /** Show premium skeleton while portfolio hydrates */
  isLoading?: boolean;
}

const boardColumns: { key: string; label: string; min: number; max: number }[] = [
  { key: 'planning', label: 'Planning', min: 0, max: 33 },
  { key: 'active', label: 'In progress', min: 34, max: 66 },
  { key: 'delivery', label: 'Delivery', min: 67, max: 100 },
];

const ProjectsConsole: React.FC<ProjectsConsoleProps> = ({
  projects,
  milestones,
  insights,
  assignmentInsights,
  assignmentQueue,
  teamLanes,
  operationsFeed,
  departments,
  projectOptions,
  employeeCount = 0,
  viewMode,
  onViewModeChange,
  onNewProject,
  onProjectClick,
  onProjectTasks,
  onProjectMenu,
  onQuickAssign,
  onCommandAction,
  onNotifyTeam,
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<ProjectFilterState>(defaultProjectFilters);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const consoleDepartments = useMemo(
    () => [...new Set([...departments, ...projects.map((p) => p.department)])].filter(Boolean).sort(),
    [departments, projects]
  );

  const filteredProjects = useMemo(
    () => filterAndSortProjects(projects, filters),
    [projects, filters]
  );

  const operationalMetrics = useMemo(
    () => buildOperationalMetrics(projects, employeeCount),
    [projects, employeeCount]
  );

  const portfolioHealth = useMemo(() => {
    if (projects.length === 0) return 0;
    return Math.round(
      projects.reduce((s, p) => s + p.healthScore, 0) / projects.length
    );
  }, [projects]);

  const handleFiltersChange = useCallback((patch: Partial<ProjectFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleQuickAction = useCallback(
    (action: CommandQuickActionId) => {
      if (onCommandAction) {
        onCommandAction(action);
        return;
      }
      const labels: Record<CommandQuickActionId, string> = {
        'generate-report': 'Generating operational report…',
        'assign-resources': 'Opening assignment hub…',
        'launch-meeting': 'Launching team meeting…',
        'open-timeline': 'Opening delivery timeline…',
        'export-dashboard': 'Exporting dashboard snapshot…',
        'notify-team': 'Notifying project teams…',
      };
      setActionToast(labels[action]);
    },
    [onCommandAction]
  );

  const workspaceContent =
    filteredProjects.length === 0 ? (
      <Box sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
        <Folder size={44} color="#94a3b8" style={{ margin: '0 auto 14px' }} />
        <Typography sx={{ fontWeight: 800, color: '#334155', fontSize: '1.0625rem' }}>
          {projects.length === 0 ? 'No project workspaces yet' : 'No projects match your filters'}
        </Typography>
        <Typography sx={{ fontSize: '0.875rem', color: '#64748b', mt: 0.75, mb: 2.5, maxWidth: 420, mx: 'auto' }}>
          {projects.length === 0
            ? 'Create a project space to activate milestones, task routing, and operational intelligence for your portfolio.'
            : 'Adjust search, department, status, or utilization filters to see more workspaces.'}
        </Typography>
        {projects.length === 0 ? (
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={onNewProject}
            sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#0f172a', borderRadius: 2 }}
          >
            New Project Space
          </Button>
        ) : (
          <Button
            variant="outlined"
            onClick={() => setFilters(defaultProjectFilters)}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Clear filters
          </Button>
        )}
      </Box>
    ) : viewMode === 'grid' ? (
      <Box sx={workspaceGridSx}>
        {filteredProjects.map((project) => (
          <ProjectWorkspaceCard
            key={project.id}
            project={project}
            onOpen={() => onProjectClick(project.id)}
            onOpenTasks={onProjectTasks ? () => onProjectTasks(project.id) : undefined}
            onProjectMenu={onProjectMenu}
          />
        ))}
      </Box>
    ) : (
      <Grid container spacing={1.5} sx={{ p: { xs: 1.25, sm: 1.5, md: 1.75 } }}>
        {boardColumns.map((col) => {
          const colProjects = filteredProjects.filter(
            (p) => p.progress >= col.min && p.progress <= col.max
          );
          return (
            <Grid item xs={12} md={4} key={col.key}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px dashed #e2e8f0',
                  bgcolor: '#fafbfc',
                  minHeight: { xs: 200, md: 240 },
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    color: '#475569',
                    mb: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {col.label}{' '}
                  <Box component="span" sx={{ color: '#94a3b8' }}>
                    ({colProjects.length})
                  </Box>
                </Typography>
                <Stack spacing={1.5}>
                  {colProjects.length === 0 ? (
                    <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', py: 3, textAlign: 'center' }}>
                      Drop projects here as they advance
                    </Typography>
                  ) : (
                    colProjects.map((p) => (
                      <Paper
                        key={p.id}
                        elevation={0}
                        onClick={() => onProjectClick(p.id)}
                        sx={{
                          p: 1.75,
                          borderRadius: 2,
                          border: '1px solid #e8edf4',
                          bgcolor: '#fff',
                          cursor: 'pointer',
                          transition: 'all 150ms ease',
                          '&:hover': {
                            borderColor: '#cbd5e1',
                            boxShadow: '0 6px 16px rgba(15,23,42,0.06)',
                          },
                        }}
                      >
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
                          {p.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.5 }}>
                          {p.progress}% · {p.tasks} tasks
                        </Typography>
                      </Paper>
                    ))
                  )}
                </Stack>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    );

  return (
    <Box sx={consolePageSx}>
      <Snackbar
        open={Boolean(actionToast)}
        autoHideDuration={3500}
        onClose={() => setActionToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" onClose={() => setActionToast(null)} sx={{ fontWeight: 600 }}>
          {actionToast}
        </Alert>
      </Snackbar>

      <Box sx={consoleInnerSx}>
        {isLoading ? (
          <ConsoleLoadingSkeleton />
        ) : (
          <>
        <Paper elevation={0} sx={{ ...sectionShellSx, p: { xs: 1.25, sm: 1.5, md: 1.75 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { md: 'center' },
              gap: 2,
            }}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <Typography
                  sx={{ fontSize: { xs: '0.9375rem', md: '1.0625rem' }, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}
                >
                  Project command center
                </Typography>
                <Box sx={aiBadgeSx}>
                  <Sparkles size={10} />
                  AI-assisted
                </Box>
              </Stack>
              <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', maxWidth: 640, lineHeight: 1.5 }}>
                Executive analytics, smart filtering, milestone runway, and live operations — enterprise-grade
                portfolio control without leaving your workspace.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
              <Chip
                size="small"
                icon={<Target size={12} />}
                label={`Health ${portfolioHealth}%`}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  bgcolor: portfolioHealth >= 70 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                  color: portfolioHealth >= 70 ? '#059669' : '#d97706',
                  border: '1px solid',
                  borderColor:
                    portfolioHealth >= 70 ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)',
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  bgcolor: '#f1f5f9',
                  p: 0.5,
                  borderRadius: 2,
                  border: '1px solid #e8edf4',
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => onViewModeChange('grid')}
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: viewMode === 'grid' ? '#fff' : 'transparent',
                    color: viewMode === 'grid' ? '#0f172a' : '#94a3b8',
                    boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(15,23,42,0.08)' : 'none',
                  }}
                >
                  <LayoutGrid size={16} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onViewModeChange('board')}
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: viewMode === 'board' ? '#fff' : 'transparent',
                    color: viewMode === 'board' ? '#0f172a' : '#94a3b8',
                    boxShadow: viewMode === 'board' ? '0 1px 3px rgba(15,23,42,0.08)' : 'none',
                  }}
                >
                  <Kanban size={16} />
                </IconButton>
              </Box>
              <Button
                data-tour="new-project"
                variant="contained"
                disableElevation
                startIcon={<Plus size={14} />}
                onClick={onNewProject}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  borderRadius: 2,
                  px: 2.25,
                  py: 1.1,
                  bgcolor: '#0f172a',
                  '&:hover': { bgcolor: '#1e293b' },
                }}
              >
                New Project Space
              </Button>
            </Stack>
          </Box>
        </Paper>

        <OperationalAnalyticsStrip metrics={operationalMetrics} />

        <ProjectsCommandFilters
          filters={filters}
          departments={consoleDepartments}
          resultCount={filteredProjects.length}
          totalCount={projects.length}
          onFiltersChange={handleFiltersChange}
          onQuickAction={handleQuickAction}
        />

        <ProjectAiInsightsSection insights={insights} onProjectClick={onProjectClick} />

        <SmartAssignmentHub
          insights={assignmentInsights}
          queue={assignmentQueue}
          teamLanes={teamLanes}
          departments={departments}
          projectOptions={projectOptions}
          onAssignToProject={onProjectClick}
          onQuickAssign={onQuickAssign}
        />

        <Box sx={consoleSplitLayoutSx}>
          <Paper elevation={0} sx={{ ...sectionShellSx, minWidth: 0 }}>
            <Box sx={sectionHeaderSx}>
              <Box>
                <Typography sx={sectionTitleSx}>Project workspace</Typography>
                <Typography sx={sectionSubtitleSx}>
                  {filteredProjects.length} of {projects.length} pipeline
                  {projects.length !== 1 ? 's' : ''} · grid or board delivery views.
                </Typography>
              </Box>
            </Box>
            {workspaceContent}
          </Paper>

          <Box sx={sidebarStackSx}>
            <CriticalMilestonesPanel
              milestones={milestones}
              onProjectClick={onProjectClick}
              onNotifyTeam={onNotifyTeam}
            />
            <OperationsActivityFeed
              items={operationsFeed}
              onItemClick={onProjectClick}
            />
          </Box>
        </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ProjectsConsole;
