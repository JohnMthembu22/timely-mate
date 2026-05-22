import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Stack,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  MoreVertical,
  Calendar,
  Sparkles,
  Activity,
  Users,
  Wallet,
  Target,
  Ban,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  FolderOpen,
  ListTodo,
  Settings2,
  Building2,
} from 'lucide-react';
import type { ProjectHubRow } from './projectHubTypes';
import { AnimatedProgressBar } from './ConsolePrimitives';
import { projectCardSx } from './projectsConsoleStyles';

const priorityStyles: Record<
  ProjectHubRow['priority'],
  { bg: string; color: string; border: string }
> = {
  High: { bg: 'rgba(244, 63, 94, 0.08)', color: '#e11d48', border: 'rgba(244, 63, 94, 0.2)' },
  Medium: { bg: 'rgba(245, 158, 11, 0.08)', color: '#d97706', border: 'rgba(245, 158, 11, 0.2)' },
  Low: { bg: 'rgba(148, 163, 184, 0.12)', color: '#475569', border: 'rgba(148, 163, 184, 0.25)' },
};

const aiRiskStyles: Record<ProjectHubRow['aiRisk'], { color: string; bg: string; border: string }> = {
  low: { color: '#059669', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.25)' },
  moderate: { color: '#d97706', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.25)' },
  elevated: { color: '#ea580c', bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.28)' },
  critical: { color: '#dc2626', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' },
};

function MetricBar({
  label,
  value,
  color,
  warningAt = 85,
}: {
  label: string;
  value: number;
  color: string;
  warningAt?: number;
}) {
  const hot = value >= warningAt;
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.03em' }}>
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.625rem',
            fontWeight: 800,
            color: hot ? '#e11d48' : '#334155',
          }}
        >
          {value}%
        </Typography>
      </Box>
      <AnimatedProgressBar value={value} color={hot ? '#f43f5e' : color} height={4} warningAt={warningAt} />
    </Box>
  );
}

function HealthRing({ score }: { score: number }) {
  const tone = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: `conic-gradient(${tone} ${score * 3.6}deg, #f1f5f9 0)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 0 0 3px ${alpha(tone, 0.12)}`,
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
          {score}
        </Typography>
        <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: '#94a3b8', lineHeight: 1 }}>
          health
        </Typography>
      </Box>
    </Box>
  );
}

function TrendSparkline({ series, trend }: { series: number[]; trend: ProjectHubRow['taskTrend'] }) {
  const trendColor =
    trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#94a3b8';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 28 }}>
      {series.map((v, i) => (
        <Box
          key={i}
          sx={{
            width: 5,
            height: `${Math.round(v * 100)}%`,
            minHeight: 4,
            maxHeight: 28,
            borderRadius: 0.75,
            bgcolor: alpha(trendColor, 0.35 + i * 0.08),
            transition: 'height 300ms ease',
          }}
        />
      ))}
      <TrendIcon size={12} color={trendColor} style={{ marginLeft: 4, marginBottom: 2 }} />
    </Box>
  );
}

export interface ProjectWorkspaceCardProps {
  project: ProjectHubRow;
  onOpen: () => void;
  onOpenTasks?: () => void;
  onProjectMenu?: (event: React.MouseEvent<HTMLElement>, projectId: string) => void;
}

export function ProjectWorkspaceCard({
  project,
  onOpen,
  onOpenTasks,
  onProjectMenu,
}: ProjectWorkspaceCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const pill = priorityStyles[project.priority];
  const risk = aiRiskStyles[project.aiRisk];
  const workloadHot = project.teamWorkload >= 88;

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  return (
    <>
      <Paper
        elevation={0}
        onClick={onOpen}
        sx={{
          ...projectCardSx,
          gap: 0,
          '&:hover .card-actions-btn': { opacity: 1 },
        }}
      >
        <Box
          className="card-glow"
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            opacity: 0,
            transition: 'opacity 220ms ease',
            background: `radial-gradient(ellipse at top, ${alpha(project.color, 0.12)}, transparent 55%)`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${project.color}, ${alpha(project.color, 0.35)})`,
          }}
        />

        <Stack direction="row" spacing={1.15} alignItems="flex-start" sx={{ mb: 1.1 }}>
          <HealthRing score={project.healthScore} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={0.5}>
              <Typography
                className="project-title"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.25,
                  pr: 0.5,
                  transition: 'color 150ms ease',
                }}
              >
                {project.name}
              </Typography>
              <IconButton
                className="card-actions-btn"
                size="small"
                onClick={handleMenuOpen}
                sx={{
                  opacity: { xs: 1, md: 0.65 },
                  mt: -0.5,
                  color: '#64748b',
                  border: '1px solid #e8edf4',
                  bgcolor: '#fafbfc',
                  transition: 'opacity 150ms ease',
                  '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
                }}
              >
                <MoreVertical size={16} />
              </IconButton>
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={0.6} sx={{ mt: 1 }}>
              <Chip
                size="small"
                icon={<Building2 size={10} />}
                label={project.department}
                sx={{
                  height: 22,
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  '& .MuiChip-icon': { color: '#64748b' },
                }}
              />
              <Box
                component="span"
                sx={{
                  px: 0.75,
                  py: 0.2,
                  fontSize: '0.5625rem',
                  fontWeight: 800,
                  borderRadius: 0.75,
                  border: '1px solid',
                  bgcolor: pill.bg,
                  color: pill.color,
                  borderColor: pill.border,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {project.priority}
              </Box>
            </Stack>
          </Box>
        </Stack>

        <Typography
          sx={{
            fontSize: '0.8125rem',
            color: '#64748b',
            lineHeight: 1.55,
            mb: 1.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {project.desc}
        </Typography>

        {/* Intelligence row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
            p: 1.15,
            mb: 1.25,
            borderRadius: 2,
            bgcolor: '#f8fafc',
            border: '1px solid #f1f5f9',
          }}
        >
          <Tooltip title="Mock AI risk score from schedule and task signals">
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Sparkles size={14} color={risk.color} />
              <Box>
                <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  AI risk
                </Typography>
                <Chip
                  size="small"
                  label={project.aiRiskLabel}
                  sx={{
                    mt: 0.25,
                    height: 20,
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    bgcolor: risk.bg,
                    color: risk.color,
                    border: `1px solid ${risk.border}`,
                  }}
                />
              </Box>
            </Stack>
          </Tooltip>

          <Tooltip title="Rolling 7-day utilization estimate">
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Users size={14} color={workloadHot ? '#ef4444' : '#6366f1'} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Team load
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: workloadHot ? '#e11d48' : '#334155',
                  }}
                >
                  {project.teamWorkload}%
                </Typography>
              </Box>
            </Stack>
          </Tooltip>

          <Stack direction="row" spacing={0.75} alignItems="center">
            <Ban size={14} color={project.activeBlockers > 0 ? '#f59e0b' : '#94a3b8'} />
            <Box>
              <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Blockers
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155' }}>
                {project.activeBlockers}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.75} alignItems="center">
            <Clock size={14} color={project.overdueTasks > 0 ? '#ef4444' : '#94a3b8'} />
            <Box>
              <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Overdue
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: project.overdueTasks > 0 ? '#e11d48' : '#334155',
                }}
              >
                {project.overdueTasks}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Delivery progress */}
        <Box sx={{ mb: 1.25 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Target size={13} color="#64748b" />
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b' }}>
                Delivery · {project.tasks} tasks
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 900, color: '#0f172a' }}>
              {project.progress}%
            </Typography>
          </Box>
          <AnimatedProgressBar value={project.progress} color={project.color} height={7} />
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.65 }}>
            <Activity size={12} color="#6366f1" />
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#475569' }}>
              {project.completionPrediction}
            </Typography>
          </Stack>
        </Box>

        {/* Budget + trend */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1.25,
            mb: 1.1,
            pb: 1.1,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
              <Wallet size={12} color="#64748b" />
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: '#64748b' }}>
                Budget usage
              </Typography>
            </Stack>
            <MetricBar label="Spend" value={project.budgetUsage} color={project.color} warningAt={90} />
          </Box>
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: '#64748b' }}>
                Task trend
              </Typography>
              <Chip
                size="small"
                label={project.taskTrendLabel}
                sx={{
                  height: 18,
                  fontSize: '0.5625rem',
                  fontWeight: 800,
                  bgcolor:
                    project.taskTrend === 'up'
                      ? 'rgba(16,185,129,0.1)'
                      : project.taskTrend === 'down'
                        ? 'rgba(239,68,68,0.08)'
                        : '#f8fafc',
                  color:
                    project.taskTrend === 'up'
                      ? '#059669'
                      : project.taskTrend === 'down'
                        ? '#dc2626'
                        : '#64748b',
                }}
              />
            </Stack>
            <TrendSparkline series={project.trendSeries} trend={project.taskTrend} />
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Calendar size={14} color="#94a3b8" />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
              Due {project.dueLabel}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={-0.85}>
            {project.teamMembers.slice(0, 4).map((member, idx) => (
              <Tooltip key={idx} title={member.name ?? member.initials}>
                <Avatar
                  src={member.avatar}
                  sx={{
                    width: 26,
                    height: 26,
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    bgcolor: '#1e293b',
                    border: '2px solid #fff',
                    boxShadow: '0 2px 6px rgba(15,23,42,0.08)',
                  }}
                >
                  {member.initials}
                </Avatar>
              </Tooltip>
            ))}
            {project.teamMembers.length > 4 && (
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: '0.5625rem',
                  fontWeight: 800,
                  bgcolor: '#e2e8f0',
                  color: '#475569',
                  border: '2px solid #fff',
                }}
              >
                +{project.teamMembers.length - 4}
              </Avatar>
            )}
          </Stack>
        </Box>
      </Paper>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 200,
              borderRadius: 2,
              border: '1px solid #e8edf4',
              boxShadow: '0 12px 40px rgba(15, 23, 42, 0.12)',
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            onOpen();
          }}
        >
          <ListItemIcon>
            <FolderOpen size={16} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontWeight: 600, fontSize: '0.8125rem' }}>
            Open workspace
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            (onOpenTasks ?? onOpen)();
          }}
        >
          <ListItemIcon>
            <ListTodo size={16} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontWeight: 600, fontSize: '0.8125rem' }}>
            View tasks
          </ListItemText>
        </MenuItem>
        {onProjectMenu && (
          <>
            <Divider />
            <MenuItem
              onClick={(e) => {
                setMenuAnchor(null);
                onProjectMenu(e as unknown as React.MouseEvent<HTMLElement>, project.id);
              }}
            >
              <ListItemIcon>
                <Settings2 size={16} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                More options
              </ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
}
