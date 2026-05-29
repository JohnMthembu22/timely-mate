import React, { memo, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  CalendarClock,
  CircleDollarSign,
  Clock,
  LineChart,
  Minus,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DashboardPanel, panelScrollSx } from '../../pages/Dashboard/components/DashboardPanel';
import { tmColors, tmGradients } from '../../theme/designTokens';
import type {
  AiInsightCategory,
  AiInsightPriority,
  AiInsightsPanelProps,
  AiOperationalInsight,
} from './aiInsightsTypes';

export type { AiOperationalInsight, AiInsightCategory, AiInsightPriority, AiInsightsPanelProps } from './aiInsightsTypes';

const CATEGORY_META: Record<
  AiInsightCategory,
  { label: string; icon: LucideIcon; color: string }
> = {
  delayed_project: { label: 'Delayed project', icon: AlertTriangle, color: '#f87171' },
  productivity: { label: 'Productivity', icon: TrendingUp, color: tmColors.emerald },
  budget_risk: { label: 'Budget risk', icon: CircleDollarSign, color: '#fbbf24' },
  attendance: { label: 'Attendance', icon: Users, color: tmColors.neonBlueBright },
  overtime: { label: 'Overtime', icon: Clock, color: '#fb923c' },
  forecast: { label: 'Forecast', icon: LineChart, color: '#a78bfa' },
};

const PRIORITY_META: Record<
  AiInsightPriority,
  { label: string; color: string }
> = {
  critical: { label: 'Critical', color: '#ef4444' },
  high: { label: 'High', color: '#f97316' },
  medium: { label: 'Medium', color: '#fbbf24' },
  low: { label: 'Low', color: tmColors.neonBlue },
};

function TrendGlyph({ trend }: { trend?: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <ArrowUpRight size={14} strokeWidth={2.5} />;
  if (trend === 'down') return <ArrowDownRight size={14} strokeWidth={2.5} />;
  return <Minus size={14} strokeWidth={2.5} />;
}

function InsightCard({
  insight,
  compact,
  onClick,
}: {
  insight: AiOperationalInsight;
  compact?: boolean;
  onClick?: () => void;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cat = CATEGORY_META[insight.category];
  const pri = PRIORITY_META[insight.priority];
  const Icon = cat.icon;

  return (
    <Box
      component={onClick ? 'button' : 'div'}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      sx={{
        width: '100%',
        textAlign: 'left',
        p: compact ? 1.25 : 1.5,
        borderRadius: '3px',
        border: '1px solid',
        borderColor: isDark ? tmColors.borderSubtle : 'divider',
        bgcolor: isDark ? alpha(tmColors.charcoal800, 0.65) : alpha('#fff', 0.7),
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease',
        '&:hover': onClick
          ? {
              borderColor: alpha(cat.color, 0.45),
              boxShadow: `0 4px 20px ${alpha(cat.color, 0.12)}`,
              transform: 'translateY(-1px)',
            }
          : {
              borderColor: alpha(cat.color, 0.2),
            },
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box
          sx={{
            width: compact ? 36 : 40,
            height: compact ? 36 : 40,
            borderRadius: '3px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(cat.color, 0.12),
            color: cat.color,
            border: `1px solid ${alpha(cat.color, 0.25)}`,
          }}
        >
          <Icon size={compact ? 18 : 20} strokeWidth={2} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" alignItems="center" sx={{ mb: 0.5, gap: 0.5 }}>
            <Chip
              label={cat.label}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.625rem',
                fontWeight: 700,
                bgcolor: alpha(cat.color, 0.12),
                color: cat.color,
                border: `1px solid ${alpha(cat.color, 0.28)}`,
              }}
            />
            <Chip
              label={pri.label}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.625rem',
                fontWeight: 700,
                bgcolor: alpha(pri.color, 0.12),
                color: pri.color,
                border: `1px solid ${alpha(pri.color, 0.3)}`,
              }}
            />
            <Typography sx={{ fontSize: '0.625rem', color: 'text.secondary', ml: 'auto' }}>
              {insight.generatedAt}
            </Typography>
          </Stack>

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: compact ? '0.8125rem' : '0.875rem',
              color: 'text.primary',
              lineHeight: 1.35,
              mb: 0.5,
            }}
          >
            {insight.title}
          </Typography>

          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.5, mb: 1 }}>
            {insight.recommendation}
          </Typography>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
            {insight.metric && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ color: cat.color, display: 'flex' }}>
                  <TrendGlyph trend={insight.trend} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: 'text.primary' }}>
                  {insight.metric}
                </Typography>
                {insight.metricLabel && (
                  <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary', fontWeight: 600 }}>
                    {insight.metricLabel}
                  </Typography>
                )}
              </Box>
            )}

            <Box sx={{ flex: 1, minWidth: 100, maxWidth: 140 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.25 }}>
                <Typography sx={{ fontSize: '0.625rem', color: 'text.secondary', fontWeight: 600 }}>
                  Confidence
                </Typography>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: tmColors.neonBlueBright }}>
                  {insight.confidence}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={insight.confidence}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  bgcolor: alpha(tmColors.neonBlue, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    background: tmGradients.heroAccent,
                  },
                }}
              />
            </Box>
          </Stack>

          {insight.actionLabel && (
            <Typography
              sx={{
                mt: 1,
                fontSize: '0.75rem',
                fontWeight: 700,
                color: tmColors.neonBlueBright,
              }}
            >
              {insight.actionLabel} →
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

const ALL_CATEGORIES: AiInsightCategory[] = [
  'delayed_project',
  'productivity',
  'budget_risk',
  'attendance',
  'overtime',
  'forecast',
];

/**
 * Reusable AI Insights Panel — displays mock operational recommendations.
 * Pass `insights` when connecting to a real service; otherwise mock data is used.
 */
export const AiInsightsPanel = memo(function AiInsightsPanel({
  insights,
  useMockData = false,
  title = 'AI insights',
  subtitle = 'Smart operational recommendations · mock intelligence (not connected to live AI)',
  maxVisible = 8,
  onInsightClick,
  compact = false,
}: AiInsightsPanelProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [categoryFilter, setCategoryFilter] = useState<AiInsightCategory | 'all'>('all');

  const source = useMemo(() => {
    if (insights && insights.length > 0) return insights;
    return [];
  }, [insights]);

  const filtered = useMemo(() => {
    const list =
      categoryFilter === 'all'
        ? source
        : source.filter((i) => i.category === categoryFilter);
    return list.slice(0, maxVisible);
  }, [source, categoryFilter, maxVisible]);

  const counts = useMemo(() => {
    const map = new Map<AiInsightCategory, number>();
    source.forEach((i) => map.set(i.category, (map.get(i.category) || 0) + 1));
    return map;
  }, [source]);

  return (
    <DashboardPanel title={title} subtitle={subtitle} accent="blue" noPadding>
      <Box sx={{ px: 2, pt: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: tmGradients.buttonPrimary,
              color: '#fff',
              boxShadow: `0 4px 16px ${alpha(tmColors.neonBlue, 0.35)}`,
            }}
          >
            <Sparkles size={18} strokeWidth={2} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'text.primary' }}>
                Command intelligence
              </Typography>
              {false && (
                <Chip
                  icon={<Brain size={12} strokeWidth={2} />}
                  label="Presentation data"
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    bgcolor: alpha(tmColors.emerald, 0.12),
                    color: tmColors.emerald,
                    border: `1px solid ${alpha(tmColors.emerald, 0.35)}`,
                    '& .MuiChip-icon': { color: 'inherit', ml: 0.5 },
                  }}
                />
              )}
            </Stack>
            <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary', mt: 0.25 }}>
              {source.length} signals · {filtered.length} shown
            </Typography>
          </Box>
          <CalendarClock size={18} strokeWidth={2} color={isDark ? tmColors.textSecondary : undefined} />
        </Stack>

        <Box
          sx={{
            display: 'flex',
            gap: 0.75,
            overflowX: 'auto',
            pb: 0.5,
            flexWrap: 'nowrap',
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha('#fff', 0.15),
              borderRadius: 2,
            },
          }}
        >
          <Chip
            label="All"
            size="small"
            onClick={() => setCategoryFilter('all')}
            sx={{
              flexShrink: 0,
              fontWeight: 600,
              fontSize: '0.6875rem',
              bgcolor: categoryFilter === 'all' ? alpha(tmColors.neonBlue, 0.2) : 'transparent',
              border: '1px solid',
              borderColor: categoryFilter === 'all' ? tmColors.neonBlue : 'divider',
            }}
          />
          {ALL_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const count = counts.get(cat) || 0;
            if (count === 0) return null;
            return (
              <Chip
                key={cat}
                label={`${meta.label} (${count})`}
                size="small"
                onClick={() => setCategoryFilter(cat)}
                sx={{
                  flexShrink: 0,
                  fontWeight: 600,
                  fontSize: '0.6875rem',
                  bgcolor: categoryFilter === cat ? alpha(meta.color, 0.15) : 'transparent',
                  border: '1px solid',
                  borderColor: categoryFilter === cat ? meta.color : 'divider',
                  color: categoryFilter === cat ? meta.color : 'text.secondary',
                }}
              />
            );
          })}
        </Box>
      </Box>

      <Box sx={{ ...panelScrollSx(theme), maxHeight: compact ? 280 : { xs: 360, md: 420 }, px: 2, py: 1.5 }}>
        <Stack spacing={1.25}>
          {filtered.length === 0 ? (
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', py: 2, textAlign: 'center' }}>
              {source.length === 0
                ? 'No insights yet. Add people, projects, and activity to see recommendations here.'
                : 'No insights in this category.'}
            </Typography>
          ) : (
            filtered.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                compact={compact}
                onClick={onInsightClick ? () => onInsightClick(insight) : undefined}
              />
            ))
          )}
        </Stack>
      </Box>

      {source.length > maxVisible && (
        <Box sx={{ px: 2, pb: 1.5, pt: 0.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            fullWidth
            size="small"
            variant="text"
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
            onClick={() => setCategoryFilter('all')}
          >
            Showing {filtered.length} of {source.length} recommendations
          </Button>
        </Box>
      )}
    </DashboardPanel>
  );
});
