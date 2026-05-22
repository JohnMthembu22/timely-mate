import React, { useState } from 'react';
import {
  Box,
  Chip,
  Collapse,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  AlertTriangle,
  Brain,
  ChevronDown,
  ChevronUp,
  FileSearch,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { LiveIndicator } from '../ProjectsConsole/ConsolePrimitives';
import { useAnimatedNumber } from '../ProjectsConsole/useAnimatedNumber';
import type { AuditInsight, TimesheetsAuditBundle } from './timesheetsAuditMock';

const severityStyle = {
  info: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

function MetricTile({ label, value, suffix, accent }: { label: string; value: number; suffix?: string; accent: string }) {
  const n = useAnimatedNumber(value);
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.25,
        borderRadius: 2,
        border: '1px solid #e8edf4',
        bgcolor: '#fff',
        position: 'relative',
        overflow: 'hidden',
        '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 2, bgcolor: accent },
      }}
    >
      <Typography sx={{ fontSize: '0.5625rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.06em' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', mt: 0.35 }}>
        {n}
        {suffix}
      </Typography>
    </Paper>
  );
}

function InsightRow({ insight }: { insight: AuditInsight }) {
  const sev = severityStyle[insight.severity];
  const [open, setOpen] = useState(false);
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid #e8edf4',
        overflow: 'hidden',
        transition: 'border-color 180ms ease',
        '&:hover': { borderColor: '#c7d2fe' },
      }}
    >
      <Box onClick={() => setOpen((v) => !v)} sx={{ p: 1.15, cursor: 'pointer' }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ flex: 1 }}>
            <AlertTriangle size={14} color={sev.color} style={{ marginTop: 2 }} />
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>{insight.title}</Typography>
              <Chip
                size="small"
                label={insight.severity}
                sx={{ height: 18, mt: 0.5, fontSize: '0.5rem', fontWeight: 800, bgcolor: sev.bg, color: sev.color }}
              />
            </Box>
          </Stack>
          <IconButton size="small">{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</IconButton>
        </Stack>
      </Box>
      <Collapse in={open}>
        <Typography sx={{ px: 1.15, pb: 1.15, fontSize: '0.6875rem', color: '#64748b', lineHeight: 1.5 }}>
          {insight.detail}
        </Typography>
      </Collapse>
    </Paper>
  );
}

export interface PayrollAuditIntelligenceProps {
  bundle: TimesheetsAuditBundle;
}

export function PayrollAuditIntelligence({ bundle }: PayrollAuditIntelligenceProps) {
  const confAnim = useAnimatedNumber(bundle.payrollForecast.confidence);

  return (
    <Stack spacing={2}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2.5,
          border: '1px solid rgba(99, 102, 241, 0.2)',
          background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #4f46e5 0%, #0f172a 100%)',
              }}
            >
              <FileSearch size={22} color="#fff" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Workforce audit & payroll intelligence
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                Finance-ready ledger · AI audit · compliance · forecasting
              </Typography>
            </Box>
          </Stack>
          <LiveIndicator label="Audit live" />
        </Stack>
      </Paper>

      <Grid container spacing={1}>
        <Grid item xs={6} sm={4} md={2}>
          <MetricTile label="Anomalies" value={bundle.anomalyCount} accent="#ef4444" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricTile label="Compliance" value={bundle.complianceScore} suffix="%" accent="#10b981" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricTile label="OT exposure" value={bundle.otExposureHours} suffix="h" accent="#f59e0b" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricTile label="Pending approval" value={bundle.pendingApprovals} accent="#6366f1" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricTile label="Allocation balance" value={bundle.allocationBalance} suffix="%" accent="#0ea5e9" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2.5,
              border: '1px solid #c7d2fe',
              background: 'linear-gradient(165deg, #0f172a 0%, #1e293b 100%)',
              height: '100%',
            }}
          >
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
              <Wallet size={16} color="#a78bfa" />
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#c4b5fd', letterSpacing: '0.06em' }}>
                PAYROLL FORECAST
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
              {bundle.payrollForecast.amount}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.35 }}>{bundle.payrollForecast.label}</Typography>
            <Chip
              size="small"
              icon={<TrendingUp size={10} />}
              label={bundle.payrollForecast.delta}
              sx={{ mt: 1, fontWeight: 800, bgcolor: 'rgba(16,185,129,0.15)', color: '#6ee7b7' }}
            />
            <Box sx={{ mt: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.35 }}>
                <Typography sx={{ fontSize: '0.5625rem', fontWeight: 800, color: '#94a3b8' }}>CONFIDENCE</Typography>
                <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#e2e8f0' }}>{confAnim}%</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={confAnim}
                sx={{
                  height: 6,
                  borderRadius: 99,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': { borderRadius: 99, bgcolor: '#818cf8' },
                }}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: '1px solid #e8edf4', height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
              <Brain size={16} color="#6366f1" />
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>AI audit insights</Typography>
              <Chip size="small" icon={<Sparkles size={10} />} label="Neural" sx={{ height: 18, fontWeight: 800, fontSize: '0.5rem' }} />
            </Stack>
            <Stack spacing={0.75}>
              {bundle.insights.map((ins) => (
                <InsightRow key={ins.id} insight={ins} />
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
