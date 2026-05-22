import React from 'react';
import {
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Navigation,
  Radio,
  Route,
  ShieldCheck,
  Users,
  Wifi,
} from 'lucide-react';
import { LiveIndicator } from '../../components/ProjectsConsole/ConsolePrimitives';
import type { ActiveRouteTrack, OperationalAlert, WorkforceTrackEmployee } from './offsiteOpsTypes';
import { fieldHeaderSx, fieldPremiumShellSx, fieldSubtitleSx, fieldTitleSx } from './fieldOpsStyles';

const attendanceStyle: Record<
  WorkforceTrackEmployee['attendance'],
  { label: string; color: string; bg: string }
> = {
  clocked_in: { label: 'Clocked in', color: '#0284c7', bg: '#e0f2fe' },
  on_site: { label: 'On site', color: '#059669', bg: '#ecfdf5' },
  en_route: { label: 'En route', color: '#4f46e5', bg: '#eef2ff' },
  late: { label: 'Late', color: '#dc2626', bg: '#fef2f2' },
  offline: { label: 'Offline', color: '#64748b', bg: '#f1f5f9' },
  break: { label: 'Break', color: '#d97706', bg: '#fffbeb' },
};

function LiveMapPlaceholder({
  crew,
  routes,
}: {
  crew: WorkforceTrackEmployee[];
  routes: ActiveRouteTrack[];
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: '#0f172a',
        minHeight: { xs: 220, md: 280 },
        border: '1px solid rgba(14, 165, 233, 0.25)',
        backgroundImage: `
          linear-gradient(rgba(56, 189, 248, 0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(56, 189, 248, 0.06) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 30% 40%, rgba(99,102,241,0.15) 0%, transparent 55%)',
        }}
      />
      <Stack direction="row" justifyContent="space-between" sx={{ p: 1.25, position: 'relative', zIndex: 1 }}>
        <Chip
          size="small"
          icon={<Radio size={10} />}
          label="Live map · mock telemetry"
          sx={{ height: 22, fontWeight: 800, fontSize: '0.5625rem', bgcolor: 'rgba(15,23,42,0.8)', color: '#7dd3fc', border: '1px solid rgba(125,211,252,0.3)' }}
        />
        <LiveIndicator label="GPS active" />
      </Stack>
      <Box sx={{ position: 'absolute', inset: '12% 8% 10% 8%' }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
          {routes.map((r) => (
            <g key={r.id}>
              <polyline
                points={r.path.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={r.status === 'delayed' ? '#f59e0b' : '#38bdf8'}
                strokeWidth="1.2"
                strokeDasharray={r.status === 'delayed' ? '3 2' : undefined}
                opacity={0.85}
              />
            </g>
          ))}
          {crew.map((w) => (
            <g key={w.id}>
              <circle cx={w.mapX} cy={w.mapY} r="4" fill={attendanceStyle[w.attendance].color} opacity={0.35} />
              <circle cx={w.mapX} cy={w.mapY} r="2.2" fill={attendanceStyle[w.attendance].color} />
              {w.movement === 'moving' && (
                <circle cx={w.mapX} cy={w.mapY} r="6" fill="none" stroke={attendanceStyle[w.attendance].color} strokeWidth="0.5" opacity={0.5}>
                  <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          ))}
        </svg>
      </Box>
      <Stack direction="row" spacing={1} sx={{ position: 'absolute', bottom: 10, left: 12, zIndex: 1 }}>
        <Chip size="small" label={`${crew.length} tracked`} sx={{ height: 20, fontSize: '0.5625rem', fontWeight: 700, bgcolor: 'rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
        <Chip size="small" label={`${routes.length} routes`} sx={{ height: 20, fontSize: '0.5625rem', fontWeight: 700, bgcolor: 'rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
      </Stack>
    </Box>
  );
}

function EmployeeTrackCard({ employee }: { employee: WorkforceTrackEmployee }) {
  const att = attendanceStyle[employee.attendance];
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.25,
        borderRadius: 2,
        border: '1px solid #e8edf4',
        transition: 'border-color 180ms ease, box-shadow 180ms ease',
        '&:hover': { borderColor: '#a5b4fc', boxShadow: '0 6px 16px rgba(99,102,241,0.08)' },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.75rem',
            bgcolor: alpha(att.color, 0.12),
            color: att.color,
            position: 'relative',
          }}
        >
          {employee.initials}
          {employee.movement === 'moving' && (
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 14,
                height: 14,
                borderRadius: '50%',
                bgcolor: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #fff',
              }}
            >
              <Navigation size={8} color="#fff" />
            </Box>
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }} noWrap>
              {employee.name}
            </Typography>
            <Chip size="small" label={att.label} sx={{ height: 20, fontWeight: 800, fontSize: '0.5625rem', color: att.color, bgcolor: att.bg }} />
          </Stack>
          <Typography sx={{ fontSize: '0.625rem', color: '#64748b', mt: 0.25 }}>{employee.role}</Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.75 }}>
            <Chip size="small" icon={<MapPin size={9} />} label={employee.targetSite} sx={{ height: 18, fontSize: '0.5rem', fontWeight: 700 }} />
            <Chip
              size="small"
              icon={employee.gpsVerified ? <ShieldCheck size={9} /> : <AlertTriangle size={9} />}
              label={employee.gpsVerified ? 'GPS OK' : 'GPS weak'}
              sx={{
                height: 18,
                fontSize: '0.5rem',
                fontWeight: 700,
                color: employee.gpsVerified ? '#059669' : '#d97706',
                bgcolor: employee.gpsVerified ? '#ecfdf5' : '#fffbeb',
              }}
            />
            {employee.checkInVerified && (
              <Chip size="small" label="Check-in ✓" sx={{ height: 18, fontSize: '0.5rem', fontWeight: 700, bgcolor: '#eef2ff', color: '#4338ca' }} />
            )}
            {employee.geofence === 'exit' && (
              <Chip size="small" label="Geofence exit" sx={{ height: 18, fontSize: '0.5rem', fontWeight: 700, bgcolor: '#fef2f2', color: '#dc2626' }} />
            )}
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.85, pt: 0.75, borderTop: '1px solid #f1f5f9' }}>
            <Typography sx={{ fontSize: '0.5625rem', color: '#94a3b8', fontWeight: 600 }}>
              {employee.currentRoute} · {employee.travelDurationMin} min travel
            </Typography>
            <Typography sx={{ fontSize: '0.5625rem', fontWeight: 800, color: employee.attendance === 'late' ? '#dc2626' : '#0ea5e9' }}>
              ETA {employee.etaArrival}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}

function RouteTrackRow({ route }: { route: ActiveRouteTrack }) {
  const delayed = route.status === 'delayed';
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 0.85, px: 1, borderRadius: 1.5, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
        <Route size={14} color={delayed ? '#f59e0b' : '#6366f1'} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>{route.name}</Typography>
          <Typography sx={{ fontSize: '0.625rem', color: '#64748b' }} noWrap>
            {route.from} → {route.to} · {route.driver}
          </Typography>
        </Box>
      </Stack>
      <Stack alignItems="flex-end" spacing={0.25}>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: delayed ? '#d97706' : '#059669' }}>
          {route.durationMin + route.delayMin} min
        </Typography>
        {delayed && (
          <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, color: '#dc2626' }}>+{route.delayMin} delay</Typography>
        )}
      </Stack>
    </Stack>
  );
}

function AlertBanner({ alert }: { alert: OperationalAlert }) {
  const colors = {
    info: { border: '#38bdf8', bg: '#f0f9ff', text: '#0369a1' },
    warning: { border: '#fbbf24', bg: '#fffbeb', text: '#b45309' },
    critical: { border: '#f87171', bg: '#fef2f2', text: '#dc2626' },
  }[alert.severity];
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        px: 1.25,
        py: 0.85,
        borderRadius: 1.5,
        border: `1px solid ${colors.border}`,
        bgcolor: colors.bg,
      }}
    >
      <AlertTriangle size={14} color={colors.text} />
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text, flex: 1 }}>{alert.message}</Typography>
    </Stack>
  );
}

export interface WorkforceTrackingPanelProps {
  crew: WorkforceTrackEmployee[];
  routes: ActiveRouteTrack[];
  alerts: OperationalAlert[];
  clockedInCount: number;
}

export function WorkforceTrackingPanel({ crew, routes, alerts, clockedInCount }: WorkforceTrackingPanelProps) {
  const onSite = crew.filter((c) => c.attendance === 'on_site').length;
  const enRoute = crew.filter((c) => c.attendance === 'en_route' || c.attendance === 'late').length;

  return (
    <Paper elevation={0} sx={fieldPremiumShellSx}>
      <Box sx={fieldHeaderSx}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#ecfdf5',
              border: '1px solid #a7f3d0',
            }}
          >
            <Users size={18} color="#059669" />
          </Box>
          <Box>
            <Typography sx={fieldTitleSx}>Workforce tracking</Typography>
            <Typography sx={fieldSubtitleSx}>
              Field locations · routes · arrivals · check-ins · geofence · attendance
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.75} flexWrap="wrap">
          <Chip size="small" icon={<Wifi size={10} />} label={`${clockedInCount} clocked in`} sx={{ fontWeight: 800, fontSize: '0.625rem', bgcolor: '#e0f2fe', color: '#0369a1' }} />
          <Chip size="small" label={`${onSite} on site`} sx={{ fontWeight: 800, fontSize: '0.625rem', bgcolor: '#ecfdf5', color: '#059669' }} />
          <Chip size="small" label={`${enRoute} en route`} sx={{ fontWeight: 800, fontSize: '0.625rem', bgcolor: '#eef2ff', color: '#4338ca' }} />
        </Stack>
      </Box>

      <Box sx={{ p: { xs: 1.25, sm: 1.5 } }}>
        <Stack spacing={1} sx={{ mb: 1.5 }}>
          {alerts.map((a) => (
            <AlertBanner key={a.id} alert={a} />
          ))}
        </Stack>

        <Grid container spacing={1.5}>
          <Grid item xs={12} lg={7}>
            <LiveMapPlaceholder crew={crew} routes={routes} />
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', mt: 1, letterSpacing: '0.06em' }}>
              ACTIVE ROUTES
            </Typography>
            <Stack spacing={0.75} sx={{ mt: 0.75 }}>
              {routes.map((r) => (
                <RouteTrackRow key={r.id} route={r} />
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12} lg={5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.08em' }}>
                FIELD EMPLOYEES
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.35}>
                <Clock size={11} color="#94a3b8" />
                <Typography sx={{ fontSize: '0.5625rem', color: '#94a3b8', fontWeight: 600 }}>Live status</Typography>
              </Stack>
            </Stack>
            <Stack spacing={1} sx={{ maxHeight: 420, overflow: 'auto' }}>
              {crew.map((e) => (
                <EmployeeTrackCard key={e.id} employee={e} />
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
