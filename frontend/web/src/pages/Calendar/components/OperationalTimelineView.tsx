import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  alpha,
  useTheme,
  Divider,
} from '@mui/material';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  isToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from '@mui/material';
import { TimelineEventCard, type TimelineEventCardData } from './TimelineEventCard';
import {
  OPS_CATEGORY_LABELS,
  type OpsTimelineCategory,
} from '../calendarOpsTypes';
import { weekRunwayPanelSx } from './weekRunwayStyles';
import {
  allowBacklogDrop,
  clearBacklogDrag,
  readBacklogDragData,
  setBacklogDragData,
} from '../calendarDragUtils';

export type TimelineFilter = 'all' | OpsTimelineCategory;

export interface BacklogDragItem {
  id: string;
  title: string;
  duration: string;
  dept: string;
  borderColor: string;
}

export interface OperationalTimelineViewProps {
  events: TimelineEventCardData[];
  backlogItems: BacklogDragItem[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onEventClick: (event: TimelineEventCardData) => void;
  onBacklogClick: (item: BacklogDragItem) => void;
  onBacklogDrop: (item: BacklogDragItem, day: Date) => void;
  rightColumn?: React.ReactNode;
  topBarExtras?: React.ReactNode;
}

const FILTER_OPTIONS: { value: TimelineFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'milestone', label: 'Milestones' },
  { value: 'deadline', label: 'Deadlines' },
  { value: 'shift', label: 'Shifts' },
  { value: 'approval', label: 'Approvals' },
  { value: 'risk', label: 'Risks' },
  { value: 'meeting', label: 'Meetings' },
  { value: 'task', label: 'Tasks' },
];

export function OperationalTimelineView({
  events,
  backlogItems,
  selectedDate,
  onSelectDate,
  onEventClick,
  onBacklogClick,
  onBacklogDrop,
  rightColumn,
  topBarExtras,
}: OperationalTimelineViewProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeek(selectedDate, { weekStartsOn: 0 }));
  const [filter, setFilter] = useState<TimelineFilter>('all');
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);

  const weekDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(weekAnchor, { weekStartsOn: 0 }),
        end: endOfWeek(weekAnchor, { weekStartsOn: 0 }),
      }),
    [weekAnchor]
  );

  const filteredEvents = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    if (filter === 'all') return sorted;
    return sorted.filter((ev) => {
      const cat =
        ev.opsCategory ??
        (ev.type === 'task' ? 'task' : ev.type === 'production' ? 'production' : 'meeting');
      return cat === filter;
    });
  }, [events, filter]);

  const groupedChronological = useMemo(() => {
    const map = new Map<string, TimelineEventCardData[]>();
    filteredEvents.forEach((ev) => {
      const key = format(new Date(ev.startDate), 'yyyy-MM-dd');
      const list = map.get(key) ?? [];
      list.push(ev);
      map.set(key, list);
    });
    return [...map.entries()];
  }, [filteredEvents]);

  const eventsByDay = (day: Date) =>
    filteredEvents.filter((ev) => isSameDay(new Date(ev.startDate), day));

  const handleDragStart = (e: React.DragEvent, item: BacklogDragItem) => {
    e.stopPropagation();
    setBacklogDragData(e, item);
  };

  const handleDropOnDay = (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverDay(null);
    const item = readBacklogDragData(e);
    clearBacklogDrag();
    if (item) {
      onSelectDate(day);
      onBacklogDrop(item, day);
    }
  };

  const handleDayDragLeave = (e: React.DragEvent, dayKey: string) => {
    const related = e.relatedTarget as Node | null;
    if (related && e.currentTarget.contains(related)) return;
    setDragOverDay((prev) => (prev === dayKey ? null : prev));
  };

  const maxVisibleInColumn = 2;

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden' }}>
      {/* Ops toolbar (not page header) */}
      <Paper
        elevation={0}
        sx={{
          ...weekRunwayPanelSx(theme),
          p: { xs: 2, sm: 2.5 },
          mb: 3,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            Business operations timeline
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
            Milestones, deadlines, shifts, approvals, and risks on one runway. Drag backlog items
            onto a day to schedule.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', flexShrink: 0 }}>
          {topBarExtras}
        </Box>
      </Paper>

      {/* 75 / 25 runway + side panel */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: 'flex-start',
          gap: { xs: 2.5, lg: 3 },
          width: '100%',
          minWidth: 0,
        }}
      >
        {/* Main runway — 75% */}
        <Box
          sx={{
            flex: { lg: '1 1 75%' },
            width: { xs: '100%', lg: '75%' },
            maxWidth: { lg: '75%' },
            minWidth: 0,
          }}
        >
          <Paper elevation={0} sx={{ ...weekRunwayPanelSx(theme), mb: 2.5 }}>
            <Box
              sx={{
                px: { xs: 2, sm: 2.5 },
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.6875rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                  }}
                >
                  Week runway
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                  Seven-day operational grid
                </Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton
                  size="small"
                  onClick={() => setWeekAnchor(subWeeks(weekAnchor, 1))}
                  aria-label="Previous week"
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}
                >
                  <ChevronLeft size={18} />
                </IconButton>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, minWidth: { xs: 100, sm: 140 }, textAlign: 'center', px: 1 }}
                >
                  {format(weekDays[0], 'MMM d')} – {format(weekDays[6], 'MMM d, yyyy')}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setWeekAnchor(addWeeks(weekAnchor, 1))}
                  aria-label="Next week"
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}
                >
                  <ChevronRight size={18} />
                </IconButton>
              </Stack>
            </Box>

            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                bgcolor: isDark ? alpha('#0f172a', 0.35) : '#f1f5f9',
                overflowX: { xs: 'auto', lg: 'hidden' },
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(7, minmax(148px, 1fr))',
                    lg: 'repeat(7, minmax(0, 1fr))',
                  },
                  gap: { xs: 1, sm: 1.25, md: 1.5 },
                  minWidth: { xs: 'min(100%, 1036px)', lg: 0 },
                  width: '100%',
                }}
              >
                {weekDays.map((day) => {
                  const key = format(day, 'yyyy-MM-dd');
                  const dayEvents = eventsByDay(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isDropTarget = dragOverDay === key;
                  const today = isToday(day);
                  const overflow = dayEvents.length - maxVisibleInColumn;

                  return (
                    <Box
                      key={key}
                      onDragEnter={(e) => {
                        allowBacklogDrop(e);
                        setDragOverDay(key);
                      }}
                      onDragOver={(e) => {
                        allowBacklogDrop(e);
                        setDragOverDay(key);
                      }}
                      onDragLeave={(e) => handleDayDragLeave(e, key)}
                      onDrop={(e) => handleDropOnDay(e, day)}
                      sx={{
                        minWidth: 0,
                        minHeight: { xs: 168, sm: 200, md: 220 },
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '8px',
                        border: '2px solid',
                        borderColor: isDropTarget
                          ? theme.palette.primary.main
                          : isSelected
                            ? theme.palette.primary.main
                            : 'transparent',
                        bgcolor: isDropTarget
                          ? alpha(theme.palette.primary.main, 0.1)
                          : isSelected
                            ? alpha(theme.palette.primary.main, 0.06)
                            : isDark
                              ? alpha('#fff', 0.03)
                              : '#ffffff',
                        boxShadow: isSelected
                          ? `0 0 0 1px ${alpha(theme.palette.primary.main, 0.25)}`
                          : 'none',
                        overflow: 'hidden',
                        transition: 'border-color 140ms ease, background-color 140ms ease, box-shadow 140ms ease',
                      }}
                    >
                      <Box
                        onClick={() => onSelectDate(day)}
                        sx={{
                          px: 1.25,
                          py: 1,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          bgcolor: today
                            ? alpha(theme.palette.primary.main, 0.08)
                            : isDark
                              ? alpha('#000', 0.15)
                              : alpha('#f8fafc', 0.9),
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.6875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: today ? 'primary.main' : 'text.secondary',
                          }}
                        >
                          {format(day, 'EEE')}
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: '1.125rem',
                            lineHeight: 1.2,
                            color: isSelected ? 'primary.main' : 'text.primary',
                          }}
                        >
                          {format(day, 'd')}
                        </Typography>
                      </Box>

                      <Stack
                        spacing={1}
                        onDragEnter={allowBacklogDrop}
                        onDragOver={allowBacklogDrop}
                        onDrop={(e) => handleDropOnDay(e, day)}
                        sx={{
                          p: 1,
                          flex: 1,
                          minHeight: 0,
                          overflowY: 'auto',
                          overflowX: 'hidden',
                        }}
                      >
                        {dayEvents.length === 0 ? (
                          <Box
                            onDragEnter={allowBacklogDrop}
                            onDragOver={allowBacklogDrop}
                            onDrop={(e) => handleDropOnDay(e, day)}
                            sx={{
                              flex: 1,
                              minHeight: 80,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px dashed',
                              borderColor: isDropTarget ? 'primary.main' : 'divider',
                              borderRadius: '6px',
                              bgcolor: isDropTarget ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '0.6875rem',
                                color: 'text.secondary',
                                textAlign: 'center',
                                px: 1,
                                lineHeight: 1.4,
                              }}
                            >
                              Drop backlog here
                            </Typography>
                          </Box>
                        ) : (
                          <>
                            {dayEvents.slice(0, maxVisibleInColumn).map((ev) => (
                              <TimelineEventCard
                                key={ev.id}
                                event={ev}
                                runwayCompact
                                onClick={() => onEventClick(ev)}
                              />
                            ))}
                            {overflow > 0 ? (
                              <Chip
                                size="small"
                                label={`+${overflow} more`}
                                onClick={() => onSelectDate(day)}
                                sx={{
                                  alignSelf: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.6875rem',
                                  height: 24,
                                  cursor: 'pointer',
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: 'primary.main',
                                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18) },
                                }}
                              />
                            ) : null}
                          </>
                        )}
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Paper>

          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {FILTER_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                size="small"
                onClick={() => setFilter(opt.value)}
                variant={filter === opt.value ? 'filled' : 'outlined'}
                sx={{
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  minHeight: 32,
                }}
              />
            ))}
          </Stack>

          <Paper elevation={0} sx={weekRunwayPanelSx(theme)}>
            <Box sx={{ px: { xs: 2, sm: 2.5 }, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                }}
              >
                Chronological runway
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                {filter === 'all'
                  ? 'All operational events sorted by date'
                  : `Showing ${OPS_CATEGORY_LABELS[filter as OpsTimelineCategory] ?? filter} only`}
              </Typography>
            </Box>
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                maxHeight: { xs: 'none', md: '58vh' },
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {groupedChronological.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No events in this filter. Try another category or schedule a new block.
                </Typography>
              ) : (
                <Stack spacing={3} divider={<Divider flexItem />}>
                  {groupedChronological.map(([dateKey, dayList]) => (
                    <Box key={dateKey}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 1.5,
                          mb: 2,
                          pb: 1,
                          borderBottom: '2px solid',
                          borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
                        }}
                      >
                        <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'text.primary' }}>
                          {format(new Date(dateKey), 'EEEE')}
                        </Typography>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.secondary' }}>
                          {format(new Date(dateKey), 'MMMM d, yyyy')}
                        </Typography>
                        <Chip
                          label={`${dayList.length} event${dayList.length !== 1 ? 's' : ''}`}
                          size="small"
                          sx={{ ml: 'auto', fontWeight: 700, fontSize: '0.6875rem' }}
                        />
                      </Box>
                      <Stack spacing={1.5}>
                        {dayList.map((ev) => (
                          <TimelineEventCard key={ev.id} event={ev} onClick={() => onEventClick(ev)} />
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Right panel — 25%, sticky on desktop */}
        {rightColumn ? (
          <Box
            sx={{
              flex: { lg: '0 0 25%' },
              width: { xs: '100%', lg: '25%' },
              maxWidth: { lg: '25%' },
              minWidth: 0,
              position: { lg: 'sticky' },
              top: { lg: 24 },
              alignSelf: 'flex-start',
              maxHeight: { lg: 'calc(100dvh - 48px)' },
              overflowY: { lg: 'auto' },
              WebkitOverflowScrolling: 'touch',
              pr: { lg: 0.5 },
            }}
          >
            {rightColumn}
          </Box>
        ) : null}
      </Box>

      {!rightColumn && backlogItems.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Draggable backlog
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 1.5,
            }}
          >
            {backlogItems.map((task) => (
              <Paper
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                onClick={() => onBacklogClick(task)}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderLeftWidth: 4,
                  borderLeftColor: task.borderColor,
                  cursor: 'grab',
                  bgcolor: '#fff',
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{task.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {task.dept} · {task.duration}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
