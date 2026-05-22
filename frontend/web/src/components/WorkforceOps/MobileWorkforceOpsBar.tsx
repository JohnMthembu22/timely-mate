import React from 'react';
import { Box, Button, Chip, Paper, Stack, Typography, alpha } from '@mui/material';
import {
  Camera,
  CheckCircle2,
  CloudOff,
  Fingerprint,
  MapPin,
  MessageCircle,
  Mic,
  RefreshCw,
  Smartphone,
  Wifi,
  WifiOff,
} from 'lucide-react';

export type MobileWorkforceAction =
  | 'offline'
  | 'sync'
  | 'voice'
  | 'approve'
  | 'field_capture'
  | 'biometric'
  | 'whatsapp'
  | 'check_in';

export interface MobileWorkforceOpsBarProps {
  variant: 'time-tracking' | 'timesheets';
  offlineMode?: boolean;
  onAction: (action: MobileWorkforceAction) => void;
  onToggleOffline?: () => void;
}

function QuickBtn({
  icon: Icon,
  label,
  onClick,
  accent = '#6366f1',
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  accent?: string;
}) {
  return (
    <Button
      onClick={onClick}
      sx={{
        flex: '1 1 72px',
        minWidth: 68,
        maxWidth: 88,
        flexDirection: 'column',
        py: 1,
        gap: 0.4,
        borderRadius: 2,
        textTransform: 'none',
        border: '1px solid #e2e8f0',
        bgcolor: '#fff',
        color: '#334155',
        transition: 'all 180ms ease',
        '&:active': { transform: 'scale(0.96)' },
        '&:hover': { borderColor: accent, bgcolor: alpha(accent, 0.06) },
      }}
    >
      <Icon size={18} color={accent} />
      <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, lineHeight: 1.15, textAlign: 'center' }}>
        {label}
      </Typography>
    </Button>
  );
}

export function MobileWorkforceOpsBar({
  variant,
  offlineMode = false,
  onAction,
  onToggleOffline,
}: MobileWorkforceOpsBarProps) {
  return (
    <Paper
      elevation={12}
      sx={{
        display: { xs: 'block', lg: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        borderRadius: '20px 20px 0 0',
        border: '1px solid #e2e8f0',
        borderBottom: 'none',
        bgcolor: alpha('#fff', 0.97),
        backdropFilter: 'blur(14px)',
        boxShadow: '0 -12px 40px rgba(15, 23, 42, 0.14)',
        pb: 'env(safe-area-inset-bottom, 10px)',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, pt: 1, pb: 0.5 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Smartphone size={14} color="#6366f1" />
          <Typography sx={{ fontSize: '0.5625rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.08em' }}>
            MOBILE WORKFORCE
          </Typography>
        </Stack>
        {onToggleOffline && (
          <Chip
            size="small"
            icon={offlineMode ? <WifiOff size={10} /> : <Wifi size={10} />}
            label={offlineMode ? 'Offline' : 'Online'}
            onClick={onToggleOffline}
            sx={{
              height: 22,
              fontWeight: 800,
              fontSize: '0.5rem',
              cursor: 'pointer',
              bgcolor: offlineMode ? '#fff7ed' : '#ecfdf5',
              color: offlineMode ? '#c2410c' : '#059669',
            }}
          />
        )}
      </Stack>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65, px: 1.15, py: 0.85, justifyContent: 'center' }}>
        <QuickBtn icon={MapPin} label="Check-in" onClick={() => onAction('check_in')} accent="#10b981" />
        {variant === 'timesheets' ? (
          <>
            <QuickBtn icon={CheckCircle2} label="Approve" onClick={() => onAction('approve')} accent="#059669" />
            <QuickBtn icon={Camera} label="Field log" onClick={() => onAction('field_capture')} accent="#ec4899" />
          </>
        ) : (
          <>
            <QuickBtn icon={Camera} label="Photo" onClick={() => onAction('field_capture')} accent="#ec4899" />
            <QuickBtn icon={CheckCircle2} label="Complete" onClick={() => onAction('approve')} accent="#14b8a6" />
          </>
        )}
        <QuickBtn icon={Mic} label="Voice" onClick={() => onAction('voice')} accent="#8b5cf6" />
        <QuickBtn icon={Fingerprint} label="Biometric" onClick={() => onAction('biometric')} accent="#0ea5e9" />
        <QuickBtn icon={RefreshCw} label="Sync" onClick={() => onAction('sync')} accent="#6366f1" />
        <QuickBtn icon={CloudOff} label="Offline" onClick={() => onAction('offline')} accent="#64748b" />
        <QuickBtn icon={MessageCircle} label="WhatsApp" onClick={() => onAction('whatsapp')} accent="#22c55e" />
      </Box>
    </Paper>
  );
}
