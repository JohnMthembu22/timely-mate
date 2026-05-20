import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Stack,
  Divider,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  IconButton,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Timer,
  Search,
  FilterList,
  VideoCall,
  CheckCircle,
  Today,
  DateRange,
  Group,
  Work,
  ArrowBack,
  Assignment,
  CalendarToday,
  MoreVert,
  Sort,
  School,
  Person,
  Share,
  Download,
  Add,
  Clear,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useNotifications, createNotification } from '../../contexts/NotificationContext';

// Activity filter options
const filterOptions = {
  types: ['All Types', 'time_track', 'meeting', 'task', 'expense', 'learning'],
  statuses: ['All Statuses', 'active', 'completed', 'pending'],
  projects: ['All Projects'],
  users: ['All Users'],
};

const Activities: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { formatAmount } = useCurrency();
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedUser, setSelectedUser] = useState('All Users');
  const [selectedTab, setSelectedTab] = useState(0);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [timeTrackingDialogOpen, setTimeTrackingDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');

  // Handle single activity view if ID is provided
  useEffect(() => {
    if (id) {
      const activity = activities.find(a => a.id === id);
      if (activity) {
        setSelectedActivity(activity);
      } else {
        navigate('/activities');
      }
    }
  }, [id, navigate, activities]);

  // Filter activities based on current filter settings
  useEffect(() => {
    let filteredActivities = [...activities];
    
    // Apply search filter
    if (searchQuery) {
      filteredActivities = filteredActivities.filter(activity => 
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply type filter
    if (selectedType !== 'All Types') {
      filteredActivities = filteredActivities.filter(activity => 
        activity.type === selectedType.toLowerCase()
      );
    }
    
    // Apply status filter
    if (selectedStatus !== 'All Statuses') {
      filteredActivities = filteredActivities.filter(activity => 
        activity.status === selectedStatus.toLowerCase()
      );
    }
    
    // Apply project filter
    if (selectedProject !== 'All Projects') {
      filteredActivities = filteredActivities.filter(activity => 
        activity.project === selectedProject
      );
    }
    
    // Apply user filter
    if (selectedUser !== 'All Users') {
      filteredActivities = filteredActivities.filter(activity => 
        activity.user === selectedUser
      );
    }
    
    // Apply date filter based on tab
    if (selectedTab === 1) {
      // Today
      const today = new Date().toISOString().split('T')[0];
      filteredActivities = filteredActivities.filter(activity => 
        activity.timestamp.includes(today)
      );
    } else if (selectedTab === 2) {
      // This week
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().split('T')[0];
      const endOfWeek = new Date(now.setDate(now.getDate() + 6)).toISOString().split('T')[0];
      
      filteredActivities = filteredActivities.filter(activity => {
        const activityDate = activity.timestamp.split(' ')[0];
        return activityDate >= startOfWeek && activityDate <= endOfWeek;
      });
    }
    
    // Sort by timestamp
    filteredActivities.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });
    
    setActivities(filteredActivities);
  }, [searchQuery, selectedType, selectedStatus, selectedProject, selectedUser, selectedTab, sortOrder]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  
  const handleActivityClick = (activity: any) => {
    setSelectedActivity(activity);
  };
  
  const handleBackToList = () => {
    setSelectedActivity(null);
    if (id) {
      navigate('/activities');
    }
  };
  
  const handleToggleSort = () => {
    setSortOrder(prevOrder => prevOrder === 'desc' ? 'asc' : 'desc');
  };

  const handleShare = () => {
    setShareDialogOpen(true);
    addNotification(createNotification.system('Share Dialog', 'Share dialog opened for activity details.'));
  };

  const handleExport = () => {
    setExportDialogOpen(true);
    addNotification(createNotification.system('Export Dialog', 'Export dialog opened for activity data.'));
  };

  const handleStartTimeTracking = () => {
    setTimeTrackingDialogOpen(true);
    addNotification(createNotification.system('Time Tracking', 'Starting new time tracking session.'));
  };

  const handleCreateTask = () => {
    setTaskDialogOpen(true);
    addNotification(createNotification.system('Task Creation', 'Creating new task.'));
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedType('All Types');
    setSelectedStatus('All Statuses');
    setSelectedProject('All Projects');
    setSelectedUser('All Users');
    setSnackbarMessage('All filters cleared successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    addNotification(createNotification.system('Filters Cleared', 'All activity filters have been reset.'));
  };

  const handleShareConfirm = () => {
    setShareDialogOpen(false);
    setSnackbarMessage('Activity shared successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    addNotification(createNotification.system('Activity Shared', 'Activity details have been shared with the team.'));
  };

  const handleExportConfirm = () => {
    setExportDialogOpen(false);
    setSnackbarMessage('Activity data exported successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    addNotification(createNotification.system('Export Complete', 'Activity data has been exported to Excel format.'));
  };

  const handleTimeTrackingConfirm = () => {
    setTimeTrackingDialogOpen(false);
    const newActivity = {
      id: Date.now().toString(),
      type: 'time_track',
      status: 'active',
      description: 'New time tracking session',
      project: 'Current Project',
      user: 'Current User',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      details: 'Started new time tracking session for project work.',
      duration: '0h 0m'
    };
    setActivities(prev => [newActivity, ...prev]);
    setSnackbarMessage('Time tracking session started');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    addNotification(createNotification.system('Time Tracking Started', 'New time tracking session has been initiated.'));
  };

  const handleTaskCreationConfirm = () => {
    setTaskDialogOpen(false);
    const newActivity = {
      id: Date.now().toString(),
      type: 'task',
      status: 'pending',
      description: 'New task created',
      project: 'Current Project',
      user: 'Current User',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      details: 'New task has been created and assigned.',
      duration: '0h 0m'
    };
    setActivities(prev => [newActivity, ...prev]);
    setSnackbarMessage('New task created successfully');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    addNotification(createNotification.system('Task Created', 'New task has been created and added to the activity log.'));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'time_track':
        return <Timer color="primary" />;
      case 'meeting':
        return <VideoCall color="secondary" />;
      case 'task':
        return <Assignment color="info" />;
      case 'expense':
        return <Work color="warning" />;
      case 'learning':
        return <School color="success" />;
      default:
        return <CheckCircle />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  // If viewing a single activity
  if (selectedActivity) {
    return (
      <DashboardLayout>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          {/* Header Section */}
          <Box
            sx={{
              background: 'linear-gradient(45deg, #2196F3, #f50057)',
              color: 'white',
              py: { xs: 4, md: 6 },
            }}
          >
            <Container maxWidth="xl">
              <Button 
                startIcon={<ArrowBack />}
                onClick={handleBackToList}
                sx={{ 
                  color: 'white',
                  mb: 2,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
                variant="outlined"
              >
                Back to Activities
              </Button>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {selectedActivity.description}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <Chip 
                  label={selectedActivity.type.replace('_', ' ')} 
                  size="small" 
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                />
                <Chip 
                  label={selectedActivity.status} 
                  size="small" 
                  sx={{ 
                    bgcolor: selectedActivity.status === 'active' 
                      ? 'rgba(76, 175, 80, 0.8)' 
                      : selectedActivity.status === 'completed'
                        ? 'rgba(33, 150, 243, 0.8)'
                        : 'rgba(255, 152, 0, 0.8)',
                    color: 'white'
                  }}
                />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {selectedActivity.timestamp}
                </Typography>
              </Stack>
            </Container>
          </Box>

          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Project
                      </Typography>
                      <Typography variant="body1">
                        {selectedActivity.project}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        User
                      </Typography>
                      <Typography variant="body1">
                        {selectedActivity.user}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Details
                    </Typography>
                    <Typography variant="body1">
                      {selectedActivity.details}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                
                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button variant="outlined" startIcon={<Share />} onClick={handleShare}>
                      Share
                    </Button>
                    <Button variant="contained" startIcon={<Download />} onClick={handleExport}>
                      Export
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Container>
        </Box>

        {/* Share Dialog */}
        <Dialog 
          open={shareDialogOpen} 
          onClose={() => setShareDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
            <Box sx={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              borderRadius: 2, 
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Share sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Share Activity
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Share this activity with your team members or export it for external use.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Activity: {selectedActivity?.description}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ 
            p: 4, 
            pt: 2,
            background: 'transparent',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            gap: 2,
          }}>
            <Button 
              onClick={() => setShareDialogOpen(false)}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                border: '1px solid rgba(0,0,0,0.1)',
                '&:hover': {
                  background: 'rgba(0,0,0,0.05)',
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleShareConfirm} 
              variant="contained" 
              startIcon={<Share />}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                }
              }}
            >
              Share
            </Button>
          </DialogActions>
        </Dialog>

        {/* Export Dialog */}
        <Dialog 
          open={exportDialogOpen} 
          onClose={() => setExportDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
            <Box sx={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              borderRadius: 2, 
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Download sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Export Activity Data
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Export activity data in your preferred format for reporting or analysis.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Format: Excel (.xlsx)
            </Typography>
          </DialogContent>
          <DialogActions sx={{ 
            p: 4, 
            pt: 2,
            background: 'transparent',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            gap: 2,
          }}>
            <Button 
              onClick={() => setExportDialogOpen(false)}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                border: '1px solid rgba(0,0,0,0.1)',
                '&:hover': {
                  background: 'rgba(0,0,0,0.05)',
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExportConfirm} 
              variant="contained" 
              startIcon={<Download />}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                }
              }}
            >
              Export
            </Button>
          </DialogActions>
        </Dialog>

        {/* Time Tracking Dialog */}
        <Dialog 
          open={timeTrackingDialogOpen} 
          onClose={() => setTimeTrackingDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
            <Box sx={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              borderRadius: 2, 
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Timer sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Start Time Tracking
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Start a new time tracking session for your current work activity.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This will create a new time tracking entry in your activity log.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ 
            p: 4, 
            pt: 2,
            background: 'transparent',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            gap: 2,
          }}>
            <Button 
              onClick={() => setTimeTrackingDialogOpen(false)}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                border: '1px solid rgba(0,0,0,0.1)',
                '&:hover': {
                  background: 'rgba(0,0,0,0.05)',
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleTimeTrackingConfirm} 
              variant="contained" 
              startIcon={<Timer />}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                }
              }}
            >
              Start Tracking
            </Button>
          </DialogActions>
        </Dialog>

        {/* Task Creation Dialog */}
        <Dialog 
          open={taskDialogOpen} 
          onClose={() => setTaskDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
            <Box sx={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              borderRadius: 2, 
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Assignment sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Create New Task
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Create a new task to track your work activities and progress.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This will add a new task entry to your activity log.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ 
            p: 4, 
            pt: 2,
            background: 'transparent',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            gap: 2,
          }}>
            <Button 
              onClick={() => setTaskDialogOpen(false)}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                border: '1px solid rgba(0,0,0,0.1)',
                '&:hover': {
                  background: 'rgba(0,0,0,0.05)',
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleTaskCreationConfirm} 
              variant="contained" 
              startIcon={<Add />}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                }
              }}
            >
              Create Task
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Header Section */}
        <Box
          sx={{
            background: 'linear-gradient(45deg, #2196F3, #f50057)',
            color: 'white',
            py: { xs: 4, md: 6 },
          }}
        >
          <Container maxWidth="xl">
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Activity Log
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: '50px' }}>
                <IconButton 
                  onClick={handleToggleSort}
                  sx={{ color: 'white' }}
                >
                  <Sort />
                </IconButton>
                <Button
                  startIcon={<FilterList />}
                  variant={showFilters ? "contained" : "outlined"}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ 
                    bgcolor: showFilters ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                      borderColor: 'white',
                    }
                  }}
                >
                  Filters
                </Button>
              </Stack>
            </Stack>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Track and manage all your work activities
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Paper sx={{ mb: 3, p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {showFilters && (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Activity Type</InputLabel>
                      <Select
                        value={selectedType}
                        label="Activity Type"
                        onChange={(e) => setSelectedType(e.target.value)}
                      >
                        {filterOptions.types.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type === 'time_track' ? 'Time Tracking' : 
                              type.charAt(0).toUpperCase() + type.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={selectedStatus}
                        label="Status"
                        onChange={(e) => setSelectedStatus(e.target.value)}
                      >
                        {filterOptions.statuses.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Project</InputLabel>
                      <Select
                        value={selectedProject}
                        label="Project"
                        onChange={(e) => setSelectedProject(e.target.value)}
                      >
                        {filterOptions.projects.map((project) => (
                          <MenuItem key={project} value={project}>
                            {project}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>User</InputLabel>
                      <Select
                        value={selectedUser}
                        label="User"
                        onChange={(e) => setSelectedUser(e.target.value)}
                      >
                        {filterOptions.users.map((user) => (
                          <MenuItem key={user} value={user}>
                            {user}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={selectedTab} onChange={handleTabChange}>
              <Tab label="All Activities" icon={<FilterList />} iconPosition="start" />
              <Tab label="Today" icon={<Today />} iconPosition="start" />
              <Tab label="This Week" icon={<DateRange />} iconPosition="start" />
            </Tabs>
          </Box>
          
          <Card sx={{ borderRadius: 4, boxShadow: 4 }}>
            <CardContent>
              {activities.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Timer sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    No Activities Yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                    Start tracking your work activities, meetings, tasks, and time to build a comprehensive activity log.
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <Button 
                      variant="contained" 
                      startIcon={<Timer />}
                      onClick={handleStartTimeTracking}
                      sx={{ borderRadius: 2 }}
                    >
                      Start Time Tracking
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<Assignment />}
                      onClick={handleCreateTask}
                      sx={{ borderRadius: 2 }}
                    >
                      Create Task
                    </Button>
                  </Stack>
                </Box>
              ) : activities.filter(activity => {
                // Apply all current filters
                if (searchQuery) {
                  if (!activity.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
                      !activity.project.toLowerCase().includes(searchQuery.toLowerCase()) &&
                      !activity.user.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false;
                  }
                }
                if (selectedType !== 'All Types' && activity.type !== selectedType) return false;
                if (selectedStatus !== 'All Statuses' && activity.status !== selectedStatus) return false;
                if (selectedProject !== 'All Projects' && activity.project !== selectedProject) return false;
                if (selectedUser !== 'All Users' && activity.user !== selectedUser) return false;
                return true;
              }).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <FilterList sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No activities match your filters
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Try adjusting your search criteria or filters
                  </Typography>
                  <Button 
                    variant="outlined" 
                    onClick={handleClearAllFilters}
                    sx={{ borderRadius: 2 }}
                  >
                    Clear All Filters
                  </Button>
                </Box>
              ) : (
                <List>
                  {activities.filter(activity => {
                    // Apply all current filters
                    if (searchQuery) {
                      if (!activity.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
                          !activity.project.toLowerCase().includes(searchQuery.toLowerCase()) &&
                          !activity.user.toLowerCase().includes(searchQuery.toLowerCase())) {
                        return false;
                      }
                    }
                    if (selectedType !== 'All Types' && activity.type !== selectedType) return false;
                    if (selectedStatus !== 'All Statuses' && activity.status !== selectedStatus) return false;
                    if (selectedProject !== 'All Projects' && activity.project !== selectedProject) return false;
                    if (selectedUser !== 'All Users' && activity.user !== selectedUser) return false;
                    return true;
                  }).map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem
                        button
                        onClick={() => handleActivityClick(activity)}
                        sx={{ 
                          py: 2,
                          borderRadius: 2,
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <ListItemIcon>
                          {getActivityIcon(activity.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              {activity.description}
                            </Typography>
                          }
                          secondary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarToday sx={{ fontSize: 12, mr: 0.5 }} />
                                {activity.timestamp}
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                                <Work sx={{ fontSize: 12, mr: 0.5 }} />
                                {activity.project}
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                                <Person sx={{ fontSize: 12, mr: 0.5 }} />
                                {activity.user}
                              </Typography>
                            </Stack>
                          }
                        />
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={activity.type.replace('_', ' ')}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                          <Chip
                            label={activity.status}
                            size="small"
                            color={getStatusColor(activity.status) as any}
                          />
                        </Stack>
                      </ListItem>
                      {index < activities.filter(activity => {
                        // Apply all current filters
                        if (searchQuery) {
                          if (!activity.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
                              !activity.project.toLowerCase().includes(searchQuery.toLowerCase()) &&
                              !activity.user.toLowerCase().includes(searchQuery.toLowerCase())) {
                            return false;
                          }
                        }
                        if (selectedType !== 'All Types' && activity.type !== selectedType) return false;
                        if (selectedStatus !== 'All Statuses' && activity.status !== selectedStatus) return false;
                        if (selectedProject !== 'All Projects' && activity.project !== selectedProject) return false;
                        if (selectedUser !== 'All Users' && activity.user !== selectedUser) return false;
                        return true;
                      }).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default Activities; 