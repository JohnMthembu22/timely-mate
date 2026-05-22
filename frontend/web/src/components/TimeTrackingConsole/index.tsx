import React, { useMemo, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useAnimatedNumber } from '../ProjectsConsole/useAnimatedNumber';
import { ActiveAssignmentCard } from './ActiveAssignmentCard';
import { AssignmentDetailDialog } from './AssignmentDetailDialog';
import { buildAiProductivityInsights } from './aiProductivityInsightsMock';
import { handleProductivityInsightAction } from './aiProductivityInsightActions';
import type { AiProductivityInsight } from './aiProductivityInsightsTypes';
import { buildTimeTrackingWorkforceIntel } from './timeTrackingWorkforceIntel';
import type { TimeTrackingJobRow, AssignmentQuickAction } from './timeTrackingTypes';
import { buildTeamActivityFeed } from './teamActivityMock';
import { DashboardCollapsibleSection } from './DashboardCollapsibleSection';
import { DashboardZone } from './DashboardZone';
import { ZoneOperationalSummary } from './ZoneOperationalSummary';
import { ZoneAiAndActivity } from './ZoneAiAndActivity';
import { TeamAnalyticsZone, type TeamTimeStats } from './TeamAnalyticsZone';
import { ttPageSx } from './timeTrackingStyles';
import { MobileWorkforceOpsBar, type MobileWorkforceAction } from '../WorkforceOps/MobileWorkforceOpsBar';

export type { TimeTrackingJobRow, AssignmentQuickAction } from './timeTrackingTypes';
export type { TeamTimeStats } from './TeamAnalyticsZone';

export interface TimeTrackingConsoleProps {
  isCheckedIn: boolean;
  checkInTime: string | null;
  dailyCode: string;
  activeJobs: TimeTrackingJobRow[];
  employeeNames?: string[];
  onToggleShift: () => void;
  onTakeBreak?: () => void;
  onJobToggle: (jobId: string, isRunning: boolean) => void;
  onAssignmentAction?: (jobId: string, action: AssignmentQuickAction) => void;
  onProductivityInsightNotify?: (title: string, description: string, priority?: 'low' | 'medium' | 'high') => void;
  onMobileNotify?: (title: string, description: string) => void;
  offlineMode?: boolean;
  onToggleOffline?: () => void;
  approvedHours?: string;
  pendingHours?: string;
  payCycleLabel?: string;
  teamStats?: TeamTimeStats;
  hasTeamMembers?: boolean;
  onOpenTeamView?: () => void;
}

const formatCheckInLabel = (checkInTime: string | null) => {
  if (!checkInTime) return '—';
  try {
    const d = new Date(checkInTime);
    if (!Number.isNaN(d.getTime())) return format(d, 'h:mm a');
  } catch {
    /* locale string */
  }
  return checkInTime;
};

const TimeTrackingConsole: React.FC<TimeTrackingConsoleProps> = ({
  isCheckedIn,
  checkInTime,
  dailyCode,
  activeJobs,
  employeeNames = [],
  onToggleShift,
  onTakeBreak,
  onJobToggle,
  onAssignmentAction,
  onProductivityInsightNotify,
  onMobileNotify,
  offlineMode = false,
  onToggleOffline,
  approvedHours = '0h',
  pendingHours = '0h',
  payCycleLabel = 'Current cycle',
  teamStats,
  hasTeamMembers = false,
  onOpenTeamView,
}) => {
  const activeTimerCount = activeJobs.filter((j) => j.isRunning).length;
  const workforceIntel = useMemo(
    () => buildTimeTrackingWorkforceIntel(employeeNames, activeTimerCount),
    [employeeNames, activeTimerCount]
  );
  const productivityInsights = useMemo(() => buildAiProductivityInsights(activeJobs), [activeJobs]);
  const teamActivity = useMemo(() => buildTeamActivityFeed(employeeNames), [employeeNames]);
  const totalHoursAnimated = useAnimatedNumber(245);
  const efficiencyAnimated = useAnimatedNumber(92);

  const handleProductivityAction = (actionId: string, insight: AiProductivityInsight) => {
    if (onProductivityInsightNotify) {
      handleProductivityInsightAction(actionId, insight, onProductivityInsightNotify);
    }
  };

  const handleMobileAction = (action: MobileWorkforceAction) => {
    const notify = (title: string, description: string) => onMobileNotify?.(title, description);
    switch (action) {
      case 'check_in':
        onToggleShift?.();
        if (!isCheckedIn) notify('Check-in', 'Use punch-in or verification channels.');
        break;
      case 'offline':
        onToggleOffline?.();
        notify('Offline mode', offlineMode ? 'Back online.' : 'Offline capture enabled.');
        break;
      case 'sync':
        notify('Auto sync', 'Queued entries will sync when online.');
        break;
      case 'voice':
        notify('Voice logging', 'Voice note attaches to active assignment.');
        break;
      case 'approve':
        notify('Mobile action', 'Use assignment cards to control timers.');
        break;
      case 'field_capture':
        notify('Field capture', 'Photo and GPS proof placeholder.');
        break;
      case 'biometric':
        notify('Biometric verify', 'Mobile verification channel (pilot).');
        break;
      case 'whatsapp':
        notify('WhatsApp workflow', 'Approval thread bridge (placeholder).');
        break;
    }
  };

  const handleQuickAction = (jobId: string, action: AssignmentQuickAction) => {
    if (onAssignmentAction) {
      onAssignmentAction(jobId, action);
      return;
    }
    if (action === 'pause') {
      const job = activeJobs.find((j) => j.id === jobId);
      if (job?.isRunning) onJobToggle(jobId, true);
    }
  };

  const [detailJob, setDetailJob] = useState<{ job: TimeTrackingJobRow; index: number } | null>(null);

  const defaultTeamStats: TeamTimeStats = {
    totalHours: 0,
    activeProjects: 0,
    completedTasks: 0,
    averageProgress: 0,
    totalTeamMembers: 0,
    activeTeamMembers: 0,
    assignedTeamMembers: 0,
    departmentBreakdown: {},
  };

  return (
    <Box sx={ttPageSx}>
      <Box sx={{ maxWidth: 1600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <DashboardZone zone={1} title="Top operational summary">
          <ZoneOperationalSummary
            isCheckedIn={isCheckedIn}
            checkInTimeLabel={formatCheckInLabel(checkInTime)}
            dailyCode={dailyCode}
            activeTimerCount={activeTimerCount}
            intel={workforceIntel}
            approvedHours={approvedHours}
            pendingHours={pendingHours}
            payCycleLabel={payCycleLabel}
            efficiencyPct={efficiencyAnimated}
            totalHoursDisplay={`${(totalHoursAnimated / 10).toFixed(1)}h`}
            onToggleShift={onToggleShift}
            onTakeBreak={onTakeBreak}
          />
        </DashboardZone>

        <DashboardZone zone={2} title="AI productivity insights + team activity">
          <ZoneAiAndActivity
            bundle={productivityInsights}
            events={teamActivity}
            onInsightAction={handleProductivityAction}
          />
        </DashboardZone>

        <DashboardZone zone={3} title="Active assignments">
          <DashboardCollapsibleSection
            title="Assignments"
            subtitle={`${activeJobs.length} active`}
            pinned
            dense
          >
            {activeJobs.length === 0 ? (
              <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', textAlign: 'center', py: 2 }}>
                No active assignments. Add a job to start tracking.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: activeJobs.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr' },
                  gap: 1.25,
                  maxHeight: { md: 480 },
                  overflowY: { md: 'auto' },
                  pr: { md: 0.25 },
                }}
              >
                  {activeJobs.map((job, index) => (
                    <ActiveAssignmentCard
                      key={job.id}
                      job={job}
                      index={index}
                      isCheckedIn={isCheckedIn}
                      onJobToggle={onJobToggle}
                      onQuickAction={handleQuickAction}
                      onOpenDetails={(j, i) => setDetailJob({ job: j, index: i })}
                    />
                  ))}
              </Box>
            )}
          </DashboardCollapsibleSection>
        </DashboardZone>

        <DashboardZone zone={4} title="Team analytics">
          <TeamAnalyticsZone
            stats={teamStats ?? defaultTeamStats}
            activeJobsCount={activeJobs.length}
            hasTeamMembers={hasTeamMembers}
            workforceIntel={workforceIntel}
            onOpenTeamView={onOpenTeamView ?? (() => undefined)}
          />
        </DashboardZone>
      </Box>

      <AssignmentDetailDialog
        job={detailJob?.job ?? null}
        index={detailJob?.index ?? 0}
        open={Boolean(detailJob)}
        onClose={() => setDetailJob(null)}
        isCheckedIn={isCheckedIn}
        onJobToggle={onJobToggle}
        onQuickAction={handleQuickAction}
      />

      <MobileWorkforceOpsBar
        variant="time-tracking"
        offlineMode={offlineMode}
        onToggleOffline={onToggleOffline}
        onAction={handleMobileAction}
      />
    </Box>
  );
};

export default TimeTrackingConsole;
