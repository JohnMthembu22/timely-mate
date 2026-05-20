import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import type { LucideIcon } from 'lucide-react';

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
}

/** KPI tiles styled like the Tailwind reference — implemented with MUI (no Tailwind). */
export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <Grid container spacing={2.5}>
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Grid item xs={12} md={6} lg={3} key={metric.title}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: '#fff',
                border: '1px solid',
                borderColor: '#f1f5f9',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  component="span"
                  sx={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    mb: 0.25,
                  }}
                >
                  {metric.title}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#1e293b',
                    lineHeight: 1.2,
                  }}
                >
                  {metric.value}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#64748b',
                    mt: 0.25,
                  }}
                >
                  {metric.change}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: metric.iconBg,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={24} strokeWidth={2} color={metric.iconColor} />
              </Box>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}
