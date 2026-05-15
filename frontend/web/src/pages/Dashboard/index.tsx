import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  useTheme,
  Stack,
  IconButton,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  Timer,
  Security,
  VideoCall,
  Assessment,
  Group,
  Settings,
  Add as AddIcon,
  Work,
  AccessTime,
  CheckCircle,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Chat as ChatIcon,
  Person,
  Business,
  TrendingUp,
  AttachMoney,
} from '@mui/icons-material';
import { useAppSelector } from '../../store';
import DashboardLayout from '../../components/DashboardLayout';
import JobChat from '../../components/JobChat';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useEmployees } from '../../contexts/EmployeeContext';
import { useNotifications, createNotification } from '../../contexts/NotificationContext';
import { useArrayPersistence, usePrimitivePersistence } from '../../hooks/usePersistence';

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

const ActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}> = ({ icon, title, description, onClick }) => (
  <Card 
    sx={{ 
      height: '100%', 
      borderRadius: 4, 
      boxShadow: 4,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s',
      '&:hover': onClick ? {
        transform: 'scale(1.02)',
      } : {},
    }}
    onClick={onClick}
  >
    <CardContent>
      <Stack spacing={2} alignItems="center" textAlign="center">
        <Box sx={{ color: 'primary.main', transform: 'scale(1.5)' }}>{icon}</Box>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Stack>
    </CardContent>
  </Card>
);



const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  
  // Call hooks - they should be available via context providers
  const { currency, formatAmount, getSymbol, detectedCountry } = useCurrency();
  
  // Get active jobs from TimeTracking
  const [activeJobs] = useArrayPersistence<Job>('timelymate_active_jobs', []);
  const { employees } = useEmployees();
  const { addNotification } = useNotifications();
  
  // Debug: Log when component renders
  useEffect(() => {
    console.log('Dashboard component rendered', { 
      user: user ? { id: user.id, email: user.email } : null, 
      employeesCount: employees?.length || 0 
    });
  }, [user, employees]);
  
  // If user is not loaded, show loading state
  if (!user) {
    return (
      <DashboardLayout>
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6">Loading user data...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  // Add sample notifications on component mount
  useEffect(() => {
    // Add some sample notifications for demonstration
    setTimeout(() => {
      addNotification(createNotification.message(
        "New Message from Sarah",
        "Sarah sent you a message about the project deadline"
      ));
    }, 1000);

    setTimeout(() => {
      addNotification(createNotification.task(
        "Task Assignment",
        "You have been assigned a new task: Review quarterly reports"
      ));
    }, 2000);

    setTimeout(() => {
      addNotification(createNotification.calendar(
        "Meeting Reminder",
        "Team standup meeting starts in 15 minutes"
      ));
    }, 3000);

    setTimeout(() => {
      addNotification(createNotification.timesheet(
        "Timesheet Approved",
        "Your timesheet for last week has been approved by your manager"
      ));
    }, 4000);

    setTimeout(() => {
      addNotification(createNotification.system(
        "System Update",
        "New features have been added to the dashboard",
        "medium"
      ));
    }, 5000);
  }, [addNotification]);
  
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

  // Calculate employee statistics
  const employeeStats = {
    totalEmployees: employees.length,
    departments: [...new Set(employees.map(emp => emp.department))].length,
    activeEmployees: employees.filter(emp => emp.status === 'active').length,
    totalSalary: employees.reduce((sum, emp) => sum + emp.salary, 0),
    avgSalary: employees.length > 0 ? Math.round(employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length) : 0,
    employmentTypes: {
      permanent: employees.filter(emp => emp.employmentType === 'permanent').length,
      contract: employees.filter(emp => emp.employmentType === 'contract').length,
      freelancer: employees.filter(emp => emp.employmentType === 'freelancer').length,
    },
    seniorityLevels: {
      junior: employees.filter(emp => emp.level === 'junior').length,
      mid: employees.filter(emp => emp.level === 'mid').length,
      senior: employees.filter(emp => emp.level === 'senior').length,
      lead: employees.filter(emp => emp.level === 'lead').length,
    }
  };

  // Get department breakdown
  const departmentBreakdown = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

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
    const handleExternalClockIn = (e: any) => {
      console.log('Dashboard received clock-in event:', e.detail);
      const iso = e?.detail?.clockInISO ? new Date(e.detail.clockInISO) : new Date();
      const newRecord = {
        id: Date.now().toString(),
        clockIn: `${formatDate(iso)} ${formatTime(iso)}`,
        clockOut: null,
        duration: null,
      } as { id: string; clockIn: string; clockOut: string | null; duration: string | null };
      setClockInRecords(prev => [...prev, newRecord]);
    };
    const handleExternalClockOut = (e: any) => {
      console.log('Dashboard received clock-out event:', e.detail);
      const clockOutISO = e?.detail?.clockOutISO ? new Date(e.detail.clockOutISO) : new Date();
      const clockInISO = e?.detail?.clockInISO ? new Date(e.detail.clockInISO) : null;
      
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
      onClick: () => console.log('Start time tracking'),
    },
    {
      icon: <AddIcon />,
      title: 'New Project',
      description: 'Create a new project for your team',
      onClick: () => console.log('Create project'),
    },
    {
      icon: <Assessment />,
      title: 'View Reports',
      description: 'Check your team\'s performance metrics',
      onClick: () => console.log('View reports'),
    },
    {
      icon: <VideoCall />,
      title: 'Team Meeting',
      description: 'Start or join a video meeting',
      onClick: () => console.log('Start meeting'),
    },
  ];

  const managementTools = [
    {
      icon: <Group />,
      title: 'Team',
      description: 'Manage your team members and roles',
      onClick: () => console.log('Team management'),
    },
    {
      icon: <Security />,
      title: 'Security',
      description: 'Review and update security settings',
      onClick: () => console.log('Security settings'),
    },
    {
      icon: <Settings />,
      title: 'Settings',
      description: 'Configure your workspace preferences',
      onClick: () => console.log('Settings'),
    },
  ];



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
          <DialogTitle sx={{ textAlign: 'center', py: 3 }}>
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

          {/* Header Section */}
          <Box
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: 'white',
              py: { xs: 4, md: 6 },
            }}
          >
            <Container maxWidth="lg">
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                    Dashboard
                  </Typography>
            {/* Floating element replaces inline timer and clock button */}
          </Stack>
              <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' } }}>
                Welcome back, {user?.organizationName || user?.email || 'User'}!
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 400, mb: 4, opacity: 0.9, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' } }}>
                Welcome back! Here's what's happening today.
              </Typography>



              {/* Metrics Cards */}
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Let's make today productive
              </Typography>
            </Container>
          </Box>

      {/* Clock In Alert */}
      {clockInAlert && (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
          <Alert 
            severity="success" 
            onClose={() => setClockInAlert(false)}
            sx={{ borderRadius: 2 }}
          >
            Successfully clocked in at {clockInTime ? formatTime(new Date(clockInTime)) : ''}
          </Alert>
        </Container>
      )}

      {/* Employee Summary Section */}
      {employees.length > 0 && (
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <Typography variant="h4" sx={{ mb: 4 }}>
            Organization Overview
          </Typography>
          <Grid container spacing={{ xs: 2, md: 4 }}>
            {/* Key Statistics */}
            <Grid item xs={12} md={8}>
              <Card 
                sx={{ 
                  height: '100%', 
                  borderRadius: 4, 
                  boxShadow: 4, 
                  mb: { xs: 2, md: 0 },
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => navigate('/hr')}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Key Metrics
                  </Typography>
                  <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Person sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h4" fontWeight={700} color="primary">
                          {employeeStats.totalEmployees}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Employees
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Business sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                        <Typography variant="h4" fontWeight={700} color="success.main">
                          {employeeStats.departments}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Departments
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                        <Typography variant="h4" fontWeight={700} color="info.main">
                          {employeeStats.activeEmployees}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Active Employees
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <AttachMoney sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                        <Typography variant="h4" fontWeight={700} color="warning.main">
                          {getSymbol()}{Math.round(employeeStats.avgSalary / 1000)}k
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Avg Salary
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Employment Type Breakdown */}
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  height: '100%', 
                  borderRadius: 4, 
                  boxShadow: 4, 
                  mb: { xs: 2, md: 0 },
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => navigate('/hr')}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Employment Types
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Permanent</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {employeeStats.employmentTypes.permanent}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(employeeStats.employmentTypes.permanent / employeeStats.totalEmployees) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Contract</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {employeeStats.employmentTypes.contract}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(employeeStats.employmentTypes.contract / employeeStats.totalEmployees) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                        color="secondary"
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Freelancer</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {employeeStats.employmentTypes.freelancer}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(employeeStats.employmentTypes.freelancer / employeeStats.totalEmployees) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                        color="success"
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Department Breakdown */}
          <Grid container spacing={{ xs: 2, md: 4 }} sx={{ mt: { xs: 2, md: 2 } }}>
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  borderRadius: 4, 
                  boxShadow: 4, 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => navigate('/reports')}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Department Distribution
                  </Typography>
                  <Stack spacing={2}>
                    {Object.entries(departmentBreakdown).map(([dept, count]) => (
                      <Box key={dept}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{dept}</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {count} employees
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={(count / employeeStats.totalEmployees) * 100}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  borderRadius: 4, 
                  boxShadow: 4, 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => navigate('/reports')}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Seniority Levels
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Junior</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {employeeStats.seniorityLevels.junior}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(employeeStats.seniorityLevels.junior / employeeStats.totalEmployees) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                        color="info"
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Mid-Level</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {employeeStats.seniorityLevels.mid}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(employeeStats.seniorityLevels.mid / employeeStats.totalEmployees) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                        color="primary"
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Senior</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {employeeStats.seniorityLevels.senior}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(employeeStats.seniorityLevels.senior / employeeStats.totalEmployees) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                        color="success"
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Lead</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {employeeStats.seniorityLevels.lead}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(employeeStats.seniorityLevels.lead / employeeStats.totalEmployees) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                        color="warning"
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Team Members */}
          <Grid container spacing={{ xs: 2, md: 4 }} sx={{ mt: { xs: 2, md: 2 } }}>
            <Grid item xs={12}>
              <Card 
                sx={{ 
                  borderRadius: 4, 
                  boxShadow: 4,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => navigate('/team')}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Team Members
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <AvatarGroup max={8} sx={{ '& .MuiAvatar-root': { width: 40, height: 40 } }}>
                      {employees.slice(0, 8).map((employee) => (
                        <Avatar 
                          key={employee.id}
                          src={employee.avatar}
                          alt={employee.name}
                          sx={{ width: 40, height: 40 }}
                        >
                          {employee.name.charAt(0)}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                    <Typography variant="body2" color="text.secondary">
                      {employees.length} total team members
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      )}

      {/* Work Summary Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Work Summary
        </Typography>
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Active Jobs with Chat */}
          <Grid item xs={12} md={8}>
            <Card 
              sx={{ 
                height: '100%', 
                borderRadius: 4, 
                boxShadow: 4,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
              onClick={() => navigate('/time-tracking')}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Jobs
                </Typography>
                <List>
                  {activeJobs.length === 0 ? (
                    <ListItem>
                      <ListItemText 
                        primary="No Active Jobs"
                        secondary="Start tracking time on a job to see it here"
                        sx={{ textAlign: 'center', py: 4 }}
                      />
                    </ListItem>
                  ) : (
                    activeJobs.map((job) => (
                    <React.Fragment key={job.id}>
                      <ListItem
                        button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJobClick(job);
                        }}
                        sx={{
                          py: 2,
                          borderRadius: 2,
                          '&:hover': {
                            bgcolor: 'action.hover',
                          }
                        }}
                      >
                        <ListItemIcon>
                          <Work color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={job.name}
                          secondary={`Client: ${job.client} | Started: ${job.startTime}`}
                        />
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={`${job.elapsedTime}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenChat(job);
                            }}
                          >
                            <ChatIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </ListItem>
                      <Box sx={{ pl: 9, pr: 2, pb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progress
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={job.progress}
                          sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                        />
                      </Box>
                      <Divider />
                    </React.Fragment>
                    ))
                  )}
                </List>
                <Button
                  fullWidth
                  variant="text"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewAllJobs();
                  }}
                  sx={{ mt: 2 }}
                >
                  View All Jobs
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                borderRadius: 4, 
                boxShadow: 4,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
              onClick={() => navigate('/reports')}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <List>
                  {activities.map((activity) => (
                    <React.Fragment key={activity.id}>
                      <ListItem
                        button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivityClick(activity.id);
                        }}
                        sx={{
                          py: 2,
                          borderRadius: 2,
                          '&:hover': {
                            bgcolor: 'action.hover',
                          }
                        }}
                      >
                        <ListItemIcon>
                          {activity.type === 'time_track' && <Timer color="primary" />}
                          {activity.type === 'meeting' && <VideoCall color="secondary" />}
                          {activity.type === 'task' && <CheckCircle color="success" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.description}
                          secondary={activity.timestamp}
                        />
                        <Chip
                          label={activity.status}
                          size="small"
                          color={activity.status === 'active' ? 'success' : 'default'}
                        />
                      </ListItem>
                      {activities.length > 3 && (<Divider />)}
                    </React.Fragment>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="text"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewAllActivities();
                  }}
                  sx={{ mt: 2 }}
                >
                  View All Activities
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

        {/* Quick Actions Section */}
          <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
            <Typography variant="h4" sx={{ mb: 4 }}>
              Quick Actions
            </Typography>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
              {quickActions.map((action) => (
                <Grid item xs={12} sm={6} md={3} key={action.title}>
                  <ActionCard {...action} />
                </Grid>
              ))}
            </Grid>
          </Container>

        {/* Management Tools Section */}
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
              <Typography variant="h4" sx={{ mb: 4 }}>
                Management Tools
              </Typography>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
                {managementTools.map((tool) => (
                  <Grid item xs={12} sm={6} md={4} key={tool.title}>
                    <ActionCard {...tool} />
                  </Grid>
                ))}
              </Grid>
            </Container>

      {/* Attendance History */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Your Attendance
        </Typography>
        <Card 
          sx={{ 
            borderRadius: 4, 
            boxShadow: 4,
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6,
            },
          }}
          onClick={() => navigate('/time-tracking')}
        >
          <CardContent>
            <List>
              {clockInRecords.map((record) => (
                <ListItem key={record.id} sx={{ py: 2 }}>
                  <ListItemIcon>
                    <AccessTime color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Clock In: ${record.clockIn}`}
                    secondary={record.clockOut ? `Clock Out: ${record.clockOut}` : 'Currently Working'}
                  />
                  {record.duration && (
                    <Chip 
                      label={`Duration: ${record.duration}`}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </ListItem>
              ))}
              {clockInRecords.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No clock-in records yet"
                    secondary="Your clock-in/out history will appear here"
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
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
                  navigate(`/time-tracking/job/${selectedJob.id}`);
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
        teamMembers={teamMembers}
      />
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
