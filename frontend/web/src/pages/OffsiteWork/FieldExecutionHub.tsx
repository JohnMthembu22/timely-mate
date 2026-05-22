import React from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Radio,
  RefreshCw,
  ScanLine,
  Smartphone,
} from 'lucide-react';
import { LiveIndicator } from '../../components/ProjectsConsole/ConsolePrimitives';
import type { QueuedItem, ScannedItem } from './types';
import type { MobileWorkforceTool } from './mobileWorkforceTypes';
import {
  MOBILE_TOOL_ACTIONS,
  SCAN_ACTIONS,
  mobileToolIcon,
  type MobileToolActionConfig,
} from './fieldExecutionConfig';
import {
  fieldActionCardSx,
  fieldExecutionGridSx,
  fieldExecutionRailSx,
  fieldHeaderSx,
  fieldShellSx,
  fieldSubtitleSx,
  fieldTitleSx,
} from './fieldOpsStyles';

export interface FieldExecutionHubProps {
  scannedItems: ScannedItem[];
  queuedItems: QueuedItem[];
  offlineMode: boolean;
  onOpenScanner: (mode: 'qr' | 'object') => void;
  onOpenMobileTool: (tool: MobileWorkforceTool) => void;
  onToggleOffline: () => void;
}

function ScanActionCard({
  title,
  description,
  accent,
  icon: Icon,
  cta,
  onClick,
}: {
  title: string;
  description: string;
  accent: string;
  icon: React.ElementType;
  cta: string;
  onClick: () => void;
}) {
  return (
    <Button onClick={onClick} sx={fieldActionCardSx(accent)}>
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(accent, 0.1),
            border: `1px solid ${alpha(accent, 0.2)}`,
            flexShrink: 0,
          }}
        >
          <Icon size={22} color={accent} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, pt: 0.15 }}>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', mt: 0.4, lineHeight: 1.45 }}>
            {description}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.35} sx={{ mt: 1 }}>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: accent }}>{cta}</Typography>
            <ChevronRight size={14} color={accent} />
          </Stack>
        </Box>
      </Stack>
    </Button>
  );
}

function MobileToolCard({
  config,
  offlineMode,
  onClick,
}: {
  config: MobileToolActionConfig;
  offlineMode: boolean;
  onClick: () => void;
}) {
  const isOffline = config.id === 'offline';
  const active = isOffline && offlineMode;
  const accent = isOffline && active ? '#f59e0b' : config.accent;
  const Icon = isOffline ? mobileToolIcon('offline', offlineMode) : config.icon;

  return (
    <Button
      onClick={onClick}
      sx={{
        ...fieldActionCardSx(accent),
        bgcolor: active ? alpha(accent, 0.06) : '#fff',
        borderColor: active ? alpha(accent, 0.35) : '#e8edf4',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(accent, 0.12),
            flexShrink: 0,
          }}
        >
          <Icon size={18} color={accent} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>
            {isOffline ? (offlineMode ? 'Offline active' : 'Offline mode') : config.title}
          </Typography>
          <Typography sx={{ fontSize: '0.625rem', color: '#64748b', mt: 0.2, lineHeight: 1.35 }} noWrap>
            {config.description}
          </Typography>
        </Box>
        {active && (
          <Chip
            size="small"
            label="On"
            sx={{ height: 18, fontSize: '0.5625rem', fontWeight: 800, bgcolor: alpha(accent, 0.15), color: accent }}
          />
        )}
      </Stack>
    </Button>
  );
}

function ScanHistoryItem({ item }: { item: ScannedItem }) {
  const isQr = item.type === 'qr';
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        py: 0.85,
        px: 1,
        borderRadius: 1.5,
        border: '1px solid #e8edf4',
        bgcolor: '#fff',
        borderLeft: `3px solid ${isQr ? '#6366f1' : '#f59e0b'}`,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }} noWrap>
          {item.data}
        </Typography>
        <Typography sx={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 600 }}>
          {isQr ? 'QR verify' : 'Material'} · {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
        </Typography>
      </Box>
      <Chip
        size="small"
        label={isQr ? 'QR' : 'MAT'}
        sx={{
          height: 20,
          fontWeight: 800,
          fontSize: '0.5625rem',
          bgcolor: isQr ? '#eef2ff' : '#fffbeb',
          color: isQr ? '#4338ca' : '#b45309',
        }}
      />
    </Stack>
  );
}

function SyncQueueRow({ item }: { item: QueuedItem }) {
  const statusConfig: Record<
    QueuedItem['status'],
    { icon: React.ElementType; color: string; label: string }
  > = {
    queued: { icon: Clock, color: '#f59e0b', label: 'Queued' },
    syncing: { icon: RefreshCw, color: '#0ea5e9', label: 'Syncing' },
    completed: { icon: CheckCircle2, color: '#10b981', label: 'Synced' },
    error: { icon: AlertTriangle, color: '#ef4444', label: 'Error' },
  };
  const cfg = statusConfig[item.status];
  const Icon = cfg.icon;

  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ py: 0.5 }}>
      <Icon size={12} color={cfg.color} />
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#334155', flex: 1 }} noWrap>
        {item.data}
      </Typography>
      <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, color: cfg.color }}>{cfg.label}</Typography>
    </Stack>
  );
}

export function FieldExecutionHub({
  scannedItems,
  queuedItems,
  offlineMode,
  onOpenScanner,
  onOpenMobileTool,
  onToggleOffline,
}: FieldExecutionHubProps) {
  const pendingSync = queuedItems.filter((q) => q.status === 'queued' || q.status === 'syncing').length;
  const recentScans = scannedItems.slice(0, 5);

  const handleMobileAction = (config: MobileToolActionConfig) => {
    if (config.id === 'offline') {
      onToggleOffline();
      return;
    }
    onOpenMobileTool(config.id);
  };

  return (
    <Paper elevation={0} sx={fieldShellSx}>
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
              background: 'linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
            }}
          >
            <Smartphone size={18} color="#fff" />
          </Box>
          <Box>
            <Typography sx={fieldTitleSx}>Field execution</Typography>
            <Typography sx={fieldSubtitleSx}>
              On-site verification, material scans, and crew mobile tools — one workflow
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
          <Chip
            size="small"
            icon={<ScanLine size={10} />}
            label={`${scannedItems.length} scans`}
            sx={{ height: 22, fontWeight: 800, fontSize: '0.625rem', bgcolor: '#eef2ff', color: '#4338ca' }}
          />
          {pendingSync > 0 && (
            <Chip
              size="small"
              icon={<RefreshCw size={10} />}
              label={`${pendingSync} pending sync`}
              sx={{ height: 22, fontWeight: 800, fontSize: '0.625rem', bgcolor: '#fef3c7', color: '#b45309' }}
            />
          )}
          <LiveIndicator label="Ready" />
        </Stack>
      </Box>

      <Box sx={{ p: { xs: 1.25, sm: 1.5 } }}>
        <Box sx={fieldExecutionGridSx}>
          <Stack spacing={1.25}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 0.25 }}>
              <Typography
                sx={{
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  color: '#64748b',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Verify on site
              </Typography>
              <Typography sx={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 600 }}>Camera-first</Typography>
            </Stack>
            <Stack spacing={1}>
              {SCAN_ACTIONS.map((action) => (
                <ScanActionCard
                  key={action.id}
                  title={action.title}
                  description={action.description}
                  accent={action.accent}
                  icon={action.icon}
                  cta={action.cta}
                  onClick={() => onOpenScanner(action.id)}
                />
              ))}
            </Stack>
          </Stack>

          <Stack spacing={1.25}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 0.25 }}>
              <Typography
                sx={{
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  color: '#64748b',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Crew mobile tools
              </Typography>
              {offlineMode && (
                <Chip
                  size="small"
                  label="Offline"
                  sx={{ height: 20, fontWeight: 800, fontSize: '0.5625rem', bgcolor: '#fff7ed', color: '#c2410c' }}
                />
              )}
            </Stack>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 1,
              }}
            >
              {MOBILE_TOOL_ACTIONS.map((tool) => (
                <MobileToolCard
                  key={tool.id}
                  config={tool}
                  offlineMode={offlineMode}
                  onClick={() => handleMobileAction(tool)}
                />
              ))}
            </Box>
          </Stack>
        </Box>
      </Box>

      <Box sx={fieldExecutionRailSx}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.2fr) minmax(0, 0.8fr)' },
            gap: { xs: 1.25, md: 2 },
            alignItems: 'start',
          }}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
              <Radio size={12} color="#6366f1" />
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em' }}>
                RECENT VERIFICATIONS
              </Typography>
            </Stack>
            {recentScans.length === 0 ? (
              <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                Scans appear here after QR verify or material scan — tied to your session and sync queue.
              </Typography>
            ) : (
              <Stack spacing={0.75}>
                {recentScans.map((s) => (
                  <ScanHistoryItem key={s.id} item={s} />
                ))}
              </Stack>
            )}
          </Box>

          {queuedItems.length > 0 && (
            <>
              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, borderColor: '#e2e8f0' }} />
              <Divider sx={{ display: { xs: 'block', md: 'none' }, borderColor: '#e2e8f0' }} />
              <Box>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                  <RefreshCw size={12} color="#0ea5e9" />
                  <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em' }}>
                    SYNC QUEUE
                  </Typography>
                </Stack>
                <Stack spacing={0.25} sx={{ maxHeight: 160, overflow: 'auto' }}>
                  {queuedItems.slice(0, 6).map((q) => (
                    <SyncQueueRow key={q.id} item={q} />
                  ))}
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
