import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Timer,
  Security,
  VideoCall,
  Assessment,
  Group,
  Settings,
  Add as AddIcon,
  AccessTime,
  CheckCircle,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../store';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingScreen from '../../components/LoadingScreen';
import { DashboardCommandSkeleton } from './DashboardCommandSkeleton';
import {
  MainDashboardContent,
} from '../../components/MainDashboardContent/MainDashboardContent';
import { PersonalAttendanceTools } from '../../components/PersonalAttendanceTools/PersonalAttendanceTools';
import JobChat from '../../components/JobChat';
import { useEmployees } from '../../contexts/EmployeeContext';
import { Briefcase, Users, Building2 } from 'lucide-react';
import type { MetricsGridItem } from '../../components/MetricsGrid/MetricsGrid';
import { useArrayPersistence } from '../../hooks/usePersistence';
import { useGuidedTour } from '../../contexts/GuidedTourContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useNotifications } from '../../contexts/NotificationContext';
import { TOUR_AUTO_START_KEY, TOUR_COMPLETED_KEY } from '../../config/guidedTour';
import {
  deriveProjectHealth,
  buildLiveActivityFeed,
  buildWorkforceSnapshot,
} from './dashboardOpsData';
import { tmGradients } from '../../theme/designTokens';
import { alpha } from '@mui/material/styles';

// Define job interface (matching TimeTracking)
interface Job {
  id: string;
  name: string;
  client: string;
  startTime: string;
  startDate: string;
  endTime: string;
  elapsedTime: string;
  totalTime: string;
  progress: number;
  status: string;
  assignedMembers: string[];
  pauseCondition: string;
  pauseTask: string | null;
  allocatedHours?: number;
  currentTimesheetId?: string;
  isTracking?: boolean;
  breakStartTime?: string;
  isOnBreak?: boolean;
  totalBreakTime?: number;
  assignedToManager?: string;
}

// Define activity interface
interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: string;
}

// Empty array for activities - no mock data
const activities: Activity[] = [];

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isDirect: boolean;
  recipient?: string;
}

interface ChatState {
  isOpen: boolean;
  selectedJob: Job | null;
  messages: Message[];
  newMessage: string;
  selectedRecipient: string | null;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { startTour } = useGuidedTour();
  const { notifications, unreadCount } = useNotifications();
  const { canCreateProjects, canAccessReports, canAccessMeetings, canManageTeam, canModifySettings } =
    usePermissions();
  
  // Call hooks - they should be available via context providers
  const [activeJobs] = useArrayPersistence<Job>('timelymate_active_jobs', []);
  const { employees } = useEmployees();
  
  
  // Date is now managed directly when needed
  
  // Initialize clock-in state based on localStorage
  const clockInToday = localStorage.getItem('clockInToday');
  const savedClockInTime = localStorage.getItem('clockInTime');
  const isClockInToday = clockInToday === new Date().toDateString();
  
  const [isClockedIn, setIsClockedIn] = useState(isClockInToday);
  const [clockInTime, setClockInTime] = useState<string | null>(
    isClockInToday ? (savedClockInTime || null) : null
  );
  const [clockInAlert, setClockInAlert] = useState(false);
  const [commandReady, setCommandReady] = useState(false);
  const recordsPrunedRef = useRef(false);
  
  // Determine if we should show the clock-in prompt
  const locationState = location.state as { from?: string; requiresClockIn?: boolean } | null;
  const [showClockInPrompt, setShowClockInPrompt] = useState(!isClockInToday);
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(locationState?.from || null);

  // Defer heavy command-center panels so header paints first
  useEffect(() => {
    const id = requestAnimationFrame(() => setCommandReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // First-time guided tour (replay anytime via Tour guide in the top bar)
  useEffect(() => {
    if (!user) return;
    const autoStarted = localStorage.getItem(TOUR_AUTO_START_KEY) === 'true';
    const completed = localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
    if (!autoStarted && !completed) {
      localStorage.setItem(TOUR_AUTO_START_KEY, 'true');
      const timer = window.setTimeout(() => startTour(), 1200);
      return () => window.clearTimeout(timer);
    }
  }, [user, startTour]);
  
  // Use persistence hooks for data that should survive sessions
  const [clockInRecords, setClockInRecords] = useArrayPersistence<{
    id: string;
    clockIn: string;
    clockOut: string | null;
    duration: string | null;
  }>('timelymate_clockin_records', []);
  
  const [chatState, setChatState] = useState<ChatState>({
    isOpen: false,
    selectedJob: null,
    messages: [],
    newMessage: '',
    selectedRecipient: null,
  });

  const departmentCount = useMemo(
    () => new Set(employees.map((emp) => emp.department)).size,
    [employees]
  );

  const teamMembers = useMemo(
    () =>
      employees.slice(0, 3).map((emp) => ({
        id: emp.id,
        name: emp.name,
        avatar: emp.avatar || emp.name.charAt(0),
      })),
    [employees]
  );

  // Format time as HH:MM:SS
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Format date as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Calculate duration between two times
  const calculateDuration = (start: Date, end: Date): string => {
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Check if user needs to clock in when they first load the dashboard
  useEffect(() => {
    // Check if we're coming from a redirect due to not being clocked in
    const locationState = location.state as { from?: string; requiresClockIn?: boolean } | null;
    
    // If we have a redirect path from state, store it
    if (locationState?.from) {
      setRedirectPath(locationState.from);
      // Show the clock-in prompt if we were redirected here
      if (locationState.requiresClockIn) {
        setShowClockInPrompt(true);
      }
    }
    
    // Check if user has already clocked in today based on localStorage value
    const hasClockInToday = localStorage.getItem('clockInToday') === new Date().toDateString();
    const savedClockInTime = localStorage.getItem('clockInTime');
    
    // Update state to match localStorage if needed
    if (hasClockInToday && savedClockInTime) {
      if (!isClockedIn) {
        console.log('Restoring clock-in state from localStorage');
        setIsClockedIn(true);
        setClockInTime(savedClockInTime);
        setShowClockInPrompt(false);
      }
    } else {
      // If not clocked in, update state but don't automatically show the prompt
      // This allows users to view the dashboard without being forced to clock in
      setIsClockedIn(false);
      setClockInTime(null);
    }
  }, [location.state, isClockedIn]);

  // Prune clock-in records older than 30 days once per mount
  useEffect(() => {
    if (recordsPrunedRef.current) return;
    recordsPrunedRef.current = true;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    setClockInRecords((prev) => {
      const cleaned = prev.filter((record) => {
        const recordDate = new Date(record.clockIn.split(' ')[0]);
        return recordDate >= thirtyDaysAgo;
      });
      return cleaned.length === prev.length ? prev : cleaned;
    });
  }, [setClockInRecords]);

  // Listen for global clock in/out events (from floating status bar)
  useEffect(() => {
    type TmClockDetail = { clockInISO?: string; clockOutISO?: string };
    const handleExternalClockIn = (e: Event) => {
      const ce = e as CustomEvent<TmClockDetail>;
      console.log('Dashboard received clock-in event:', ce.detail);
      const iso = ce.detail?.clockInISO ? new Date(ce.detail.clockInISO) : new Date();
      const newRecord = {
        id: Date.now().toString(),
        clockIn: `${formatDate(iso)} ${formatTime(iso)}`,
        clockOut: null,
        duration: null,
      } as { id: string; clockIn: string; clockOut: string | null; duration: string | null };
      setClockInRecords(prev => [...prev, newRecord]);
    };
    const handleExternalClockOut = (e: Event) => {
      const ce = e as CustomEvent<TmClockDetail>;
      console.log('Dashboard received clock-out event:', ce.detail);
      const clockOutISO = ce.detail?.clockOutISO ? new Date(ce.detail.clockOutISO) : new Date();
      const clockInISO = ce.detail?.clockInISO ? new Date(ce.detail.clockInISO) : null;
      
      setClockInRecords(prev => {
        const updated = [...prev];
        const lastRecord = updated[updated.length - 1];
        if (lastRecord && !lastRecord.clockOut) {
          lastRecord.clockOut = `${formatDate(clockOutISO)} ${formatTime(clockOutISO)}`;
          
          // Calculate duration if we have clock-in time
          if (clockInISO) {
            lastRecord.duration = calculateDuration(clockInISO, clockOutISO);
          }
        }
        return updated;
      });
    };
    window.addEventListener('tm:clockIn', handleExternalClockIn as EventListener);
    window.addEventListener('tm:clockOut', handleExternalClockOut as EventListener);
    return () => {
      window.removeEventListener('tm:clockIn', handleExternalClockIn as EventListener);
      window.removeEventListener('tm:clockOut', handleExternalClockOut as EventListener);
    };
  }, []);

  const handleClockIn = useCallback(() => {
    console.log('Clocked in at', new Date().toLocaleTimeString());
    const now = new Date();
    setIsClockedIn(true);
    setClockInTime(now.toISOString());
    setShowClockInPrompt(false);
    setClockInAlert(true);
    
    // Auto-hide the clock-in alert after 5 seconds
    setTimeout(() => {
      setClockInAlert(false);
    }, 5000);
    
    // Store clock-in info in localStorage with today's date string
    localStorage.setItem('clockInToday', new Date().toDateString());
    localStorage.setItem('clockInTime', now.toISOString());
    
    // Add new clock-in record
    const newRecord = {
      id: Date.now().toString(),
      clockIn: `${formatDate(now)} ${formatTime(now)}`,
      clockOut: null,
      duration: null,
    };
    
    setClockInRecords(prev => [...prev, newRecord]);
    
    // If we were redirected, navigate back after clocking in
    if (redirectPath) {
      // Clear redirect state first
      setRedirectPath(null);
      // Navigate back to the page the user was trying to access
      navigate(redirectPath);
    }
  }, [navigate, redirectPath, setClockInRecords]);

  const handleClockOut = useCallback(() => {
    if (clockInTime) {
      const clockOutTime = new Date();
      const clockInDate = new Date(clockInTime);
      const duration = calculateDuration(clockInDate, clockOutTime);
      
      // Update the last clock-in record
      setClockInRecords(prev => {
        const updated = [...prev];
        const lastRecord = updated[updated.length - 1];
        if (lastRecord) {
          lastRecord.clockOut = `${formatDate(clockOutTime)} ${formatTime(clockOutTime)}`;
          lastRecord.duration = duration;
        }
        return updated;
      });
    }
    
    setIsClockedIn(false);
    setClockInTime(null);
    
    // Remove today's clock-in record from localStorage
    localStorage.removeItem('clockInToday');
    localStorage.removeItem('clockInTime');
  }, [clockInTime, setClockInRecords]);

  const handleViewAllJobs = useCallback(() => {
    navigate('/time-tracking');
  }, [navigate]);

  const handleViewAllActivities = useCallback(() => {
    navigate('/activities');
  }, [navigate]);

  const handleJobClick = useCallback((job: Job) => {
    setSelectedJob(job);
    setJobDetailsOpen(true);
  }, []);

  const handleOpenChat = useCallback((job: Job) => {
    setChatState((prev) => ({
      ...prev,
      isOpen: true,
      selectedJob: job,
      messages: [],
      newMessage: '',
      selectedRecipient: null,
    }));
  }, []);

  const handleProjectCardClick = useCallback(
    (id: string) => {
      const job = activeJobs.find((j) => j.id === id);
      if (job) {
        handleJobClick(job);
        return;
      }
      navigate('/projects');
    },
    [activeJobs, handleJobClick, navigate]
  );

  const handleProjectMenuClick = useCallback(
    (id: string) => {
      const job = activeJobs.find((j) => j.id === id);
      if (job) {
        handleOpenChat(job);
        return;
      }
      navigate('/projects');
    },
    [activeJobs, handleOpenChat, navigate]
  );

  const handleCloseJobDetails = useCallback(() => {
    setJobDetailsOpen(false);
    setSelectedJob(null);
  }, []);

  const handleActivityClick = useCallback(
    (activityId: string) => {
      navigate(`/activities/${activityId}`);
    },
    [navigate]
  );

  const handleCloseChat = useCallback(() => {
    setChatState((prev) => ({
      ...prev,
      isOpen: false,
      selectedJob: null,
      messages: [],
      newMessage: '',
      selectedRecipient: null,
    }));
  }, []);

  const quickActions = useMemo(
    () =>
      [
        {
          icon: <Timer />,
          title: 'Track Time',
          description: 'Start tracking time for your current task',
          onClick: () => navigate('/time-tracking'),
          show: true,
        },
        {
          icon: <AddIcon />,
          title: 'New Project',
          description: 'Create a new project for your team',
          onClick: () => navigate('/projects', { state: { openCreateProject: true } }),
          show: canCreateProjects(),
        },
        {
          icon: <Assessment />,
          title: 'View Reports',
          description: "Check your team's performance metrics",
          onClick: () => navigate('/reports'),
          show: canAccessReports(),
        },
        {
          icon: <VideoCall />,
          title: 'Team Meeting',
          description: 'Start or join a video meeting',
          onClick: () => navigate('/meetings'),
          show: canAccessMeetings(),
        },
      ].filter((action) => action.show),
    [navigate, canCreateProjects, canAccessReports, canAccessMeetings]
  );

  const managementTools = useMemo(
    () =>
      [
        {
          icon: <Group />,
          title: 'Team',
          description: 'Manage your team members and roles',
          onClick: () => navigate('/team'),
          show: canManageTeam(),
        },
        {
          icon: <Security />,
          title: 'Security',
          description: 'Review and update security settings',
          onClick: () => navigate('/settings', { state: { focusSection: 'security' } }),
          show: canModifySettings(),
        },
        {
          icon: <Settings />,
          title: 'Settings',
          description: 'Configure your workspace preferences',
          onClick: () => navigate('/settings'),
          show: canModifySettings(),
        },
      ].filter((tool) => tool.show),
    [navigate, canManageTeam, canModifySettings]
  );

  const dashboardMetrics: MetricsGridItem[] = useMemo(
    () => [
    {
      title: 'Active workspaces',
      value: String(activeJobs.length),
      change: activeJobs.length ? 'Jobs on your timer' : 'None running yet',
      icon: Briefcase,
      iconColor: '#3b82f6',
      iconBg: '#eff6ff',
    },
    {
      title: 'People',
      value: String(employees.length),
      change: employees.length ? 'Imported roster' : 'Add people in HR',
      icon: Users,
      iconColor: '#10b981',
      iconBg: '#ecfdf5',
    },
    {
      title: 'Departments',
      value: String(departmentCount),
      change: departmentCount ? 'Across org' : 'No departments yet',
      icon: Building2,
      iconColor: '#f59e0b',
      iconBg: '#fffbeb',
    },
  ],
    [activeJobs.length, employees.length, departmentCount]
  );

  const projectTiles = useMemo(() => {
    if (activeJobs.length > 0) {
      return activeJobs.map((job) => ({
        id: job.id,
        title: job.name,
        department: job.client || 'Workspace',
        progress: job.progress,
        dueDate: job.startDate ? job.startDate : 'In progress',
        teamSize: job.assignedMembers?.length ?? 0,
      }));
    }
    return [];
  }, [activeJobs]);

  const projectHealth = useMemo(() => deriveProjectHealth(projectTiles), [projectTiles]);

  const atRiskCount = useMemo(
    () => projectHealth.filter((p) => p.status === 'at-risk' || p.status === 'critical').length,
    [projectHealth]
  );

  const workforce = useMemo(
    () => buildWorkforceSnapshot(employees, departmentCount, activeJobs.length, isClockedIn),
    [employees, departmentCount, activeJobs.length, isClockedIn]
  );

  const notificationFeed = useMemo(
    () =>
      notifications.slice(0, 8).map((n) => ({
        id: n.id,
        title: n.title,
        description: n.description,
        time: n.time,
        read: n.read,
      })),
    [notifications]
  );

  const jobNames = useMemo(() => activeJobs.map((j) => j.name), [activeJobs]);

  const liveActivity = useMemo(
    () =>
      buildLiveActivityFeed({
        clockRecords: clockInRecords,
        jobNames,
        notificationItems: notificationFeed,
        legacyActivities: activities,
      }),
    [clockInRecords, jobNames, notificationFeed]
  );

  const attendanceSidebar = useMemo(
    () => (
      <PersonalAttendanceTools
        isClockedIn={isClockedIn}
        clockInTime={clockInTime || null}
        records={clockInRecords}
        onClockIn={handleClockIn}
        onClockOut={handleClockOut}
        onOpenTimeTracking={() => navigate('/time-tracking')}
      />
    ),
    [isClockedIn, clockInTime, clockInRecords, handleClockIn, handleClockOut, navigate]
  );


  if (!user) {
    return (
      <DashboardLayout>
        <LoadingScreen message="Loading your workspace…" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Clock-in Prompt Dialog */}
        <Dialog
          open={showClockInPrompt}
          onClose={() => {
            // Don't allow closing the dialog by clicking outside or pressing escape
            // User must clock in to close the dialog
            return false;
          }}
          maxWidth="sm"
          fullWidth
          disableEscapeKeyDown
        >
          <DialogTitle id="clock-in-dialog-title" sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
              {redirectPath ? 'Clock In Required' : 'Start Your Workday'}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <AccessTime sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="body1" sx={{ mb: 3 }}>
                {redirectPath 
                  ? 'You must clock in before accessing other pages in the app.' 
                  : 'Welcome to work! Please clock in to start tracking your workday.'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current time: {new Date().toLocaleTimeString()}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<LoginIcon />}
              onClick={handleClockIn}
              sx={{ px: 4 }}
            >
              Clock In Now
            </Button>
            {/* Removed "Remind Me Later" button */}
          </DialogActions>
        </Dialog>

        {/* Page header — gradient matches Calendar page */}
        <Box
          sx={{
            background: tmGradients.dialogTitle,
            pt: { xs: 3, md: 4 },
            pb: { xs: 2.5, md: 3 },
            borderBottom: `1px solid ${alpha('#fff', 0.12)}`,
            boxShadow: `0 8px 32px ${alpha('#000', 0.25)}`,
          }}
        >
          <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ color: 'white' }}>
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  opacity: 0.85,
                  mb: 1,
                }}
              >
                TimelyMate · Operations
              </Typography>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 0.75,
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                  letterSpacing: '-0.03em',
                }}
              >
                Command center
              </Typography>
              <Typography
                sx={{
                  fontWeight: 400,
                  opacity: 0.92,
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  maxWidth: 640,
                  lineHeight: 1.5,
                }}
              >
                AI-assisted oversight of projects, workforce, and live signals — all routes stay one click away in the sidebar.
              </Typography>
            </Box>
          </Container>
        </Box>

      {/* Clock In Alert */}
      {clockInAlert && (
        <Container maxWidth="xl" disableGutters sx={{ mt: 2, px: { xs: 2, sm: 3, md: 4 } }}>
          <Alert 
            severity="success" 
            onClose={() => setClockInAlert(false)}
            sx={{ borderRadius: 2 }}
          >
            Successfully clocked in at {clockInTime ? formatTime(new Date(clockInTime)) : ''}
          </Alert>
        </Container>
      )}


      {!commandReady ? (
        <DashboardCommandSkeleton />
      ) : (
      <MainDashboardContent
        displayName={user.organizationName || user.email || 'User'}
        metrics={dashboardMetrics}
        projects={projectTiles}
        isClockedIn={isClockedIn}
        clockInTime={clockInTime}
        atRiskCount={atRiskCount}
        unreadCount={unreadCount}
        projectHealth={projectHealth}
        workforce={workforce}
        liveActivity={liveActivity}
        quickActions={quickActions}
        managementActions={managementTools}
        attendanceSidebar={attendanceSidebar}
        recentActivity={
          activities.length > 0 ? (
            <Box sx={{ pt: 1.5 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', mb: 1 }}>
                Legacy activity log
              </Typography>
              <List dense disablePadding>
                {activities.map((activity) => (
                  <ListItem
                    key={activity.id}
                    disableGutters
                    sx={{ py: 1, cursor: 'pointer', borderRadius: '3px', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => handleActivityClick(activity.id)}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {activity.type === 'time_track' && <Timer sx={{ fontSize: 18 }} />}
                      {activity.type === 'meeting' && <VideoCall sx={{ fontSize: 18 }} />}
                      {activity.type === 'task' && <CheckCircle sx={{ fontSize: 18 }} />}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={activity.timestamp}
                      primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 600 }}
                      secondaryTypographyProps={{ fontSize: '0.75rem' }}
                    />
                    <Chip label={activity.status} size="small" sx={{ height: 20, fontSize: '0.625rem' }} />
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : undefined
        }
        onViewAllProjects={handleViewAllJobs}
        onViewAllActivities={handleViewAllActivities}
        onProjectCardClick={handleProjectCardClick}
        onProjectMenuClick={handleProjectMenuClick}
        onProjectTrackClick={() => navigate('/time-tracking')}
      />
      )}

      {/* Job Details Dialog */}
      <Dialog
        open={jobDetailsOpen}
        onClose={handleCloseJobDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedJob && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{selectedJob.name}</Typography>
                <Chip
                  label={selectedJob.status}
                  color={selectedJob.status === 'active' ? 'success' : 'default'}
                />
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Client
                  </Typography>
                  <Typography variant="body1">{selectedJob.client}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Start Time
                  </Typography>
                  <Typography variant="body1">{selectedJob.startTime}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Time Tracking
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body1">
                      Elapsed: {selectedJob.elapsedTime}
                    </Typography>
                    <Typography variant="body1">
                      Total: {selectedJob.totalTime}
                    </Typography>
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Progress
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={selectedJob.progress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedJob.progress}% Complete
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseJobDetails}>Close</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  handleCloseJobDetails();
                  navigate('/projects', {
                    state: {
                      openProjectId: selectedJob.id,
                      openProjectName: selectedJob.name,
                    },
                  });
                }}
              >
                View Full Details
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Chat Dialog */}
      <JobChat
        isOpen={chatState.isOpen}
        onClose={handleCloseChat}
        jobName={chatState.selectedJob?.name || ''}
        jobId={chatState.selectedJob?.id}
        teamMembers={teamMembers}
      />
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
