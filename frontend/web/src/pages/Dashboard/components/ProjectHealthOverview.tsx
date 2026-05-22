import React, { memo, useMemo } from 'react';
import {
  Box,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  AlertTriangle,
  CircleDollarSign,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { DashboardPanel, panelScrollSx } from './DashboardPanel';
import type { ProjectHealthRow } from '../dashboardOpsData';
import { tmColors, tmGradients } from '../../../theme/designTokens';
import {
  BUDGET_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
} from '../../../components/ProjectCard/projectMetrics';

export const ProjectHealthOverview = memo(function ProjectHealthOverview({
  rows,
  onViewAll,
}: {
  rows: ProjectHealthRow[];
  onViewAll?: () => void;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const summary = useMemo(() => {
    const onTrack = rows.filter((r) => r.status === 'on-track' || r.status === 'completed').length;
    const atRisk = rows.filter((r) => r.status === 'at-risk').length;
    const critical = rows.filter((r) => r.status === 'critical').length;
    const avgProgress =
      rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.progress, 0) / rows.length) : 0;
    const avgRisk =
      rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.riskScore, 0) / rows.length) : 0;
    const budgetAlerts = rows.filter((r) => r.budgetHealth !== 'healthy').length;
    return { onTrack, atRisk, critical, avgProgress, avgRisk, budgetAlerts };
  }, [rows]);

  return (
    <DashboardPanel
      title="Project health overview"
      subtitle={`Portfolio pulse · ${rows.length} active workspace${rows.length !== 1 ? 's' : ''}`}
      accent="emerald"
      action={
        onViewAll ? (
          <Typography
            component="button"
            onClick={onViewAll}
            sx={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: tmColors.neonBlueBright,
              whiteSpace: 'nowrap',
            }}
          >
            View all
          </Typography>
        ) : undefined
      }
      noPadding
    >
      {/* Executive summary strip */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: isDark ? alpha('#000', 0.15) : alpha(tmColors.neonBlueDeep, 0.03),
        }}
      >
        <Grid container spacing={1.25}>
          {[
            { label: 'On track', value: summary.onTrack, color: tmColors.emerald, icon: TrendingUp },
            { label: 'At risk', value: summary.atRisk, color: '#fbbf24', icon: AlertTriangle },
            { label: 'Critical', value: summary.critical, color: '#f87171', icon: ShieldAlert },
            { label: 'Avg risk', value: summary.avgRisk, color: tmColors.neonBlueBright, icon: ShieldAlert },
            { label: 'Avg progress', value: `${summary.avgProgress}%`, color: tmColors.neonBlue, icon: TrendingUp },
            { label: 'Budget alerts', value: summary.budgetAlerts, color: '#fb923c', icon: CircleDollarSign },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Grid item xs={6} sm={4} md={2} key={stat.label}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '3px',
                    border: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center',
                  }}
                >
                  <Icon size={14} strokeWidth={2} color={stat.color} style={{ marginBottom: 4 }} />
                  <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: stat.color, lineHeight: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Box sx={{ ...panelScrollSx(theme), maxHeight: { xs: 320, md: 380 }, px: 2, py: 1.5 }}>
        <Stack spacing={1.25}>
          {rows.length === 0 ? (
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', py: 2, textAlign: 'center' }}>
              No projects to score yet.
            </Typography>
          ) : (
            rows.map((row) => {
              const statusColor = STATUS_COLORS[row.status];
              const budgetColor = BUDGET_COLORS[row.budgetHealth];
              return (
                <Box
                  key={row.id}
                  sx={{
                    p: 1.5,
                    borderRadius: '3px',
                    border: '1px solid',
                    borderColor: isDark ? tmColors.borderSubtle : 'divider',
                    bgcolor: isDark ? alpha(tmColors.charcoal800, 0.5) : alpha('#fff', 0.6),
                    transition: 'border-color 0.15s ease',
                    '&:hover': { borderColor: alpha(statusColor, 0.4) },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1} sx={{ mb: 1 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'text.primary' }} noWrap>
                        {row.title}
                      </Typography>
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mt: 0.5, gap: 0.5 }}>
                        <Chip
                          label={STATUS_LABELS[row.status]}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            bgcolor: alpha(statusColor, 0.12),
                            color: statusColor,
                            border: `1px solid ${alpha(statusColor, 0.3)}`,
                          }}
                        />
                        <Chip
                          label={`Risk ${row.riskScore}`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            bgcolor: alpha(row.riskScore >= 60 ? '#f87171' : tmColors.emerald, 0.12),
                            color: row.riskScore >= 60 ? '#f87171' : tmColors.emerald,
                          }}
                        />
                        <Chip
                          label={row.budgetLabel}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            bgcolor: alpha(budgetColor, 0.12),
                            color: budgetColor,
                            border: `1px solid ${alpha(budgetColor, 0.3)}`,
                          }}
                        />
                      </Stack>
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: 'text.primary', flexShrink: 0 }}>
                      {row.progress}%
                    </Typography>
                  </Stack>

                  <LinearProgress
                    variant="determinate"
                    value={row.progress}
                    sx={{
                      height: 6,
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: alpha(tmColors.neonBlue, 0.08),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        background: tmGradients.heroAccent,
                      },
                    }}
                  />

                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}>
                      {row.teamSize} team · Due {row.dueDate}
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 0.75,
                      alignItems: 'flex-start',
                      p: 1,
                      borderRadius: '3px',
                      bgcolor: isDark ? alpha(tmColors.neonBlue, 0.06) : alpha(tmColors.neonBlueDeep, 0.04),
                      border: `1px solid ${alpha(tmColors.neonBlue, 0.15)}`,
                    }}
                  >
                    <Sparkles size={13} strokeWidth={2} color={tmColors.neonBlueBright} style={{ flexShrink: 0, marginTop: 1 }} />
                    <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.4 }}>
                      {row.aiRecommendation}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
        </Stack>
      </Box>
    </DashboardPanel>
  );
});
