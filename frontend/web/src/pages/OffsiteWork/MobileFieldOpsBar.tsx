import React from 'react';
import { Box, Button, Chip, Paper, Stack, Typography, alpha } from '@mui/material';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Mic,
  QrCode,
  ScanLine,
  Wifi,
  WifiOff,
} from 'lucide-react';

export interface MobileFieldOpsBarProps {
  offlineMode: boolean;
  onToggleOffline: () => void;
  onQuickCheckIn: () => void;
  onQuickScan: () => void;
  onVoiceNote: () => void;
  onImageUpload: () => void;
  onGpsVerify: () => void;
  onEmergency: () => void;
  onWhatsApp: () => void;
  onCompleteTask: () => void;
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
  accent = '#0ea5e9',
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  accent?: string;
  highlight?: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      sx={{
        flex: '1 1 72px',
        minWidth: 72,
        maxWidth: 96,
        flexDirection: 'column',
        py: 1.1,
        px: 0.5,
        gap: 0.5,
        borderRadius: 2,
        textTransform: 'none',
        border: '1px solid',
        borderColor: highlight ? accent : '#e2e8f0',
        bgcolor: highlight ? alpha(accent, 0.08) : '#fff',
        color: '#334155',
        transition: 'all 150ms ease',
        '&:hover': {
          bgcolor: alpha(accent, 0.12),
          borderColor: accent,
          transform: 'scale(1.03)',
        },
        '&:active': { transform: 'scale(0.97)' },
      }}
    >
      <Icon size={20} color={accent} />
      <Typography sx={{ fontSize: '0.5625rem', fontWeight: 800, lineHeight: 1.2, textAlign: 'center' }}>
        {label}
      </Typography>
    </Button>
  );
}

export function MobileFieldOpsBar({
  offlineMode,
  onToggleOffline,
  onQuickCheckIn,
  onQuickScan,
  onVoiceNote,
  onImageUpload,
  onGpsVerify,
  onEmergency,
  onWhatsApp,
  onCompleteTask,
}: MobileFieldOpsBarProps) {
  return (
    <Paper
      elevation={8}
      sx={{
        display: { xs: 'block', lg: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        borderRadius: '16px 16px 0 0',
        border: '1px solid #e2e8f0',
        borderBottom: 'none',
        bgcolor: alpha('#fff', 0.96),
        backdropFilter: 'blur(12px)',
        boxShadow: '0 -8px 32px rgba(15, 23, 42, 0.12)',
        pb: 'env(safe-area-inset-bottom, 8px)',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, pt: 1, pb: 0.5 }}>
        <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.08em' }}>
          FIELD QUICK ACTIONS
        </Typography>
        <Chip
          size="small"
          icon={offlineMode ? <WifiOff size={10} /> : <Wifi size={10} />}
          label={offlineMode ? 'Offline' : 'Online'}
          onClick={onToggleOffline}
          sx={{
            height: 22,
            fontWeight: 800,
            fontSize: '0.5625rem',
            cursor: 'pointer',
            bgcolor: offlineMode ? '#fff7ed' : '#ecfdf5',
            color: offlineMode ? '#c2410c' : '#059669',
          }}
        />
      </Stack>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.75,
          px: 1.25,
          py: 1,
          justifyContent: 'center',
        }}
      >
        <QuickAction icon={MapPin} label="Check-in" onClick={onQuickCheckIn} accent="#10b981" />
        <QuickAction icon={QrCode} label="Scan" onClick={onQuickScan} accent="#6366f1" highlight />
        <QuickAction icon={Camera} label="Photo" onClick={onImageUpload} accent="#ec4899" />
        <QuickAction icon={ScanLine} label="GPS" onClick={onGpsVerify} accent="#0ea5e9" />
        <QuickAction icon={Mic} label="Voice" onClick={onVoiceNote} accent="#8b5cf6" />
        <QuickAction icon={CheckCircle2} label="Complete" onClick={onCompleteTask} accent="#14b8a6" />
        <QuickAction icon={AlertTriangle} label="SOS" onClick={onEmergency} accent="#ef4444" />
        <QuickAction icon={MessageCircle} label="WhatsApp" onClick={onWhatsApp} accent="#22c55e" />
        <QuickAction
          icon={offlineMode ? WifiOff : Wifi}
          label={offlineMode ? 'Online' : 'Offline'}
          onClick={onToggleOffline}
          accent="#64748b"
        />
      </Box>
    </Paper>
  );
}
