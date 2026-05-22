import React, { memo } from 'react';
import { useElapsedTimer } from '../../hooks/useElapsedTimer';
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import { glassCardSx } from '../../theme/surfaces';
import { tmColors } from '../../theme/designTokens';

export interface AttendanceRecord {
  id: string;
  clockIn: string;
  clockOut: string | null;
  duration: string | null;
}

export interface PersonalAttendanceToolsProps {
  isClockedIn: boolean;
  clockInTime: string | null;
  records: AttendanceRecord[];
  onClockIn: () => void;
  onClockOut: () => void;
  onOpenTimeTracking: () => void;
}

/** Right-column contextual attendance panel for the dashboard master grid. */
export const PersonalAttendanceTools = memo(function PersonalAttendanceTools({
  isClockedIn,
  clockInTime,
  records,
  onClockIn,
  onClockOut,
  onOpenTimeTracking,
}: PersonalAttendanceToolsProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const elapsedTime = useElapsedTimer(isClockedIn, clockInTime);
  const recent = [...records].slice(-5).reverse();

  return (
    <Box
      sx={{
        ...glassCardSx(theme),
        p: 2.5,
        position: { lg: 'sticky' },
        top: { lg: 88 },
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: 'text.primary', mb: 0.25 }}>
        Attendance
      </Typography>
      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', mb: 2 }}>
        Today&apos;s session and recent punches
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            mb: 0.75,
          }}
        >
          Status
        </Typography>
        <Typography sx={{ fontWeight: 600, color: 'text.primary', mb: 0.25 }}>
          {isClockedIn ? 'Clocked in' : 'Not clocked in'}
        </Typography>
        {isClockedIn && clockInTime && (
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            Started tracking • session timer running
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: isDark ? alpha(tmColors.neonBlue, 0.08) : '#f8fafc',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          px: 1.5,
          py: 1.25,
          mb: 2,
        }}
      >
        <AccessTime sx={{ fontSize: 22, color: isDark ? tmColors.neonBlue : 'text.secondary' }} />
        <Box>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'text.secondary',
              textTransform: 'uppercase',
            }}
          >
            Elapsed
          </Typography>
          <Typography
            sx={{
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 700,
              fontSize: '1.125rem',
              color: 'text.primary',
            }}
          >
            {elapsedTime}
          </Typography>
        </Box>
      </Box>

      <StackButtons isClockedIn={isClockedIn} onClockIn={onClockIn} onClockOut={onClockOut} />

      <Divider sx={{ my: 2 }} />

      <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.primary', mb: 1 }}>
        Recent history
      </Typography>
      {recent.length === 0 ? (
        <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
          No punches yet. Clock in to start recording.
        </Typography>
      ) : (
        <List dense disablePadding sx={{ maxHeight: 220, overflow: 'auto' }}>
          {recent.map((record) => (
            <ListItem key={record.id} disableGutters sx={{ py: 0.75, display: 'block' }}>
              <ListItemText
                primaryTypographyProps={{ sx: { fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary' } }}
                secondaryTypographyProps={{ sx: { fontSize: '0.75rem', color: 'text.secondary' } }}
                primary={`In · ${record.clockIn}`}
                secondary={
                  record.clockOut
                    ? `Out · ${record.clockOut}${record.duration ? ` · ${record.duration}` : ''}`
                    : 'Currently working'
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      <Button
        fullWidth
        variant="text"
        onClick={onOpenTimeTracking}
        sx={{ mt: 2, fontWeight: 600, fontSize: '0.8125rem' }}
      >
        Open time tracking
      </Button>
    </Box>
  );
});

function StackButtons({
  isClockedIn,
  onClockIn,
  onClockOut,
}: {
  isClockedIn: boolean;
  onClockIn: () => void;
  onClockOut: () => void;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {!isClockedIn ? (
        <Button variant="contained" color="secondary" fullWidth onClick={onClockIn}>
          Clock in
        </Button>
      ) : (
        <Button variant="outlined" fullWidth onClick={onClockOut}>
          Clock out
        </Button>
      )}
    </Box>
  );
}
