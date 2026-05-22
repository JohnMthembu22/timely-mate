import React, { memo } from 'react';
import { Grid, Paper, Typography, Box, useTheme } from '@mui/material';
import type { LucideIcon } from 'lucide-react';
import { glassCardSx, metricLabelSx, metricValueSx } from '../../theme/surfaces';

export interface MetricsGridItem {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  /** Icon stroke color */
  iconColor: string;
  /** Background tint behind icon */
  iconBg: string;
}

export interface MetricsGridProps {
  metrics: MetricsGridItem[];
  /** When true, renders only grid items (parent supplies container). */
  embedded?: boolean;
}

/** KPI tiles — theme-aware glass surfaces */
export const MetricsGrid = memo(function MetricsGrid({ metrics, embedded = false }: MetricsGridProps) {
  const theme = useTheme();

  const tiles = metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Grid item xs={6} sm={6} md={6} lg={3} key={metric.title}>
            <Paper
              elevation={0}
              sx={{
                ...glassCardSx(theme),
                p: { xs: 2, sm: 3 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography component="span" sx={metricLabelSx(theme)}>
                  {metric.title}
                </Typography>
                <Typography variant="h4" sx={{ ...metricValueSx(theme), fontSize: { xs: '1.35rem', sm: '2.125rem' } }}>
                  {metric.value}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    mt: 0.25,
                  }}
                >
                  {metric.change}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  bgcolor: metric.iconBg,
                }}
              >
                <Icon size={22} color={metric.iconColor} strokeWidth={2} />
              </Box>
            </Paper>
          </Grid>
        );
      });

  if (embedded) {
    return <>{tiles}</>;
  }

  return (
    <Grid container spacing={2.5}>
      {tiles}
    </Grid>
  );
});
