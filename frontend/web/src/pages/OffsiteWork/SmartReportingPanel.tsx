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
  Tab,
  Tabs,
  Typography,
  alpha,
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Brain, ChevronDown, ChevronUp, Download, FileText, Sparkles, TrendingUp } from 'lucide-react';
import type { FieldReportMetric, SmartReportingBundle } from './offsiteOpsTypes';
import { fieldHeaderSx, fieldPremiumShellSx, fieldSubtitleSx, fieldTitleSx } from './fieldOpsStyles';

const toneColor = {
  positive: '#10b981',
  warning: '#f59e0b',
  neutral: '#0ea5e9',
  critical: '#ef4444',
};

const CHART_COLORS = {
  primary: '#0ea5e9',
  secondary: '#6366f1',
  success: '#10b981',
  accent: '#8b5cf6',
  warn: '#f59e0b',
};

const chartMargin = { top: 8, right: 12, left: 0, bottom: 4 };

function MetricCard({ metric }: { metric: FieldReportMetric }) {
  const color = toneColor[metric.tone];
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.25,
        borderRadius: 2,
        border: '1px solid #e8edf4',
        bgcolor: '#fff',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 20px ${alpha(color, 0.12)}` },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: color,
        },
      }}
    >
      <Typography sx={{ fontSize: '0.5625rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.06em' }}>
        {metric.title.toUpperCase()}
      </Typography>
      <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', mt: 0.35 }}>{metric.value}</Typography>
      <Stack direction="row" alignItems="center" spacing={0.35}>
        <TrendingUp size={11} color={metric.changeUp ? '#059669' : '#dc2626'} />
        <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: metric.changeUp ? '#059669' : '#dc2626' }}>
          {metric.change}
        </Typography>
      </Stack>
    </Paper>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <Paper elevation={3} sx={{ p: 1, borderRadius: 1.5, border: '1px solid #e2e8f0', minWidth: 120 }}>
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#475569', mb: 0.5 }}>{label}</Typography>
      {payload.map((p) => (
        <Typography key={p.name} sx={{ fontSize: '0.75rem', fontWeight: 700, color: p.color }}>
          {p.name}: {p.value}
          {typeof p.value === 'number' && p.value <= 100 ? '%' : ''}
        </Typography>
      ))}
    </Paper>
  );
}

function ChartFrame({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        borderRadius: 2.5,
        border: '1px solid #e8edf4',
        bgcolor: '#fff',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 1.5, pt: 1.25, pb: 0.75, borderBottom: '1px solid #f1f5f9', bgcolor: '#fafbfc' }}>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>{title}</Typography>
        {subtitle && (
          <Typography sx={{ fontSize: '0.625rem', color: '#64748b', mt: 0.25 }}>{subtitle}</Typography>
        )}
      </Box>
      <Box sx={{ height: { xs: 200, sm: 240 }, p: 1.25, pt: 1 }}>{children}</Box>
    </Box>
  );
}

type ReportChartTab = 'productivity' | 'routes' | 'workforce' | 'verification';

export interface SmartReportingPanelProps {
  data: SmartReportingBundle;
  onExport?: (format: 'csv' | 'pdf') => void;
}

export function SmartReportingPanel({ data, onExport }: SmartReportingPanelProps) {
  const [panelOpen, setPanelOpen] = useState(true);
  const [chartTab, setChartTab] = useState<ReportChartTab>('productivity');

  const handleExport = (format: 'csv' | 'pdf') => {
    if (onExport) onExport(format);
    else window.alert(`Export ${format.toUpperCase()} — operational report generated (mock).`);
  };

  const chartTabs: { id: ReportChartTab; label: string }[] = [
    { id: 'productivity', label: 'Productivity' },
    { id: 'routes', label: 'Routes' },
    { id: 'workforce', label: 'Workforce' },
    { id: 'verification', label: 'Scans' },
  ];

  return (
    <Paper elevation={0} sx={fieldPremiumShellSx}>
      <Box
        sx={{
          ...fieldHeaderSx,
          cursor: 'pointer',
          '&:hover': { bgcolor: alpha('#f8fafc', 0.8) },
        }}
        onClick={() => setPanelOpen((v) => !v)}
        role="button"
        aria-expanded={panelOpen}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#eef2ff',
              border: '1px solid #c7d2fe',
            }}
          >
            <FileText size={18} color="#4f46e5" />
          </Box>
          <Box>
            <Typography sx={fieldTitleSx}>Smart reporting</Typography>
            <Typography sx={fieldSubtitleSx}>
              Productivity · routes · attendance · completions · travel · OT · scans
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center" onClick={(e) => e.stopPropagation()}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Download size={14} />}
            onClick={() => handleExport('csv')}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Export CSV
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<FileText size={14} />}
            onClick={() => handleExport('pdf')}
            sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#4f46e5', borderRadius: 1.5, display: { xs: 'none', sm: 'inline-flex' } }}
          >
            PDF report
          </Button>
          <IconButton
            size="small"
            onClick={() => setPanelOpen((v) => !v)}
            sx={{ border: '1px solid #e2e8f0', bgcolor: '#fff' }}
            aria-label={panelOpen ? 'Collapse reporting' : 'Expand reporting'}
          >
            {panelOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </IconButton>
        </Stack>
      </Box>

      <Collapse in={panelOpen}>
        <Box sx={{ p: { xs: 1.25, sm: 1.5 } }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.35,
              mb: 1.5,
              borderRadius: 2,
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', mb: 0.5 }}>
              EXECUTIVE SUMMARY
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#334155', lineHeight: 1.55, fontWeight: 500 }}>
              {data.executiveSummary}
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 1.35,
              mb: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%)',
              border: '1px solid #c7d2fe',
            }}
          >
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
              <Brain size={16} color="#6366f1" />
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#4338ca', letterSpacing: '0.06em' }}>
                AI-GENERATED REPORT SUMMARY
              </Typography>
              <Chip size="small" icon={<Sparkles size={10} />} label="Neural" sx={{ height: 18, fontSize: '0.5rem', fontWeight: 800 }} />
            </Stack>
            <Typography sx={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.55 }}>{data.aiSummary}</Typography>
          </Paper>

          <Grid container spacing={1} sx={{ mb: 1.75 }}>
            {data.metrics.map((m) => (
              <Grid item xs={6} sm={4} md={3} key={m.id}>
                <MetricCard metric={m} />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mb: 1.25 }}>
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.08em', mb: 0.75 }}>
              ANALYTICS
            </Typography>
            <Tabs
              value={chartTab}
              onChange={(_, v: ReportChartTab) => setChartTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 36,
                '& .MuiTab-root': {
                  minHeight: 36,
                  py: 0.75,
                  px: 1.5,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 1.5,
                  mr: 0.5,
                },
                '& .Mui-selected': { color: '#4f46e5' },
                '& .MuiTabs-indicator': { height: 2, borderRadius: 1, bgcolor: '#6366f1' },
              }}
            >
              {chartTabs.map((t) => (
                <Tab key={t.id} value={t.id} label={t.label} />
              ))}
            </Tabs>
          </Box>

          {chartTab === 'productivity' && (
            <ChartFrame title="Field productivity trend" subtitle="Weekly output index · higher is better">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.productivityTrend} margin={chartMargin}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[60, 100]} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Productivity"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: CHART_COLORS.primary, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartFrame>
          )}

          {chartTab === 'routes' && (
            <ChartFrame title="Route efficiency" subtitle="Planned vs optimized weekly scores">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.routeEfficiency} margin={chartMargin} barGap={4} barCategoryGap="18%">
                  <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[80, 100]} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                  <Bar dataKey="value" name="Baseline" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="value2" name="Optimized" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </ChartFrame>
          )}

          {chartTab === 'workforce' && (
            <Grid container spacing={1.5}>
              <Grid item xs={12} md={6}>
                <ChartFrame title="Workforce attendance" subtitle="Daily clock-in rate %">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.attendanceWeekly} margin={chartMargin}>
                      <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[90, 100]} axisLine={false} tickLine={false} width={30} />
                      <Tooltip content={<ChartTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Attendance"
                        stroke={CHART_COLORS.success}
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartFrame>
              </Grid>
              <Grid item xs={12} md={6}>
                <ChartFrame title="Site completion" subtitle="Progress by active site">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.siteCompletion} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={72}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="value" name="Completion" fill={CHART_COLORS.accent} radius={[0, 4, 4, 0]} maxBarSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartFrame>
              </Grid>
            </Grid>
          )}

          {chartTab === 'verification' && (
            <ChartFrame title="Scan verification by type" subtitle="Volume by scan category this week">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.scanStats} margin={chartMargin} barCategoryGap="22%">
                  <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Scans" fill={CHART_COLORS.warn} radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </ChartFrame>
          )}

          <Stack direction="row" spacing={0.75} sx={{ mt: 1.5, display: { xs: 'flex', sm: 'none' } }}>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              startIcon={<Download size={14} />}
              onClick={() => handleExport('csv')}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Export CSV
            </Button>
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={<FileText size={14} />}
              onClick={() => handleExport('pdf')}
              sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#4f46e5' }}
            >
              PDF
            </Button>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
}
