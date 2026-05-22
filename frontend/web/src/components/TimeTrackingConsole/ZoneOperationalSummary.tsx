import React from 'react';
import { Box, Button, IconButton, Paper, Stack, Tooltip, Typography, alpha, keyframes } from '@mui/material';
import { Clock, Coffee, FileSpreadsheet, Play, Square, Users, Zap } from 'lucide-react';
import { useAnimatedNumber } from '../ProjectsConsole/useAnimatedNumber';
import type { TimeTrackingWorkforceIntel } from './timeTrackingWorkforceIntel';
import { ttPremiumSx, ttType } from './timeTrackingStyles';

const pulseDot = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
`;

function SummaryTile({
  label,
  value,
  tip,
  accent,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  tip?: string;
  accent: string;
  icon: React.ElementType;
}) {
  const body = (
    <Paper
      elevation={0}
      sx={{
        p: 1.25,
        height: '100%',
        borderRadius: 2.5,
        border: '1px solid #e8ecf1',
        bgcolor: '#fff',
        transition: 'border-color 180ms ease',
        '&:hover': { borderColor: alpha(accent, 0.35) },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(accent, 0.08),
            color: accent,
            flexShrink: 0,
          }}
        >
          <Icon size={18} strokeWidth={2} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8' }}>{label}</Typography>
          <Typography sx={{ ...ttType.title, fontSize: '1.0625rem', mt: 0.15 }}>{value}</Typography>
        </Box>
      </Stack>
    </Paper>
  );

  return tip ? (
    <Tooltip title={tip} arrow placement="top">
      {body}
    </Tooltip>
  ) : (
    body
  );
}

export interface ZoneOperationalSummaryProps {
  isCheckedIn: boolean;
  checkInTimeLabel: string;
  dailyCode: string;
  activeTimerCount: number;
  intel: TimeTrackingWorkforceIntel;
  approvedHours: string;
  pendingHours: string;
  payCycleLabel?: string;
  efficiencyPct: number;
  totalHoursDisplay: string;
  onToggleShift: () => void;
  onTakeBreak?: () => void;
}

export function ZoneOperationalSummary({
  isCheckedIn,
  checkInTimeLabel,
  dailyCode,
  activeTimerCount,
  intel,
  approvedHours,
  pendingHours,
  payCycleLabel = 'Current cycle',
  efficiencyPct,
  totalHoursDisplay,
  onToggleShift,
  onTakeBreak,
}: ZoneOperationalSummaryProps) {
  const utilAnimated = useAnimatedNumber(intel.workforceUtilization);

  const sessionTip = isCheckedIn
    ? `${checkInTimeLabel} · Code ${dailyCode || '—'} · ${activeTimerCount} live timer${activeTimerCount !== 1 ? 's' : ''}`
    : 'Check in to start tracking';

  const workforceTip = `${intel.overtimeAlertCount} OT alerts · ${intel.lateCheckInCount} late · ${intel.anomalyCount} flags`;
  const timesheetTip = `Pending ${pendingHours} · ${payCycleLabel}`;
  const utilTip = `${totalHoursDisplay} logged · ${efficiencyPct}% efficiency · OT +${intel.base.overtime.weekOverWeek}% WoW`;

  return (
    <Paper elevation={0} sx={{ ...ttPremiumSx, p: 1.25, '&:hover': { boxShadow: '0 1px 2px rgba(15,23,42,0.04)' } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 1,
          alignItems: 'stretch',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 0 }}>
          <SummaryTile
            label="Session"
            icon={Clock}
            accent={isCheckedIn ? '#10b981' : '#64748b'}
            tip={sessionTip}
            value={
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {isCheckedIn && (
                  <Box
                    component="span"
                    sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981', animation: `${pulseDot} 2s infinite` }}
                  />
                )}
                <span>{isCheckedIn ? 'On shift' : 'Off shift'}</span>
              </Stack>
            }
          />
          <Stack direction="row" spacing={0.5}>
            <Button
              size="small"
              variant="contained"
              disableElevation
              onClick={onToggleShift}
              startIcon={isCheckedIn ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
              sx={{
                flex: 1,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.8125rem',
                py: 0.65,
                borderRadius: 2,
                bgcolor: isCheckedIn ? '#e11d48' : '#0f172a',
              }}
            >
              {isCheckedIn ? 'End' : 'Punch in'}
            </Button>
            {isCheckedIn && onTakeBreak && (
              <Tooltip title="Break">
                <IconButton
                  size="small"
                  onClick={onTakeBreak}
                  sx={{ border: '1px solid #e8ecf1', borderRadius: 2 }}
                >
                  <Coffee size={16} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        <SummaryTile
          label="Workforce"
          icon={Users}
          accent="#6366f1"
          value={`${intel.activeEmployees}`}
          tip={workforceTip}
        />

        <SummaryTile label="Timesheet" icon={FileSpreadsheet} accent="#0ea5e9" value={approvedHours} tip={timesheetTip} />

        <SummaryTile label="Utilization" icon={Zap} accent="#10b981" value={`${utilAnimated}%`} tip={utilTip} />
      </Box>
    </Paper>
  );
}
