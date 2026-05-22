import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Grid,
  Collapse,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Brain,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  TrendingDown,
  Users,
  Timer,
  Gauge,
  ShieldAlert,
  Wallet,
  Shuffle,
  Zap,
  Activity,
} from 'lucide-react';
import type { InsightCategory, InsightSeverity, ProjectAiInsight } from './projectAiInsightTypes';
import { INSIGHT_CATEGORY_LABELS } from './projectAiInsightTypes';
import { sectionHeaderSx, sectionShellSx, sectionSubtitleSx, sectionTitleSx } from './projectsConsoleStyles';

const categoryIcon: Record<InsightCategory, React.ElementType> = {
  delay_prediction: Clock,
  workload_imbalance: Users,
  overdue_tasks: Timer,
  productivity: Zap,
  bottleneck: Activity,
  high_risk: ShieldAlert,
  budget_overrun: Wallet,
  resource_allocation: Shuffle,
};

const severityPalette: Record<
  InsightSeverity,
  { color: string; glow: string; bg: string; border: string; label: string }
> = {
  critical: {
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.35)',
    bg: 'rgba(239, 68, 68, 0.06)',
    border: 'rgba(239, 68, 68, 0.35)',
    label: 'Critical',
  },
  high: {
    color: '#f97316',
    glow: 'rgba(249, 115, 22, 0.3)',
    bg: 'rgba(249, 115, 22, 0.06)',
    border: 'rgba(249, 115, 22, 0.3)',
    label: 'High',
  },
  warning: {
    color: '#eab308',
    glow: 'rgba(234, 179, 8, 0.28)',
    bg: 'rgba(234, 179, 8, 0.06)',
    border: 'rgba(234, 179, 8, 0.28)',
    label: 'Warning',
  },
  opportunity: {
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.28)',
    bg: 'rgba(16, 185, 129, 0.06)',
    border: 'rgba(16, 185, 129, 0.28)',
    label: 'Opportunity',
  },
  info: {
    color: '#6366f1',
    glow: 'rgba(99, 102, 241, 0.28)',
    bg: 'rgba(99, 102, 241, 0.06)',
    border: 'rgba(99, 102, 241, 0.28)',
    label: 'Info',
  },
};

export interface ProjectAiInsightsSectionProps {
  insights: ProjectAiInsight[];
  onProjectClick: (projectId: string) => void;
  onInsightAction?: (insight: ProjectAiInsight, actionId: string) => void;
}

function InsightCard({
  insight,
  expanded,
  onToggle,
  onProjectClick,
  onInsightAction,
}: {
  insight: ProjectAiInsight;
  expanded: boolean;
  onToggle: () => void;
  onProjectClick: (id: string) => void;
  onInsightAction?: (insight: ProjectAiInsight, actionId: string) => void;
}) {
  const palette = severityPalette[insight.severity];
  const Icon = categoryIcon[insight.category] ?? AlertTriangle;

  const handleAction = (actionId: string) => {
    if (onInsightAction) {
      onInsightAction(insight, actionId);
      return;
    }
    if (
      (actionId === 'open' || actionId === 'budget' || actionId === 'rebalance') &&
      insight.projectId
    ) {
      onProjectClick(insight.projectId);
    }
  };

  return (
    <Paper
      elevation={0}
      onClick={onToggle}
      sx={{
        position: 'relative',
        borderRadius: 2.5,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid',
        borderColor: expanded ? palette.border : '#e8edf4',
        bgcolor: '#fff',
        boxShadow: expanded
          ? `0 12px 40px ${alpha(palette.color, 0.12)}, 0 0 0 1px ${alpha(palette.color, 0.08)}`
          : '0 1px 3px rgba(15, 23, 42, 0.05)',
        transition: 'all 220ms cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: palette.border,
          boxShadow: `0 16px 48px ${alpha(palette.color, 0.14)}, 0 0 24px ${palette.glow}`,
          transform: 'translateY(-2px)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: `linear-gradient(180deg, ${palette.color}, ${alpha(palette.color, 0.35)})`,
        },
      }}
    >
      {insight.severityLevel >= 3 && (
        <Box
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: palette.color,
            boxShadow: `0 0 12px ${palette.glow}`,
            animation: 'ai-pulse 2s ease-in-out infinite',
            '@keyframes ai-pulse': {
              '0%, 100%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.55, transform: 'scale(1.15)' },
            },
          }}
        />
      )}

      <Box sx={{ p: 2, pl: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${alpha(palette.color, 0.15)}, ${alpha(palette.color, 0.04)})`,
              border: `1px solid ${alpha(palette.color, 0.2)}`,
              color: palette.color,
            }}
          >
            <Icon size={18} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, pr: 3 }}>
            <Stack direction="row" flexWrap="wrap" gap={0.75} alignItems="center" sx={{ mb: 0.75 }}>
              <Chip
                size="small"
                label={INSIGHT_CATEGORY_LABELS[insight.category]}
                sx={{
                  height: 20,
                  fontSize: '0.5625rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  bgcolor: alpha(palette.color, 0.1),
                  color: palette.color,
                  border: `1px solid ${alpha(palette.color, 0.22)}`,
                }}
              />
              <Chip
                size="small"
                label={palette.label}
                sx={{
                  height: 20,
                  fontSize: '0.5625rem',
                  fontWeight: 800,
                  bgcolor: palette.bg,
                  color: palette.color,
                  border: `1px solid ${palette.border}`,
                }}
              />
              {insight.confidence != null && (
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: '#94a3b8' }}>
                  AI {insight.confidence}%
                </Typography>
              )}
            </Stack>

            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.4,
                letterSpacing: '-0.02em',
              }}
            >
              {insight.headline}
            </Typography>

            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.75, lineHeight: 1.5 }}>
              {insight.summary}
            </Typography>

            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.25 }} alignItems="center">
              {insight.metric && (
                <Chip
                  size="small"
                  icon={<Gauge size={10} />}
                  label={insight.metric}
                  sx={{
                    height: 22,
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    '& .MuiChip-icon': { color: palette.color },
                  }}
                />
              )}
              {insight.detectedAt && (
                <Typography sx={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 600 }}>
                  {insight.detectedAt}
                </Typography>
              )}
              {insight.projectName && (
                <Typography sx={{ fontSize: '0.625rem', color: '#64748b', fontWeight: 600 }}>
                  · {insight.projectName}
                </Typography>
              )}
              {insight.team && (
                <Typography sx={{ fontSize: '0.625rem', color: '#64748b', fontWeight: 600 }}>
                  · {insight.team}
                </Typography>
              )}
            </Stack>
          </Box>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            sx={{
              position: 'absolute',
              right: 10,
              bottom: 10,
              color: '#94a3b8',
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              '&:hover': { bgcolor: '#f1f5f9', color: palette.color },
            }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </IconButton>
        </Stack>

        <Collapse in={expanded} timeout={220}>
          <Box
            sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${alpha(palette.color, 0.2)}` }}
            onClick={(e) => e.stopPropagation()}
          >
            {insight.detail && (
              <Typography sx={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.6, mb: 2 }}>
                {insight.detail}
              </Typography>
            )}
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {insight.actions.map((action) => (
                <Button
                  key={action.id}
                  size="small"
                  variant={action.variant === 'primary' ? 'contained' : 'outlined'}
                  onClick={() => handleAction(action.id)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: 1.5,
                    ...(action.variant === 'primary'
                      ? {
                          bgcolor: '#0f172a',
                          boxShadow: `0 4px 14px ${alpha(palette.color, 0.25)}`,
                          '&:hover': {
                            bgcolor: '#1e293b',
                            boxShadow: `0 6px 20px ${alpha(palette.color, 0.35)}`,
                          },
                        }
                      : {
                          borderColor: '#e2e8f0',
                          color: '#475569',
                          '&:hover': { borderColor: palette.color, color: palette.color },
                        }),
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
}

export function ProjectAiInsightsSection({
  insights,
  onProjectClick,
  onInsightAction,
}: ProjectAiInsightsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sectionExpanded, setSectionExpanded] = useState(true);

  const criticalCount = insights.filter((i) => i.severity === 'critical' || i.severity === 'high').length;

  return (
    <Paper
      elevation={0}
      sx={{
        ...sectionShellSx,
        background: 'linear-gradient(165deg, #0f172a 0%, #1e293b 42%, #0f172a 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        boxShadow: '0 4px 24px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -120,
          right: -80,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Box
        sx={{
          ...sectionHeaderSx,
          borderColor: 'rgba(255,255,255,0.08)',
          ...(!sectionExpanded && { borderBottom: 'none' }),
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(56,189,248,0.2))',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <Brain size={18} color="#a5b4fc" />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  sx={{
                    ...sectionTitleSx,
                    color: '#f8fafc',
                    fontSize: '1rem',
                  }}
                >
                  AI Insights
                </Typography>
                <Chip
                  size="small"
                  icon={<Sparkles size={10} color="#c4b5fd" />}
                  label="Operational intelligence"
                  sx={{
                    height: 22,
                    fontSize: '0.5625rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    bgcolor: 'rgba(99, 102, 241, 0.2)',
                    color: '#c4b5fd',
                    border: '1px solid rgba(167, 139, 250, 0.35)',
                    '& .MuiChip-icon': { ml: 0.5 },
                  }}
                />
              </Stack>
              <Typography sx={{ ...sectionSubtitleSx, color: '#94a3b8', mt: 0.5 }}>
                Predictive signals across delays, workload, budget, bottlenecks, and resource fit — mock
                analytics until live AI is connected.
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          {criticalCount > 0 && (
            <Chip
              size="small"
              icon={<TrendingDown size={12} color="#fca5a5" />}
              label={`${criticalCount} need action`}
              sx={{
                fontWeight: 800,
                fontSize: '0.6875rem',
                bgcolor: 'rgba(239, 68, 68, 0.15)',
                color: '#fecaca',
                border: '1px solid rgba(248, 113, 113, 0.35)',
              }}
            />
          )}
          <Chip
            size="small"
            label={`${insights.length} signals`}
            sx={{
              fontWeight: 700,
              bgcolor: 'rgba(255,255,255,0.06)',
              color: '#cbd5e1',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          />
          <Tooltip title={sectionExpanded ? 'Collapse section' : 'Expand section'}>
            <IconButton
              size="small"
              onClick={() => setSectionExpanded((open) => !open)}
              aria-expanded={sectionExpanded}
              aria-label={sectionExpanded ? 'Collapse AI insights' : 'Expand AI insights'}
              sx={{
                color: '#cbd5e1',
                border: '1px solid rgba(255,255,255,0.14)',
                bgcolor: 'rgba(255,255,255,0.06)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.12)',
                  color: '#f8fafc',
                  borderColor: 'rgba(167, 139, 250, 0.45)',
                },
              }}
            >
              {sectionExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Collapse in={sectionExpanded} timeout={280}>
        <Box sx={{ p: { xs: 1.25, sm: 1.5, md: 1.75 }, position: 'relative', zIndex: 1 }}>
          <Grid container spacing={1.5}>
            {insights.map((insight) => (
              <Grid item xs={12} md={6} key={insight.id}>
                <InsightCard
                  insight={insight}
                  expanded={expandedId === insight.id}
                  onToggle={() =>
                    setExpandedId((prev) => (prev === insight.id ? null : insight.id))
                  }
                  onProjectClick={onProjectClick}
                  onInsightAction={onInsightAction}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
}
