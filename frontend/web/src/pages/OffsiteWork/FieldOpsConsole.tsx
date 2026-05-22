import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
} from '@mui/material';
import {
  ArrowDownRight,
  ArrowUpRight,
  HardHat,
  Radio,
  Plus,
  CloudUpload,
  WifiOff,
} from 'lucide-react';
import { useAnimatedNumber } from '../../components/ProjectsConsole/useAnimatedNumber';
import { LiveIndicator } from '../../components/ProjectsConsole/ConsolePrimitives';
import type {
  FieldOpsMetric,
  QueuedItem,
  ScannedItem,
  SiteLocation,
  SiteStatus,
} from './types';
import { SmartSiteIntelligence } from './SmartSiteIntelligence';
import { AssignFieldWorkPanel } from './AssignFieldWorkPanel';
import { WorkforceTrackingPanel } from './WorkforceTrackingPanel';
import { AiOperationalInsightsPanel } from './AiOperationalInsightsPanel';
import { OperationalScannerHub } from './OperationalScannerHub';
import { OffsiteTaskManagement } from './OffsiteTaskManagement';
import { FieldActivityTimeline } from './FieldActivityTimeline';
import { SmartReportingPanel } from './SmartReportingPanel';
import type { OffsiteFieldAssignment } from './offsiteAssignments';
import type { Employee } from '../../contexts/EmployeeContext';
import type { MobileWorkforceTool } from './mobileWorkforceTypes';
import { buildFieldMetrics } from './fieldOpsData';
import {
  buildAiOperationalInsights,
  buildFieldTimeline,
  buildOffsiteFieldTasks,
  buildScanAnalytics,
  buildSmartReporting,
  buildWorkforceTracking,
  enrichScanRecords,
} from './offsiteOpsMockData';
import type { AiOperationalInsight, OffsiteFieldTask } from './offsiteOpsTypes';
import { createAiInsightActionHandler } from './aiInsightActions';
import {
  fieldInnerSx,
  fieldMetricGridSx,
  fieldMetricTileSx,
  fieldPremiumShellSx,
  fieldSectionLabelSx,
  fieldSubtitleSx,
} from './fieldOpsStyles';

const toneAccent: Record<FieldOpsMetric['tone'], string> = {
  positive: 'linear-gradient(90deg, #10b981, #34d399)',
  warning: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
  critical: 'linear-gradient(90deg, #ef4444, #f87171)',
  neutral: 'linear-gradient(90deg, #0ea5e9, #38bdf8)',
};

function MetricTile({ metric }: { metric: FieldOpsMetric }) {
  const animated = useAnimatedNumber(metric.value);
  return (
    <Paper elevation={0} sx={fieldMetricTileSx(toneAccent[metric.tone])}>
      <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {metric.label}
      </Typography>
      <Stack direction="row" alignItems="baseline" spacing={0.35} sx={{ mt: 0.35 }}>
        <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
          {animated}
        </Typography>
        {metric.suffix && (
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{metric.suffix}</Typography>
        )}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.35} sx={{ mt: 0.5 }}>
        {metric.trendUp ? <ArrowUpRight size={11} color="#059669" /> : <ArrowDownRight size={11} color="#94a3b8" />}
        <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, color: metric.trendUp ? '#059669' : '#64748b' }}>
          {metric.trend}
        </Typography>
      </Stack>
    </Paper>
  );
}

export interface FieldOpsConsoleProps {
  locations: SiteLocation[];
  scannedItems: ScannedItem[];
  queuedItems: QueuedItem[];
  employees: Employee[];
  offsiteWorkers: Employee[];
  fieldAssignments: OffsiteFieldAssignment[];
  onAssignFieldWork: (input: {
    title: string;
    description?: string;
    siteId?: string;
    assigneeIds: string[];
    dueDate?: string;
  }) => void;
  onAddSite: () => void;
  onViewMap: (location: SiteLocation) => void;
  onOpenScanner: (mode: 'qr' | 'object') => void;
  onOpenMobileTool: (tool: MobileWorkforceTool) => void;
  onDeleteSite: (id: string) => void;
  onStatusChange: (id: string, status: SiteStatus) => void;
  onProgressChange: (id: string, progress: number) => void;
  getStatusColor: (status: string) => 'success' | 'warning' | 'default';
  offlineMode: boolean;
  onToggleOffline: () => void;
  onInsightNotify: (title: string, description: string, priority?: 'low' | 'medium' | 'high') => void;
}

export function FieldOpsConsole({
  locations,
  scannedItems,
  queuedItems,
  employees,
  offsiteWorkers,
  fieldAssignments,
  onAssignFieldWork,
  onAddSite,
  onViewMap,
  onOpenScanner,
  onOpenMobileTool,
  onDeleteSite,
  onStatusChange,
  onProgressChange,
  getStatusColor,
  offlineMode,
  onToggleOffline,
  onInsightNotify,
}: FieldOpsConsoleProps) {
  const [fieldTasks, setFieldTasks] = useState<OffsiteFieldTask[]>([]);

  const metrics = useMemo(() => buildFieldMetrics(locations, scannedItems, queuedItems), [locations, scannedItems, queuedItems]);
  const workforce = useMemo(
    () => buildWorkforceTracking(offsiteWorkers.length ? offsiteWorkers : employees, locations),
    [offsiteWorkers, employees, locations]
  );
  const aiInsights = useMemo(() => buildAiOperationalInsights(locations), [locations]);
  const scanRecords = useMemo(() => enrichScanRecords(scannedItems, locations), [scannedItems, locations]);
  const scanAnalytics = useMemo(() => buildScanAnalytics(scanRecords), [scanRecords]);
  const timelineEvents = useMemo(() => buildFieldTimeline(locations, scannedItems), [locations, scannedItems]);
  const reporting = useMemo(() => buildSmartReporting(locations), [locations]);

  useEffect(() => {
    setFieldTasks((prev) =>
      prev.length > 0 ? prev : buildOffsiteFieldTasks(locations, offsiteWorkers.length ? offsiteWorkers : employees)
    );
  }, [locations, offsiteWorkers, employees]);

  const pendingSync = queuedItems.filter((q) => q.status === 'queued' || q.status === 'syncing').length;
  const activeSites = locations.filter((l) => l.status === 'active').length;

  const handleInsightAction = useCallback(
    (actionId: string, insight: AiOperationalInsight) => {
      createAiInsightActionHandler({
        locations,
        offsiteWorkers,
        onViewMap,
        onAssignFieldWork,
        onOpenMobileTool,
        onStatusChange,
        addNotification: (n) =>
          onInsightNotify(n.title, n.description, n.priority as 'low' | 'medium' | 'high' | undefined),
      })(actionId, insight);
    },
    [
      locations,
      offsiteWorkers,
      onViewMap,
      onAssignFieldWork,
      onOpenMobileTool,
      onStatusChange,
      onInsightNotify,
    ]
  );

  return (
    <Box sx={fieldInnerSx}>
      <Paper elevation={0} sx={{ ...fieldPremiumShellSx, p: { xs: 1.25, sm: 1.5 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1.25}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
              <HardHat size={18} color="#0ea5e9" />
              <Typography sx={{ fontSize: { xs: '0.9375rem', md: '1rem' }, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Field Operations Command Center
              </Typography>
              <Chip size="small" icon={<Radio size={10} />} label="Mission control" sx={{ height: 20, fontWeight: 800, fontSize: '0.5625rem', bgcolor: '#ecfeff', color: '#0e7490', border: '1px solid #a5f3fc' }} />
              {offlineMode && (
                <Chip size="small" icon={<WifiOff size={10} />} label="Offline" sx={{ height: 20, fontWeight: 800, fontSize: '0.5625rem', bgcolor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }} />
              )}
            </Stack>
            <Typography sx={{ ...fieldSubtitleSx, maxWidth: 640 }}>
              Enterprise field workforce platform · sites · crews · verification · intelligence
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" alignItems="center">
            <Chip size="small" label={`${workforce.clockedInCount} crews`} sx={{ fontWeight: 700, fontSize: '0.6875rem', bgcolor: '#f0fdf4', color: '#166534' }} />
            <Chip size="small" label={`${activeSites} live sites`} sx={{ fontWeight: 700, fontSize: '0.6875rem', bgcolor: '#eff6ff', color: '#1d4ed8' }} />
            <Chip size="small" label={`${scannedItems.length} scans`} sx={{ fontWeight: 700, fontSize: '0.6875rem', bgcolor: '#eef2ff', color: '#4338ca' }} />
            {pendingSync > 0 && (
              <Chip size="small" icon={<CloudUpload size={10} />} label={`${pendingSync} syncing`} sx={{ fontWeight: 700, fontSize: '0.6875rem', bgcolor: '#fef3c7', color: '#b45309' }} />
            )}
            <Button
              size="small"
              variant="contained"
              startIcon={<Plus size={14} />}
              onClick={onAddSite}
              sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#0f172a', borderRadius: 1.5, minHeight: 40 }}
            >
              Deploy site
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <AssignFieldWorkPanel
        offsiteWorkers={offsiteWorkers}
        locations={locations}
        assignments={fieldAssignments}
        onAssign={onAssignFieldWork}
      />

      <Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75, px: 0.25 }}>
          <Typography sx={fieldSectionLabelSx}>Live field overview</Typography>
          <LiveIndicator label="Real-time" />
        </Stack>
        <Box sx={fieldMetricGridSx}>
          {metrics.map((m) => (
            <MetricTile key={m.id} metric={m} />
          ))}
        </Box>
      </Box>

      <WorkforceTrackingPanel
        crew={workforce.crew}
        routes={workforce.routes}
        alerts={workforce.alerts}
        clockedInCount={workforce.clockedInCount}
      />

      <OperationalScannerHub
        scanRecords={scanRecords}
        analytics={scanAnalytics}
        queuedItems={queuedItems}
        offlineMode={offlineMode}
        onOpenScanner={onOpenScanner}
        onOpenMobileTool={onOpenMobileTool}
        onToggleOffline={onToggleOffline}
      />

      <AiOperationalInsightsPanel insights={aiInsights} onInsightAction={handleInsightAction} />

      <OffsiteTaskManagement tasks={fieldTasks} onTasksChange={setFieldTasks} />

      <FieldActivityTimeline
        events={timelineEvents}
        onSiteClick={(siteId) => {
          const loc = locations.find((l) => l.id === siteId);
          if (loc) onViewMap(loc);
        }}
      />

      <SmartReportingPanel data={reporting} />

      <SmartSiteIntelligence
        locations={locations}
        onAddSite={onAddSite}
        onViewMap={onViewMap}
        onDeleteSite={onDeleteSite}
        onStatusChange={onStatusChange}
        onProgressChange={onProgressChange}
        getStatusColor={getStatusColor}
      />
    </Box>
  );
}
