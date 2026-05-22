import React from 'react';
import {
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import {
  Bluetooth,
  Camera,
  Fingerprint,
  MapPin,
  Mic,
  Nfc,
  QrCode,
  Radio,
  ScanFace,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Watch,
  Wifi,
} from 'lucide-react';
import { LiveIndicator } from '../ProjectsConsole/ConsolePrimitives';
import { VERIFICATION_METHODS, type VerificationMethod, type VerificationMethodId } from './verificationMethodsData';

const methodIcon: Record<VerificationMethodId, React.ElementType> = {
  qr: QrCode,
  geofence: MapPin,
  watch: Watch,
  voice: Mic,
  facial: ScanFace,
  fingerprint: Fingerprint,
  nfc: Nfc,
  ble: Bluetooth,
  gps: MapPin,
  site_geofence: Shield,
  fraud_ai: ShieldCheck,
  selfie: Camera,
};

const statusStyle = {
  active: { label: 'Verified', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  standby: { label: 'Standby', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
  syncing: { label: 'Syncing', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  placeholder: { label: 'Coming soon', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
};

const PRIMARY_METHOD_IDS: VerificationMethodId[] = ['qr', 'geofence', 'watch', 'voice'];

export function VerificationCard({
  method,
  isCheckedIn,
  onVerify,
  onPlaceholder,
}: {
  method: VerificationMethod;
  isCheckedIn: boolean;
  onVerify: (checkInKey: string) => void;
  onPlaceholder: (method: VerificationMethod) => void;
}) {
  const Icon = methodIcon[method.id];
  const st = statusStyle[method.status];
  const canCheckIn = Boolean(method.checkInKey) && !method.placeholder;

  return (
    <Paper
      elevation={0}
      onClick={() => {
        if (canCheckIn) onVerify(method.checkInKey!);
        else onPlaceholder(method);
      }}
      sx={{
        p: 1.5,
        height: '100%',
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: method.status === 'active' ? 'rgba(16,185,129,0.25)' : '#e8edf4',
        bgcolor: method.placeholder ? '#fafbfc' : '#fff',
        cursor: 'pointer',
        transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: method.placeholder
            ? '0 8px 20px rgba(15,23,42,0.06)'
            : `0 12px 28px ${alpha('#6366f1', 0.12)}`,
          borderColor: method.placeholder ? '#c7d2fe' : '#86efac',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: method.placeholder
            ? 'linear-gradient(90deg, #94a3b8, #cbd5e1)'
            : 'linear-gradient(90deg, #6366f1, #06b6d4)',
          opacity: method.placeholder ? 0.5 : 1,
        },
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: method.placeholder
                ? '#f1f5f9'
                : 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.08) 100%)',
              border: '1px solid',
              borderColor: method.placeholder ? '#e2e8f0' : 'rgba(99,102,241,0.2)',
            }}
          >
            <Icon size={22} color={method.placeholder ? '#64748b' : '#4f46e5'} />
          </Box>
          <Chip
            size="small"
            label={st.label}
            sx={{ height: 20, fontWeight: 800, fontSize: '0.5rem', bgcolor: st.bg, color: st.color }}
          />
        </Stack>

        <Box>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {method.title}
          </Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', mt: 0.35, lineHeight: 1.45 }}>
            {method.description}
          </Typography>
        </Box>

        {method.accuracyScore != null && (
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.35 }}>
              <Typography sx={{ fontSize: '0.5625rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>
                ACCURACY
              </Typography>
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#334155' }}>{method.accuracyScore}%</Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={method.accuracyScore}
              sx={{
                height: 4,
                borderRadius: 99,
                bgcolor: '#f1f5f9',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 99,
                  background: 'linear-gradient(90deg, #6366f1, #22d3ee)',
                },
              }}
            />
          </Box>
        )}

        {method.biometricConfidence != null && (
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.35 }}>
              <Typography sx={{ fontSize: '0.5625rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>
                BIOMETRIC CONFIDENCE
              </Typography>
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#059669' }}>
                {method.biometricConfidence}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={method.biometricConfidence}
              sx={{
                height: 4,
                borderRadius: 99,
                bgcolor: '#ecfdf5',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 99,
                  bgcolor: '#10b981',
                },
              }}
            />
          </Box>
        )}

        <Typography sx={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 600 }}>
          Last sync: {method.lastSync ?? '—'}
        </Typography>

        {canCheckIn && !isCheckedIn && (
          <Button
            size="small"
            variant="contained"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onVerify(method.checkInKey!);
            }}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.6875rem',
              borderRadius: 1.5,
              bgcolor: '#0f172a',
              mt: 0.5,
            }}
          >
            Verify & check in
          </Button>
        )}
        {method.placeholder && (
          <Chip
            size="small"
            icon={<Sparkles size={10} />}
            label="Enterprise pilot"
            sx={{ height: 22, fontWeight: 700, fontSize: '0.5625rem', alignSelf: 'flex-start' }}
          />
        )}
      </Stack>
    </Paper>
  );
}

export interface SmartWorkforceVerificationProps {
  isCheckedIn: boolean;
  checkInTime: string | null;
  onVerify: (checkInKey: string) => void;
  onPlaceholder: (title: string) => void;
  /** Reduces outer padding when embedded in dashboard accordions. */
  dense?: boolean;
  /** Zone layout: compact grid, optional primary/advanced split via `section`. */
  zoneLayout?: boolean;
  section?: 'all' | 'primary' | 'advanced';
}

export function SmartWorkforceVerification({
  isCheckedIn,
  checkInTime,
  onVerify,
  onPlaceholder,
  dense = false,
  zoneLayout = false,
  section = 'all',
}: SmartWorkforceVerificationProps) {
  const activeCount = VERIFICATION_METHODS.filter((m) => m.status === 'active').length;
  const methods =
    section === 'primary'
      ? VERIFICATION_METHODS.filter((m) => PRIMARY_METHOD_IDS.includes(m.id))
      : section === 'advanced'
        ? VERIFICATION_METHODS.filter((m) => !PRIMARY_METHOD_IDS.includes(m.id))
        : VERIFICATION_METHODS;

  if (zoneLayout && section !== 'all') {
    return (
      <Box>
        {section === 'primary' && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 0.75 }}>
            <Chip size="small" icon={<Wifi size={10} />} label={`${activeCount} channels live`} sx={{ height: 22, fontWeight: 800, fontSize: '0.5625rem' }} />
            {isCheckedIn ? (
              <Chip size="small" icon={<ShieldCheck size={10} />} label={checkInTime ? `Verified ${checkInTime}` : 'Verified'} sx={{ height: 22, fontWeight: 800, fontSize: '0.5625rem', bgcolor: '#ecfdf5', color: '#059669' }} />
            ) : (
              <Chip size="small" label="Awaiting verification" sx={{ height: 22, fontWeight: 800, fontSize: '0.5625rem' }} />
            )}
            <LiveIndicator label="Secure" />
          </Stack>
        )}
        <Grid container spacing={0.75}>
          {methods.map((method) => (
            <Grid item xs={6} sm={4} md={3} key={method.id}>
              <VerificationCard
                method={method}
                isCheckedIn={isCheckedIn}
                onVerify={onVerify}
                onPlaceholder={(m) => onPlaceholder(m.title)}
              />
            </Grid>
          ))}
        </Grid>
        {section === 'primary' && (
          <Paper
            elevation={0}
            sx={{
              mt: 0.75,
              p: 0.85,
              borderRadius: 1.5,
              border: '1px dashed #c7d2fe',
              bgcolor: alpha('#eef2ff', 0.4),
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
            }}
          >
            <Smartphone size={14} color="#6366f1" />
            <Typography sx={{ fontSize: '0.625rem', color: '#475569', lineHeight: 1.4 }}>
              AI fraud detection active. Expand advanced methods for biometric pilots.
            </Typography>
          </Paper>
        )}
      </Box>
    );
  }

  return (
    <Box sx={zoneLayout || dense ? undefined : { py: { xs: 3, md: 4 }, px: { xs: 1.5, md: 2 } }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: dense ? 2 : 3,
          border: '1px solid #e5eaf1',
          overflow: 'hidden',
          boxShadow: dense ? 'none' : '0 4px 24px rgba(15, 23, 42, 0.06)',
        }}
      >
        {!zoneLayout && (
        <Box
          sx={{
            px: dense ? { xs: 1.15, md: 1.35 } : { xs: 2, md: 2.5 },
            py: dense ? 1.15 : 2,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1.5}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                }}
              >
                <Shield size={24} color="#fff" />
              </Box>
              <Box>
                <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
                  <Typography sx={{ fontSize: { xs: '1.125rem', md: '1.25rem' }, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                    Smart workforce verification
                  </Typography>
                  <Chip
                    size="small"
                    icon={<Radio size={10} />}
                    label="Biometric-grade"
                    sx={{
                      height: 22,
                      fontWeight: 800,
                      fontSize: '0.5625rem',
                      bgcolor: 'rgba(16,185,129,0.15)',
                      color: '#6ee7b7',
                      border: '1px solid rgba(16,185,129,0.3)',
                    }}
                  />
                </Stack>
                <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.35, maxWidth: 560 }}>
                  Multi-factor attendance verification — QR, geofence, wearables, voice, and next-gen biometric pilots.
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
              <Chip
                size="small"
                icon={<Wifi size={10} />}
                label={`${activeCount} channels live`}
                sx={{ height: 24, fontWeight: 800, fontSize: '0.625rem', bgcolor: 'rgba(255,255,255,0.08)', color: '#e2e8f0' }}
              />
              {isCheckedIn ? (
                <Chip
                  size="small"
                  icon={<ShieldCheck size={10} />}
                  label={checkInTime ? `Verified ${checkInTime}` : 'Session verified'}
                  sx={{ height: 24, fontWeight: 800, fontSize: '0.625rem', bgcolor: 'rgba(16,185,129,0.2)', color: '#6ee7b7' }}
                />
              ) : (
                <Chip
                  size="small"
                  label="Awaiting verification"
                  sx={{ height: 24, fontWeight: 800, fontSize: '0.625rem', bgcolor: 'rgba(245,158,11,0.15)', color: '#fcd34d' }}
                />
              )}
              <LiveIndicator label="Secure" />
            </Stack>
          </Stack>
        </Box>
        )}

        {zoneLayout && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ px: 1, py: 0.75, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
            <Chip size="small" icon={<Wifi size={10} />} label={`${activeCount} live`} sx={{ height: 22, fontWeight: 800, fontSize: '0.5625rem' }} />
            {isCheckedIn ? (
              <Chip size="small" icon={<ShieldCheck size={10} />} label="Verified" sx={{ height: 22, fontWeight: 800, fontSize: '0.5625rem', bgcolor: '#ecfdf5', color: '#059669' }} />
            ) : (
              <Chip size="small" label="Awaiting" sx={{ height: 22, fontWeight: 800, fontSize: '0.5625rem' }} />
            )}
            <LiveIndicator label="Secure" />
          </Stack>
        )}

        <Box sx={{ p: zoneLayout || dense ? { xs: 1, md: 1.15 } : { xs: 2, md: 2.5 }, bgcolor: '#f8fafc' }}>
          <Grid container spacing={zoneLayout || dense ? 0.75 : 1.5}>
            {methods.map((method) => (
              <Grid item xs={12} sm={6} md={4} lg={zoneLayout || dense ? 3 : 3} key={method.id}>
                <VerificationCard
                  method={method}
                  isCheckedIn={isCheckedIn}
                  onVerify={onVerify}
                  onPlaceholder={(m) => onPlaceholder(m.title)}
                />
              </Grid>
            ))}
          </Grid>

          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 2,
              border: '1px dashed #c7d2fe',
              bgcolor: alpha('#eef2ff', 0.5),
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              flexWrap: 'wrap',
            }}
          >
            <Smartphone size={18} color="#6366f1" />
            <Typography sx={{ fontSize: '0.75rem', color: '#475569', flex: 1, minWidth: 200 }}>
              AI fraud detection runs continuously on punch patterns. Facial, fingerprint, NFC, BLE, and selfie channels
              enroll during enterprise pilot — existing QR, geofence, watch, and voice remain fully operational.
            </Typography>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}
