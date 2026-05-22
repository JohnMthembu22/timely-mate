import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, Stack, Chip, alpha, keyframes } from '@mui/material';
import { MapPin, Radio, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useAnimatedNumber } from '../../components/ProjectsConsole/useAnimatedNumber';
import { buildLiveFieldOpsSnapshot } from './liveFieldOpsMockData';
import type { FleetPulse, LiveFieldMetric, LiveOpsState } from './liveFieldOpsTypes';

const pulseRing = keyframes`
  0% { transform: scale(0.85); opacity: 0.9; }
  70% { transform: scale(1.35); opacity: 0; }
  100% { transform: scale(1.35); opacity: 0; }
`;

const scanLine = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
`;

const STATE_COLORS: Record<LiveOpsState, { main: string; glow: string; bg: string }> = {
  optimal: { main: '#34d399', glow: 'rgba(52,211,153,0.45)', bg: 'rgba(16,185,129,0.12)' },
  watch: { main: '#fbbf24', glow: 'rgba(251,191,36,0.45)', bg: 'rgba(245,158,11,0.12)' },
  critical: { main: '#f87171', glow: 'rgba(248,113,113,0.5)', bg: 'rgba(239,68,68,0.14)' },
  neutral: { main: '#38bdf8', glow: 'rgba(56,189,248,0.4)', bg: 'rgba(14,165,233,0.12)' },
};

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const w = 72;
  const h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#spark-${color.replace('#', '')})`}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function LiveDot({ state, size = 8 }: { state: LiveOpsState; size?: number }) {
  const c = STATE_COLORS[state];
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          bgcolor: c.main,
          boxShadow: `0 0 10px ${c.glow}`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: -3,
          borderRadius: '50%',
          border: `2px solid ${c.main}`,
          animation: `${pulseRing} 2s ease-out infinite`,
        }}
      />
    </Box>
  );
}

function MetricTile({ metric }: { metric: LiveFieldMetric }) {
  const animated = useAnimatedNumber(metric.value);
  const colors = STATE_COLORS[metric.state];
  const useStaticDisplay = metric.display.includes('h') || metric.display.includes('m');
  const displayValue = useStaticDisplay
    ? metric.display
    : metric.suffix
      ? `${animated}${metric.suffix}`
      : String(animated);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.15, sm: 1.35 },
        borderRadius: 2,
        bgcolor: 'rgba(15, 23, 42, 0.55)',
        border: `1px solid ${alpha(colors.main, 0.22)}`,
        backdropFilter: 'blur(12px)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 200ms ease, transform 200ms ease',
        '&:hover': {
          borderColor: alpha(colors.main, 0.45),
          transform: 'translateY(-2px)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${colors.main}, transparent)`,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.75 }}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <LiveDot state={metric.state} size={7} />
          <Typography
            sx={{
              fontSize: '0.5625rem',
              fontWeight: 800,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              lineHeight: 1.2,
            }}
          >
            {metric.label}
          </Typography>
        </Stack>
        <Chip
          size="small"
          label={metric.state}
          sx={{
            height: 18,
            fontSize: '0.5rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            bgcolor: colors.bg,
            color: colors.main,
            border: `1px solid ${alpha(colors.main, 0.3)}`,
          }}
        />
      </Stack>

      <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.375rem' },
            fontWeight: 800,
            color: '#f8fafc',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          {displayValue}
        </Typography>
        <MiniSparkline data={metric.sparkline} color={colors.main} />
      </Stack>

      <Stack direction="row" alignItems="center" spacing={0.35}>
        {metric.deltaUp ? <TrendingUp size={11} color={colors.main} /> : <TrendingDown size={11} color="#94a3b8" />}
        <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, color: metric.deltaUp ? colors.main : '#94a3b8' }}>
          {metric.delta}
        </Typography>
      </Stack>

      {metric.gps && (
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.85, pt: 0.75, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <MapPin size={11} color={colors.main} />
          <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, color: '#cbd5e1', flex: 1 }} noWrap>
            {metric.gps.label}
          </Typography>
          <Typography sx={{ fontSize: '0.5rem', fontWeight: 600, color: '#64748b', fontFamily: 'monospace' }}>
            {metric.gps.lat.toFixed(2)}° · {metric.gps.lng.toFixed(2)}°
          </Typography>
        </Stack>
      )}
    </Paper>
  );
}

function ActivityPulseBar({ pulses }: { pulses: FleetPulse[] }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 36, px: 0.25 }}>
      {pulses.map((p) => {
        const c = STATE_COLORS[p.state];
        const h = Math.max(12, (p.intensity / 100) * 36);
        return (
          <TooltipPulse key={p.id} label={p.label} intensity={p.intensity}>
            <Box
              sx={{
                flex: 1,
                height: h,
                borderRadius: '4px 4px 2px 2px',
                bgcolor: alpha(c.main, 0.35),
                border: `1px solid ${alpha(c.main, 0.4)}`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'height 400ms ease',
                ...(p.id === 'p7' && {
                  bgcolor: alpha(c.main, 0.55),
                  boxShadow: `0 0 12px ${c.glow}`,
                }),
              }}
            >
              {p.id === 'p7' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '40%',
                    height: '100%',
                    background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.25)}, transparent)`,
                    animation: `${scanLine} 2.5s ease-in-out infinite`,
                  }}
                />
              )}
            </Box>
          </TooltipPulse>
        );
      })}
    </Box>
  );
}

function TooltipPulse({ label, intensity, children }: { label: string; intensity: number; children: React.ReactNode }) {
  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.35 }}>
      {children}
      <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: '#64748b' }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: '#94a3b8' }}>{intensity}%</Typography>
    </Box>
  );
}

export function LiveFieldOpsDashboard() {
  const [tick, setTick] = useState(0);
  const snapshot = useMemo(() => buildLiveFieldOpsSnapshot(), [tick]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 45000);
    return () => window.clearInterval(id);
  }, []);

  const criticalCount = snapshot.metrics.filter((m) => m.state === 'critical' || m.state === 'watch').length;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: '#0f172a',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 50% at 20% 0%, rgba(14,165,233,0.15), transparent),
            radial-gradient(ellipse 60% 40% at 90% 100%, rgba(236,72,153,0.08), transparent)
          `,
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ position: 'relative', px: { xs: 1.25, sm: 1.75 }, pt: { xs: 1.25, sm: 1.5 }, pb: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                p: 0.75,
                borderRadius: 1.5,
                bgcolor: 'rgba(14,165,233,0.15)',
                border: '1px solid rgba(56,189,248,0.3)',
                display: 'flex',
              }}
            >
              <Activity size={18} color="#38bdf8" />
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Typography sx={{ fontSize: { xs: '0.9375rem', md: '1.0625rem' }, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                  Live Field Operations
                </Typography>
                <LiveDot state="optimal" size={8} />
                <Chip
                  size="small"
                  icon={<Radio size={10} />}
                  label="LIVE"
                  sx={{
                    height: 20,
                    fontWeight: 800,
                    fontSize: '0.5625rem',
                    bgcolor: 'rgba(16,185,129,0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(52,211,153,0.35)',
                    '& .MuiChip-icon': { color: '#34d399', ml: 0.5 },
                  }}
                />
              </Stack>
              <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', mt: 0.2 }}>
                Fleet intelligence · logistics command · real-time workforce telemetry
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" alignItems="center">
            {criticalCount > 0 && (
              <Chip
                size="small"
                label={`${criticalCount} signals need attention`}
                sx={{
                  height: 22,
                  fontWeight: 800,
                  fontSize: '0.625rem',
                  bgcolor: 'rgba(239,68,68,0.12)',
                  color: '#fca5a5',
                  border: '1px solid rgba(248,113,113,0.35)',
                }}
              />
            )}
            <Chip
              size="small"
              label={`Updated ${new Date(snapshot.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              sx={{
                height: 22,
                fontWeight: 700,
                fontSize: '0.625rem',
                bgcolor: 'rgba(255,255,255,0.06)',
                color: '#94a3b8',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ position: 'relative', px: { xs: 1.25, sm: 1.75 }, pb: 1.25 }}>
        <Typography sx={{ fontSize: '0.5625rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.08em', mb: 0.75, textTransform: 'uppercase' }}>
          Operational activity pulse
        </Typography>
        <ActivityPulseBar pulses={snapshot.pulses} />
      </Box>

      <Box
        sx={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(3, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
            xl: 'repeat(3, minmax(0, 1fr))',
          },
          gap: { xs: 1, sm: 1.15 },
          p: { xs: 1.25, sm: 1.75 },
          pt: 0,
        }}
      >
        {snapshot.metrics.map((m) => (
          <MetricTile key={m.id} metric={m} />
        ))}
      </Box>

      <Box
        sx={{
          position: 'relative',
          px: { xs: 1.25, sm: 1.75 },
          py: 1.25,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <Typography sx={{ fontSize: '0.5625rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', mr: 0.5 }}>
          Active regions
        </Typography>
        {snapshot.activeRegions.map((r) => {
          const c = STATE_COLORS[r.state];
          return (
            <Chip
              key={r.name}
              size="small"
              icon={<MapPin size={10} color={c.main} />}
              label={`${r.name} · ${r.crews} crews`}
              sx={{
                height: 24,
                fontWeight: 700,
                fontSize: '0.625rem',
                bgcolor: c.bg,
                color: '#e2e8f0',
                border: `1px solid ${alpha(c.main, 0.25)}`,
                '& .MuiChip-icon': { ml: 0.5 },
              }}
            />
          );
        })}
      </Box>
    </Paper>
  );
}
