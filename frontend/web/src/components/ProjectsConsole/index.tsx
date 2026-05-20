import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  Grid,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  Folder,
  Layers,
  Calendar,
  CheckCircle2,
  MoreVertical,
  Plus,
  LayoutGrid,
  Kanban,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export type ProjectViewMode = 'grid' | 'board';

export type ProjectPriority = 'High' | 'Medium' | 'Low';

export interface ProjectHubRow {
  id: string;
  name: string;
  desc: string;
  progress: number;
  tasks: string;
  priority: ProjectPriority;
  team: string[];
  dueLabel: string;
  color: string;
}

export interface ProjectMetric {
  label: string;
  value: string;
  icon: 'folder' | 'layers' | 'alert' | 'trend';
}

export interface ProjectMilestone {
  id: string;
  title: string;
  date: string;
  state: 'at-risk' | 'normal';
}

export interface ProjectsConsoleProps {
  projects: ProjectHubRow[];
  metrics: ProjectMetric[];
  milestones: ProjectMilestone[];
  viewMode: ProjectViewMode;
  onViewModeChange: (mode: ProjectViewMode) => void;
  onNewProject: () => void;
  onProjectClick: (projectId: string) => void;
  onProjectMenu?: (event: React.MouseEvent<HTMLElement>, projectId: string) => void;
}

const priorityStyles: Record<
  ProjectPriority,
  { bg: string; color: string; border: string }
> = {
  High: { bg: 'rgba(244, 63, 94, 0.08)', color: '#e11d48', border: 'rgba(244, 63, 94, 0.2)' },
  Medium: { bg: 'rgba(245, 158, 11, 0.08)', color: '#d97706', border: 'rgba(245, 158, 11, 0.2)' },
  Low: { bg: 'rgba(148, 163, 184, 0.12)', color: '#475569', border: 'rgba(148, 163, 184, 0.25)' },
};

const metricIconMap = {
  folder: Folder,
  layers: Layers,
  alert: AlertCircle,
  trend: TrendingUp,
};

const metricTone: Record<ProjectMetric['icon'], { bg: string; color: string }> = {
  folder: { bg: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' },
  layers: { bg: 'rgba(99, 102, 241, 0.08)', color: '#6366f1' },
  alert: { bg: 'rgba(244, 63, 94, 0.08)', color: '#f43f5e' },
  trend: { bg: 'rgba(16, 185, 129, 0.08)', color: '#10b981' },
};

const boardColumns: { key: string; label: string; min: number; max: number }[] = [
  { key: 'planning', label: 'Planning', min: 0, max: 33 },
  { key: 'active', label: 'In progress', min: 34, max: 66 },
  { key: 'delivery', label: 'Delivery', min: 67, max: 100 },
];

const ProjectsConsole: React.FC<ProjectsConsoleProps> = ({
  projects,
  metrics,
  milestones,
  viewMode,
  onViewModeChange,
  onNewProject,
  onProjectClick,
  onProjectMenu,
}) => {
  const renderProjectCard = (project: ProjectHubRow) => {
    const pill = priorityStyles[project.priority];
    return (
      <Paper
        key={project.id}
        elevation={0}
        onClick={() => onProjectClick(project.id)}
        sx={{
          p: 2.5,
          height: 224,
          borderRadius: 3,
          border: '1px solid #f1f5f9',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'box-shadow 150ms ease, border-color 150ms ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
            borderColor: '#e2e8f0',
            '& .project-title': { color: '#2563eb' },
          },
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography
                className="project-title"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  letterSpacing: '-0.01em',
                  transition: 'color 120ms ease',
                }}
              >
                {project.name}
              </Typography>
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  mt: 0.5,
                  px: 0.75,
                  py: 0.25,
                  fontSize: '0.5625rem',
                  fontWeight: 700,
                  borderRadius: 0.5,
                  border: '1px solid',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  bgcolor: pill.bg,
                  color: pill.color,
                  borderColor: pill.border,
                }}
              >
                {project.priority} Priority
              </Box>
            </Box>
            {onProjectMenu && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onProjectMenu?.(e, project.id);
                }}
                sx={{ color: '#94a3b8', '&:hover': { color: '#475569' } }}
              >
                <MoreVertical size={16} />
              </IconButton>
            )}
          </Box>
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: '#94a3b8',
              mt: 1.5,
              fontWeight: 500,
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {project.desc}
          </Typography>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircle2 size={14} color="#cbd5e1" />
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: '#94a3b8' }}>
                Tasks: <Box component="strong" sx={{ color: '#334155' }}>{project.tasks}</Box>
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: '#334155' }}>
              {project.progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={project.progress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: '#f1f5f9',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: `linear-gradient(90deg, ${project.color}, #6366f1)`,
              },
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pt: 1.5,
            borderTop: '1px solid #f8fafc',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Calendar size={14} color="#94a3b8" />
            <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 500 }}>
              Due {project.dueLabel}
            </Typography>
          </Box>
          <Stack direction="row" spacing={-0.75}>
            {project.team.slice(0, 4).map((initials, idx) => (
              <Avatar
                key={idx}
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: '0.5625rem',
                  fontWeight: 700,
                  bgcolor: '#1e293b',
                  border: '2px solid #fff',
                }}
              >
                {initials}
              </Avatar>
            ))}
          </Stack>
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ bgcolor: 'rgba(248, 250, 252, 0.3)', py: 3, px: { xs: 2, md: 3 }, minHeight: '100%' }}>
      <Box sx={{ maxWidth: 1600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid #f1f5f9',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { sm: 'center' },
            gap: 2,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', letterSpacing: '-0.02em' }}>
              Project Hub
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.25 }}>
              Track developmental phases, milestones, resource allocation profiles, and task completions.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                display: 'flex',
                bgcolor: '#f1f5f9',
                p: 0.5,
                borderRadius: 2,
                border: '1px solid rgba(226, 232, 240, 0.4)',
              }}
            >
              <IconButton
                size="small"
                onClick={() => onViewModeChange('grid')}
                sx={{
                  borderRadius: 1.5,
                  bgcolor: viewMode === 'grid' ? '#fff' : 'transparent',
                  color: viewMode === 'grid' ? '#1e293b' : '#94a3b8',
                  boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(15,23,42,0.06)' : 'none',
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
                  color: viewMode === 'board' ? '#1e293b' : '#94a3b8',
                  boxShadow: viewMode === 'board' ? '0 1px 2px rgba(15,23,42,0.06)' : 'none',
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
                fontWeight: 600,
                fontSize: '0.75rem',
                borderRadius: 2,
                px: 2,
                py: 1,
                bgcolor: '#0f172a',
                '&:hover': { bgcolor: '#1e293b' },
              }}
            >
              New Project Space
            </Button>
          </Stack>
        </Paper>

        {/* Metrics */}
        <Grid container spacing={2}>
          {metrics.map((m) => {
            const Icon = metricIconMap[m.icon];
            const tone = metricTone[m.icon];
            return (
              <Grid item xs={6} md={3} key={m.label}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {m.label}
                    </Typography>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', mt: 0.25 }}>
                      {m.value}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: tone.bg, color: tone.color, display: 'flex' }}>
                    <Icon size={16} />
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} lg={9}>
            {projects.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 8,
                  textAlign: 'center',
                  borderRadius: 3,
                  border: '1px dashed #e2e8f0',
                }}
              >
                <Folder size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                <Typography sx={{ fontWeight: 600, color: '#475569' }}>No projects yet</Typography>
                <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8', mt: 0.5, mb: 2 }}>
                  Create a project space to start tracking milestones and tasks.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Plus size={16} />}
                  onClick={onNewProject}
                  sx={{ textTransform: 'none', bgcolor: '#0f172a' }}
                >
                  New Project Space
                </Button>
              </Paper>
            ) : viewMode === 'grid' ? (
              <Grid container spacing={2.5}>
                {projects.map((project) => (
                  <Grid item xs={12} md={6} key={project.id}>
                    {renderProjectCard(project)}
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={2}>
                {boardColumns.map((col) => {
                  const colProjects = projects.filter(
                    (p) => p.progress >= col.min && p.progress <= col.max
                  );
                  return (
                    <Grid item xs={12} md={4} key={col.key}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: '1px solid #f1f5f9',
                          bgcolor: '#fafbfc',
                          minHeight: 280,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#475569',
                            mb: 2,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {col.label}{' '}
                          <Box component="span" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                            ({colProjects.length})
                          </Box>
                        </Typography>
                        <Stack spacing={1.5}>
                          {colProjects.length === 0 ? (
                            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', py: 2, textAlign: 'center' }}>
                              No projects
                            </Typography>
                          ) : (
                            colProjects.map((p) => (
                              <Paper
                                key={p.id}
                                elevation={0}
                                onClick={() => onProjectClick(p.id)}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  border: '1px solid #e2e8f0',
                                  bgcolor: '#fff',
                                  cursor: 'pointer',
                                  '&:hover': { borderColor: '#cbd5e1' },
                                }}
                              >
                                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1e293b' }}>
                                  {p.name}
                                </Typography>
                                <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', mt: 0.5 }}>
                                  {p.progress}% · {p.tasks} tasks
                                </Typography>
                              </Paper>
                            ))
                          )}
                        </Stack>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Grid>

          {/* Milestones sidebar */}
          <Grid item xs={12} lg={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid #f1f5f9',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>
                  Critical Milestones
                </Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', mt: 0.25 }}>
                  High priority checkpoints due inside this workspace cycle.
                </Typography>
              </Box>
              <Stack spacing={1.25}>
                {milestones.length === 0 ? (
                  <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>No upcoming milestones</Typography>
                ) : (
                  milestones.map((m) => (
                    <Paper
                      key={m.id}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                      }}
                    >
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                        {m.title}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mt: 1,
                        }}
                      >
                        <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: '#94a3b8' }}>
                          {m.date}
                        </Typography>
                        <Box
                          component="span"
                          sx={{
                            px: 0.75,
                            py: 0.25,
                            fontSize: '0.5rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            borderRadius: 0.5,
                            border: '1px solid',
                            ...(m.state === 'at-risk'
                              ? {
                                  bgcolor: 'rgba(244, 63, 94, 0.08)',
                                  color: '#e11d48',
                                  borderColor: 'rgba(244, 63, 94, 0.2)',
                                }
                              : {
                                  bgcolor: '#f8fafc',
                                  color: '#475569',
                                  borderColor: '#e2e8f0',
                                }),
                          }}
                        >
                          {m.state === 'at-risk' ? 'at-risk' : 'on track'}
                        </Box>
                      </Box>
                    </Paper>
                  ))
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>

    </Box>
  );
};

export default ProjectsConsole;
