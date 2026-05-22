import React from 'react';
import {
  Avatar,
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  Brain,
  Clock,
  Flame,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { LiveIndicator } from '../ProjectsConsole/ConsolePrimitives';
import { useAnimatedNumber } from '../ProjectsConsole/useAnimatedNumber';
import type { TimeTrackingWorkforceIntel } from './timeTrackingWorkforceIntel';
import { utilizationHeatColor } from './timeTrackingWorkforceIntel';
import { ttIntelShellSx, ttMetricTileSx, ttSectionLabelSx } from './timeTrackingStyles';

function IntelMetric({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  accent: string;
}) {
  const animated = useAnimatedNumber(value);
  return (
    <Paper elevation={0} sx={ttMetricTileSx(accent)}>
      <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.07em' }}>
        {label}
      </Typography>
      <Stack direction="row" alignItems="baseline" spacing={0.25} sx={{ mt: 0.35 }}>
        <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc' }}>{animated}</Typography>
        {suffix && (
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{suffix}</Typography>
        )}
      </Stack>
    </Paper>
  );
}

function UtilizationHeatBar({ value, heat }: { value: number; heat: string }) {
  const color = utilizationHeatColor(heat as 'low' | 'optimal' | 'high' | 'critical');
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ flex: 1, height: 6, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <Box
          sx={{
            width: `${value}%`,
            height: '100%',
            borderRadius: 99,
            background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.5)})`,
            boxShadow: `0 0 10px ${alpha(color, 0.35)}`,
            transition: 'width 600ms ease',
          }}
        />
      </Box>
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color, minWidth: 36 }}>{value}%</Typography>
    </Box>
  );
}

export interface WorkforceIntelligencePanelProps {
  data: TimeTrackingWorkforceIntel;
}

export function WorkforceIntelligencePanel({ data }: WorkforceIntelligencePanelProps) {
  const { base } = data;
  const trendData = base.productivity.trend;

  return (
    <Paper elevation={0} sx={ttIntelShellSx}>
      <Box
        sx={{
          px: { xs: 1.25, sm: 1.5 },
          py: { xs: 1.1, md: 1.25 },
          borderBottom: '1px solid rgba(255,255,255,0.08)',
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
              background: 'linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%)',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Brain size={20} color="#fff" />
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                Workforce intelligence
              </Typography>
              <Chip
                size="small"
                icon={<Sparkles size={10} />}
                label="Command center"
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
              Live monitoring · AI productivity · attendance · utilization · wellness · OT prediction
            </Typography>
          </Box>
        </Stack>
        <LiveIndicator label="Biometric live" />
      </Box>

      <Box sx={{ p: { xs: 1.25, sm: 1.5 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
            gap: 1,
            mb: 1.5,
          }}
        >
          <IntelMetric label="Active employees" value={data.activeEmployees} accent="#10b981" />
          <IntelMetric label="Active timers" value={data.activeTimers} accent="#0ea5e9" />
          <IntelMetric label="Utilization" value={data.workforceUtilization} suffix="%" accent="#6366f1" />
          <IntelMetric label="OT alerts" value={data.overtimeAlertCount} accent="#f59e0b" />
          <IntelMetric label="Late check-ins" value={data.lateCheckInCount} accent="#f87171" />
        </Box>

        <Grid container spacing={1.5}>
          <Grid item xs={12} lg={5}>
            <Typography sx={{ ...ttSectionLabelSx, color: '#94a3b8', mb: 0.75 }}>Live workforce</Typography>
            <Stack spacing={0.75}>
              {data.liveEmployees.map((emp) => (
                <Box
                  key={emp.id}
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.06)',
                    bgcolor: 'rgba(15,23,42,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    transition: 'background 150ms ease',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: '#334155' }}>
                    {emp.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#f1f5f9' }} noWrap>
                        {emp.name}
                      </Typography>
                      {emp.timerActive && (
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: '#22c55e',
                            boxShadow: '0 0 8px rgba(34,197,94,0.6)',
                            animation: 'tt-pulse 2s ease-in-out infinite',
                            '@keyframes tt-pulse': {
                              '0%, 100%': { opacity: 1 },
                              '50%': { opacity: 0.4 },
                            },
                          }}
                        />
                      )}
                    </Stack>
                    <Typography sx={{ fontSize: '0.625rem', color: '#64748b' }}>
                      {emp.role} · {emp.department}
                    </Typography>
                    <UtilizationHeatBar value={emp.utilization} heat={emp.heat} />
                  </Box>
                  <Chip
                    size="small"
                    label={emp.status}
                    sx={{
                      height: 18,
                      fontSize: '0.5rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      bgcolor:
                        emp.status === 'active'
                          ? 'rgba(16,185,129,0.15)'
                          : emp.status === 'break'
                            ? 'rgba(245,158,11,0.15)'
                            : 'rgba(100,116,139,0.2)',
                      color: emp.status === 'active' ? '#6ee7b7' : emp.status === 'break' ? '#fcd34d' : '#94a3b8',
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Typography sx={{ ...ttSectionLabelSx, color: '#94a3b8', mb: 0.75 }}>Productivity trend</Typography>
            <Box
              sx={{
                height: 200,
                p: 1,
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.06)',
                bgcolor: 'rgba(15,23,42,0.4)',
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[70, 90]} axisLine={false} tickLine={false} width={28} />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="target" name="Target" stroke="#475569" strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
                  <Line type="monotone" dataKey="score" name="Score" stroke="#818cf8" strokeWidth={2.5} dot={{ r: 3, fill: '#818cf8' }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            <Typography sx={{ ...ttSectionLabelSx, color: '#94a3b8', mt: 1.25, mb: 0.75 }}>Department load</Typography>
            <Stack spacing={0.75}>
              {data.departmentLoads.map((dept) => (
                <Box
                  key={dept.id}
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0' }}>{dept.name}</Typography>
                    <Chip
                      size="small"
                      label={dept.status}
                      sx={{
                        height: 18,
                        fontSize: '0.5rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        bgcolor:
                          dept.status === 'overloaded'
                            ? 'rgba(239,68,68,0.15)'
                            : dept.status === 'underutilized'
                              ? 'rgba(56,189,248,0.15)'
                              : 'rgba(16,185,129,0.12)',
                        color:
                          dept.status === 'overloaded'
                            ? '#fca5a5'
                            : dept.status === 'underutilized'
                              ? '#7dd3fc'
                              : '#6ee7b7',
                      }}
                    />
                  </Stack>
                  <UtilizationHeatBar
                    value={dept.utilization}
                    heat={dept.utilization >= 90 ? 'critical' : dept.utilization < 55 ? 'low' : 'optimal'}
                  />
                </Box>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} lg={3}>
            <Typography sx={{ ...ttSectionLabelSx, color: '#94a3b8', mb: 0.75 }}>Alerts & anomalies</Typography>
            <Stack spacing={0.75} sx={{ mb: 1.25 }}>
              {base.overtime.byMember
                .filter((o) => o.risk !== 'low')
                .slice(0, 3)
                .map((o) => (
                  <Box
                    key={o.id}
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      border: '1px solid rgba(245,158,11,0.25)',
                      bgcolor: 'rgba(245,158,11,0.08)',
                    }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Clock size={12} color="#fbbf24" />
                      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#fcd34d' }}>OT {o.risk}</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#fef3c7', mt: 0.25 }}>{o.name}</Typography>
                    <Typography sx={{ fontSize: '0.625rem', color: '#94a3b8' }}>
                      {o.hours}h · {o.department}
                    </Typography>
                  </Box>
                ))}
            </Stack>

            <Typography sx={{ fontSize: '0.5625rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', mb: 0.5 }}>
              LATE CHECK-INS
            </Typography>
            {data.lateCheckIns.map((late) => (
              <Box key={late.id} sx={{ py: 0.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#cbd5e1' }}>{late.name}</Typography>
                <Typography sx={{ fontSize: '0.625rem', color: '#94a3b8' }}>
                  {late.actual} (+{late.minutesLate}m) · {late.department}
                </Typography>
              </Box>
            ))}

            <Typography sx={{ fontSize: '0.5625rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', mt: 1, mb: 0.5 }}>
              ATTENDANCE ANOMALIES
            </Typography>
            {data.anomalies.map((a) => (
              <Box
                key={a.id}
                sx={{
                  p: 0.85,
                  mb: 0.5,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor:
                    a.severity === 'critical'
                      ? 'rgba(239,68,68,0.3)'
                      : a.severity === 'warning'
                        ? 'rgba(245,158,11,0.25)'
                        : 'rgba(148,163,184,0.2)',
                }}
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <AlertTriangle size={11} color={a.severity === 'critical' ? '#f87171' : '#fbbf24'} />
                  <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#e2e8f0' }}>{a.label}</Typography>
                </Stack>
                <Typography sx={{ fontSize: '0.625rem', color: '#94a3b8', mt: 0.25 }}>{a.detail}</Typography>
              </Box>
            ))}

            <Typography sx={{ fontSize: '0.5625rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', mt: 1, mb: 0.5 }}>
              BURNOUT RISK
            </Typography>
            {base.fatigue.slice(0, 3).map((f) => (
              <Box key={f.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, py: 0.5 }}>
                <Flame size={12} color={f.severity === 'critical' ? '#ef4444' : '#f59e0b'} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#e2e8f0' }}>{f.name}</Typography>
                  <Typography sx={{ fontSize: '0.625rem', color: '#94a3b8' }}>Risk {f.score}%</Typography>
                </Box>
              </Box>
            ))}
          </Grid>
        </Grid>

        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
            <Zap size={14} color="#a78bfa" />
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#c4b5fd', letterSpacing: '0.06em' }}>
              AI PRODUCTIVITY & ALLOCATION
            </Typography>
          </Stack>
          <Grid container spacing={1}>
            {base.recommendations.slice(0, 3).map((rec) => (
              <Grid item xs={12} md={4} key={rec.id}>
                <Box
                  sx={{
                    p: 1.15,
                    borderRadius: 2,
                    border: '1px solid rgba(167,139,250,0.2)',
                    bgcolor: 'rgba(99,102,241,0.08)',
                    height: '100%',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.35 }}>
                    <TrendingUp size={12} color="#a78bfa" />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#e2e8f0' }}>{rec.title}</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', lineHeight: 1.45 }}>{rec.detail}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
}
