import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Stack,
  Chip,
  LinearProgress,
  Avatar,
  Button,
  alpha,
  useTheme,
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  Users,
  Clock,
  HeartPulse,
  AlertTriangle,
  Trophy,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { DashboardPanel } from '../Dashboard/components/DashboardPanel';
import { glassCardSx } from '../../theme/surfaces';
import { tmColors } from '../../theme/designTokens';
import { useEmployees } from '../../contexts/EmployeeContext';
import { buildWorkforceIntelligenceData } from './workforceIntelligenceMockData';

const healthStatusCopy = {
  strong: { label: 'Strong', color: tmColors.emerald },
  stable: { label: 'Stable', color: tmColors.neonBlue },
  at_risk: { label: 'At risk', color: '#fbbf24' },
};

const WorkforceIntelligence: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { employees } = useEmployees();

  const data = useMemo(
    () => buildWorkforceIntelligenceData(),
    [employees]
  );

  const healthMeta = healthStatusCopy[data.teamHealth.status];

  return (
    <DashboardLayout>
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 3, maxWidth: 1600, mx: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { md: 'flex-end' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{ color: 'text.secondary', letterSpacing: '0.12em', fontWeight: 700 }}
            >
              Workforce
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Workforce Intelligence
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
              Operational view of attendance, productivity, overtime, workload balance, and team
              health. Mock analytics until live workforce APIs are connected.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              component={RouterLink}
              to="/team"
              variant="outlined"
              size="small"
              startIcon={<Users size={16} />}
              sx={{ textTransform: 'none', borderRadius: `${3}px` }}
            >
              Team directory
            </Button>
            <Button
              component={RouterLink}
              to="/time-tracking"
              variant="contained"
              size="small"
              startIcon={<Clock size={16} />}
              sx={{ textTransform: 'none', borderRadius: `${3}px` }}
            >
              Time tracking
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={2.5}>
          {/* KPI strip */}
          <Grid item xs={6} sm={3}>
            <KpiTile label="Attendance rate" value={`${data.attendance.rate}%`} accent="emerald" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <KpiTile
              label="Productivity"
              value={`${data.productivity.current}%`}
              sub={`+${data.productivity.delta}% vs prior`}
              accent="blue"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <KpiTile
              label="Overtime (week)"
              value={`${data.overtime.totalHours}h`}
              sub={`+${data.overtime.weekOverWeek}% WoW`}
              accent="amber"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <KpiTile
              label="Team health"
              value={`${data.teamHealth.score}`}
              sub={healthMeta.label}
              accent="emerald"
            />
          </Grid>

          {/* Attendance */}
          <Grid item xs={12} lg={7}>
            <DashboardPanel title="Attendance overview" subtitle="Weekly presence and punctuality" accent="emerald">
              <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
                <Chip size="small" label={`On time ${data.attendance.onTime}%`} color="success" variant="outlined" />
                <Chip size="small" label={`Late ${data.attendance.late}%`} variant="outlined" />
                <Chip size="small" label={`Absent ${data.attendance.absent}%`} variant="outlined" />
              </Stack>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.attendance.weekly}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="label" tick={{ fill: theme.palette.text.secondary, fontSize: 11 }} />
                    <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: isDark ? '#1e293b' : '#fff',
                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        borderRadius: 3,
                      }}
                    />
                    <Legend />
                    <Bar dataKey="present" name="Present" fill={tmColors.emerald} stackId="a" />
                    <Bar dataKey="late" name="Late" fill="#fbbf24" stackId="a" />
                    <Bar dataKey="absent" name="Absent" fill="#f87171" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </DashboardPanel>
          </Grid>

          {/* Team health */}
          <Grid item xs={12} lg={5}>
            <DashboardPanel title="Team health score" subtitle="Composite operational wellness index" accent="blue">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: healthMeta.color }}>
                  {data.teamHealth.score}
                </Typography>
                <Chip label={healthMeta.label} size="small" sx={{ bgcolor: alpha(healthMeta.color, 0.15), color: healthMeta.color }} />
              </Box>
              <Stack spacing={1.5}>
                {data.teamHealth.factors.map((f) => (
                  <Box key={f.label}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {f.label}
                      </Typography>
                      <Typography variant="caption" fontWeight={700}>
                        {f.value}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={f.value}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor: f.value >= 80 ? tmColors.emerald : f.value >= 65 ? tmColors.neonBlue : '#fbbf24',
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </DashboardPanel>
          </Grid>

          {/* Productivity */}
          <Grid item xs={12} md={6}>
            <DashboardPanel title="Productivity trends" subtitle="Weekly output vs target" accent="blue">
              <Box sx={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.productivity.trend}>
                    <defs>
                      <linearGradient id="prodFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={tmColors.neonBlue} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={tmColors.neonBlue} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="week" tick={{ fill: theme.palette.text.secondary, fontSize: 11 }} />
                    <YAxis domain={[60, 100]} tick={{ fill: theme.palette.text.secondary, fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="score" stroke={tmColors.neonBlue} fill="url(#prodFill)" name="Actual" />
                    <Area type="monotone" dataKey="target" stroke={tmColors.emerald} fill="none" strokeDasharray="4 4" name="Target" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </DashboardPanel>
          </Grid>

          {/* Overtime */}
          <Grid item xs={12} md={6}>
            <DashboardPanel title="Overtime tracking" subtitle="Hours and risk by team member" accent="amber">
              <Stack spacing={1.25}>
                {data.overtime.byMember.map((row) => (
                  <Box
                    key={row.id}
                    sx={{
                      ...glassCardSx(theme),
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: tmColors.neonBlueDeep }}>
                      {row.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {row.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.department}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700}>
                      {row.hours}h
                    </Typography>
                    {row.trend === 'up' ? (
                      <ArrowUpRight size={16} color="#f87171" />
                    ) : row.trend === 'down' ? (
                      <ArrowDownRight size={16} color={tmColors.emerald} />
                    ) : null}
                    <Chip
                      size="small"
                      label={row.risk}
                      sx={{
                        textTransform: 'capitalize',
                        bgcolor:
                          row.risk === 'high'
                            ? alpha('#f87171', 0.15)
                            : row.risk === 'medium'
                              ? alpha('#fbbf24', 0.15)
                              : alpha(tmColors.emerald, 0.15),
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </DashboardPanel>
          </Grid>

          {/* Workload */}
          <Grid item xs={12} md={6}>
            <DashboardPanel
              title="Workload balance"
              subtitle={`Balance index ${data.workload.balanceIndex} · ${data.workload.overloaded} overloaded · ${data.workload.underutilized} underutilized`}
              accent="blue"
            >
              <Stack spacing={1.25}>
                {data.workload.members.map((m) => (
                  <Box key={m.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {m.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {m.utilization}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(m.utilization, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 3,
                        bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor:
                            m.utilization > 90
                              ? '#f87171'
                              : m.utilization > 75
                                ? '#fbbf24'
                                : m.utilization < 50
                                  ? tmColors.neonBlue
                                  : tmColors.emerald,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </DashboardPanel>
          </Grid>

          {/* Fatigue */}
          <Grid item xs={12} md={6}>
            <DashboardPanel title="Fatigue risk indicators" subtitle="Early signals before burnout" accent="amber">
              <Stack spacing={1.25}>
                {data.fatigue.map((f) => (
                  <Box
                    key={f.id}
                    sx={{
                      ...glassCardSx(theme),
                      p: 1.5,
                      borderLeft: '3px solid',
                      borderLeftColor:
                        f.severity === 'critical'
                          ? '#f87171'
                          : f.severity === 'elevated'
                            ? '#fbbf24'
                            : tmColors.neonBlue,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <AlertTriangle size={16} />
                      <Typography variant="body2" fontWeight={700}>
                        {f.name}
                      </Typography>
                      <Chip size="small" label={`Risk ${f.score}`} sx={{ ml: 'auto', textTransform: 'capitalize' }} />
                    </Box>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                      {f.drivers.map((d) => (
                        <Chip key={d} label={d} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </DashboardPanel>
          </Grid>

          {/* Top performers */}
          <Grid item xs={12} md={5}>
            <DashboardPanel title="Top performers" subtitle="Recognition-ready leaders this period" accent="emerald">
              <Stack spacing={1.5}>
                {data.topPerformers.map((p, idx) => (
                  <Box
                    key={p.id}
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      alignItems: 'flex-start',
                      p: 1.5,
                      borderRadius: `${3}px`,
                      ...glassCardSx(theme),
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: `${3}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: idx === 0 ? alpha('#fbbf24', 0.2) : alpha(tmColors.emerald, 0.15),
                        color: idx === 0 ? '#fbbf24' : tmColors.emerald,
                      }}
                    >
                      <Trophy size={16} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700}>
                        {p.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.role} · Score {p.score} (+{p.delta})
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                        {p.highlight}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </DashboardPanel>
          </Grid>

          {/* AI recommendations */}
          <Grid item xs={12} md={7}>
            <DashboardPanel
              title="AI workforce recommendations"
              subtitle="Suggested actions from operational signals (mock)"
              accent="blue"
              action={
                <Chip
                  icon={<Sparkles size={14} />}
                  label="Advisory"
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: `${3}px` }}
                />
              }
            >
              <Stack spacing={1.5}>
                {data.recommendations.map((rec) => (
                  <Box
                    key={rec.id}
                    sx={{
                      ...glassCardSx(theme),
                      p: 2,
                      borderLeft: '3px solid',
                      borderLeftColor:
                        rec.impact === 'high'
                          ? tmColors.neonBlue
                          : rec.impact === 'medium'
                            ? '#fbbf24'
                            : tmColors.emerald,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                      <HeartPulse size={16} />
                      <Typography variant="subtitle2" fontWeight={700}>
                        {rec.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={rec.impact}
                        sx={{ ml: 'auto', textTransform: 'capitalize' }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {rec.detail}
                    </Typography>
                    <Chip
                      size="small"
                      label={rec.category}
                      sx={{ mt: 1, textTransform: 'capitalize' }}
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Stack>
            </DashboardPanel>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

function KpiTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: 'blue' | 'emerald' | 'amber';
}) {
  const theme = useTheme();
  const color =
    accent === 'emerald' ? tmColors.emerald : accent === 'amber' ? '#fbbf24' : tmColors.neonBlue;

  return (
    <Box sx={{ ...glassCardSx(theme), p: 2, height: '100%' }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 800, color, mt: 0.5 }}>
        {value}
      </Typography>
      {sub ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {sub}
        </Typography>
      ) : null}
    </Box>
  );
}

export default WorkforceIntelligence;
