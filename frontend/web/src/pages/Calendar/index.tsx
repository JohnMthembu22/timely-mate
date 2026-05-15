import React, { useState, useEffect } from 'react';
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
  InputLabel,
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
  Popover,
} from '@mui/material';
import {
  Add,
  Event,
  VideoCall,
  Today,
  ViewKanban,
  CalendarMonth,
  ArrowBack,
  ArrowForward,
  QrCodeScanner,
  ViewInAr,
  Timer,
  DragIndicator,
  ChevronLeft,
  ChevronRight,
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
  Videocam as VideocamIcon,
} from '@mui/icons-material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { format, addMonths, subMonths, isSameDay, addDays } from 'date-fns';
import DashboardLayout from '../../components/DashboardLayout';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { useEmployees } from '../../contexts/EmployeeContext';

interface TeamMember {
  name: string;
  avatar: string;
  role: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: TeamMember | null;
  status: 'todo' | 'in_progress' | 'completed';
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  isProjectTask: boolean;
  projectId?: string;
  createdAt: string;
  progress: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'meeting' | 'task';
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  projectId?: string;
  attendees?: { name: string; avatar: string }[];
  progress?: number;
  location?: string;
  isVirtual?: boolean;
  meetingLink?: string;
}

const Calendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState(0);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newEventDialogOpen, setNewEventDialogOpen] = useState(false);
  const { employees } = useEmployees();
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    type: 'meeting',
    priority: 'medium',
    status: 'todo',
    isVirtual: false,
  });

  // Generate mock tasks from employees data
  useEffect(() => {
    if (employees.length > 0) {
      const mockTasks: Task[] = [];
      const departments = [...new Set(employees.map(emp => emp.department))];
      
      departments.forEach((dept, deptIndex) => {
        const deptEmployees = employees.filter(emp => emp.department === dept);
        
        // Create team members from employees
        const team: TeamMember[] = deptEmployees.map(emp => ({
          name: emp.name,
          avatar: emp.avatar || `https://i.pravatar.cc/150?u=${emp.id}`,
          role: emp.position,
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
          const statuses: ('todo' | 'in_progress' | 'completed')[] = ['todo', 'in_progress', 'completed'];
          const status = statuses[taskIndex % 3];
          const assignee = team[taskIndex % team.length] || null;
          
          const task: Task = {
            id: `${deptIndex}-${taskIndex}`,
            title: `${template.title} - ${dept}`,
            description: template.description,
            assignee,
            status,
            dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            priority: template.priority,
            isProjectTask: true,
            projectId: deptIndex.toString(),
            createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
            progress: status === 'completed' ? 100 : status === 'in_progress' ? Math.floor(Math.random() * 80) + 20 : 0,
          };
          
          mockTasks.push(task);
        });
      });

      setTasks(mockTasks);
    }
  }, [employees]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [view, setView] = useState('month');
  const [showSmartScheduling, setShowSmartScheduling] = useState(false);
  const [showTimeBlockDialog, setShowTimeBlockDialog] = useState(false);
  
  // Hover popup state
  const [hoverEvent, setHoverEvent] = useState<CalendarEvent | null>(null);
  const [hoverAnchorEl, setHoverAnchorEl] = useState<HTMLElement | null>(null);

  const features = [
    {
      icon: <QrCodeScanner sx={{ fontSize: 40, color: '#2196f3' }} />,
      title: 'Smart Event Tracking',
      description: 'Scan color-coded event tags to start tasks automatically',
    },
    {
      icon: <ViewInAr sx={{ fontSize: 40, color: '#2196f3' }} />,
      title: 'AR Event Preview',
      description: 'View event details and timelines in augmented reality',
    },
    {
      icon: <Timer sx={{ fontSize: 40, color: '#2196f3' }} />,
      title: 'Time Management',
      description: 'Track time with countdown timers and instant device syncing',
    },
    {
      icon: <DragIndicator sx={{ fontSize: 40, color: '#2196f3' }} />,
      title: 'Task Assignment',
      description: 'Drag-and-drop task management with smart AI suggestions',
    },
  ];

  const handleNewEvent = () => {
    if (!newEvent.title || !newEvent.startDate) return;

    setEvents(prev => [...prev, {
      id: (prev.length + 1).toString(),
      title: newEvent.title!,
      description: newEvent.description || '',
      startDate: newEvent.startDate!,
      endDate: newEvent.endDate || newEvent.startDate!,
      type: newEvent.type as 'meeting' | 'task',
      priority: newEvent.priority as 'low' | 'medium' | 'high',
      status: newEvent.status as 'todo' | 'in_progress' | 'completed',
      progress: newEvent.type === 'task' ? 0 : undefined,
      projectId: newEvent.projectId,
      attendees: newEvent.type === 'meeting' ? [] : undefined,
      location: newEvent.location,
      isVirtual: newEvent.isVirtual,
      meetingLink: newEvent.meetingLink,
    }]);
    setNewEventDialogOpen(false);
    setNewEvent({
      type: 'meeting',
      priority: 'medium',
      status: 'todo',
      isVirtual: false,
    });
  };

  const getEventsByDate = (date: Date) => {
    return events.filter(event => 
      format(new Date(event.startDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const getEventsByStatus = (status: 'todo' | 'in_progress' | 'completed') => {
    const eventsByStatus = events.filter(event => event.status === status);
    const tasksByStatus = tasks.filter(task => task.status === status);
    
    // Convert tasks to calendar events for display
    const taskEvents: CalendarEvent[] = tasksByStatus.map(task => ({
      id: `task-${task.id}`,
      title: task.title,
      description: task.description,
      startDate: task.dueDate,
      endDate: task.dueDate,
      type: 'task' as const,
      priority: task.priority,
      status: task.status,
      projectId: task.projectId,
      attendees: task.assignee ? [{ name: task.assignee.name, avatar: task.assignee.avatar }] : undefined,
      progress: task.progress,
    }));
    
    return [...eventsByStatus, ...taskEvents];
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

  const handleStatusChange = (event: CalendarEvent, newStatus: 'todo' | 'in_progress' | 'completed') => {
    setEvents(prev => prev.map(e => {
      if (e.id === event.id) {
        return {
          ...e,
          status: newStatus,
          progress: newStatus === 'completed' ? 100 : e.progress,
        };
      }
      return e;
    }));
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

  const CustomDay = (props: PickersDayProps<Date> & { hasEvents?: boolean }) => {
    const { hasEvents, day, ...other } = props;
    const dayEvents = getEventsByDate(day);
    
    return (
      <Box sx={{ position: 'relative', height: '100%', minHeight: 80 }}>
        <PickersDay {...other} day={day} />
        
        {/* Events for this day */}
        <Box sx={{ 
          position: 'absolute', 
          top: 45, 
          left: 0, 
          right: 0, 
          bottom: 0,
          px: 0.5,
          py: 0.5,
        }}>
          {dayEvents.slice(0, 3).map((event, index) => (
            <Box
              key={event.id}
              sx={{
                bgcolor: event.type === 'meeting' ? 'primary.main' : 'secondary.main',
                color: 'white',
                fontSize: '0.7rem',
                px: 0.5,
                py: 0.25,
                mb: 0.25,
                borderRadius: 1,
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: 500,
                '&:hover': {
                  bgcolor: event.type === 'meeting' ? 'primary.dark' : 'secondary.dark',
                  transform: 'scale(1.02)',
                  transition: 'all 0.2s ease',
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleEventClick(event);
              }}
              onMouseEnter={(e) => handleEventMouseEnter(event, e.currentTarget)}
              onMouseLeave={handleEventMouseLeave}
            >
              {event.title}
            </Box>
          ))}
          {dayEvents.length > 3 && (
            <Box
              sx={{
                bgcolor: 'text.secondary',
                color: 'white',
                fontSize: '0.7rem',
                px: 0.5,
                py: 0.25,
                borderRadius: 1,
                textAlign: 'center',
                fontWeight: 500,
              }}
            >
              +{dayEvents.length - 3} more
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const renderCalendarView = () => (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        px: 2,
        py: 1,
        bgcolor: 'background.default',
        borderRadius: 3,
      }}>
        <IconButton 
          onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
          sx={{ 
            bgcolor: 'action.hover',
            '&:hover': { bgcolor: 'action.selected' },
            width: 40,
            height: 40,
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight="medium" color="text.primary">
          {format(selectedDate, 'MMMM yyyy')}
        </Typography>
        <IconButton 
          onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
          sx={{ 
            bgcolor: 'action.hover',
            '&:hover': { bgcolor: 'action.selected' },
            width: 40,
            height: 40,
          }}
        >
          <ArrowForward />
        </IconButton>
      </Box>
      <Box sx={{ px: 2 }}>
        {/* Temporary simple calendar grid for testing */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: 1,
          p: 2,
          minHeight: '600px',
          bgcolor: 'background.paper',
          borderRadius: 2,
        }}>
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Box key={day} sx={{ 
              p: 2, 
              textAlign: 'center', 
              fontWeight: 'bold',
              bgcolor: 'grey.100',
              borderRadius: 1,
            }}>
              {day}
            </Box>
          ))}
          
          {/* Calendar days */}
          {Array.from({ length: 35 }, (_, i) => {
            const dayNumber = i + 1;
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            const dayEvents = getEventsByDate(new Date(currentYear, currentMonth, dayNumber));
            return (
              <Box key={i} sx={{ 
                p: 1, 
                minHeight: 80,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                position: 'relative',
                bgcolor: 'background.paper',
              }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {dayNumber}
                </Typography>
                {dayEvents.slice(0, 3).map((event, index) => (
                  <Box
                    key={event.id}
                    sx={{
                      bgcolor: event.type === 'meeting' ? 'primary.main' : 'secondary.main',
                      color: 'white',
                      fontSize: '0.7rem',
                      px: 0.5,
                      py: 0.25,
                      mb: 0.25,
                      borderRadius: 1,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: event.type === 'meeting' ? 'primary.dark' : 'secondary.dark',
                        transform: 'scale(1.02)',
                        transition: 'all 0.2s ease',
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                    onMouseEnter={(e) => handleEventMouseEnter(event, e.currentTarget)}
                    onMouseLeave={handleEventMouseLeave}
                  >
                    {event.title}
                  </Box>
                ))}
                {dayEvents.length > 3 && (
                  <Box
                    sx={{
                      bgcolor: 'text.secondary',
                      color: 'white',
                      fontSize: '0.7rem',
                      px: 0.5,
                      py: 0.25,
                      borderRadius: 1,
                      textAlign: 'center',
                      fontWeight: 500,
                    }}
                  >
                    +{dayEvents.length - 3} more
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            px: 2,
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          Events for {format(selectedDate, 'MMMM d, yyyy')}
        </Typography>
        <Stack spacing={2} sx={{ px: 2 }}>
          {getEventsByDate(selectedDate).map(event => (
            <Card 
              key={event.id}
              sx={{ 
                cursor: 'pointer',
                borderRadius: 3,
                boxShadow: 1,
                '&:hover': { 
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                },
                border: '1px solid',
                borderColor: 'divider',
              }}
              onClick={() => handleEventClick(event)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight="medium">{event.title}</Typography>
                  <Chip
                    size="small"
                    label={event.type}
                    color={event.type === 'meeting' ? 'primary' : 'secondary'}
                    sx={{ 
                      borderRadius: 2,
                      fontWeight: 500,
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {event.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Event sx={{ fontSize: 20 }} />
                    {format(new Date(event.startDate), 'h:mm a')} - 
                    {format(new Date(event.endDate), 'h:mm a')}
                  </Typography>
                  {event.type === 'task' && event.progress !== undefined && (
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={event.progress}
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Progress: {event.progress}%
                      </Typography>
                    </Box>
                  )}
                  {event.type === 'meeting' && event.attendees && (
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      {event.attendees.map(attendee => (
                        <Chip
                          key={attendee.name}
                          size="small"
                          avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>{attendee.avatar}</Avatar>}
                          label={attendee.name}
                          sx={{ 
                            borderRadius: 2,
                            bgcolor: 'action.hover',
                            color: 'text.primary',
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  );

  const renderKanbanView = () => (
    <Grid container spacing={3}>
      {(['todo', 'in_progress', 'completed'] as const).map(status => (
        <Grid item xs={12} md={4} key={status}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%',
              borderRadius: 4,
              bgcolor: status === 'todo' ? 'grey.50' :
                      status === 'in_progress' ? 'primary.50' :
                      'success.50',
            }}
          >
            <Typography variant="h6" fontWeight="medium" sx={{ mb: 3 }}>
              {status === 'todo' ? 'To Do' :
               status === 'in_progress' ? 'In Progress' :
               'Completed'}
              <Typography 
                component="span" 
                variant="body2" 
                color="text.secondary" 
                sx={{ ml: 1 }}
              >
                ({getEventsByStatus(status).length})
              </Typography>
            </Typography>
            <Stack spacing={2}>
              {getEventsByStatus(status).map(event => (
                <Card 
                  key={event.id}
                  sx={{ 
                    cursor: 'pointer',
                    borderRadius: 3,
                    boxShadow: 1,
                    '&:hover': { 
                      boxShadow: 6,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out',
                    },
                  }}
                  onClick={() => handleEventClick(event)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight="medium">{event.title}</Typography>
                      <Chip
                        size="small"
                        label={event.type}
                        color={event.type === 'meeting' ? 'primary' : 'secondary'}
                        sx={{ borderRadius: 2 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {format(new Date(event.startDate), 'MMM d, h:mm a')}
                    </Typography>
                    {event.type === 'task' && event.progress !== undefined && (
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={event.progress}
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: 'action.hover',
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Progress: {event.progress}%
                        </Typography>
                      </Box>
                    )}
                    {event.type === 'meeting' && event.attendees && (
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        {event.attendees.map(attendee => (
                          <Chip
                            key={attendee.name}
                            size="small"
                            avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>{attendee.avatar}</Avatar>}
                            label={attendee.name}
                            sx={{ borderRadius: 2 }}
                          />
                        ))}
                      </Box>
                    )}
                    {event.type === 'task' && event.attendees && (
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Chip
                          size="small"
                          avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}>{event.attendees[0].avatar}</Avatar>}
                          label={`Assigned to: ${event.attendees[0].name}`}
                          sx={{ borderRadius: 2 }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <DashboardLayout>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2196f3 0%, #e91e63 100%)',
            pt: 6,
            pb: 4,
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ color: 'white', mb: 6 }}>
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

            <Grid container spacing={3} sx={{ mb: 4 }}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 4,
                      boxShadow: 2,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2} alignItems="center" textAlign="center">
                        <Box sx={{ transform: 'scale(1.2)', mb: 1 }}>
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" fontWeight="medium">
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{ mt: -4, pb: 6, minHeight: '100vh' }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3,
              borderRadius: 4,
              bgcolor: 'background.paper',
              mb: 3,
              boxShadow: 2,
              minHeight: 'auto',
              height: 'auto',
              overflow: 'visible',
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
                    label="Timeline" 
                    value="timeline"
                  />
                </Tabs>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setNewEventDialogOpen(true)}
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
            ) : view === 'timeline' ? (
              <Timeline>
                {events.map((event) => (
                  <TimelineItem key={event.id}>
                    <TimelineSeparator>
                      <TimelineDot />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      {event.title}
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            ) : (
              renderKanbanView()
            )}
          </Paper>
        </Container>

        {/* New Event Dialog */}
            <Dialog
              open={newEventDialogOpen}
              onClose={() => setNewEventDialogOpen(false)}
              maxWidth="sm"
              fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: 3,
            px: 4,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1), rgba(255,255,255,0.3))'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <VideocamIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Create New Event
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  Schedule meetings and tasks
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
              <DialogContent>
                <Stack spacing={3} sx={{ mt: 2 }}>
                  <TextField
                    label="Title"
                    value={newEvent.title || ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    fullWidth
                    required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <TextField
                    label="Description"
                    value={newEvent.description || ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    multiline
                    rows={3}
                    fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Start Date"
                        type="datetime-local"
                        value={newEvent.startDate || ''}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="End Date"
                        type="datetime-local"
                        value={newEvent.endDate || ''}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={newEvent.type || 'meeting'}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as 'meeting' | 'task' }))}
                          label="Type"
                      sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="meeting">Meeting</MenuItem>
                          <MenuItem value="task">Task</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Priority</InputLabel>
                        <Select
                          value={newEvent.priority || 'medium'}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                          label="Priority"
                      sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="low">Low</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

              {/* Meeting-specific fields */}
              {newEvent.type === 'meeting' && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>Meeting Details</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Meeting Type</InputLabel>
                        <Select
                          value={newEvent.isVirtual ? 'virtual' : 'in-person'}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, isVirtual: e.target.value === 'virtual' }))}
                          label="Meeting Type"
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="in-person">In-Person</MenuItem>
                          <MenuItem value="virtual">Virtual</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Location"
                        value={newEvent.location || ''}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                        fullWidth
                        placeholder={newEvent.isVirtual ? "Enter meeting link" : "Enter location"}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Add Attendees"
                        placeholder="Enter email addresses separated by commas"
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        onChange={(e) => {
                          const attendees = e.target.value.split(',').map(email => ({
                            name: email.trim(),
                            avatar: email.trim().charAt(0).toUpperCase()
                          }));
                          setNewEvent(prev => ({ ...prev, attendees }));
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
                </Stack>
              </DialogContent>
          <DialogActions sx={{ 
            p: 4, 
            pt: 2,
            background: 'transparent',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            gap: 2,
            flexDirection: 'column',
            alignItems: 'stretch'
          }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => setNewEventDialogOpen(false)}
                variant="outlined"
                size="large"
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  borderColor: 'rgba(0,0,0,0.2)',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: 'rgba(0,0,0,0.4)',
                    background: 'rgba(0,0,0,0.02)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleNewEvent}
                disabled={!newEvent.title || !newEvent.startDate}
                size="large"
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  boxShadow: '0 8px 24px rgba(102,126,234,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2, #667eea)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(102,126,234,0.4)'
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.3))',
                    color: 'rgba(255,255,255,0.7)'
                  }
                }}
              >
                Create Event
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
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
            >
              {selectedEvent && (
                <>
                  <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight="medium">
                      {selectedEvent.title}
                  </Typography>
                      <Chip
                        size="small"
                        label={selectedEvent.type}
                        color={selectedEvent.type === 'meeting' ? 'primary' : 'secondary'}
                    sx={{ borderRadius: 2 }}
                      />
                    </Box>
                  </DialogTitle>
                  <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                  <Typography variant="body1" color="text.secondary">
                        {selectedEvent.description}
                      </Typography>
                      <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Time
                        </Typography>
                    <Typography variant="body1">
                          {format(new Date(selectedEvent.startDate), 'MMM d, yyyy h:mm a')} - 
                          {format(new Date(selectedEvent.endDate), 'h:mm a')}
                        </Typography>
                      </Box>
                  {selectedEvent.type === 'meeting' && (
                    <>
                        <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Location
                            </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ color: 'text.secondary' }} />
                          <Typography variant="body1">
                            {selectedEvent.isVirtual ? 'Virtual Meeting' : selectedEvent.location}
                            </Typography>
                          </Box>
                        {selectedEvent.isVirtual && selectedEvent.meetingLink && (
                          <Button
                            variant="outlined"
                            startIcon={<VideoCall />}
                            href={selectedEvent.meetingLink}
                            target="_blank"
                            sx={{ mt: 1 }}
                          >
                            Join Meeting
                          </Button>
                          )}
                        </Box>
                      {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Attendees
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {selectedEvent.attendees.map(attendee => (
                              <Chip
                                key={attendee.name}
                                avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>{attendee.avatar}</Avatar>}
                                label={attendee.name}
                                sx={{ borderRadius: 2 }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                  {selectedEvent.type === 'task' && (
                    <>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="body2">
                            {selectedEvent.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={selectedEvent.progress}
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            bgcolor: 'action.hover',
                          }}
                        />
                      </Box>
                      {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Assigned To
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}>{selectedEvent.attendees[0].avatar}</Avatar>}
                              label={selectedEvent.attendees[0].name}
                              sx={{ borderRadius: 2 }}
                            />
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                    </Stack>
                  </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                    <Button 
                      onClick={() => {
                        setEventDialogOpen(false);
                        setSelectedEvent(null);
                      }}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3,
                      }}
                    >
                      Close
                    </Button>
                    {selectedEvent.type === 'task' && (
                      <Button
                        variant="contained"
                        color={selectedEvent.status === 'completed' ? 'success' : 'primary'}
                        onClick={() => handleStatusChange(
                          selectedEvent,
                          selectedEvent.status === 'completed' ? 'todo' : 'completed'
                        )}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3,
                    }}
                      >
                        {selectedEvent.status === 'completed' ? 'Reopen' : 'Mark Complete'}
                      </Button>
                    )}
                {selectedEvent.type === 'meeting' && (
                  <Button
                    variant="contained"
                    startIcon={<VideoCall />}
                    onClick={() => {
                      // Handle joining meeting
                      if (selectedEvent.meetingLink) {
                        window.open(selectedEvent.meetingLink, '_blank');
                      }
                    }}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3,
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
        <Dialog open={showTimeBlockDialog} onClose={() => setShowTimeBlockDialog(false)}>
          <DialogTitle>Create Time Block</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField label="Block Title" fullWidth />
              <TextField label="Duration" select fullWidth defaultValue="1h">
                <MenuItem value="30m">30 minutes</MenuItem>
                <MenuItem value="1h">1 hour</MenuItem>
                <MenuItem value="2h">2 hours</MenuItem>
                <MenuItem value="4h">4 hours</MenuItem>
              </TextField>
              <TextField label="Color" select fullWidth defaultValue="#4CAF50">
                <MenuItem value="#4CAF50">Green</MenuItem>
                <MenuItem value="#2196F3">Blue</MenuItem>
                <MenuItem value="#FF9800">Orange</MenuItem>
                <MenuItem value="#F44336">Red</MenuItem>
              </TextField>
              <FormControlLabel
                control={<Switch />}
                label="Recurring"
              />
          </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowTimeBlockDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setShowTimeBlockDialog(false)}>
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Event Hover Popup */}
        <Popover
          open={Boolean(hoverEvent)}
          anchorEl={hoverAnchorEl}
          onClose={handleEventMouseLeave}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          sx={{
            pointerEvents: 'none',
            zIndex: 9999,
            '& .MuiPopover-paper': {
              pointerEvents: 'auto',
              borderRadius: 2,
              boxShadow: 3,
              maxWidth: 300,
              zIndex: 9999,
            },
          }}
          slotProps={{
            paper: {
              sx: {
                zIndex: 9999,
              }
            }
          }}
        >
          {hoverEvent && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="medium" sx={{ color: 'text.primary' }}>
                  {hoverEvent.title}
                </Typography>
                <Chip
                  size="small"
                  label={hoverEvent.type}
                  color={hoverEvent.type === 'meeting' ? 'primary' : 'secondary'}
                  sx={{ borderRadius: 1, fontSize: '0.7rem' }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {hoverEvent.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Event sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(hoverEvent.startDate), 'h:mm a')} - 
                  {format(new Date(hoverEvent.endDate), 'h:mm a')}
                </Typography>
              </Box>
              {hoverEvent.type === 'meeting' && hoverEvent.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {hoverEvent.isVirtual ? 'Virtual Meeting' : hoverEvent.location}
                  </Typography>
                </Box>
              )}
              {hoverEvent.type === 'task' && hoverEvent.progress !== undefined && (
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {hoverEvent.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={hoverEvent.progress}
                    sx={{ 
                      height: 4, 
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                    }}
                  />
                </Box>
              )}
              {hoverEvent.type === 'meeting' && hoverEvent.attendees && hoverEvent.attendees.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Attendees ({hoverEvent.attendees.length})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {hoverEvent.attendees.slice(0, 3).map(attendee => (
                      <Chip
                        key={attendee.name}
                        size="small"
                        avatar={<Avatar sx={{ bgcolor: 'primary.main', width: 16, height: 16, fontSize: '0.6rem' }}>{attendee.avatar}</Avatar>}
                        label={attendee.name}
                        sx={{ 
                          borderRadius: 1, 
                          fontSize: '0.6rem',
                          height: 20,
                          '& .MuiChip-avatar': {
                            width: 16,
                            height: 16,
                          },
                        }}
                      />
                    ))}
                    {hoverEvent.attendees.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{hoverEvent.attendees.length - 3} more
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Popover>
      </LocalizationProvider>
    </DashboardLayout>
  );
};

export default Calendar;
