import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  Clock,
  Gauge,
  ShieldAlert,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import type { OperationalMetric, OperationalMetricTone } from './projectOperationalAnalytics';
import { useAnimatedNumber } from './useAnimatedNumber';
import { analyticsGridSx, analyticsTileSx } from './projectsConsoleStyles';
import { LiveIndicator } from './ConsolePrimitives';

const toneColors: Record<OperationalMetricTone, { accent: string; iconBg: string; iconColor: string }> = {
  positive: {
    accent: 'linear-gradient(90deg, #10b981, #34d399)',
    iconBg: 'rgba(16, 185, 129, 0.1)',
    iconColor: '#059669',
  },
  neutral: {
    accent: 'linear-gradient(90deg, #6366f1, #818cf8)',
    iconBg: 'rgba(99, 102, 241, 0.1)',
    iconColor: '#4f46e5',
  },
  warning: {
    accent: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
    iconBg: 'rgba(245, 158, 11, 0.12)',
    iconColor: '#d97706',
  },
  critical: {
    accent: 'linear-gradient(90deg, #ef4444, #f87171)',
    iconBg: 'rgba(239, 68, 68, 0.1)',
    iconColor: '#dc2626',
  },
  info: {
    accent: 'linear-gradient(90deg, #0ea5e9, #38bdf8)',
    iconBg: 'rgba(14, 165, 233, 0.1)',
    iconColor: '#0284c7',
  },
};

const iconMap = {
  health: Activity,
  workforce: Users,
  risk: ShieldAlert,
  delivery: Target,
  efficiency: Gauge,
  blocked: Clock,
  approval: Clock,
  productivity: Brain,
};

function MetricSparkline({ data, color, gradientId }: { data: number[]; color: string; gradientId: string }) {
  const chartData = data.map((v, i) => ({ i, v: v * 100 }));
  return (
    <Box sx={{ width: '100%', height: 28, mt: 0.75 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

function AnalyticsTile({ metric }: { metric: OperationalMetric }) {
  const animated = useAnimatedNumber(metric.value);
  const palette = toneColors[metric.tone];
  const Icon = iconMap[metric.icon] ?? TrendingUp;
  const trendUp = metric.trend >= 0;
  const trendPositive =
    metric.id === 'overdue-risk' || metric.id === 'blocked' || metric.id === 'approval'
      ? !trendUp
      : trendUp;

  return (
    <Tooltip
      title={metric.hoverDetail}
      placement="top"
      arrow
      enterDelay={400}
      slotProps={{
        tooltip: {
          sx: { maxWidth: 280, fontSize: '0.75rem', lineHeight: 1.5, p: 1.25 },
        },
      }}
    >
      <Paper elevation={0} sx={analyticsTileSx(palette.accent)}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: '0.5rem',
                fontWeight: 800,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                lineHeight: 1.25,
              }}
            >
              {metric.label}
            </Typography>
            <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mt: 0.35 }}>
              <Typography
                sx={{
                  fontSize: { xs: '1.125rem', sm: '1.25rem' },
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.03em',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {metric.id === 'productivity' ? metric.displayValue : animated}
              </Typography>
              {metric.suffix && (
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#64748b' }}>
                  {metric.suffix}
                </Typography>
              )}
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.75 }}>
              {trendPositive ? (
                <ArrowUpRight size={12} color="#059669" />
              ) : (
                <ArrowDownRight size={12} color="#dc2626" />
              )}
              <Typography
                sx={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  color: trendPositive ? '#059669' : '#dc2626',
                }}
              >
                {metric.trendLabel}
              </Typography>
            </Stack>
          </Box>
          <Box
            sx={{
              p: 1.1,
              borderRadius: 2,
              bgcolor: palette.iconBg,
              color: palette.iconColor,
              display: 'flex',
              flexShrink: 0,
            }}
          >
            <Icon size={17} />
          </Box>
        </Stack>
        <MetricSparkline data={metric.sparkline} color={palette.iconColor} gradientId={`spark-${metric.id}`} />
        <Box sx={{ position: 'absolute', bottom: 6, right: 8 }}>
          <LiveIndicator />
        </Box>
      </Paper>
    </Tooltip>
  );
}

export interface OperationalAnalyticsStripProps {
  metrics: OperationalMetric[];
}

export function OperationalAnalyticsStrip({ metrics }: OperationalAnalyticsStripProps) {
  return (
    <Box sx={analyticsGridSx}>
      {metrics.map((m) => (
        <AnalyticsTile key={m.id} metric={m} />
      ))}
    </Box>
  );
}
