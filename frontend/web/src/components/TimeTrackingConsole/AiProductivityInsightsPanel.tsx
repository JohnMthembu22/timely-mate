import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import {
  AlertTriangle,
  Brain,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Gauge,
  Moon,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { LiveIndicator } from '../ProjectsConsole/ConsolePrimitives';
import type {
  AiProductivityInsight,
  AiProductivityInsightsBundle,
  ProductivityInsightCategory,
} from './aiProductivityInsightsTypes';
import { ttIntelShellSx } from './timeTrackingStyles';

const categoryIcon: Record<ProductivityInsightCategory, React.ElementType> = {
  productivity: TrendingDown,
  workload: Users,
  fatigue: Moon,
  efficiency: TrendingUp,
  overtime: Clock,
  workflow: Gauge,
  attendance: AlertTriangle,
  focus: Target,
};

const categoryLabel: Record<ProductivityInsightCategory, string> = {
  productivity: 'Productivity',
  workload: 'Workload',
  fatigue: 'Fatigue',
  efficiency: 'Efficiency',
  overtime: 'Overtime',
  workflow: 'Workflow',
  attendance: 'Attendance',
  focus: 'Focus time',
};

const severityStyle = {
  info: { color: '#7dd3fc', border: 'rgba(125, 211, 252, 0.35)', glow: 'rgba(56, 189, 248, 0.12)' },
  warning: { color: '#fbbf24', border: 'rgba(251, 191, 36, 0.35)', glow: 'rgba(245, 158, 11, 0.12)' },
  critical: { color: '#f87171', border: 'rgba(248, 113, 113, 0.4)', glow: 'rgba(239, 68, 68, 0.15)' },
};

function InsightCard({
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
  const sev = severityStyle[insight.severity];
  const Icon = categoryIcon[insight.category];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.5,
        border: `1px solid ${sev.border}`,
        bgcolor: alpha('#0f172a', 0.55),
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
        transition: 'box-shadow 220ms ease, border-color 220ms ease',
        boxShadow: expanded ? `0 0 28px ${sev.glow}` : 'none',
        '&:hover': { borderColor: sev.color },
      }}
    >
      <Box onClick={onToggle} sx={{ p: 1.35, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${alpha(sev.color, 0.25)} 0%, transparent 100%)`,
              border: `1px solid ${sev.border}`,
            }}
          >
            <Icon size={18} color={sev.color} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={0.75}>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.35 }}>
                {insight.headline}
              </Typography>
              {insight.metric && (
                <Chip
                  size="small"
                  label={insight.metric}
                  sx={{
                    height: 22,
                    fontWeight: 800,
                    fontSize: '0.625rem',
                    bgcolor: alpha(sev.color, 0.15),
                    color: sev.color,
                    border: `1px solid ${sev.border}`,
                    flexShrink: 0,
                  }}
                />
              )}
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" sx={{ mt: 0.5 }}>
              <Chip
                size="small"
                label={insight.severity}
                sx={{
                  height: 18,
                  fontSize: '0.5rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: sev.color,
                  bgcolor: alpha(sev.color, 0.1),
                }}
              />
              <Chip
                size="small"
                label={categoryLabel[insight.category]}
                sx={{ height: 18, fontSize: '0.5rem', fontWeight: 700, color: '#94a3b8', bgcolor: 'rgba(255,255,255,0.05)' }}
              />
              {insight.teamOrProject && (
                <Typography sx={{ fontSize: '0.625rem', color: '#64748b', fontWeight: 600 }}>
                  {insight.teamOrProject}
                </Typography>
              )}
            </Stack>
          </Box>
          <IconButton size="small" sx={{ color: '#94a3b8' }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </IconButton>
        </Stack>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ px: 1.35, pb: 1.35, pt: 0 }}>
          <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', lineHeight: 1.55, mb: 1 }}>
            {insight.detail}
          </Typography>
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              bgcolor: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(167,139,250,0.2)',
              mb: 1.25,
            }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.35 }}>
              <Zap size={12} color="#a78bfa" />
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#c4b5fd', letterSpacing: '0.04em' }}>
                OPERATIONAL SUGGESTION
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>{insight.recommendation}</Typography>
          </Box>
          <Stack direction="row" spacing={0.75} flexWrap="wrap">
            {insight.actions.map((action) => (
              <Button
                key={action.id}
                size="small"
                variant={action.variant === 'primary' ? 'contained' : 'outlined'}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(action.id, insight);
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  borderRadius: 1.5,
                  ...(action.variant === 'primary'
                    ? { bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }
                    : { color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: '#a78bfa' } }),
                }}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
}

export interface AiProductivityInsightsPanelProps {
  bundle: AiProductivityInsightsBundle;
  onInsightAction: (actionId: string, insight: AiProductivityInsight) => void;
  /** When false, insight list starts collapsed (saves vertical space in tabbed layouts). */
  defaultOpen?: boolean;
}

export function AiProductivityInsightsPanel({ bundle, onInsightAction, defaultOpen = true }: AiProductivityInsightsPanelProps) {
  const [panelOpen, setPanelOpen] = useState(defaultOpen);
  const [expandedId, setExpandedId] = useState<string | null>(bundle.insights[0]?.id ?? null);

  return (
    <Paper elevation={0} sx={ttIntelShellSx}>
      <Box
        sx={{
          px: { xs: 1.25, sm: 1.5 },
          py: { xs: 1.1, md: 1.25 },
          borderBottom: panelOpen ? '1px solid rgba(255,255,255,0.08)' : 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.45)',
            }}
          >
            <Brain size={20} color="#fff" />
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                AI productivity insights
              </Typography>
              <Chip
                size="small"
                icon={<Sparkles size={10} />}
                label="Neural HR"
                sx={{
                  height: 20,
                  fontWeight: 800,
                  fontSize: '0.5rem',
                  bgcolor: 'rgba(6, 182, 212, 0.15)',
                  color: '#67e8f9',
                  border: '1px solid rgba(6,182,212,0.35)',
                }}
              />
            </Stack>
            <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', mt: 0.25 }}>
              Recommendations · workload · fatigue · OT · workflows · attendance · focus
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
          {bundle.criticalCount > 0 && (
            <Chip size="small" label={`${bundle.criticalCount} critical`} sx={{ height: 22, fontWeight: 800, fontSize: '0.625rem', bgcolor: 'rgba(239,68,68,0.15)', color: '#fca5a5' }} />
          )}
          {bundle.warningCount > 0 && (
            <Chip size="small" label={`${bundle.warningCount} warnings`} sx={{ height: 22, fontWeight: 800, fontSize: '0.625rem', bgcolor: 'rgba(245,158,11,0.15)', color: '#fcd34d' }} />
          )}
          <Chip
            size="small"
            icon={<Eye size={10} />}
            label={`Efficiency ${bundle.efficiencyDelta >= 0 ? '+' : ''}${bundle.efficiencyDelta}%`}
            sx={{ height: 22, fontWeight: 800, fontSize: '0.625rem', bgcolor: 'rgba(16,185,129,0.12)', color: '#6ee7b7' }}
          />
          <LiveIndicator label="AI live" />
          <IconButton size="small" onClick={() => setPanelOpen((v) => !v)} sx={{ color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.12)' }}>
            {panelOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </IconButton>
        </Stack>
      </Box>
      <Collapse in={panelOpen}>
        <Box
          sx={{
            p: { xs: 1.25, sm: 1.5 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: 1.15,
          }}
        >
          {bundle.insights.map((ins) => (
            <InsightCard
              key={ins.id}
              insight={ins}
              expanded={expandedId === ins.id}
              onToggle={() => setExpandedId((id) => (id === ins.id ? null : ins.id))}
              onAction={onInsightAction}
            />
          ))}
        </Box>
      </Collapse>
    </Paper>
  );
}
