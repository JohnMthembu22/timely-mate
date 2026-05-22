import React, { useState } from 'react';
import { Box, Collapse, Grid, IconButton, Paper, Stack, Tooltip, Typography, alpha } from '@mui/material';
import { Brain, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { TeamActivityFeed } from './TeamActivityFeed';
import type { AiProductivityInsight, AiProductivityInsightsBundle } from './aiProductivityInsightsTypes';
import type { TeamActivityEvent } from './teamActivityTypes';
import { ttPremiumSx, ttType } from './timeTrackingStyles';

const severityAccent = {
  critical: '#ef4444',
  warning: '#f59e0b',
  info: '#6366f1',
};

function ProductivityInsightRow({
  insight,
  expanded,
  onToggle,
  onAction,
}: {
  insight: AiProductivityInsight;
  expanded: boolean;
  onToggle: () => void;
  onAction: (actionId: string, insight: AiProductivityInsight) => void;
}) {
  const accent = severityAccent[insight.severity];
  const detailTip = [insight.detail, insight.recommendation].filter(Boolean).join('\n\n');

  return (
    <Paper
      elevation={0}
      onClick={onToggle}
      sx={{
        px: 1.1,
        py: 0.85,
        borderRadius: 2,
        border: '1px solid #e8ecf1',
        borderLeft: `3px solid ${accent}`,
        bgcolor: '#fff',
        cursor: 'pointer',
        transition: 'background-color 150ms ease',
        '&:hover': { bgcolor: '#fafbfc' },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.75}>
        <Tooltip title={detailTip} arrow placement="top-start">
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.35, flex: 1 }}>
            {insight.headline}
          </Typography>
        </Tooltip>
        <Stack direction="row" alignItems="center" spacing={0.5} flexShrink={0}>
          {insight.metric && (
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: accent }}>{insight.metric}</Typography>
          )}
          <IconButton size="small" sx={{ p: 0.25 }} onClick={(e) => { e.stopPropagation(); onToggle(); }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </IconButton>
        </Stack>
      </Stack>
      <Collapse in={expanded}>
        <Box sx={{ pt: 0.75 }} onClick={(e) => e.stopPropagation()}>
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.45, mb: 0.5 }}>{insight.detail}</Typography>
          {insight.actions[0] && (
            <Typography
              component="button"
              onClick={() => onAction(insight.actions[0].id, insight)}
              sx={{
                p: 0,
                border: 'none',
                bgcolor: 'transparent',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#4f46e5',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {insight.actions[0].label}
            </Typography>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

export interface ZoneAiAndActivityProps {
  bundle: AiProductivityInsightsBundle;
  events: TeamActivityEvent[];
  onInsightAction: (actionId: string, insight: AiProductivityInsight) => void;
}

export function ZoneAiAndActivity({ bundle, events, onInsightAction }: ZoneAiAndActivityProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Grid container spacing={1.25}>
      <Grid item xs={12} md={6}>
        <Paper
          elevation={0}
          sx={{
            ...ttPremiumSx,
            p: 1.25,
            height: { md: 320 },
            maxHeight: { xs: 340, md: 320 },
            display: 'flex',
            flexDirection: 'column',
            '&:hover': { boxShadow: '0 1px 2px rgba(15,23,42,0.04)' },
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1, flexShrink: 0 }}>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Brain size={16} color="#8b5cf6" />
              <Typography sx={{ ...ttType.title, fontSize: '0.9375rem' }}>AI insights</Typography>
            </Stack>
            <Tooltip title={`${bundle.criticalCount} critical · ${bundle.warningCount} warnings · Efficiency ${bundle.efficiencyDelta >= 0 ? '+' : ''}${bundle.efficiencyDelta}%`}>
              <Stack direction="row" spacing={0.5}>
                {bundle.criticalCount > 0 && (
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ef4444' }} />
                )}
                {bundle.warningCount > 0 && (
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                )}
                <Sparkles size={14} color="#a78bfa" />
              </Stack>
            </Tooltip>
          </Stack>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.65,
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 99 },
            }}
          >
            {bundle.insights.map((ins) => (
              <ProductivityInsightRow
                key={ins.id}
                insight={ins}
                expanded={expandedId === ins.id}
                onToggle={() => setExpandedId((id) => (id === ins.id ? null : ins.id))}
                onAction={onInsightAction}
              />
            ))}
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper
          elevation={0}
          sx={{
            ...ttPremiumSx,
            p: 1.25,
            height: { md: 320 },
            maxHeight: { xs: 340, md: 320 },
            display: 'flex',
            flexDirection: 'column',
            '&:hover': { boxShadow: '0 1px 2px rgba(15,23,42,0.04)' },
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1, flexShrink: 0 }}>
            <Typography sx={{ ...ttType.title, fontSize: '0.9375rem' }}>Team activity</Typography>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22c55e', boxShadow: `0 0 0 3px ${alpha('#22c55e', 0.2)}` }} />
          </Stack>
          <TeamActivityFeed events={events} maxHeight={260} embedded />
        </Paper>
      </Grid>
    </Grid>
  );
}
