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
  Brain,
  ChevronDown,
  ChevronUp,
  CloudRain,
  Clock,
  Package,
  Route,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import type { AiInsightCategory, AiOperationalInsight } from './offsiteOpsTypes';

const categoryIcon: Record<AiInsightCategory, React.ElementType> = {
  route: Route,
  overtime: Clock,
  weather: CloudRain,
  workforce: Users,
  material: Package,
  installation: Zap,
  safety: Shield,
  delay: TrendingUp,
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
  insight: AiOperationalInsight;
  expanded: boolean;
  onToggle: () => void;
  onAction: (actionId: string, insight: AiOperationalInsight) => void;
}) {
  const sev = severityStyle[insight.severity];
  const Icon = categoryIcon[insight.category];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.5,
        border: `1px solid ${sev.border}`,
        bgcolor: alpha('#0f172a', 0.6),
        backdropFilter: 'blur(8px)',
        overflow: 'hidden',
        transition: 'box-shadow 200ms ease',
        boxShadow: expanded ? `0 0 24px ${sev.glow}` : 'none',
      }}
    >
      <Box
        onClick={onToggle}
        sx={{
          p: 1.35,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${alpha(sev.color, 0.2)} 0%, transparent 100%)`,
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
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
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
              {insight.siteName && (
                <Typography sx={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 600 }}>{insight.siteName}</Typography>
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
          <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', lineHeight: 1.5, mb: 1 }}>
            {insight.detail}
          </Typography>
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              bgcolor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              mb: 1.25,
            }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.35 }}>
              <Sparkles size={12} color="#a78bfa" />
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#c4b5fd', letterSpacing: '0.04em' }}>
                RECOMMENDATION
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
                    ? {
                        bgcolor: '#0ea5e9',
                        '&:hover': { bgcolor: '#0284c7' },
                      }
                    : {
                        color: '#cbd5e1',
                        borderColor: 'rgba(255,255,255,0.2)',
                        '&:hover': { borderColor: '#7dd3fc', bgcolor: 'rgba(56,189,248,0.08)' },
                      }),
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

export interface AiOperationalInsightsPanelProps {
  insights: AiOperationalInsight[];
  onInsightAction: (actionId: string, insight: AiOperationalInsight) => void;
}

export function AiOperationalInsightsPanel({ insights, onInsightAction }: AiOperationalInsightsPanelProps) {
  const [panelOpen, setPanelOpen] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(insights[0]?.id ?? null);

  const critical = insights.filter((i) => i.severity === 'critical').length;
  const warning = insights.filter((i) => i.severity === 'warning').length;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.5,
        border: '1px solid rgba(14, 165, 233, 0.3)',
        background: 'linear-gradient(165deg, #020617 0%, #0f172a 42%, #1e1b4b 100%)',
        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: { xs: 1.25, sm: 1.5 },
          py: { xs: 1.1, md: 1.25 },
          borderBottom: panelOpen ? '1px solid rgba(255,255,255,0.08)' : 'none',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%)',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
            }}
          >
            <Brain size={20} color="#fff" />
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                AI operational insights
              </Typography>
              <Chip
                size="small"
                icon={<Sparkles size={10} />}
                label="Neural ops"
                sx={{
                  height: 20,
                  fontWeight: 800,
                  fontSize: '0.5rem',
                  bgcolor: 'rgba(167, 139, 250, 0.2)',
                  color: '#c4b5fd',
                  border: '1px solid rgba(167,139,250,0.35)',
                }}
              />
            </Stack>
            <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', mt: 0.25 }}>
              Routes · weather · workforce · materials · safety · SLA predictions
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center">
          {critical > 0 && (
            <Chip size="small" label={`${critical} critical`} sx={{ height: 22, fontWeight: 800, fontSize: '0.625rem', bgcolor: 'rgba(239,68,68,0.15)', color: '#fca5a5' }} />
          )}
          {warning > 0 && (
            <Chip size="small" label={`${warning} warnings`} sx={{ height: 22, fontWeight: 800, fontSize: '0.625rem', bgcolor: 'rgba(245,158,11,0.15)', color: '#fcd34d' }} />
          )}
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
          {insights.map((ins) => (
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
