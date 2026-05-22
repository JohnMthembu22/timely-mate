import React, { useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Briefcase,
  Calendar,
  CircleDollarSign,
  MessageSquare,
  MoreVertical,
  Play,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
import { glassCardInteractiveSx, glassCardSx } from '../../theme/surfaces';
import { tmColors, tmGradients } from '../../theme/designTokens';
import {
  BUDGET_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
  deriveProjectMetrics,
  type BudgetHealth,
  type ProjectDisplayStatus,
} from './projectMetrics';

export interface ProjectCardProps {
  id?: string;
  title: string;
  department: string;
  progress: number;
  dueDate: string;
  teamSize: number;
  /** Override auto-derived status */
  status?: ProjectDisplayStatus;
  riskScore?: number;
  budgetHealth?: BudgetHealth;
  budgetLabel?: string;
  aiRecommendation?: string;
  onCardClick?: () => void;
  onMenuClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /** Optional — track time shortcut */
  onTrackClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

function RiskMeter({ score, color }: { score: number; color: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.35 }}>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Risk
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color }}>{score}</Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          height: 5,
          borderRadius: 2,
          bgcolor: alpha(color, 0.12),
          '& .MuiLinearProgress-bar': { borderRadius: 2, bgcolor: color },
        }}
      />
    </Box>
  );
}

/** Premium enterprise project tile with health, budget, AI guidance, and quick actions. */
export function ProjectCard({
  id = 'project',
  title,
  department,
  progress,
  dueDate,
  teamSize,
  status: statusProp,
  riskScore: riskProp,
  budgetHealth: budgetHealthProp,
  budgetLabel: budgetLabelProp,
  aiRecommendation: aiProp,
  onCardClick,
  onMenuClick,
  onTrackClick,
}: ProjectCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const metrics = useMemo(
    () => deriveProjectMetrics(id, progress, teamSize),
    [id, progress, teamSize]
  );

  const status = statusProp ?? metrics.status;
  const riskScore = riskProp ?? metrics.riskScore;
  const budgetHealth = budgetHealthProp ?? metrics.budgetHealth;
  const budgetLabel = budgetLabelProp ?? metrics.budgetLabel;
  const aiRecommendation = aiProp ?? metrics.aiRecommendation;
  const statusColor = STATUS_COLORS[status];
  const budgetColor = BUDGET_COLORS[budgetHealth];
  const progressValue = Math.min(100, Math.max(0, progress));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!onCardClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCardClick();
    }
  };

  return (
    <Box
      role={onCardClick ? 'button' : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      onClick={onCardClick}
      onKeyDown={handleKeyDown}
      sx={{
        ...(onCardClick ? glassCardInteractiveSx(theme) : glassCardSx(theme)),
        p: 0,
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        cursor: onCardClick ? 'pointer' : 'default',
        outline: 'none',
        overflow: 'hidden',
        '&:focus-visible': onCardClick
          ? {
              boxShadow: `0 0 0 2px ${theme.palette.background.default}, 0 0 0 4px ${theme.palette.primary.main}`,
            }
          : {},
      }}
    >
      {/* Status rail */}
      <Box
        sx={{
          height: 3,
          background:
            status === 'completed'
              ? tmGradients.heroAccent
              : `linear-gradient(90deg, ${statusColor}, ${alpha(statusColor, 0.4)})`,
        }}
      />

      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1} sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: '3px',
                bgcolor: alpha(statusColor, 0.12),
                color: statusColor,
                border: `1px solid ${alpha(statusColor, 0.28)}`,
                display: 'flex',
                flexShrink: 0,
              }}
            >
              <Briefcase size={18} strokeWidth={2} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                noWrap
                sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary', letterSpacing: '-0.01em' }}
              >
                {title}
              </Typography>
              <Typography noWrap sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>
                {department}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center" flexShrink={0}>
            <Chip
              label={STATUS_LABELS[status]}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.625rem',
                fontWeight: 700,
                bgcolor: alpha(statusColor, 0.12),
                color: statusColor,
                border: `1px solid ${alpha(statusColor, 0.35)}`,
              }}
            />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick?.(e);
              }}
              aria-label="More project actions"
              sx={{
                borderRadius: '3px',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <MoreVertical size={14} strokeWidth={2} />
            </IconButton>
          </Stack>
        </Stack>

        {/* KPI row */}
        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <Box
            sx={{
              flex: 1,
              p: 1,
              borderRadius: '3px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
            }}
          >
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.25 }}>
              <ShieldAlert size={12} strokeWidth={2} color={statusColor} />
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                Risk score
              </Typography>
            </Stack>
            <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: statusColor, lineHeight: 1 }}>
              {riskScore}
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              p: 1,
              borderRadius: '3px',
              border: '1px solid',
              borderColor: alpha(budgetColor, 0.35),
              bgcolor: alpha(budgetColor, 0.08),
            }}
          >
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.25 }}>
              <CircleDollarSign size={12} strokeWidth={2} color={budgetColor} />
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                Budget
              </Typography>
            </Stack>
            <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: budgetColor, lineHeight: 1.2 }}>
              {budgetLabel}
            </Typography>
          </Box>
        </Stack>

        {/* Progress */}
        <Box sx={{ mb: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Progress
            </Typography>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, color: 'text.primary' }}>{progressValue}%</Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progressValue}
            sx={{
              height: 8,
              borderRadius: 2,
              mb: 1,
              bgcolor: alpha(tmColors.neonBlue, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
                background: status === 'on-track' || status === 'completed' ? tmGradients.heroAccent : `linear-gradient(90deg, ${statusColor}, ${alpha(statusColor, 0.6)})`,
              },
            }}
          />
          <RiskMeter score={riskScore} color={riskScore >= 70 ? '#f87171' : riskScore >= 45 ? '#fbbf24' : tmColors.emerald} />
        </Box>

        {/* Meta row */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }} flexWrap="wrap">
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Calendar size={13} strokeWidth={2} color={theme.palette.text.secondary} />
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>{dueDate}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Users size={13} strokeWidth={2} color={tmColors.emerald} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary' }}>{teamSize}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>team</Typography>
          </Stack>
        </Stack>

        {/* AI recommendation */}
        <Box
          sx={{
            p: 1.25,
            borderRadius: '3px',
            border: '1px solid',
            borderColor: isDark ? alpha(tmColors.neonBlue, 0.25) : alpha(tmColors.neonBlueDeep, 0.15),
            bgcolor: isDark ? alpha(tmColors.neonBlue, 0.06) : alpha(tmColors.neonBlueDeep, 0.04),
            mb: 1.5,
            flex: 1,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Stack direction="row" spacing={0.75} alignItems="flex-start">
            <Sparkles size={14} strokeWidth={2} color={tmColors.neonBlueBright} style={{ flexShrink: 0, marginTop: 2 }} />
            <Box>
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: tmColors.neonBlueBright, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.35 }}>
                AI recommendation
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.45 }}>
                {aiRecommendation}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Quick actions */}
        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            pt: 1.25,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {onCardClick && (
            <Button
              size="small"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                onCardClick();
              }}
              sx={{ flex: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', borderRadius: '3px', py: 0.75 }}
            >
              Open
            </Button>
          )}
          {onMenuClick && (
            <Tooltip title="Team chat">
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuClick(e);
                }}
                startIcon={<MessageSquare size={14} />}
                sx={{ flex: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', borderRadius: '3px', py: 0.75 }}
              >
                Chat
              </Button>
            </Tooltip>
          )}
          {(onTrackClick || onCardClick) && (
            <Tooltip title="Track time">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onTrackClick) onTrackClick(e);
                  else onCardClick?.();
                }}
                aria-label="Track time"
                sx={{
                  borderRadius: '3px',
                  border: '1px solid',
                  borderColor: 'divider',
                  color: tmColors.emerald,
                }}
              >
                <Play size={16} strokeWidth={2} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
