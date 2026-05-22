import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Brain,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Sparkles,
  Zap,
} from 'lucide-react';
import { LiveIndicator } from '../ProjectsConsole/ConsolePrimitives';
import { useAnimatedNumber } from '../ProjectsConsole/useAnimatedNumber';
import type { PayrollAiInsight, PayrollIntelligenceBundle } from './payrollIntelligenceMock';

const severityStyle = {
  info: { color: '#7dd3fc', border: 'rgba(125, 211, 252, 0.35)', glow: 'rgba(56, 189, 248, 0.12)' },
  warning: { color: '#fbbf24', border: 'rgba(251, 191, 36, 0.35)', glow: 'rgba(245, 158, 11, 0.12)' },
  critical: { color: '#f87171', border: 'rgba(248, 113, 113, 0.4)', glow: 'rgba(239, 68, 68, 0.15)' },
};

function InsightCard({
  insight,
  expanded,
  onToggle,
}: {
  insight: PayrollAiInsight;
  expanded: boolean;
  onToggle: () => void;
}) {
  const sev = severityStyle[insight.severity];
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.5,
        border: `1px solid ${sev.border}`,
        bgcolor: alpha('#0f172a', 0.55),
        overflow: 'hidden',
        boxShadow: expanded ? `0 0 24px ${sev.glow}` : 'none',
        transition: 'box-shadow 200ms ease',
      }}
    >
      <Box onClick={onToggle} sx={{ p: 1.25, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.35 }}>
              {insight.headline}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
              <Chip size="small" label={insight.severity} sx={{ height: 18, fontSize: '0.5rem', fontWeight: 800, color: sev.color, bgcolor: alpha(sev.color, 0.1) }} />
              {insight.metric && (
                <Chip size="small" label={insight.metric} sx={{ height: 18, fontSize: '0.625rem', fontWeight: 800, color: sev.color, bgcolor: alpha(sev.color, 0.12) }} />
              )}
            </Stack>
          </Box>
          <IconButton size="small" sx={{ color: '#94a3b8' }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </IconButton>
        </Stack>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ px: 1.25, pb: 1.25 }}>
          <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', mb: 1, lineHeight: 1.5 }}>{insight.detail}</Typography>
          <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.35 }}>
              <Zap size={12} color="#a78bfa" />
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#c4b5fd' }}>RECOMMENDATION</Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>{insight.recommendation}</Typography>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}

export function AiPayrollIntelligencePanel({ bundle }: { bundle: PayrollIntelligenceBundle }) {
  const [panelOpen, setPanelOpen] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(bundle.insights[0]?.id ?? null);
  const otAnim = useAnimatedNumber(bundle.overtimeRiskHours);
  const effAnim = useAnimatedNumber(bundle.payrollEfficiency);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.5,
        border: '1px solid rgba(79, 70, 229, 0.25)',
        background: 'linear-gradient(165deg, #020617 0%, #0f172a 45%, #1e1b4b 100%)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 1.5, py: 1.25, borderBottom: panelOpen ? '1px solid rgba(255,255,255,0.08)' : 'none', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)' }}>
            <DollarSign size={20} color="#fff" />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, color: '#f8fafc' }}>AI payroll intelligence</Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Forecast · risks · anomalies · labor breakdown</Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Chip size="small" icon={<Sparkles size={10} />} label="Finance AI" sx={{ height: 20, fontWeight: 800, fontSize: '0.5rem', bgcolor: 'rgba(167,139,250,0.2)', color: '#c4b5fd' }} />
          <LiveIndicator label="Live" />
          <IconButton size="small" onClick={() => setPanelOpen((v) => !v)} sx={{ color: '#cbd5e1' }}>
            {panelOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </IconButton>
        </Stack>
      </Box>

      <Collapse in={panelOpen}>
        <Box sx={{ p: 1.5 }}>
          <Grid container spacing={1} sx={{ mb: 1.5 }}>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 1.15, borderRadius: 2, bgcolor: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: '#94a3b8' }}>PROJECTED PAYROLL</Typography>
                <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc' }}>{bundle.projectedPayroll.amount}</Typography>
                <Typography sx={{ fontSize: '0.625rem', color: '#fbbf24', fontWeight: 700 }}>{bundle.projectedPayroll.variance}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 1.15, borderRadius: 2, bgcolor: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: '#94a3b8' }}>OT RISK</Typography>
                <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: '#fcd34d' }}>{otAnim}h</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 1.15, borderRadius: 2, bgcolor: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: '#94a3b8' }}>UNDERREPORTED</Typography>
                <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: '#fca5a5' }}>{bundle.underreportedHours}h</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper elevation={0} sx={{ p: 1.15, borderRadius: 2, bgcolor: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: '#94a3b8' }}>EFFICIENCY</Typography>
                <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: '#6ee7b7' }}>{effAnim}%</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.06)', height: 160 }}>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', mb: 0.5 }}>Cost vs budget</Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={bundle.costTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={28} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 11 }} />
                    <Line type="monotone" dataKey="budget" stroke="#64748b" strokeDasharray="4 4" dot={false} />
                    <Line type="monotone" dataKey="actual" stroke="#818cf8" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.06)', height: 160 }}>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', mb: 0.5 }}>OT hours trend</Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={bundle.otTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={24} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', fontSize: 11 }} />
                    <Bar dataKey="hours" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 1.15, borderRadius: 2, bgcolor: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.06)', height: 160 }}>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', mb: 0.75 }}>Labor cost breakdown</Typography>
                <Stack spacing={0.75}>
                  {bundle.laborBreakdown.slice(0, 4).map((slice) => (
                    <Box key={slice.project}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.25 }}>
                        <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: '#e2e8f0' }} noWrap>{slice.project}</Typography>
                        <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8' }}>{slice.pct}%</Typography>
                      </Stack>
                      <Box sx={{ height: 4, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <Box sx={{ width: `${slice.pct}%`, height: '100%', bgcolor: '#6366f1', borderRadius: 99 }} />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
            <Brain size={14} color="#a78bfa" />
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#c4b5fd', letterSpacing: '0.06em' }}>AI INSIGHTS</Typography>
          </Stack>
          <Grid container spacing={1}>
            {bundle.insights.map((ins) => (
              <Grid item xs={12} md={6} key={ins.id}>
                <InsightCard
                  insight={ins}
                  expanded={expandedId === ins.id}
                  onToggle={() => setExpandedId((id) => (id === ins.id ? null : ins.id))}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
}
