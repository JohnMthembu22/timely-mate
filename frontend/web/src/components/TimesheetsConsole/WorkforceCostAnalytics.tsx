import React, { useMemo, useState } from 'react';
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
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Brain, ChevronDown, ChevronUp, Download, FileText, Sparkles, TrendingUp } from 'lucide-react';
import { LiveIndicator } from '../ProjectsConsole/ConsolePrimitives';
import { useAnimatedNumber } from '../ProjectsConsole/useAnimatedNumber';
import {
  COST_VIEW_META,
  buildWorkforceCostAnalytics,
  type CostAnalyticsView,
  type WorkforceCostAnalyticsBundle,
} from '../WorkforceOps/workforceCostAnalyticsMock';
import { wfExecutiveSx, wfGlowPulse, wfSectionLabelSx } from '../WorkforceOps/workforceOpsStyles';
import { formatZAR } from '../../utils/currency';

function formatK(v: number) {
  if (v >= 1000) {
    return `R ${(v / 1000).toFixed(0)}k`;
  }
  return formatZAR(v);
}

function ExecutiveMetric({ label, value, suffix, accent }: { label: string; value: number; suffix?: string; accent: string }) {
  const n = useAnimatedNumber(value);
  const display = suffix ? `${n.toLocaleString('en-ZA')}${suffix}` : formatZAR(n);
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 2, border: '1px solid #e8edf4', bgcolor: '#fff', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 2, bgcolor: accent } }}>
      <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.07em' }}>{label}</Typography>
      <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', mt: 0.35 }}>
        {display}
      </Typography>
    </Paper>
  );
}

function ChartPanel({ view, data }: { view: CostAnalyticsView; data: WorkforceCostAnalyticsBundle }) {
  const meta = COST_VIEW_META[view];
  const height = 220;

  const series = useMemo(() => {
    switch (view) {
      case 'department':
        return data.departmentCosts;
      case 'project':
        return data.projectCosts;
      case 'overtime':
        return data.overtimeTrend;
      case 'utilization':
        return data.utilizationByDept;
      case 'forecast':
        return data.forecastTrend;
      case 'productivity':
        return data.productivityVsCost;
      case 'profitability':
        return data.profitability;
      default:
        return data.departmentCosts;
    }
  }, [view, data]);

  const isDual = view === 'forecast' || view === 'productivity';

  return (
    <Box sx={{ height }}>
      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a', mb: 0.25 }}>{meta.title}</Typography>
      <Typography sx={{ fontSize: '0.625rem', color: '#94a3b8', mb: 1 }}>{meta.subtitle}</Typography>
      <ResponsiveContainer width="100%" height="85%">
        {isDual ? (
          <ComposedChart data={series}>
            <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={36} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="value" name={view === 'forecast' ? 'Actual' : 'Productivity'} fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Line type="monotone" dataKey="value2" name={view === 'forecast' ? 'Forecast' : 'Cost index'} stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        ) : (
          <BarChart data={series} barCategoryGap="18%">
            <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={view === 'overtime' ? 28 : 40} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 11 }}
              formatter={(v) => [view === 'overtime' ? `${v}h` : formatK(Number(v ?? 0)), '']}
            />
            <Bar dataKey="value" fill={view === 'utilization' ? '#10b981' : view === 'profitability' ? '#8b5cf6' : '#0ea5e9'} radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </Box>
  );
}

export interface WorkforceCostAnalyticsProps {
  approvedHours: string;
  pendingHours: string;
  onExport?: (format: 'csv' | 'pdf') => void;
}

export function WorkforceCostAnalytics({ approvedHours, pendingHours, onExport }: WorkforceCostAnalyticsProps) {
  const [open, setOpen] = useState(true);
  const [view, setView] = useState<CostAnalyticsView>('department');
  const data = useMemo(() => buildWorkforceCostAnalytics(approvedHours, pendingHours), [approvedHours, pendingHours]);

  const handleExport = (format: 'csv' | 'pdf') => {
    if (onExport) onExport(format);
    else window.alert(`Workforce cost analytics ${format.toUpperCase()} export (mock).`);
  };

  return (
    <Paper elevation={0} sx={{ ...wfExecutiveSx, ...wfGlowPulse }}>
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 1,
          borderBottom: open ? '1px solid #f1f5f9' : 'none',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4f46e5, #0f172a)' }}>
            <TrendingUp size={22} color="#fff" />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Workforce cost analytics
            </Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>Executive labor intelligence · margin · forecast</Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <LiveIndicator label="Live" />
          <Button size="small" variant="outlined" startIcon={<Download size={14} />} onClick={() => handleExport('csv')} sx={{ textTransform: 'none', fontWeight: 700, display: { xs: 'none', sm: 'inline-flex' } }}>
            CSV
          </Button>
          <Button size="small" variant="contained" startIcon={<FileText size={14} />} onClick={() => handleExport('pdf')} sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#4f46e5', display: { xs: 'none', sm: 'inline-flex' } }}>
            PDF
          </Button>
          <IconButton size="small" onClick={() => setOpen((v) => !v)}>
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </IconButton>
        </Stack>
      </Box>

      <Collapse in={open}>
        <Box sx={{ p: 1.5 }}>
          <Grid container spacing={1} sx={{ mb: 1.5 }}>
            <Grid item xs={6} sm={4} md={2}>
              <ExecutiveMetric label="Total labor" value={data.totalLaborCost} accent="#6366f1" />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <ExecutiveMetric label="OT spend" value={data.overtimeSpend} accent="#f59e0b" />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <ExecutiveMetric label="Utilization" value={data.utilizationEfficiency} suffix="%" accent="#10b981" />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <ExecutiveMetric label="Op. margin" value={data.operationalMargin} suffix="%" accent="#8b5cf6" />
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ p: 1.25, mb: 1.5, borderRadius: 2, bgcolor: '#0f172a', border: '1px solid rgba(99,102,241,0.25)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
              <Brain size={16} color="#a78bfa" />
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#c4b5fd', letterSpacing: '0.06em' }}>AI EXECUTIVE SUMMARY</Typography>
              <Chip size="small" icon={<Sparkles size={10} />} label="CFO brief" sx={{ height: 18, fontSize: '0.5rem', fontWeight: 800 }} />
            </Stack>
            <Typography sx={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.55 }}>{data.aiSummary}</Typography>
            <Chip size="small" label={data.forecastVariance} sx={{ mt: 1, fontWeight: 800, bgcolor: 'rgba(245,158,11,0.15)', color: '#fcd34d' }} />
          </Paper>

          <Tabs
            value={view}
            onChange={(_, v: CostAnalyticsView) => setView(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 1.25, minHeight: 36, '& .MuiTab-root': { minHeight: 32, fontSize: '0.6875rem', fontWeight: 700, textTransform: 'none' } }}
          >
            {(Object.keys(COST_VIEW_META) as CostAnalyticsView[]).map((key) => (
              <Tab key={key} value={key} label={COST_VIEW_META[key].title.split(' ').slice(0, 2).join(' ')} />
            ))}
          </Tabs>

          <Grid container spacing={1.5}>
            <Grid item xs={12} md={8}>
              <Paper elevation={0} sx={{ p: 1.25, borderRadius: 2, border: '1px solid #e8edf4', bgcolor: '#fafbfc' }}>
                <ChartPanel view={view} data={data} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 1.25, borderRadius: 2, border: '1px solid #e8edf4', height: '100%' }}>
                <Typography sx={wfSectionLabelSx}>Cost trend</Typography>
                <Box sx={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.costTrendWeekly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} width={32} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={0.75} sx={{ mt: 1.25, display: { xs: 'flex', sm: 'none' } }}>
            <Button fullWidth size="small" variant="outlined" startIcon={<Download size={14} />} onClick={() => handleExport('csv')}>
              Export CSV
            </Button>
            <Button fullWidth size="small" variant="contained" startIcon={<FileText size={14} />} onClick={() => handleExport('pdf')} sx={{ bgcolor: '#4f46e5' }}>
              PDF
            </Button>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
}
