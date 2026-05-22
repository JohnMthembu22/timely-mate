import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Avatar,
  LinearProgress,
  Button,
  Collapse,
  IconButton,
  alpha,
} from '@mui/material';
import {
  Flag,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  Link2,
  User,
  Calendar,
  Target,
  Bell,
  ExternalLink,
  GitBranch,
} from 'lucide-react';
import type { OperationalMilestone, MilestoneProgressStatus, MilestoneRiskLevel } from './projectMilestoneTypes';
import { sectionHeaderSx, sectionShellSx, sectionSubtitleSx, sectionTitleSx } from './projectsConsoleStyles';

const statusMeta: Record<
  MilestoneProgressStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  completed: { label: 'Completed', color: '#059669', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
  in_progress: { label: 'In progress', color: '#2563eb', bg: 'rgba(37,99,235,0.1)', border: 'rgba(37,99,235,0.22)' },
  upcoming: { label: 'Upcoming', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
  blocked: { label: 'Blocked', color: '#d97706', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.28)' },
  overdue: { label: 'Overdue', color: '#dc2626', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.28)' },
};

const riskMeta: Record<MilestoneRiskLevel, { label: string; color: string }> = {
  low: { label: 'Low risk', color: '#059669' },
  medium: { label: 'Medium risk', color: '#d97706' },
  high: { label: 'High risk', color: '#ea580c' },
  critical: { label: 'Critical', color: '#dc2626' },
};

function MilestoneCard({
  milestone: m,
  expanded,
  onToggle,
  onOpenProject,
  onNotify,
}: {
  milestone: OperationalMilestone;
  expanded: boolean;
  onToggle: () => void;
  onOpenProject: (projectId: string) => void;
  onNotify?: (projectId: string) => void;
}) {
  const status = statusMeta[m.progressStatus];
  const risk = riskMeta[m.riskLevel];

  return (
    <Box sx={{ position: 'relative', pl: 2.75 }}>
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 14,
          width: 14,
          height: 14,
          borderRadius: '50%',
          bgcolor: m.isOverdue ? '#ef4444' : m.projectColor,
          border: '2px solid #fff',
          boxShadow: m.isOverdue
            ? `0 0 0 3px ${alpha('#ef4444', 0.25)}, 0 0 12px ${alpha('#ef4444', 0.4)}`
            : `0 0 0 2px ${alpha(m.projectColor, 0.25)}`,
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: 6,
          top: 28,
          bottom: expanded ? 8 : 20,
          width: 2,
          bgcolor: alpha(m.projectColor, 0.35),
          borderRadius: 1,
        }}
      />
      <Paper
        elevation={0}
        onClick={onToggle}
        sx={{
          p: { xs: 1.25, sm: 1.5 },
          borderRadius: 2,
          border: '1px solid',
          borderColor: expanded ? alpha(risk.color, 0.35) : m.isOverdue ? 'rgba(239,68,68,0.22)' : '#eef2f7',
          bgcolor: m.isOverdue ? 'rgba(254,242,242,0.45)' : '#fff',
          cursor: 'pointer',
          transition: 'all 200ms ease',
          '&:hover': {
            borderColor: alpha(m.projectColor, 0.45),
            boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
            transform: 'translateY(-1px)',
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" flexWrap="wrap" gap={0.5} alignItems="center" sx={{ mb: 0.75 }}>
              <Chip
                size="small"
                label={status.label}
                sx={{
                  height: 20,
                  fontSize: '0.5625rem',
                  fontWeight: 800,
                  bgcolor: status.bg,
                  color: status.color,
                  border: `1px solid ${status.border}`,
                }}
              />
              <Chip
                size="small"
                label={risk.label}
                sx={{
                  height: 20,
                  fontSize: '0.5625rem',
                  fontWeight: 800,
                  color: risk.color,
                  bgcolor: alpha(risk.color, 0.08),
                  border: `1px solid ${alpha(risk.color, 0.25)}`,
                }}
              />
              {m.isOverdue && (
                <Chip
                  size="small"
                  icon={<AlertTriangle size={10} />}
                  label="Overdue"
                  sx={{
                    height: 20,
                    fontSize: '0.5625rem',
                    fontWeight: 800,
                    bgcolor: 'rgba(239,68,68,0.12)',
                    color: '#dc2626',
                  }}
                />
              )}
            </Stack>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.35 }}>
              {m.title}
            </Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', mt: 0.35 }}>
              {m.projectName}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            sx={{ border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </IconButton>
        </Stack>

        <Box sx={{ mt: 1.25, position: 'relative', height: 6, borderRadius: 99, bgcolor: '#f1f5f9', overflow: 'hidden' }}>
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${m.timelinePosition}%`,
              borderRadius: 99,
              background: `linear-gradient(90deg, ${m.projectColor}, ${alpha(m.projectColor, 0.5)})`,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              left: `${Math.min(98, m.timelinePosition)}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: '#fff',
              border: `2px solid ${m.projectColor}`,
              boxShadow: '0 1px 4px rgba(15,23,42,0.15)',
            }}
          />
        </Box>

        <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 1.25 }} alignItems="center">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Clock size={12} color={m.isOverdue ? '#dc2626' : '#94a3b8'} />
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: m.isOverdue ? '#dc2626' : '#64748b',
              }}
            >
              {m.countdownLabel}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Avatar sx={{ width: 22, height: 22, fontSize: '0.5625rem', bgcolor: alpha(m.projectColor, 0.15), color: m.projectColor }}>
              {m.owner.initials}
            </Avatar>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#475569' }}>
              {m.owner.name}
            </Typography>
          </Stack>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={m.progress}
          sx={{
            mt: 1.25,
            height: 5,
            borderRadius: 99,
            bgcolor: '#f1f5f9',
            '& .MuiLinearProgress-bar': { borderRadius: 99, bgcolor: m.projectColor },
          }}
        />

        {m.dependencyWarning && (
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="flex-start"
            sx={{
              mt: 1.25,
              p: 1,
              borderRadius: 1.5,
              bgcolor: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            <Link2 size={12} color="#d97706" style={{ marginTop: 2 }} />
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: '#92400e', lineHeight: 1.45 }}>
              {m.dependencyWarning}
            </Typography>
          </Stack>
        )}

        <Collapse in={expanded} timeout={220}>
          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed #e2e8f0' }} onClick={(e) => e.stopPropagation()}>
            <Typography sx={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.55, mb: 1.5 }}>
              {m.detail}
            </Typography>
            <Stack spacing={1} sx={{ mb: 1.5 }}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Target size={12} color="#6366f1" />
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#334155' }}>
                  Forecast: {m.completionForecast}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Calendar size={12} color="#94a3b8" />
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                  {m.date}
                </Typography>
              </Stack>
              {m.dependencies.length > 0 && (
                <Stack direction="row" spacing={0.75} alignItems="flex-start">
                  <GitBranch size={12} color="#94a3b8" style={{ marginTop: 2 }} />
                  <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', lineHeight: 1.45 }}>
                    Depends on: {m.dependencies.join(', ')}
                  </Typography>
                </Stack>
              )}
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 1.5 }}>
              {m.blockers.map((b) => (
                <Chip key={b} size="small" label={b} sx={{ height: 22, fontSize: '0.625rem', fontWeight: 600 }} />
              ))}
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              <Button
                size="small"
                variant="contained"
                startIcon={<ExternalLink size={12} />}
                onClick={() => onOpenProject(m.projectId)}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.6875rem', bgcolor: '#0f172a', borderRadius: 1.5 }}
              >
                Open workspace
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<User size={12} />}
                onClick={() => onOpenProject(m.projectId)}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.6875rem', borderRadius: 1.5 }}
              >
                Reassign owner
              </Button>
              {onNotify && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Bell size={12} />}
                  onClick={() => onNotify(m.projectId)}
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.6875rem', borderRadius: 1.5 }}
                >
                  Notify team
                </Button>
              )}
            </Stack>
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
}

export interface CriticalMilestonesPanelProps {
  milestones: OperationalMilestone[];
  onProjectClick: (projectId: string) => void;
  onNotifyTeam?: (projectId: string) => void;
}

export function CriticalMilestonesPanel({
  milestones,
  onProjectClick,
  onNotifyTeam,
}: CriticalMilestonesPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sectionExpanded, setSectionExpanded] = useState(true);
  const atRiskCount = milestones.filter((m) => m.riskLevel === 'high' || m.riskLevel === 'critical').length;
  const overdueCount = milestones.filter((m) => m.isOverdue).length;

  return (
    <Paper
      elevation={0}
      sx={{
        ...sectionShellSx,
        flex: '1 1 52%',
        minHeight: { xs: 280, lg: 0 },
        maxHeight: { lg: '58%' },
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          ...sectionHeaderSx,
          background: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 100%)',
          ...(!sectionExpanded && { borderBottom: 'none' }),
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Flag size={17} color="#6366f1" />
            <Typography sx={sectionTitleSx}>Critical milestones</Typography>
            <Chip
              size="small"
              label="Operational tracker"
              sx={{
                height: 20,
                fontSize: '0.5625rem',
                fontWeight: 800,
                bgcolor: '#eef2ff',
                color: '#4338ca',
                border: '1px solid #c7d2fe',
              }}
            />
          </Stack>
          <Typography sx={sectionSubtitleSx}>
            Timeline, risk, dependencies, and delivery forecasts — at-risk checkpoints surface first.
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
          {overdueCount > 0 && (
            <Chip size="small" label={`${overdueCount} overdue`} color="error" variant="outlined" sx={{ fontWeight: 800, fontSize: '0.625rem' }} />
          )}
          {atRiskCount > 0 && (
            <Chip
              size="small"
              label={`${atRiskCount} at risk`}
              sx={{ fontWeight: 800, fontSize: '0.625rem', bgcolor: 'rgba(245,158,11,0.1)', color: '#d97706' }}
            />
          )}
          <IconButton
            size="small"
            onClick={() => setSectionExpanded((v) => !v)}
            aria-label={sectionExpanded ? 'Collapse milestones' : 'Expand milestones'}
            sx={{ border: '1px solid #e2e8f0' }}
          >
            {sectionExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </IconButton>
        </Stack>
      </Box>

      <Collapse in={sectionExpanded}>
        <Box sx={{ px: { xs: 1.25, sm: 1.5 }, py: 1.25, flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {milestones.length === 0 ? (
            <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8', py: 3, textAlign: 'center' }}>
              No milestones scheduled. Add projects to populate delivery checkpoints.
            </Typography>
          ) : (
            <Stack spacing={1.35}>
              {milestones.map((m) => (
                <MilestoneCard
                  key={m.id}
                  milestone={m}
                  expanded={expandedId === m.id}
                  onToggle={() => setExpandedId((prev) => (prev === m.id ? null : m.id))}
                  onOpenProject={onProjectClick}
                  onNotify={onNotifyTeam}
                />
              ))}
            </Stack>
          )}
        </Box>

        <Box sx={{ px: { xs: 1.25, sm: 1.5 }, py: 1.15, borderTop: '1px solid #f1f5f9', bgcolor: '#fafbfc', flexShrink: 0 }}>
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', mb: 0.5 }}>
            Portfolio sync
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
            Milestones stay tied to workspace cards — expand any checkpoint for owners, blockers, and quick actions.
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );
}
