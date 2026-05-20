import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  Grid,
  keyframes,
} from '@mui/material';
import {
  Play,
  Square,
  Coffee,
  Clock,
  CalendarDays,
  BarChart3,
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

export interface TimeTrackingJobRow {
  id: string;
  name: string;
  team: string;
  progress: number;
  timeSpent: string;
  isRunning: boolean;
}

export interface TimeTrackingConsoleProps {
  isCheckedIn: boolean;
  checkInTime: string | null;
  dailyCode: string;
  activeJobs: TimeTrackingJobRow[];
  onToggleShift: () => void;
  onTakeBreak?: () => void;
  onJobToggle: (jobId: string, isRunning: boolean) => void;
}

const pulseDot = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const pulseBadge = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.65; }
`;

const formatCheckInLabel = (checkInTime: string | null) => {
  if (!checkInTime) return '—';
  try {
    const d = new Date(checkInTime);
    if (!Number.isNaN(d.getTime())) {
      return format(d, 'h:mm a');
    }
  } catch {
    /* locale string from state */
  }
  return checkInTime;
};

const TimeTrackingConsole: React.FC<TimeTrackingConsoleProps> = ({
  isCheckedIn,
  checkInTime,
  dailyCode,
  activeJobs,
  onToggleShift,
  onTakeBreak,
  onJobToggle,
}) => {
  const weeklyLogs = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const today = new Date();
    return Array.from({ length: 5 }, (_, i) => {
      const day = addDays(weekStart, i);
      return {
        day: format(day, 'EEE'),
        date: format(day, 'd MMM'),
        hours: i < 2 ? `${7.5 + i * 0.3}h` : i === 2 ? '4.2h' : '—',
        isToday: isSameDay(day, today),
      };
    });
  }, []);

  const totalHours = '24.5h';
  const efficiency = '92%';

  return (
    <Box sx={{ bgcolor: 'rgba(248, 250, 252, 0.3)', py: 3, px: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: 1600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Workspace header */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid #f1f5f9',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { sm: 'center' },
            gap: 2,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', letterSpacing: '-0.02em' }}>
              Time & Attendance Console
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.25 }}>
              Log operational project hours, check allocations, and track team utilization metrics.
            </Typography>
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
              py: 1,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#475569',
            }}
          >
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#10b981',
                animation: `${pulseDot} 2s ease-in-out infinite`,
              }}
            />
            System Status: Connected
          </Box>
        </Paper>

        <Grid container spacing={3} alignItems="flex-start">
          {/* Main column */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              {/* Punch card */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      p: 1.75,
                      borderRadius: 2,
                      bgcolor: isCheckedIn ? 'rgba(16, 185, 129, 0.08)' : '#f1f5f9',
                      color: isCheckedIn ? '#059669' : '#94a3b8',
                      border: '1px solid',
                      borderColor: isCheckedIn ? 'rgba(16, 185, 129, 0.2)' : '#e2e8f0',
                      display: 'flex',
                    }}
                  >
                    <Clock size={24} strokeWidth={2} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        display: 'block',
                      }}
                    >
                      Current Session Context
                    </Typography>
                    <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                      {isCheckedIn ? 'Active Session Running' : 'Shift Logged Out'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                      {isCheckedIn ? (
                        <>
                          Started today at {formatCheckInLabel(checkInTime)} · Daily Code:{' '}
                          <Box
                            component="span"
                            sx={{
                              fontFamily: 'monospace',
                              bgcolor: '#f1f5f9',
                              px: 0.5,
                              borderRadius: 0.5,
                              color: '#334155',
                            }}
                          >
                            {dailyCode || '—'}
                          </Box>
                        </>
                      ) : (
                        'Punch in to start tracking time on your assignments.'
                      )}
                    </Typography>
                  </Box>
                </Box>

                <Stack direction="row" spacing={1.25} sx={{ width: { xs: '100%', md: 'auto' } }}>
                  <Button
                    variant="contained"
                    disableElevation
                    onClick={onToggleShift}
                    startIcon={
                      isCheckedIn ? (
                        <Square size={14} fill="currentColor" />
                      ) : (
                        <Play size={14} fill="currentColor" />
                      )
                    }
                    sx={{
                      flex: { xs: 1, md: 'none' },
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      borderRadius: 2,
                      px: 2.5,
                      py: 1.25,
                      bgcolor: isCheckedIn ? '#e11d48' : '#0f172a',
                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
                      '&:hover': { bgcolor: isCheckedIn ? '#be123c' : '#1e293b' },
                    }}
                  >
                    {isCheckedIn ? 'End Shift Log' : 'Punch In Shift'}
                  </Button>
                  {isCheckedIn && onTakeBreak && (
                    <IconButton
                      onClick={onTakeBreak}
                      title="Take a break"
                      sx={{
                        border: '1px solid #e2e8f0',
                        borderRadius: 2,
                        bgcolor: '#f8fafc',
                        color: '#475569',
                        '&:hover': { bgcolor: '#f1f5f9' },
                      }}
                    >
                      <Coffee size={18} />
                    </IconButton>
                  )}
                </Stack>
              </Paper>

              {/* Active assignments */}
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#1e293b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Active Assignments
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.25 }}>
                    Allocate tracked hours dynamically to your current open project pipelines.
                  </Typography>
                </Box>

                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
                    overflow: 'hidden',
                  }}
                >
                  {activeJobs.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.875rem', color: '#64748b' }}>
                        No active assignments. Add a job to start tracking.
                      </Typography>
                    </Box>
                  ) : (
                    activeJobs.map((job, index) => (
                      <Box
                        key={job.id}
                        sx={{
                          p: 2,
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          justifyContent: 'space-between',
                          alignItems: { sm: 'center' },
                          gap: 2,
                          borderTop: index > 0 ? '1px solid #f1f5f9' : 'none',
                          transition: 'background-color 120ms ease',
                          '&:hover': { bgcolor: 'rgba(248, 250, 252, 0.6)' },
                        }}
                      >
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>
                              {job.name}
                            </Typography>
                            {job.isRunning && (
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: '0.5625rem',
                                  fontWeight: 700,
                                  px: 0.75,
                                  py: 0.25,
                                  borderRadius: 0.5,
                                  bgcolor: 'rgba(59, 130, 246, 0.08)',
                                  color: '#2563eb',
                                  border: '1px solid rgba(59, 130, 246, 0.2)',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                  animation: `${pulseBadge} 2s ease-in-out infinite`,
                                }}
                              >
                                Tracking Live
                              </Typography>
                            )}
                          </Box>
                          <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, mt: 0.25 }}>
                            {job.team}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            width: { xs: '100%', sm: 'auto' },
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
                            <Typography
                              sx={{
                                fontSize: '0.625rem',
                                fontWeight: 600,
                                color: '#94a3b8',
                                textTransform: 'uppercase',
                                display: 'block',
                              }}
                            >
                              Logged
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                              {job.timeSpent}
                            </Typography>
                          </Box>
                          <IconButton
                            onClick={() => onJobToggle(job.id, job.isRunning)}
                            disabled={!isCheckedIn && !job.isRunning}
                            sx={{
                              border: '1px solid',
                              borderColor: job.isRunning ? 'rgba(244, 63, 94, 0.3)' : '#e2e8f0',
                              borderRadius: 2,
                              bgcolor: job.isRunning ? 'rgba(254, 226, 226, 0.5)' : '#f8fafc',
                              color: job.isRunning ? '#e11d48' : '#475569',
                              '&:hover': {
                                bgcolor: job.isRunning ? 'rgba(254, 226, 226, 0.8)' : '#f1f5f9',
                              },
                              '&.Mui-disabled': { opacity: 0.45 },
                            }}
                          >
                            {job.isRunning ? (
                              <Square size={18} fill="currentColor" />
                            ) : (
                              <Play size={18} fill="currentColor" />
                            )}
                          </IconButton>
                        </Box>
                      </Box>
                    ))
                  )}
                </Paper>
              </Box>
            </Stack>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 1.5,
                    mb: 2,
                    borderBottom: '1px solid #f8fafc',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarDays size={16} color="#94a3b8" />
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>
                      Timesheet Log
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      bgcolor: '#f1f5f9',
                      color: '#475569',
                      px: 1,
                      py: 0.25,
                      borderRadius: 99,
                    }}
                  >
                    This Week
                  </Typography>
                </Box>
                <Stack spacing={1}>
                  {weeklyLogs.map((log) => (
                    <Box
                      key={log.day}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1.25,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: log.isToday ? '#0f172a' : '#f1f5f9',
                        bgcolor: log.isToday ? '#0f172a' : 'rgba(248, 250, 252, 0.5)',
                        color: log.isToday ? '#fff' : '#334155',
                        boxShadow: log.isToday ? '0 1px 2px rgba(15, 23, 42, 0.12)' : 'none',
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>{log.day}</Typography>
                        <Typography
                          sx={{
                            fontSize: '0.625rem',
                            color: log.isToday ? '#94a3b8' : '#94a3b8',
                          }}
                        >
                          {log.date}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                        {log.hours}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <BarChart3 size={16} color="#94a3b8" />
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>
                    Utilization Summary
                  </Typography>
                </Box>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(248, 250, 252, 0.8)',
                        border: '1px solid rgba(241, 245, 249, 0.6)',
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          display: 'block',
                        }}
                      >
                        Total Hours
                      </Typography>
                      <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                        {totalHours}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(248, 250, 252, 0.8)',
                        border: '1px solid rgba(241, 245, 249, 0.6)',
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          display: 'block',
                        }}
                      >
                        Efficiency
                      </Typography>
                      <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#059669' }}>
                        {efficiency}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TimeTrackingConsole;
