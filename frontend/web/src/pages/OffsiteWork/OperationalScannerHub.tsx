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
import { formatDistanceToNow } from 'date-fns';
import {
  CheckCircle2,
  Cpu,
  MapPin,
  Nfc,
  QrCode,
  ScanBarcode,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Wrench,
  ClipboardCheck,
  Package,
  Camera,
  Radio,
} from 'lucide-react';
import { LiveIndicator } from '../../components/ProjectsConsole/ConsolePrimitives';
import type { QueuedItem } from './types';
import type { MobileWorkforceTool } from './mobileWorkforceTypes';
import type { OperationalScanRecord, ScanAnalytics, ScanPurpose } from './offsiteOpsTypes';
import { SCAN_PURPOSE_LABELS } from './offsiteOpsMockData';
import { MOBILE_TOOL_ACTIONS, mobileToolIcon, type MobileToolActionConfig } from './fieldExecutionConfig';
import { fieldHeaderSx, fieldShellSx, fieldSubtitleSx, fieldTitleSx } from './fieldOpsStyles';

const SCAN_MODES: {
  purpose: ScanPurpose;
  icon: React.ElementType;
  accent: string;
  scannerMode?: 'qr' | 'object';
}[] = [
  { purpose: 'qr', icon: QrCode, accent: '#6366f1', scannerMode: 'qr' },
  { purpose: 'barcode', icon: ScanBarcode, accent: '#f59e0b', scannerMode: 'object' },
  { purpose: 'equipment', icon: Wrench, accent: '#64748b', scannerMode: 'object' },
  { purpose: 'asset', icon: Cpu, accent: '#8b5cf6', scannerMode: 'object' },
  { purpose: 'material', icon: Package, accent: '#d97706', scannerMode: 'object' },
  { purpose: 'check_in', icon: ShieldCheck, accent: '#10b981', scannerMode: 'qr' },
  { purpose: 'task', icon: ClipboardCheck, accent: '#0ea5e9', scannerMode: 'qr' },
  { purpose: 'installation', icon: Camera, accent: '#ec4899', scannerMode: 'object' },
  { purpose: 'nfc', icon: Nfc, accent: '#14b8a6' },
  { purpose: 'geolocation', icon: MapPin, accent: '#22c55e', scannerMode: 'qr' },
];

export interface OperationalScannerHubProps {
  scanRecords: OperationalScanRecord[];
  analytics: ScanAnalytics;
  queuedItems: QueuedItem[];
  offlineMode: boolean;
  onOpenScanner: (mode: 'qr' | 'object') => void;
  onOpenMobileTool: (tool: MobileWorkforceTool) => void;
  onToggleOffline: () => void;
}

function ScanModeTile({
  purpose,
  icon: Icon,
  accent,
  onLaunch,
}: {
  purpose: ScanPurpose;
  icon: React.ElementType;
  accent: string;
  onLaunch: () => void;
}) {
  const label = SCAN_PURPOSE_LABELS[purpose];
  return (
    <Button
      onClick={onLaunch}
      sx={{
        p: 1.15,
        borderRadius: 2,
        border: '1px solid #334155',
        bgcolor: alpha('#0f172a', 0.5),
        textAlign: 'left',
        textTransform: 'none',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 180ms ease',
        '&:hover': {
          borderColor: accent,
          bgcolor: alpha(accent, 0.12),
          transform: 'translateY(-1px)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: accent,
        },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Icon size={18} color={accent} />
        <Box>
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#f1f5f9' }}>{label}</Typography>
          <Typography sx={{ fontSize: '0.5625rem', color: '#64748b', fontWeight: 600 }}>
            {purpose === 'nfc' ? 'Placeholder' : 'Camera scan'}
          </Typography>
        </Box>
      </Stack>
    </Button>
  );
}

function ScanHistoryRow({ record }: { record: OperationalScanRecord }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        py: 0.9,
        px: 1,
        borderRadius: 1.5,
        bgcolor: '#0f172a',
        border: '1px solid #334155',
        borderLeft: `3px solid ${record.verified ? '#10b981' : '#f59e0b'}`,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#f8fafc' }} noWrap>
            {record.label}
          </Typography>
          {record.verified && <CheckCircle2 size={12} color="#10b981" />}
        </Stack>
        <Typography sx={{ fontSize: '0.625rem', color: '#94a3b8', fontFamily: 'ui-monospace, monospace' }} noWrap>
          {record.data}
        </Typography>
        <Typography sx={{ fontSize: '0.5625rem', color: '#64748b', mt: 0.25 }}>
          {record.projectName} · {record.siteName} · {formatDistanceToNow(new Date(record.timestamp), { addSuffix: true })}
        </Typography>
      </Box>
      <Chip
        size="small"
        label={record.format.toUpperCase()}
        sx={{ height: 18, fontSize: '0.5rem', fontWeight: 800, bgcolor: '#1e293b', color: '#94a3b8' }}
      />
    </Stack>
  );
}

export function OperationalScannerHub({
  scanRecords,
  analytics,
  queuedItems,
  offlineMode,
  onOpenScanner,
  onOpenMobileTool,
  onToggleOffline,
}: OperationalScannerHubProps) {
  const handleMobileAction = (config: MobileToolActionConfig) => {
    if (config.id === 'offline') {
      onToggleOffline();
      return;
    }
    onOpenMobileTool(config.id);
  };

  const launchScan = (mode: (typeof SCAN_MODES)[0]) => {
    if (mode.scannerMode) {
      onOpenScanner(mode.scannerMode);
    } else {
      onOpenScanner('qr');
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.5,
        border: '1px solid #334155',
        bgcolor: '#1e293b',
        boxShadow: '0 4px 24px rgba(15, 23, 42, 0.15)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ ...fieldHeaderSx, borderColor: '#334155', bgcolor: '#0f172a' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            }}
          >
            <ScanLine size={20} color="#fff" />
          </Box>
          <Box>
            <Typography sx={{ ...fieldTitleSx, color: '#f8fafc' }}>Operational scanning system</Typography>
            <Typography sx={{ ...fieldSubtitleSx, color: '#94a3b8' }}>
              Enterprise verify · assets · materials · check-ins · NFC · geolocation
            </Typography>
          </Box>
        </Stack>
        <LiveIndicator label="Scanner ready" />
      </Box>

      <Box sx={{ p: { xs: 1.25, sm: 1.5 } }}>
        <Grid container spacing={1.25} sx={{ mb: 1.5 }}>
          {[
            { label: 'Scans today', value: String(analytics.todayTotal), color: '#38bdf8' },
            { label: 'Verified rate', value: `${analytics.verifiedRate}%`, color: '#10b981' },
            { label: 'Success streak', value: String(analytics.successStreak), color: '#a78bfa' },
            { label: 'Queue', value: String(queuedItems.length), color: '#fbbf24' },
          ].map((stat) => (
            <Grid item xs={6} sm={3} key={stat.label}>
              <Box sx={{ p: 1.15, borderRadius: 2, bgcolor: '#0f172a', border: '1px solid #334155' }}>
                <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em' }}>
                  {stat.label.toUpperCase()}
                </Typography>
                <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: stat.color, mt: 0.35 }}>
                  {stat.value}
                </Typography>
                {stat.label === 'Verified rate' && (
                  <LinearProgress
                    variant="determinate"
                    value={analytics.verifiedRate}
                    sx={{
                      mt: 0.75,
                      height: 4,
                      borderRadius: 2,
                      bgcolor: '#334155',
                      '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 2 },
                    }}
                  />
                )}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.08em', mb: 1 }}>
          SCAN MODES
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
            gap: 0.85,
            mb: 1.5,
          }}
        >
          {SCAN_MODES.map((m) => (
            <ScanModeTile
              key={m.purpose}
              purpose={m.purpose}
              icon={m.icon}
              accent={m.accent}
              onLaunch={() => launchScan(m)}
            />
          ))}
        </Box>

        <Grid container spacing={1.5}>
          <Grid item xs={12} md={7}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
              <Radio size={12} color="#38bdf8" />
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.06em' }}>
                RECENT SCANS FEED
              </Typography>
            </Stack>
            <Stack spacing={0.75} sx={{ maxHeight: 280, overflow: 'auto' }}>
              {scanRecords.length === 0 ? (
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', py: 2, textAlign: 'center' }}>
                  No scans yet — select a mode above to verify on site.
                </Typography>
              ) : (
                scanRecords.slice(0, 8).map((r) => <ScanHistoryRow key={r.id} record={r} />)
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} md={5}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
              <Smartphone size={14} color="#10b981" />
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.06em' }}>
                MOBILE WORKFORCE TOOLS
              </Typography>
            </Stack>
            <Stack spacing={0.75}>
              {MOBILE_TOOL_ACTIONS.map((tool) => {
                const Icon = tool.id === 'offline' ? mobileToolIcon('offline', offlineMode) : tool.icon;
                const active = tool.id === 'offline' && offlineMode;
                return (
                  <Button
                    key={tool.id}
                    onClick={() => handleMobileAction(tool)}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      py: 1,
                      px: 1.15,
                      borderRadius: 2,
                      border: '1px solid #334155',
                      bgcolor: active ? alpha(tool.accent, 0.15) : '#0f172a',
                      color: '#e2e8f0',
                      '&:hover': { borderColor: tool.accent, bgcolor: alpha(tool.accent, 0.1) },
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" width="100%">
                      <Icon size={16} color={tool.accent} />
                      <Box sx={{ textAlign: 'left', flex: 1 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800 }}>{tool.title}</Typography>
                        <Typography sx={{ fontSize: '0.5625rem', color: '#64748b' }}>{tool.description}</Typography>
                      </Box>
                    </Stack>
                  </Button>
                );
              })}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
