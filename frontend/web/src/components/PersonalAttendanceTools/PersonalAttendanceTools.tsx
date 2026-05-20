import React from 'react';
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { AccessTime } from '@mui/icons-material';

export interface AttendanceRecord {
  id: string;
  clockIn: string;
  clockOut: string | null;
  duration: string | null;
}

export interface PersonalAttendanceToolsProps {
  isClockedIn: boolean;
  elapsedTime: string;
  clockInTime: string | null;
  records: AttendanceRecord[];
  onClockIn: () => void;
  onClockOut: () => void;
  onOpenTimeTracking: () => void;
}

const SURFACE = {
  bgcolor: '#fff',
  border: '1px solid #f1f5f9',
  borderRadius: 3,
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
} as const;

/** Right-column contextual attendance panel for the dashboard master grid. */
export function PersonalAttendanceTools({
  isClockedIn,
  elapsedTime,
  clockInTime,
  records,
  onClockIn,
  onClockOut,
  onOpenTimeTracking,
}: PersonalAttendanceToolsProps) {
  const recent = [...records].slice(-5).reverse();

  return (
    <Box
      sx={{
        ...SURFACE,
        p: 2.5,
        position: { lg: 'sticky' },
        top: { lg: 88 },
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1e293b', mb: 0.25 }}>
        Attendance
      </Typography>
      <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8', mb: 2 }}>
        Today&apos;s session and recent punches
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75 }}>
          Status
        </Typography>
        <Typography sx={{ fontWeight: 600, color: '#1e293b', mb: 0.25 }}>
          {isClockedIn ? 'Clocked in' : 'Not clocked in'}
        </Typography>
        {isClockedIn && clockInTime && (
          <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Started tracking • session timer running
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: '#f8fafc',
          border: '1px solid #f1f5f9',
          borderRadius: 2,
          px: 1.5,
          py: 1.25,
          mb: 2,
        }}
      >
        <AccessTime sx={{ fontSize: 22, color: '#64748b' }} />
        <Box>
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            Elapsed
          </Typography>
          <Typography sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: '1.125rem', color: '#1e293b' }}>
            {elapsedTime}
          </Typography>
        </Box>
      </Box>

      <StackButtons isClockedIn={isClockedIn} onClockIn={onClockIn} onClockOut={onClockOut} />

      <Divider sx={{ my: 2, borderColor: '#f1f5f9' }} />

      <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', color: '#1e293b', mb: 1 }}>
        Recent history
      </Typography>
      {recent.length === 0 ? (
        <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
          No punches yet. Clock in to start recording.
        </Typography>
      ) : (
        <List dense disablePadding sx={{ maxHeight: 220, overflow: 'auto' }}>
          {recent.map((record) => (
            <ListItem key={record.id} disableGutters sx={{ py: 0.75, display: 'block' }}>
              <ListItemText
                primaryTypographyProps={{ sx: { fontSize: '0.8125rem', fontWeight: 600, color: '#334155' } }}
                secondaryTypographyProps={{ sx: { fontSize: '0.75rem', color: '#94a3b8' } }}
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
        sx={{ mt: 2, fontWeight: 600, color: '#475569', fontSize: '0.8125rem' }}
      >
        Open time tracking
      </Button>
    </Box>
  );
}

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
        <Button variant="contained" fullWidth onClick={onClockIn} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Clock in
        </Button>
      ) : (
        <Button variant="outlined" fullWidth onClick={onClockOut} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Clock out
        </Button>
      )}
    </Box>
  );
}
