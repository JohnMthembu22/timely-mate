import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
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
import { MainDashboardContent, MAIN_DASHBOARD_SAMPLE_PROJECTS } from '../../components/MainDashboardContent/MainDashboardContent';
import { PersonalAttendanceTools } from '../../components/PersonalAttendanceTools/PersonalAttendanceTools';
import JobChat from '../../components/JobChat';
import { useEmployees } from '../../contexts/EmployeeContext';
import { Briefcase, Users, Building2, Clock } from 'lucide-react';
import type { MetricsGridItem } from '../../components/MetricsGrid/MetricsGrid';
import { useArrayPersistence } from '../../hooks/usePersistence';
import { useGuidedTour } from '../../contexts/GuidedTourContext';
import { TOUR_AUTO_START_KEY, TOUR_COMPLETED_KEY } from '../../config/guidedTour';

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

const workspaceCardSx = {
  bgcolor: '#fff',
  border: '1px solid #f1f5f9',
  borderRadius: 3,
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
  transition: 'box-shadow 0.2s ease',
} as const;

const ActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}> = ({ icon, title, description, onClick }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
  <Card
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={handleKeyDown}
    sx={{
      ...workspaceCardSx,
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      outline: 'none',
      transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
      '&:hover': onClick
        ? { boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)', borderColor: '#e2e8f0' }
        : {},
      '&:focus-visible': onClick
        ? { boxShadow: '0 0 0 2px #fff, 0 0 0 4px #3b82f6', borderColor: '#93c5fd' }
        : {},
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            p: 1.25,
            borderRadius: 2,
            bgcolor: '#f8fafc',
            border: '1px solid #f1f5f9',
            color: '#475569',
            display: 'flex',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1e293b', mb: 0.25 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.45 }}>
            {description}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
  );
};



const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { startTour } = useGuidedTour();
  
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
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [clockInAlert, setClockInAlert] = useState(false);
  
  // Determine if we should show the clock-in prompt
  const locationState = location.state as { from?: string; requiresClockIn?: boolean } | null;
  const [showClockInPrompt, setShowClockInPrompt] = useState(!isClockInToday);
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(locationState?.from || null);

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

  const departmentCount = [...new Set(employees.map((emp) => emp.department))].length;

  // Mock team members for direct messaging - now using real employees
  const teamMembers = employees.slice(0, 3).map(emp => ({ 
    id: emp.id, 
    name: emp.name, 
    avatar: emp.avatar || emp.name.charAt(0) 
  }));

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

  // Update elapsed time every second
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isClockedIn && clockInTime) {
      // Calculate initial elapsed time
      const startTime = new Date(clockInTime);
      const now = new Date();
      const diff = now.getTime() - startTime.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      // Set initial elapsed time immediately
      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
      
      // Update elapsed time every second
      interval = setInterval(() => {
        const currentTime = new Date();
        const elapsedMs = currentTime.getTime() - startTime.getTime();
        
        const h = Math.floor(elapsedMs / (1000 * 60 * 60));
        const m = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((elapsedMs % (1000 * 60)) / 1000);
        
        setElapsedTime(
          `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        );
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isClockedIn, clockInTime]);

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
  }, [location.state]);

  // Listen for changes to isClockedIn state
  useEffect(() => {
    // We no longer automatically show the clock-in prompt when not clocked in
    // This allows users to view the dashboard without being forced to clock in
    // The prompt will only show if they were redirected from a page that requires clock-in
  }, [isClockedIn]);

  // Clean up old clock-in records (older than 30 days) periodically
  useEffect(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const cleanedRecords = clockInRecords.filter(record => {
      const recordDate = new Date(record.clockIn.split(' ')[0]); // Extract date part
      return recordDate >= thirtyDaysAgo;
    });
    
    // Only update if records were actually cleaned
    if (cleanedRecords.length !== clockInRecords.length) {
      setClockInRecords(cleanedRecords);
    }
  }, [clockInRecords, setClockInRecords]);

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

  const handleClockIn = () => {
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
  };

  const handleClockOut = () => {
    console.log('Clocked out after', elapsedTime, 'of work');
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
    setClockInTime('');
    setElapsedTime('00:00:00');
    
    // Remove today's clock-in record from localStorage
    localStorage.removeItem('clockInToday');
    localStorage.removeItem('clockInTime');
  };

  const handleViewAllJobs = () => {
    navigate('/time-tracking');
  };

  const handleViewAllActivities = () => {
    navigate('/activities');
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setJobDetailsOpen(true);
  };

  const handleProjectCardClick = (id: string) => {
    const job = activeJobs.find((j) => j.id === id);
    if (job) {
      handleJobClick(job);
      return;
    }
    if (MAIN_DASHBOARD_SAMPLE_PROJECTS.some((p) => p.id === id)) {
      navigate('/projects');
      return;
    }
    navigate('/projects');
  };

  const handleProjectMenuClick = (id: string) => {
    const job = activeJobs.find((j) => j.id === id);
    if (job) {
      handleOpenChat(job);
      return;
    }
    navigate('/projects');
  };

  const handleCloseJobDetails = () => {
    setJobDetailsOpen(false);
    setSelectedJob(null);
  };

  const handleActivityClick = (activityId: string) => {
    navigate(`/activities/${activityId}`);
  };

  const handleOpenChat = (job: Job) => {
    setChatState(prev => ({
      ...prev,
      isOpen: true,
      selectedJob: job,
      messages: [], // In a real app, you would fetch messages here
      newMessage: '',
      selectedRecipient: null,
    }));
  };

  const handleCloseChat = () => {
    setChatState(prev => ({
      ...prev,
      isOpen: false,
      selectedJob: null,
      messages: [],
      newMessage: '',
      selectedRecipient: null,
    }));
  };

  const quickActions = [
    {
      icon: <Timer />,
      title: 'Track Time',
      description: 'Start tracking time for your current task',
      onClick: () => navigate('/time-tracking'),
    },
    {
      icon: <AddIcon />,
      title: 'New Project',
      description: 'Create a new project for your team',
      onClick: () => navigate('/projects', { state: { openCreateProject: true } }),
    },
    {
      icon: <Assessment />,
      title: 'View Reports',
      description: 'Check your team\'s performance metrics',
      onClick: () => navigate('/reports'),
    },
    {
      icon: <VideoCall />,
      title: 'Team Meeting',
      description: 'Start or join a video meeting',
      onClick: () => navigate('/meetings'),
    },
  ];

  const managementTools = [
    {
      icon: <Group />,
      title: 'Team',
      description: 'Manage your team members and roles',
      onClick: () => navigate('/team'),
    },
    {
      icon: <Security />,
      title: 'Security',
      description: 'Review and update security settings',
      onClick: () => navigate('/settings', { state: { focusSection: 'security' } }),
    },
    {
      icon: <Settings />,
      title: 'Settings',
      description: 'Configure your workspace preferences',
      onClick: () => navigate('/settings'),
    },
  ];

  const dashboardMetrics: MetricsGridItem[] = [
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
    {
      title: 'Session',
      value: isClockedIn ? elapsedTime : '—',
      change: isClockedIn ? 'Elapsed today' : 'Clock in to track',
      icon: Clock,
      iconColor: '#a855f7',
      iconBg: '#faf5ff',
    },
  ];

  const projectTiles =
    activeJobs.length > 0
      ? activeJobs.map((job) => ({
          id: job.id,
          title: job.name,
          department: job.client || 'Workspace',
          progress: job.progress,
          dueDate: job.startDate ? job.startDate : 'In progress',
          teamSize: job.assignedMembers?.length ?? 0,
        }))
      : MAIN_DASHBOARD_SAMPLE_PROJECTS;


  if (!user) {
    return (
      <DashboardLayout>
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6">Loading user data...</Typography>
        </Box>
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
            background: 'linear-gradient(135deg, #2196f3 0%, #e91e63 100%)',
            pt: { xs: 4, md: 6 },
            pb: { xs: 3, md: 4 },
          }}
        >
          <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ color: 'white' }}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
                }}
              >
                Dashboard
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  opacity: 0.95,
                  mb: 1.5,
                  fontSize: { xs: '1.125rem', sm: '1.35rem', md: '1.5rem' },
                }}
              >
                Welcome back, {user.organizationName || user.email || 'User'}
              </Typography>
              <Typography
                sx={{
                  fontWeight: 400,
                  opacity: 0.9,
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  maxWidth: 560,
                }}
              >
                Here&apos;s what&apos;s happening today — workspaces on the left, your attendance context on the right.
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


      <MainDashboardContent
        displayName={user.organizationName || user.email || 'User'}
        metrics={dashboardMetrics}
        projects={projectTiles}
        attendanceSidebar={
          <PersonalAttendanceTools
            isClockedIn={isClockedIn}
            elapsedTime={elapsedTime}
            clockInTime={clockInTime || null}
            records={clockInRecords}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            onOpenTimeTracking={() => navigate('/time-tracking')}
          />
        }
        recentActivity={
          <>
            <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1e293b', mt: 4, mb: 2 }}>
              Recent activity
            </Typography>
            <Box sx={{ ...workspaceCardSx, p: 2 }}>
              <List dense disablePadding>
                {activities.length === 0 ? (
                  <ListItem disableGutters sx={{ py: 1 }}>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 500, color: '#64748b' }}>No recent activity</Typography>
                      }
                      secondary={
                        <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8', mt: 0.25 }}>
                          Updates will appear here when available.
                        </Typography>
                      }
                    />
                  </ListItem>
                ) : (
                  activities.map((activity) => (
                    <ListItem
                      key={activity.id}
                      disableGutters
                      sx={{ py: 1.25, borderRadius: 1, cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc' } }}
                      onClick={() => handleActivityClick(activity.id)}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {activity.type === 'time_track' && <Timer sx={{ fontSize: 20, color: '#64748b' }} />}
                        {activity.type === 'meeting' && <VideoCall sx={{ fontSize: 20, color: '#64748b' }} />}
                        {activity.type === 'task' && <CheckCircle sx={{ fontSize: 20, color: '#64748b' }} />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', color: '#1e293b' }}>
                            {activity.description}
                          </Typography>
                        }
                        secondary={
                          <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>{activity.timestamp}</Typography>
                        }
                      />
                      <Chip label={activity.status} size="small" sx={{ height: 22, fontSize: '0.6875rem' }} />
                    </ListItem>
                  ))
                )}
              </List>
              <Button
                fullWidth
                variant="text"
                onClick={handleViewAllActivities}
                sx={{ mt: 1, fontWeight: 600, textTransform: 'none', color: '#475569' }}
              >
                View all activities
              </Button>
            </Box>
          </>
        }
        onViewAllProjects={handleViewAllJobs}
        onProjectCardClick={handleProjectCardClick}
        onProjectMenuClick={handleProjectMenuClick}
      />

      {/* Quick Actions */}
      <Container maxWidth="xl" disableGutters sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, md: 4 } }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', color: '#1e293b', mb: 0.5 }}>
          Quick actions
        </Typography>
        <Typography sx={{ fontSize: '0.875rem', color: '#94a3b8', mb: 3 }}>
          Shortcuts for everyday work.
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 2 }}>
          {quickActions.map((action) => (
            <Grid item xs={12} sm={6} md={3} key={action.title}>
              <ActionCard {...action} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Management Tools */}
      <Container maxWidth="xl" disableGutters sx={{ py: { xs: 3, md: 5 }, pb: { xs: 6, md: 8 }, px: { xs: 2, sm: 3, md: 4 } }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.125rem', color: '#1e293b', mb: 0.5 }}>
          Management tools
        </Typography>
        <Typography sx={{ fontSize: '0.875rem', color: '#94a3b8', mb: 3 }}>
          Administration and workspace controls.
        </Typography>
        <Grid container spacing={{ xs: 2, sm: 2 }}>
          {managementTools.map((tool) => (
            <Grid item xs={12} sm={6} md={4} key={tool.title}>
              <ActionCard {...tool} />
            </Grid>
          ))}
        </Grid>
      </Container>

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
