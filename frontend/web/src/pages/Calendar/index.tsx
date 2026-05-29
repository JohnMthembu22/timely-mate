import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputAdornment,
  Select,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  LinearProgress,
  Container,
  Tooltip,
  Switch,
  FormControlLabel,
  Popper,
  Divider,
} from '@mui/material';
import {
  Add,
  VideoCall,
  ViewDay,
  ViewWeek,
  ViewModule,
  AccessTime,
  LocationOn,
  People,
  Repeat,
  NotificationsActive,
  AutoAwesome,
  Psychology,
  Speed,
  Analytics,
  CalendarViewDay,
} from '@mui/icons-material';
import {
  format,
  addMonths,
  subMonths,
  isSameDay,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
} from 'date-fns';
import {
  ChevronLeft as ChevronLeftLucide,
  ChevronRight as ChevronRightLucide,
  Plus,
  QrCode,
  Clock as ClockLucide,
  Users as UsersLucide,
  Calendar as CalendarLucideIcon,
  MapPin,
  Users,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import PopupHoverCard from '../../components/PopupHoverCard';
import { useEmployees } from '../../contexts/EmployeeContext';
import { popupFormLabelSx, popupNestedPanelSx } from '../../theme/popupSurfaces';
import { buildOperationalMockEvents } from './calendarOpsMockData';
import type { OpsRiskLevel, OpsTimelineCategory } from './calendarOpsTypes';
import { OperationalTimelineView } from './components/OperationalTimelineView';
import type { TimelineEventCardData } from './components/TimelineEventCard';
import { WeekRunwaySidePanel } from './components/WeekRunwaySidePanel';
import { AssignScheduleDialog } from './components/AssignScheduleDialog';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAppSelector } from '../../store';
import {
  notifyTaskSubmittedToBriefedBy,
} from '../../utils/taskReview';
import { getAuthUserLabel } from '../../utils/managerReview';

type TaskWorkflowStatus = 'todo' | 'in_progress' | 'completed' | 'pending_review';

interface TeamMember {
  name: string;
  avatar: string;
  role: string;
  email?: string;
  id?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: TeamMember | null;
  assignedBy: TeamMember | null;
  assignedByEmail?: string;
  status: TaskWorkflowStatus;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  isProjectTask: boolean;
  projectId?: string;
  projectName?: string;
  createdAt: string;
  progress: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'meeting' | 'task' | 'production';
  priority: 'low' | 'medium' | 'high';
  status: TaskWorkflowStatus;
  projectId?: string;
  projectName?: string;
  attendees?: { name: string; avatar: string }[];
  assignedByEmail?: string;
  assignedByName?: string;
  linkedTaskId?: string;
  progress?: number;
  location?: string;
  isVirtual?: boolean;
  meetingLink?: string;
  opsCategory?: OpsTimelineCategory;
  riskLevel?: OpsRiskLevel;
}

interface PendingScheduleRequest {
  item: BacklogItem;
  day: Date;
}

const SAMPLE_OPERATIONAL_BACKLOG: {
  id: string;
  title: string;
  duration: string;
  dept: string;
  borderColor: string;
}[] = [
  { id: 'demo-1', title: 'Bulk T-Shirt Print Run', duration: '3 days', dept: 'Production', borderColor: '#f59e0b' },
  { id: 'demo-2', title: 'Setup Signage Installation', duration: '1 day', dept: 'Operations', borderColor: '#3b82f6' },
  { id: 'demo-3', title: 'Client Branding Sign-off', duration: '2 hours', dept: 'Creative', borderColor: '#10b981' },
];

type BacklogItem = {
  id: string;
  title: string;
  duration: string;
  dept: string;
  borderColor: string;
  sourceTask?: Task;
};

const blockContextLabel = (type?: CalendarEvent['type']) => {
  if (type === 'production') return 'Production run';
  if (type === 'task') return 'Task allocation';
  return 'Meeting / sync';
};

const priorityLabel = (priority?: CalendarEvent['priority']) => {
  if (priority === 'high') return 'High priority';
  if (priority === 'low') return 'Low priority';
  return 'Medium priority';
};

const defaultNewEventState = (): Partial<CalendarEvent> => ({
  type: 'meeting',
  priority: 'medium',
  status: 'todo',
  isVirtual: false,
});

const eventTypeChipLabel = (type: CalendarEvent['type']) => {
  if (type === 'meeting') return 'Meeting';
  if (type === 'production') return 'Production';
  return 'Task';
};

const isTaskLike = (type: CalendarEvent['type']) => type === 'task' || type === 'production';

const getNewBlockDialogCopy = (
  event: Partial<CalendarEvent>,
  fallbackDate: Date
) => {
  const title = event.title?.trim();
  const context = blockContextLabel(event.type);
  const priority = priorityLabel(event.priority);
  const scheduleLabel = event.startDate
    ? format(new Date(event.startDate), 'MMM d, yyyy · h:mm a')
    : format(fallbackDate, 'MMM d, yyyy');

  if (title) {
    return {
      heading: title,
      subtitle: `${context} · ${priority} · ${scheduleLabel}`,
    };
  }

  return {
    heading: 'Schedule operational block',
    subtitle: 'Add a title, timing, and context to place this on the runway.',
  };
};

const isAvatarImageUrl = (value: string) => /^https?:\/\//i.test(value.trim());

/** Renders profile photo when avatar is a URL, otherwise initials from name */
const renderPersonAvatar = (
  person: { name: string; avatar: string },
  sx?: object
) => {
  const src = isAvatarImageUrl(person.avatar) ? person.avatar : undefined;
  const initials =
    person.name.trim().charAt(0).toUpperCase() ||
    (person.avatar.length === 1 ? person.avatar.toUpperCase() : '?');

  return (
    <Avatar src={src} alt={person.name} imgProps={{ loading: 'lazy' }} sx={sx}>
      {initials}
    </Avatar>
  );
};

const roundedLg = '8px';

/** White inputs inside nested meeting panel (on top of global dialog field styles) */
const meetingPanelFieldSx = {
  '& .MuiOutlinedInput-root': { bgcolor: '#fff' },
};

const Calendar: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { addNotification, addNotificationForRecipient } = useNotifications();
  const [selectedDate, setSelectedDate] = useState(new Date());
  /** Month shown in the operational grid (independent of selected day). */
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  /** Week strip anchor (Sunday-based). */
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newEventDialogOpen, setNewEventDialogOpen] = useState(false);
  const { employees } = useEmployees();
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>(defaultNewEventState);
  const [assignScheduleOpen, setAssignScheduleOpen] = useState(false);
  const [pendingSchedule, setPendingSchedule] = useState<PendingScheduleRequest | null>(null);

  const openNewEventDialog = (preset?: Partial<CalendarEvent>) => {
    setNewEvent({ ...defaultNewEventState(), ...preset });
    setNewEventDialogOpen(true);
  };

  const newBlockDialogCopy = getNewBlockDialogCopy(newEvent, selectedDate);

  // Generate demo tasks from employees (presentation mode only)
  useEffect(() => {
    if (employees.length > 0) {
      const mockTasks: Task[] = [];
      const departments = [...new Set(employees.map(emp => emp.department))];
      
      departments.forEach((dept, deptIndex) => {
        const deptEmployees = employees.filter(emp => emp.department === dept);
        
        // Create team members from employees
        const team: TeamMember[] = deptEmployees.map((emp) => ({
          id: emp.id,
          name: emp.name,
          avatar: emp.avatar || `https://i.pravatar.cc/150?u=${emp.id}`,
          role: emp.position,
          email: emp.email,
        }));

        // Generate tasks for each department
        const taskTemplates = [
          { title: 'Code Review', description: 'Review and approve code changes', priority: 'high' as const },
          { title: 'Bug Fix', description: 'Fix critical bugs in production', priority: 'high' as const },
          { title: 'Feature Development', description: 'Implement new feature requirements', priority: 'medium' as const },
          { title: 'Testing', description: 'Perform comprehensive testing', priority: 'medium' as const },
          { title: 'Documentation', description: 'Update project documentation', priority: 'low' as const },
          { title: 'Performance Optimization', description: 'Optimize application performance', priority: 'medium' as const },
          { title: 'Security Audit', description: 'Conduct security review', priority: 'high' as const },
          { title: 'Deployment', description: 'Deploy application to production', priority: 'high' as const },
          { title: 'User Training', description: 'Conduct user training sessions', priority: 'low' as const },
          { title: 'Data Analysis', description: 'Analyze user data and metrics', priority: 'medium' as const },
        ];

        taskTemplates.forEach((template, taskIndex) => {
          const statuses: TaskWorkflowStatus[] = ['todo', 'in_progress', 'completed'];
          const status = statuses[taskIndex % 3];
          const assignee = team[taskIndex % team.length] || null;
          const assignedBy = team[(taskIndex + 1) % team.length] || team[0] || null;

          const task: Task = {
            id: `${deptIndex}-${taskIndex}`,
            title: `${template.title} - ${dept}`,
            description: template.description,
            assignee,
            assignedBy,
            assignedByEmail: assignedBy?.email ?? deptEmployees[(taskIndex + 1) % deptEmployees.length]?.email,
            status,
            dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priority: template.priority,
            isProjectTask: true,
            projectId: deptIndex.toString(),
            projectName: dept,
            createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
            progress: status === 'completed' ? 100 : status === 'in_progress' ? Math.floor(Math.random() * 80) + 20 : 0,
          };
          
          mockTasks.push(task);
        });
      });

      setTasks(mockTasks);
    }
  }, [employees]);

  useEffect(() => {
    const seeds = buildOperationalMockEvents();
    setEvents((prev) => {
      const existing = new Set(prev.map((e) => e.id));
      const additions: CalendarEvent[] = seeds
        .filter((s) => !existing.has(s.id))
        .map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          startDate: s.startDate,
          endDate: s.endDate,
          type:
            s.opsCategory === 'meeting'
              ? 'meeting'
              : s.opsCategory === 'production'
                ? 'production'
                : 'task',
          priority: s.priority,
          status: s.status,
          projectId: s.projectId,
          location: s.location,
          opsCategory: s.opsCategory,
          riskLevel: s.riskLevel,
        }));
      return additions.length ? [...prev, ...additions] : prev;
    });
  }, []);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [view, setView] = useState('month');
  const [showTimeBlockDialog, setShowTimeBlockDialog] = useState(false);
  
  // Hover popup state
  const [hoverEvent, setHoverEvent] = useState<CalendarEvent | null>(null);
  const [hoverAnchorEl, setHoverAnchorEl] = useState<HTMLElement | null>(null);

  const handleNewEvent = () => {
    if (!newEvent.title || !newEvent.startDate) return;

    setEvents(prev => [...prev, {
      id: (prev.length + 1).toString(),
      title: newEvent.title!,
      description: newEvent.description || '',
      startDate: newEvent.startDate!,
      endDate: newEvent.endDate || newEvent.startDate!,
      type: newEvent.type as CalendarEvent['type'],
      priority: newEvent.priority as 'low' | 'medium' | 'high',
      status: (newEvent.status ?? 'todo') as TaskWorkflowStatus,
      progress: newEvent.type === 'meeting' ? undefined : 0,
      projectId: newEvent.projectId,
      projectName: newEvent.projectName,
      linkedTaskId: newEvent.linkedTaskId,
      assignedByEmail: newEvent.assignedByEmail,
      assignedByName: newEvent.assignedByName,
      attendees: newEvent.attendees ?? (newEvent.type === 'meeting' ? [] : undefined),
      location: newEvent.location,
      isVirtual: newEvent.isVirtual,
      meetingLink: newEvent.meetingLink,
    }]);
    setNewEventDialogOpen(false);
    setNewEvent(defaultNewEventState());
  };

  const getEventsByDate = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    const dayEvents = events.filter(
      (event) => format(new Date(event.startDate), 'yyyy-MM-dd') === key
    );
    const taskEvents: CalendarEvent[] = tasks
      .filter((task) => task.dueDate === key)
      .map((task) => ({
        id: `task-${task.id}`,
        title: task.title,
        description: task.description,
        startDate: task.dueDate,
        endDate: task.dueDate,
        type: 'task' as const,
        priority: task.priority,
        status: task.status,
        projectId: task.projectId,
        projectName: task.projectName,
        linkedTaskId: task.id,
        assignedByEmail: task.assignedByEmail ?? task.assignedBy?.email,
        assignedByName: task.assignedBy?.name,
        attendees: task.assignee ? [{ name: task.assignee.name, avatar: task.assignee.avatar }] : undefined,
        progress: task.progress,
      }));
    return [...dayEvents, ...taskEvents];
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  // Hover handlers for event popup
  const handleEventMouseEnter = (event: CalendarEvent, anchorEl: HTMLElement) => {
    setHoverEvent(event);
    setHoverAnchorEl(anchorEl);
  };

  const handleEventMouseLeave = () => {
    setHoverEvent(null);
    setHoverAnchorEl(null);
  };

  const syncLinkedTaskStatus = (event: CalendarEvent, newStatus: TaskWorkflowStatus) => {
    if (!event.linkedTaskId && !event.id.startsWith('task-')) return;
    const taskId = event.linkedTaskId ?? event.id.replace(/^task-/, '');
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              progress:
                newStatus === 'completed' || newStatus === 'pending_review'
                  ? 100
                  : newStatus === 'in_progress'
                    ? Math.max(t.progress, 20)
                    : 0,
            }
          : t
      )
    );
  };

  const patchEventStatus = (eventId: string, newStatus: TaskWorkflowStatus) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        return {
          ...e,
          status: newStatus,
          progress:
            newStatus === 'completed' || newStatus === 'pending_review'
              ? 100
              : newStatus === 'in_progress'
                ? Math.max(e.progress ?? 0, 20)
                : e.progress,
        };
      })
    );
  };

  const handleStatusChange = (event: CalendarEvent, newStatus: TaskWorkflowStatus) => {
    patchEventStatus(event.id, newStatus);
    syncLinkedTaskStatus(event, newStatus);
    setSelectedEvent((prev) => (prev?.id === event.id ? { ...prev, status: newStatus } : prev));
  };

  const handleSubmitForReview = (event: CalendarEvent) => {
    const submitterLabel = getAuthUserLabel(user ?? undefined);
    const briefedByEmail = event.assignedByEmail ?? user?.email;

    handleStatusChange(event, 'pending_review');

    notifyTaskSubmittedToBriefedBy({
      briefedByEmail,
      briefedByName: event.assignedByName,
      taskTitle: event.title,
      submitterLabel,
      submitterEmail: user?.email,
      actionUrl: '/calendar',
      employees,
      addNotificationForRecipient,
      addNotification,
    });

    setEventDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleProgressChange = (event: CalendarEvent, newProgress: number) => {
    setEvents(prev => prev.map(e => {
      if (e.id === event.id) {
        return {
          ...e,
          progress: newProgress,
          status: newProgress === 100 ? 'completed' : 'in_progress',
        };
      }
      return e;
    }));
  };

  const eventStatusLabel = (s: CalendarEvent['status']) => {
    if (s === 'pending_review') return 'Pending review';
    if (s === 'in_progress') return 'In-Progress';
    if (s === 'completed') return 'Done';
    return 'To-Do';
  };

  const eventTypeShort = (e: CalendarEvent) => eventTypeChipLabel(e.type);

  const getBacklogItems = (): BacklogItem[] => {
    const unassigned = tasks.filter((t) => !t.assignee);
    if (unassigned.length > 0) {
      return unassigned.slice(0, 8).map((t) => {
        const deptMatch = t.title.match(/ - (.+)$/);
        return {
          id: t.id,
          title: t.title.replace(/ - .*$/, ''),
          duration: '—',
          dept: deptMatch ? deptMatch[1] : 'General',
          borderColor:
            t.priority === 'high' ? '#f59e0b' : t.priority === 'medium' ? '#3b82f6' : '#10b981',
          sourceTask: t,
        };
      });
    }
    return [];
    return SAMPLE_OPERATIONAL_BACKLOG.map((r) => ({ ...r }));
  };

  const scheduleDayToDatetimeLocal = (day: string, hour: number) => {
    const h = String(hour).padStart(2, '0');
    return `${day}T${h}:00`;
  };

  const projectNameOptions = useMemo(() => {
    const names = new Set<string>();
    tasks.forEach((t) => {
      if (t.projectName) names.add(t.projectName);
      else if (t.projectId) names.add(`Project ${t.projectId}`);
    });
    employees.forEach((e) => names.add(e.department));
    return [...names].sort();
  }, [tasks, employees]);

  const openAssignScheduleForBacklog = (item: BacklogItem, day: Date) => {
    setPendingSchedule({ item, day });
    setAssignScheduleOpen(true);
  };

  const completeBacklogSchedule = (assigneeId: string, projectName: string) => {
    if (!pendingSchedule) return;
    const { item, day } = pendingSchedule;
    const dayStr = format(day, 'yyyy-MM-dd');
    const startDate = scheduleDayToDatetimeLocal(dayStr, 9);
    const endDate = scheduleDayToDatetimeLocal(dayStr, 10);
    const employee = employees.find((e) => e.id === assigneeId);
    const assigneeMember: TeamMember | null = employee
      ? {
          id: employee.id,
          name: employee.name,
          avatar: employee.avatar || `https://i.pravatar.cc/150?u=${employee.id}`,
          role: employee.position,
          email: employee.email,
        }
      : null;
    const assignerEmail = user?.email;
    const assignerName = getAuthUserLabel(user ?? undefined);

    if (item.sourceTask) {
      const t = item.sourceTask;
      setTasks((prev) =>
        prev.map((task) =>
          task.id === t.id
            ? {
                ...task,
                assignee: assigneeMember,
                assignedBy: assigneeMember
                  ? {
                      name: assignerName,
                      avatar: '',
                      role: 'Scheduler',
                      email: assignerEmail,
                    }
                  : task.assignedBy,
                assignedByEmail: assignerEmail,
                dueDate: dayStr,
                projectName,
                projectId: t.projectId ?? projectName,
              }
            : task
        )
      );
      openNewEventDialog({
        title: item.title,
        description: t.description,
        startDate,
        endDate,
        type: 'task',
        priority: t.priority,
        status: t.status === 'completed' ? 'todo' : t.status,
        projectId: t.projectId,
        projectName,
        linkedTaskId: t.id,
        assignedByEmail: assignerEmail,
        assignedByName: assignerName,
        attendees: assigneeMember
          ? [{ name: assigneeMember.name, avatar: assigneeMember.avatar }]
          : undefined,
      });
    } else {
      const blockType: CalendarEvent['type'] =
        item.dept === 'Production' ? 'production' : 'task';
      openNewEventDialog({
        title: item.title,
        description: `${item.dept} · ${item.duration} · ${projectName}`,
        startDate,
        endDate,
        type: blockType,
        priority: 'medium',
        status: 'todo',
        projectName,
        assignedByEmail: assignerEmail,
        assignedByName: assignerName,
        attendees: assigneeMember
          ? [{ name: assigneeMember.name, avatar: assigneeMember.avatar }]
          : undefined,
      });
    }

    setAssignScheduleOpen(false);
    setPendingSchedule(null);
  };

  const handleBacklogItemClick = (item: BacklogItem) => {
    const day = item.sourceTask?.dueDate || format(selectedDate, 'yyyy-MM-dd');
    openAssignScheduleForBacklog(item, new Date(day.includes('T') ? day : `${day}T12:00:00`));
  };

  const toTimelineCard = (ev: CalendarEvent): TimelineEventCardData => ({
    id: ev.id,
    title: ev.title,
    description: ev.description,
    startDate: ev.startDate,
    endDate: ev.endDate,
    type: ev.type,
    opsCategory: ev.opsCategory,
    priority: ev.priority,
    status: ev.status,
    riskLevel: ev.riskLevel,
    location: ev.location,
  });

  const getMergedTimelineEvents = (): CalendarEvent[] => {
    const taskEvents: CalendarEvent[] = tasks.map((task) => ({
      id: `task-${task.id}`,
      title: task.title,
      description: task.description,
      startDate: task.dueDate,
      endDate: task.dueDate,
      type: 'task' as const,
      priority: task.priority,
      status: task.status,
      projectId: task.projectId,
      projectName: task.projectName,
      linkedTaskId: task.id,
      assignedByEmail: task.assignedByEmail ?? task.assignedBy?.email,
      assignedByName: task.assignedBy?.name,
      attendees: task.assignee ? [{ name: task.assignee.name, avatar: task.assignee.avatar }] : undefined,
      progress: task.progress,
    }));
    return [...events, ...taskEvents].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  };

  const renderNewOperationalBlockButton = () => (
    <Button
      variant="contained"
      size="medium"
      startIcon={<Plus size={16} />}
      onClick={() => openNewEventDialog()}
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.75rem',
        bgcolor: '#0f172a',
        px: 2,
        py: 1,
        '&:hover': { bgcolor: '#1e293b' },
      }}
    >
      New operational block
    </Button>
  );

  const renderSegmentMonthTimeline = () => (
    <Box
      sx={{
        display: 'flex',
        bgcolor: '#f1f5f9',
        p: 0.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Button
        size="small"
        onClick={() => setView('month')}
        variant={view === 'month' ? 'contained' : 'text'}
        sx={{ textTransform: 'none', fontSize: '0.75rem', minWidth: 72 }}
      >
        Month
      </Button>
      <Button
        size="small"
        onClick={() => setView('timeline')}
        variant={view === 'timeline' ? 'contained' : 'text'}
        sx={{ textTransform: 'none', fontSize: '0.75rem', minWidth: 72 }}
      >
        Timeline
      </Button>
    </Box>
  );

  const renderSegmentDayWeek = () => (
    <Box
      sx={{
        display: 'flex',
        bgcolor: '#f1f5f9',
        p: 0.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Button
        size="small"
        onClick={() => setView('day')}
        variant={view === 'day' ? 'contained' : 'text'}
        sx={{ textTransform: 'none', fontSize: '0.75rem', minWidth: 64 }}
      >
        Day
      </Button>
      <Button
        size="small"
        onClick={() => setView('week')}
        variant={view === 'week' ? 'contained' : 'text'}
        sx={{ textTransform: 'none', fontSize: '0.75rem', minWidth: 64 }}
      >
        Week
      </Button>
    </Box>
  );

  const renderSegmentWeekMonth = () => (
    <Box
      sx={{
        display: 'flex',
        bgcolor: '#f1f5f9',
        p: 0.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Button
        size="small"
        onClick={() => setView('week')}
        variant={view === 'week' ? 'contained' : 'text'}
        sx={{ textTransform: 'none', fontSize: '0.75rem', minWidth: 72 }}
      >
        Week
      </Button>
      <Button
        size="small"
        onClick={() => setView('month')}
        variant={view === 'month' ? 'contained' : 'text'}
        sx={{ textTransform: 'none', fontSize: '0.75rem', minWidth: 72 }}
      >
        Month
      </Button>
    </Box>
  );

  const renderOperationalTopBar = (actions: React.ReactNode) => (
    <Grid item xs={12}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Operational schedule
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            Drag incoming jobs onto the grid timeline to assign dates and sync tracking triggers.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>{actions}</Box>
      </Paper>
    </Grid>
  );

  const renderMiniDarkEventCard = (ev: CalendarEvent, opts?: { compact?: boolean }) => (
    <Box
      onClick={(e) => {
        e.stopPropagation();
        handleEventClick(ev);
      }}
      onMouseEnter={(e) => handleEventMouseEnter(ev, e.currentTarget)}
      onMouseLeave={handleEventMouseLeave}
      sx={{
        bgcolor: '#0f172a',
        color: '#fff',
        borderRadius: 1,
        px: opts?.compact ? 0.75 : 1.25,
        py: opts?.compact ? 0.5 : 1,
        border: '1px solid',
        borderColor: '#1e293b',
        boxShadow: '0 4px 6px -1px rgba(15,23,42,0.35)',
        cursor: 'pointer',
        transition: 'transform 120ms ease',
        '&:hover': { transform: 'scale(1.01)' },
      }}
    >
      <Typography
        sx={{
          fontSize: opts?.compact ? '0.625rem' : '0.8rem',
          fontWeight: 700,
          lineHeight: 1.25,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: opts?.compact ? 'nowrap' : 'normal',
        }}
      >
        {ev.title}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 0.5,
          mt: 0.35,
          flexWrap: 'wrap',
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: '0.5rem',
            fontWeight: 700,
            px: 0.5,
            py: 0.125,
            borderRadius: 0.5,
            bgcolor: 'rgba(16, 185, 129, 0.18)',
            color: '#6ee7b7',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            lineHeight: 1.2,
          }}
        >
          {eventStatusLabel(ev.status)}
        </Box>
        <Typography
          component="span"
          sx={{ fontSize: '0.5rem', fontWeight: 600, color: '#94a3b8', flexShrink: 0 }}
        >
          {eventTypeShort(ev)}
        </Typography>
      </Box>
      {!opts?.compact && (
        <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', mt: 0.75 }}>
          {format(new Date(ev.startDate), 'h:mm a')} · {format(new Date(ev.endDate), 'h:mm a')}
        </Typography>
      )}
    </Box>
  );

  const renderWeekRunwaySidePanelContent = () => {
    const backlogItems = getBacklogItems();
    const selectedDayEvents = getEventsByDate(selectedDate);
    const rosterCount =
      selectedDayEvents.reduce((acc, e) => acc + (e.attendees?.length ?? 0), 0) || 4;
    const estHours = Math.round((12 + selectedDayEvents.length * 2.3) * 10) / 10;

    return (
      <WeekRunwaySidePanel
        backlogItems={backlogItems.map((task) => ({
          id: task.id,
          title: task.title,
          duration: task.duration,
          dept: task.dept,
          borderColor: task.borderColor,
          priority: task.sourceTask?.priority,
        }))}
        selectedDate={selectedDate}
        estHours={estHours}
        rosterCount={rosterCount}
        enableDrag={view === 'timeline'}
        onBacklogClick={(item) => {
          const match = backlogItems.find((b) => b.id === item.id);
          if (match) handleBacklogItemClick(match);
        }}
      />
    );
  };

  const renderOperationalRightColumn = () => (
    <Grid item xs={12} lg={3}>
      {renderWeekRunwaySidePanelContent()}
    </Grid>
  );

  const renderCalendarView = () => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const rangeStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const rangeEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const calendarDays = eachDayOfInterval({ start: rangeStart, end: rangeEnd });

    const stackUnit = 46;

    return (
      <Grid container spacing={3}>
        {renderOperationalTopBar(
          <>
            {renderSegmentMonthTimeline()}
            {renderNewOperationalBlockButton()}
          </>
        )}

        <Grid item xs={12} lg={9}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.08em' }}>
                {format(calendarMonth, 'MMMM yyyy')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75 }}>
                <IconButton
                  size="small"
                  onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                  aria-label="Previous month"
                >
                  <ChevronLeftLucide size={18} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                  aria-label="Next month"
                >
                  <ChevronRightLucide size={18} />
                </IconButton>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                textAlign: 'center',
                py: 1,
                bgcolor: 'rgba(248, 250, 252, 0.9)',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <Typography key={d} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  {d}
                </Typography>
              ))}
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '1px',
                bgcolor: '#e2e8f0',
              }}
            >
              {calendarDays.map((day) => {
                const inMonth = isSameMonth(day, calendarMonth);
                const dayEvents = getEventsByDate(day);
                const visible = dayEvents.slice(0, 2);
                const more = dayEvents.length - visible.length;
                const selected = isSameDay(day, selectedDate);

                return (
                  <Box
                    key={day.toISOString()}
                    onClick={() => {
                      setSelectedDate(day);
                      if (!isSameMonth(day, calendarMonth)) {
                        setCalendarMonth(startOfMonth(day));
                      }
                    }}
                    sx={{
                      position: 'relative',
                      minHeight: 128,
                      bgcolor: inMonth ? '#fff' : 'rgba(248, 250, 252, 0.55)',
                      p: 1,
                      cursor: inMonth ? 'pointer' : 'default',
                      transition: 'background-color 120ms ease',
                      outline: selected ? '2px solid #0f172a' : 'none',
                      outlineOffset: -2,
                      zIndex: selected ? 1 : 0,
                      ...(inMonth && isToday(day)
                        ? { bgcolor: 'rgba(59, 130, 246, 0.06)' }
                        : {}),
                      '&:hover':
                        inMonth && !selected ? { bgcolor: 'rgba(248, 250, 252, 0.95)' } : {},
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        fontWeight: 700,
                        color: inMonth ? (selected ? '#0f172a' : 'text.secondary') : 'action.disabled',
                        mb: 0.5,
                      }}
                    >
                      {inMonth ? format(day, 'd') : ''}
                    </Typography>

                    {inMonth && visible.length > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 6,
                          right: 6,
                          bottom: 6,
                          top: 26,
                          pointerEvents: 'none',
                        }}
                      >
                        {visible.map((ev, idx) => (
                          <Box
                            key={ev.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(ev);
                            }}
                            onMouseEnter={(e) => handleEventMouseEnter(ev, e.currentTarget)}
                            onMouseLeave={handleEventMouseLeave}
                            sx={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              bottom: 4 + idx * stackUnit,
                              pointerEvents: 'auto',
                              bgcolor: '#0f172a',
                              color: '#fff',
                              borderRadius: 1,
                              px: 0.75,
                              py: 0.5,
                              border: '1px solid',
                              borderColor: '#1e293b',
                              boxShadow: '0 4px 6px -1px rgba(15,23,42,0.35)',
                              cursor: 'pointer',
                              transition: 'transform 120ms ease',
                              '&:hover': { transform: 'scale(1.02)' },
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '0.625rem',
                                fontWeight: 700,
                                lineHeight: 1.25,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {ev.title}
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 0.5,
                                mt: 0.25,
                              }}
                            >
                              <Box
                                component="span"
                                sx={{
                                  fontSize: '0.5rem',
                                  fontWeight: 700,
                                  px: 0.5,
                                  py: 0.125,
                                  borderRadius: 0.5,
                                  bgcolor: 'rgba(16, 185, 129, 0.18)',
                                  color: '#6ee7b7',
                                  border: '1px solid rgba(16, 185, 129, 0.35)',
                                  lineHeight: 1.2,
                                }}
                              >
                                {eventStatusLabel(ev.status)}
                              </Box>
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: '0.5rem',
                                  fontWeight: 600,
                                  color: '#94a3b8',
                                  flexShrink: 0,
                                }}
                              >
                                {eventTypeShort(ev)}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                        {more > 0 && (
                          <Typography
                            variant="caption"
                            sx={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              bottom: 4 + visible.length * stackUnit,
                              textAlign: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              color: 'text.secondary',
                              bgcolor: 'rgba(241, 245, 249, 0.95)',
                              borderRadius: 0.5,
                              py: 0.25,
                              pointerEvents: 'none',
                            }}
                          >
                            +{more} more
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {renderOperationalRightColumn()}
      </Grid>
    );
  };

  const renderDayView = () => {
    const dayBlocks = getEventsByDate(selectedDate);

    return (
      <Grid container spacing={3}>
        {renderOperationalTopBar(
          <>
            {renderSegmentDayWeek()}
            <IconButton
              size="small"
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
              aria-label="Previous day"
            >
              <ChevronLeftLucide size={18} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
              aria-label="Next day"
            >
              <ChevronRightLucide size={18} />
            </IconButton>
            <Button size="small" variant="outlined" onClick={() => setSelectedDate(new Date())} sx={{ textTransform: 'none', fontWeight: 600 }}>
              Today
            </Button>
            {renderNewOperationalBlockButton()}
          </>
        )}

        <Grid item xs={12} lg={9}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.08em' }}>
                Day runway
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </Typography>
            </Box>
            <Stack spacing={1.25} sx={{ p: 2 }}>
              {dayBlocks.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No operational blocks on this date. Create one or switch days.
                </Typography>
              ) : (
                dayBlocks.map((ev) => (
                  <Box key={ev.id}>{renderMiniDarkEventCard(ev)}</Box>
                ))
              )}
            </Stack>
          </Paper>
        </Grid>

        {renderOperationalRightColumn()}
      </Grid>
    );
  };

  const renderWeekView = () => {
    const weekStart = weekAnchor;
    const weekEnd = endOfWeek(weekAnchor, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <Grid container spacing={3}>
        {renderOperationalTopBar(
          <>
            {renderSegmentWeekMonth()}
            <IconButton
              size="small"
              onClick={() => setWeekAnchor(addDays(weekAnchor, -7))}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
              aria-label="Previous week"
            >
              <ChevronLeftLucide size={18} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setWeekAnchor(addDays(weekAnchor, 7))}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
              aria-label="Next week"
            >
              <ChevronRightLucide size={18} />
            </IconButton>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', px: 0.5 }}>
              {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
            </Typography>
            {renderNewOperationalBlockButton()}
          </>
        )}

        <Grid item xs={12} lg={9}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(7, minmax(0, 1fr))' },
                gap: '1px',
                bgcolor: '#e2e8f0',
                minHeight: { sm: 320 },
              }}
            >
              {days.map((day) => {
                const colEvents = getEventsByDate(day);
                const sel = isSameDay(day, selectedDate);
                return (
                  <Box
                    key={day.toISOString()}
                    sx={{
                      bgcolor: '#fff',
                      p: 1.25,
                      minHeight: { xs: 'auto', sm: 300 },
                      outline: sel ? '2px solid #0f172a' : 'none',
                      outlineOffset: -2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      onClick={() => {
                        setSelectedDate(day);
                        setWeekAnchor(startOfWeek(day, { weekStartsOn: 0 }));
                      }}
                      sx={{
                        fontWeight: 700,
                        color: isToday(day) ? 'primary.main' : '#334155',
                        cursor: 'pointer',
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {format(day, 'EEE d')}
                    </Typography>
                    <Stack spacing={1}>
                      {colEvents.map((ev) => (
                        <Box key={ev.id}>{renderMiniDarkEventCard(ev, { compact: true })}</Box>
                      ))}
                    </Stack>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {renderOperationalRightColumn()}
      </Grid>
    );
  };

  const renderTimelineView = () => {
    const items = getMergedTimelineEvents();
    const backlogItems = getBacklogItems();

    return (
      <OperationalTimelineView
        events={items.map(toTimelineCard)}
        backlogItems={backlogItems.map((b) => ({
          id: b.id,
          title: b.title,
          duration: b.duration,
          dept: b.dept,
          borderColor: b.borderColor,
        }))}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onEventClick={(ev) => {
          const full = items.find((e) => e.id === ev.id);
          if (full) handleEventClick(full);
        }}
        onBacklogClick={(b) => {
          const match = backlogItems.find((x) => x.id === b.id);
          if (match) handleBacklogItemClick(match);
        }}
        onBacklogDrop={(b, day) => {
          const match = backlogItems.find((x) => x.id === b.id);
          if (match) openAssignScheduleForBacklog(match, day);
        }}
        rightColumn={renderWeekRunwaySidePanelContent()}
        topBarExtras={
          <>
            {renderSegmentMonthTimeline()}
            {renderNewOperationalBlockButton()}
          </>
        }
      />
    );
  };

  return (
    <DashboardLayout>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2196f3 0%, #e91e63 100%)',
            pt: 6,
            pb: 4,
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ color: 'white', mb: 3 }}>
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                Calendar
              </Typography>
              <Typography 
                variant="h5"
                sx={{ 
                  fontWeight: 400,
                  opacity: 0.9,
                }}
              >
                Manage your schedule with advanced tracking and collaboration tools
              </Typography>
            </Box>
          </Container>
        </Box>

        <Container
          maxWidth="xl"
          sx={{ mt: -4, pb: 6, minHeight: '100vh', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}
        >
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 2, sm: 3 },
              borderRadius: 4,
              bgcolor: 'background.paper',
              mb: 3,
              boxShadow: 2,
              minHeight: 'auto',
              height: 'auto',
              overflow: view === 'timeline' ? 'hidden' : 'visible',
              maxWidth: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Tabs 
                  value={view} 
                  onChange={(e, newValue) => setView(newValue)}
                  sx={{
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      minHeight: 48,
                      fontSize: '1rem',
                    }
                  }}
                >
                  <Tab 
                    icon={<ViewDay />} 
                    label="Day" 
                    value="day"
                  />
                  <Tab 
                    icon={<ViewWeek />} 
                    label="Week" 
                    value="week"
                  />
                  <Tab 
                    icon={<ViewModule />} 
                    label="Month" 
                    value="month"
                  />
                  <Tab 
                    icon={<CalendarViewDay />} 
                    label="Ops timeline" 
                    value="timeline"
                  />
                </Tabs>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => openNewEventDialog()}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  fontWeight: 500,
                }}
              >
                New Event
              </Button>
            </Box>

            {view === 'month' ? (
              renderCalendarView()
            ) : view === 'day' ? (
              renderDayView()
            ) : view === 'week' ? (
              renderWeekView()
            ) : (
              renderTimelineView()
            )}
          </Paper>
        </Container>

        {/* New operational block */}
            <Dialog
              open={newEventDialogOpen}
              onClose={() => setNewEventDialogOpen(false)}
              maxWidth="sm"
              fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
              <Box
                sx={{
                  height: 40,
                  width: 40,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <CalendarLucideIcon size={20} strokeWidth={2} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.25,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {newBlockDialogCopy.heading}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(191, 219, 254, 0.95)', mt: 0.25, fontWeight: 500 }}>
                  {newBlockDialogCopy.subtitle}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
              <DialogContent>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography sx={popupFormLabelSx}>Block Title *</Typography>
                    <TextField
                      hiddenLabel
                      required
                      placeholder="e.g., Bulk T-Shirt Print Run / Setup Signage"
                      value={newEvent.title || ''}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      fullWidth
                    />
                  </Box>
                  <Box>
                    <Typography sx={popupFormLabelSx}>Description</Typography>
                    <TextField
                      hiddenLabel
                      placeholder="Provide operational details or meeting agenda items..."
                      value={newEvent.description || ''}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      multiline
                      rows={3}
                      fullWidth
                    />
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                      gap: 2,
                      width: '100%',
                    }}
                  >
                    <Box>
                      <Typography sx={popupFormLabelSx}>Start Date &amp; Time</Typography>
                      <TextField
                        hiddenLabel
                        type="datetime-local"
                        value={newEvent.startDate || ''}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                        fullWidth
                      />
                    </Box>
                    <Box>
                      <Typography sx={popupFormLabelSx}>End Date &amp; Time</Typography>
                      <TextField
                        hiddenLabel
                        type="datetime-local"
                        value={newEvent.endDate || ''}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                        fullWidth
                      />
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                      gap: 2,
                      width: '100%',
                    }}
                  >
                    <Box>
                      <Typography sx={popupFormLabelSx}>Block Context Type</Typography>
                      <FormControl fullWidth>
                        <Select
                          displayEmpty
                          value={newEvent.type || 'meeting'}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as CalendarEvent['type'] }))}
                        >
                          <MenuItem value="meeting">Meeting / Sync</MenuItem>
                          <MenuItem value="task">Task Allocation</MenuItem>
                          <MenuItem value="production">Production Run</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box>
                      <Typography sx={popupFormLabelSx}>Priority Level</Typography>
                      <FormControl fullWidth>
                        <Select
                          value={newEvent.priority || 'medium'}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                        >
                          <MenuItem value="low">Low Priority</MenuItem>
                          <MenuItem value="medium">Medium Priority</MenuItem>
                          <MenuItem value="high">High Priority</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>

              {newEvent.type === 'meeting' && (
                <Box sx={popupNestedPanelSx}>
                  <Typography
                    sx={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: '#94a3b8',
                      display: 'block',
                      mb: 2,
                    }}
                  >
                    Meeting specifics
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography sx={popupFormLabelSx}>Presence</Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 1,
                        bgcolor: 'rgba(226, 232, 240, 0.5)',
                        p: 0.5,
                        borderRadius: roundedLg,
                      }}
                    >
                      {(['In-Person', 'Virtual'] as const).map((mode) => {
                        const isVirtualMode = mode === 'Virtual';
                        const selected = Boolean(newEvent.isVirtual) === isVirtualMode;
                        return (
                          <Button
                            key={mode}
                            type="button"
                            disableElevation
                            onClick={() =>
                              setNewEvent((prev) => ({ ...prev, isVirtual: isVirtualMode }))
                            }
                            sx={{
                              py: 0.75,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              borderRadius: 1.5,
                              textTransform: 'none',
                              minWidth: 0,
                              ...(selected
                                ? {
                                    bgcolor: '#fff',
                                    color: '#0f172a',
                                    boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
                                    '&:hover': { bgcolor: '#fff' },
                                  }
                                : {
                                    color: '#64748b',
                                    bgcolor: 'transparent',
                                    '&:hover': { bgcolor: 'transparent', color: '#0f172a' },
                                  }),
                            }}
                          >
                            {mode}
                          </Button>
                        );
                      })}
                    </Box>
                    </Box>

                    <Box>
                      <Typography sx={popupFormLabelSx}>
                        {newEvent.isVirtual ? 'Meeting link' : 'Location'}
                      </Typography>
                    <TextField
                      hiddenLabel
                      placeholder={
                        newEvent.isVirtual
                          ? 'Paste Meet, Teams, or Zoom link'
                          : 'Enter boardroom or facility location'
                      }
                      value={
                        newEvent.isVirtual
                          ? newEvent.meetingLink || ''
                          : newEvent.location || ''
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        setNewEvent((prev) =>
                          prev.isVirtual
                            ? { ...prev, meetingLink: v }
                            : { ...prev, location: v }
                        );
                      }}
                      fullWidth
                      sx={meetingPanelFieldSx}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ ml: 0.5 }}>
                            <MapPin size={16} color="#94a3b8" strokeWidth={2} />
                          </InputAdornment>
                        ),
                      }}
                    />
                    </Box>

                    <Box>
                      <Typography sx={popupFormLabelSx}>Attendees</Typography>
                    <TextField
                      hiddenLabel
                      placeholder="Invite team members by name or email..."
                      fullWidth
                      value={(newEvent.attendees ?? []).map((a) => a.name).join(', ')}
                      sx={meetingPanelFieldSx}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ ml: 0.5 }}>
                            <Users size={16} color="#94a3b8" strokeWidth={2} />
                          </InputAdornment>
                        ),
                      }}
                      onChange={(e) => {
                        const attendees = e.target.value
                          .split(',')
                          .map((email) => ({
                            name: email.trim(),
                            avatar: email.trim().charAt(0).toUpperCase(),
                          }))
                          .filter((a) => a.name.length > 0);
                        setNewEvent((prev) => ({ ...prev, attendees }));
                      }}
                    />
                    </Box>
                  </Stack>
                </Box>
              )}
                </Stack>
              </DialogContent>
          <DialogActions>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
              <Button onClick={() => setNewEventDialogOpen(false)} variant="text">
                Cancel
              </Button>
              <Button
                variant="contained"
                className="popup-submit-dark"
                disableElevation
                onClick={handleNewEvent}
                disabled={!newEvent.title || !newEvent.startDate}
              >
                Create Block
              </Button>
            </Box>
          </DialogActions>
            </Dialog>

            {/* Event Details Dialog */}
            <Dialog
              open={eventDialogOpen}
              onClose={() => {
                setEventDialogOpen(false);
                setSelectedEvent(null);
              }}
              maxWidth="sm"
              fullWidth
            >
              {selectedEvent && (
                <>
                  <DialogTitle sx={{ pb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" sx={{ opacity: 0.88, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', mb: 0.75 }}>
                          Block detail
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                          {selectedEvent.title}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={eventTypeChipLabel(selectedEvent.type)}
                        sx={{
                          borderRadius: 1,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          bgcolor: 'rgba(255,255,255,0.2)',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.35)',
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />
                    </Box>
                  </DialogTitle>
                  <DialogContent>
                    <Stack spacing={2.5}>
                  <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.65 }}>
                        {selectedEvent.description || 'No description provided.'}
                      </Typography>
                      <Divider sx={{ borderColor: '#e2e8f0' }} />
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: '#fff',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 2px rgba(15,23,42,0.05)',
                        }}
                      >
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748b', display: 'block', mb: 1 }}>
                          Schedule
                        </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                          {format(new Date(selectedEvent.startDate), 'MMM d, yyyy · h:mm a')} —{' '}
                          {format(new Date(selectedEvent.endDate), 'h:mm a')}
                        </Typography>
                      </Box>
                  {selectedEvent.type === 'meeting' && (
                    <>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: '#fff',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748b', display: 'block', mb: 1 }}>
                          Location
                            </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 20, color: '#64748b' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>
                            {selectedEvent.isVirtual ? 'Virtual Meeting' : selectedEvent.location || '—'}
                            </Typography>
                          </Box>
                        {selectedEvent.isVirtual && selectedEvent.meetingLink && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<VideoCall />}
                            href={selectedEvent.meetingLink}
                            target="_blank"
                            sx={{ mt: 2, py: 1 }}
                          >
                            Join Meeting
                          </Button>
                          )}
                        </Box>
                      {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748b', display: 'block', mb: 1 }}>
                            Attendees
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {selectedEvent.attendees.map(attendee => (
                              <Chip
                                key={attendee.name}
                                size="small"
                                avatar={renderPersonAvatar(attendee, { bgcolor: 'primary.main', width: 28, height: 28 })}
                                label={attendee.name}
                                sx={{ borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#fff', fontWeight: 500 }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                  {isTaskLike(selectedEvent.type) && (
                    <>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fff', border: '1px solid #e2e8f0' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748b' }}>
                            Progress
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {selectedEvent.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={selectedEvent.progress}
                          sx={{ 
                            height: 8, 
                            borderRadius: 99,
                            bgcolor: '#e2e8f0',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 99,
                              background: 'linear-gradient(90deg, #2196f3, #e91e63)',
                            },
                          }}
                        />
                      </Box>
                      {selectedEvent.assignedByName && (
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748b', display: 'block', mb: 1 }}>
                            Assigned by
                          </Typography>
                          <Chip
                            label={selectedEvent.assignedByName}
                            size="small"
                            sx={{ borderRadius: 2, fontWeight: 600 }}
                          />
                        </Box>
                      )}
                      {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748b', display: 'block', mb: 1 }}>
                            Assigned To
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              avatar={renderPersonAvatar(selectedEvent.attendees[0], { bgcolor: 'secondary.main' })}
                              label={selectedEvent.attendees[0].name}
                              sx={{ borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#fff', fontWeight: 500 }}
                            />
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                    </Stack>
                  </DialogContent>
              <DialogActions>
                    <Button 
                      onClick={() => {
                        setEventDialogOpen(false);
                        setSelectedEvent(null);
                      }}
                  variant="outlined"
                    >
                      Close
                    </Button>
                    {isTaskLike(selectedEvent.type) && (
                      <Button
                        variant="contained"
                        className={
                          selectedEvent.status === 'completed' || selectedEvent.status === 'pending_review'
                            ? 'popup-submit-dark'
                            : undefined
                        }
                        onClick={() => {
                          if (
                            selectedEvent.status === 'completed' ||
                            selectedEvent.status === 'pending_review'
                          ) {
                            handleStatusChange(selectedEvent, 'todo');
                            setEventDialogOpen(false);
                            setSelectedEvent(null);
                          } else {
                            handleSubmitForReview(selectedEvent);
                          }
                        }}
                      >
                        {selectedEvent.status === 'completed' || selectedEvent.status === 'pending_review'
                          ? 'Reopen task'
                          : 'Mark complete & send for review'}
                      </Button>
                    )}
                {selectedEvent.type === 'meeting' && (
                  <Button
                    variant="contained"
                    startIcon={<VideoCall />}
                    onClick={() => {
                      if (selectedEvent.meetingLink) {
                        window.open(selectedEvent.meetingLink, '_blank');
                      }
                    }}
                  >
                    Join Meeting
                      </Button>
                    )}
                  </DialogActions>
                </>
              )}
            </Dialog>

        {/* Time Block Dialog */}
        <Dialog
          open={showTimeBlockDialog}
          onClose={() => setShowTimeBlockDialog(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1.05rem' }}>
              Time block
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 0.5 }}>
              Quick placeholder — wire to scheduling when ready
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Block title" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }} />
              <TextField label="Duration" select fullWidth defaultValue="1h" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}>
                <MenuItem value="30m">30 minutes</MenuItem>
                <MenuItem value="1h">1 hour</MenuItem>
                <MenuItem value="2h">2 hours</MenuItem>
                <MenuItem value="4h">4 hours</MenuItem>
              </TextField>
              <TextField label="Color" select fullWidth defaultValue="#2196F3" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}>
                <MenuItem value="#4CAF50">Green</MenuItem>
                <MenuItem value="#2196F3">Blue</MenuItem>
                <MenuItem value="#FF9800">Orange</MenuItem>
                <MenuItem value="#F44336">Red</MenuItem>
              </TextField>
              <FormControlLabel
                control={<Switch size="small" />}
                label={<Typography variant="body2" sx={{ color: '#475569' }}>Recurring</Typography>}
              />
          </Box>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setShowTimeBlockDialog(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={() => setShowTimeBlockDialog(false)}>
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Event hover preview — Popper avoids Modal scroll-lock (page jumping to top) */}
        <Popper
          open={Boolean(hoverEvent && hoverAnchorEl)}
          anchorEl={hoverAnchorEl}
          placement="bottom"
          modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
          sx={{
            zIndex: (theme) => theme.zIndex.tooltip,
            pointerEvents: 'none',
          }}
        >
          {hoverEvent && (
            <PopupHoverCard>
              <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.35 }}>
                  {hoverEvent.title}
                </Typography>
                <Chip
                  size="small"
                  label={eventTypeChipLabel(hoverEvent.type)}
                  sx={{
                    borderRadius: 1,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    height: 22,
                    bgcolor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.25, lineHeight: 1.5 }}>
                {hoverEvent.description || 'No description'}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1,
                  py: 1,
                  px: 1.25,
                  borderRadius: 1.5,
                  bgcolor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                }}
              >
                <AccessTime sx={{ fontSize: 18, color: '#64748b' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155' }}>
                  {format(new Date(hoverEvent.startDate), 'h:mm a')} — {format(new Date(hoverEvent.endDate), 'h:mm a')}
                </Typography>
              </Box>
              {hoverEvent.type === 'meeting' && hoverEvent.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationOn sx={{ fontSize: 18, color: '#64748b' }} />
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500 }}>
                    {hoverEvent.isVirtual ? 'Virtual Meeting' : hoverEvent.location}
                  </Typography>
                </Box>
              )}
              {isTaskLike(hoverEvent.type) && hoverEvent.progress !== undefined && (
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                      Progress
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {hoverEvent.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={hoverEvent.progress}
                    sx={{ 
                      height: 6, 
                      borderRadius: 99,
                      bgcolor: '#e2e8f0',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 99,
                        background: 'linear-gradient(90deg, #2196f3, #e91e63)',
                      },
                    }}
                  />
                </Box>
              )}
              {hoverEvent.type === 'meeting' && hoverEvent.attendees && hoverEvent.attendees.length > 0 && (
                <Box sx={{ mt: 1.25, pt: 1.25, borderTop: '1px solid #f1f5f9' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', display: 'block', mb: 0.75 }}>
                    Attendees ({hoverEvent.attendees.length})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {hoverEvent.attendees.slice(0, 3).map(attendee => (
                      <Chip
                        key={attendee.name}
                        size="small"
                        avatar={renderPersonAvatar(attendee, { bgcolor: '#334155', width: 18, height: 18, fontSize: '0.55rem' })}
                        label={attendee.name}
                        sx={{ 
                          borderRadius: 1.5, 
                          fontSize: '0.65rem',
                          height: 24,
                          border: '1px solid #e2e8f0',
                          bgcolor: '#fff',
                          '& .MuiChip-avatar': {
                            width: 18,
                            height: 18,
                          },
                        }}
                      />
                    ))}
                    {hoverEvent.attendees.length > 3 && (
                      <Typography variant="caption" sx={{ alignSelf: 'center', color: '#64748b', fontWeight: 600 }}>
                        +{hoverEvent.attendees.length - 3}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              </Box>
            </PopupHoverCard>
          )}
        </Popper>

        <AssignScheduleDialog
          open={assignScheduleOpen}
          taskTitle={pendingSchedule?.item.title ?? 'Task'}
          scheduleDay={pendingSchedule?.day ?? selectedDate}
          employees={employees}
          projectOptions={projectNameOptions}
          defaultProject={pendingSchedule?.item.dept}
          onClose={() => {
            setAssignScheduleOpen(false);
            setPendingSchedule(null);
          }}
          onConfirm={completeBacklogSchedule}
        />
    </DashboardLayout>
  );
};

export default Calendar;
