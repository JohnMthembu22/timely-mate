import React, { useEffect, useMemo, useState } from 'react';
import { 
  Box, 
  Badge, 
  Button, 
  IconButton, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Avatar,
  Stack,
  Paper,
  Menu,
  MenuItem,
  MenuList,
  Grid
} from '@mui/material';
import WatchLaterOutlined from '@mui/icons-material/WatchLaterOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Person from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GroupIcon from '@mui/icons-material/Group';
import FolderIcon from '@mui/icons-material/Folder';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HelpIcon from '@mui/icons-material/Help';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CircleIcon from '@mui/icons-material/Circle';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useNotifications, NotificationItem } from '../../contexts/NotificationContext';

const Glass = styled(Box)(({ theme }) => ({
  background: 'transparent !important',
  borderRadius: 12,
  padding: 8,
  boxShadow: 'none !important',
  border: 'none !important',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
}));

const Hollow = styled(Box)(({ theme }) => ({
  borderRadius: 12,
  padding: '8px 12px',
  border: '1px solid rgba(255,255,255,0.9)',
  background: 'rgba(0,0,0,0.35)',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: 'white',
}));

const RingButton = styled(IconButton)(({ theme }) => ({
  width: 46,
  height: 46,
  color: 'white',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.9)',
  background: 'rgba(0,0,0,0.35)',
}));

const ProfileCircle = styled(Box)(({ theme }) => ({
  width: 50,
  height: 50,
  borderRadius: '50%',
  background: '#11a63a',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(255,255,255,0.9)',
  boxShadow: '0 6px 16px rgba(0,0,0,0.35)'
}));

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

const FloatingStatusBar: React.FC = () => {
  const navigate = useNavigate();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  const [now, setNow] = useState(() => Date.now());
  const [isClockedIn, setIsClockedIn] = useState(() => {
    const clockInToday = localStorage.getItem('clockInToday');
    return clockInToday === new Date().toDateString();
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [userStatus, setUserStatus] = useState<string>(() => {
    return localStorage.getItem('userStatus') || 'available';
  });
  const [startTime, setStartTime] = useState(() => {
    const saved = localStorage.getItem('clockInTime');
    return saved ? new Date(saved).getTime() : Date.now();
  });
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [notificationDetailOpen, setNotificationDetailOpen] = useState(false);

  useEffect(() => {
    if (!isClockedIn) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isClockedIn]);

  const elapsed = useMemo(() => formatDuration((isClockedIn ? now : startTime) - startTime), [now, startTime, isClockedIn]);
  
  // Calculate countdown from 8 hours (28800 seconds)
  const countdown = useMemo(() => {
    if (!isClockedIn) return '08:00:00';
    const elapsedMs = now - startTime;
    const remainingMs = Math.max(0, (8 * 60 * 60 * 1000) - elapsedMs); // 8 hours in milliseconds
    return formatCountdown(remainingMs);
  }, [now, startTime, isClockedIn]);

  // Check if countdown is low (less than 1 hour remaining)
  const isLowTime = useMemo(() => {
    if (!isClockedIn) return false;
    const elapsedMs = now - startTime;
    const remainingMs = (8 * 60 * 60 * 1000) - elapsedMs;
    return remainingMs <= (60 * 60 * 1000); // Less than 1 hour
  }, [now, startTime, isClockedIn]);

  // User status options
  const userStatusOptions = [
    { value: 'available', label: 'Available', icon: <CheckCircleIcon />, color: '#4caf50' },
    { value: 'busy', label: 'Busy', icon: <DoNotDisturbIcon />, color: '#f44336' },
    { value: 'in-meeting', label: 'In a Meeting', icon: <MeetingRoomIcon />, color: '#ff9800' },
    { value: 'away', label: 'Away', icon: <ScheduleIcon />, color: '#ffc107' },
    { value: 'offline', label: 'Offline', icon: <RadioButtonUncheckedIcon />, color: '#9e9e9e' },
  ];

  // Get current status info
  const currentStatus = userStatusOptions.find(status => status.value === userStatus) || userStatusOptions[0];

  // Save user status to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userStatus', userStatus);
  }, [userStatus]);

  // Get icon for notification type
  const getNotificationIcon = (type: NotificationItem['type']) => {
    const iconMap = {
      message: <MessageIcon />,
      task: <AssignmentIcon />,
      calendar: <EventIcon />,
      timesheet: <AccessTimeIcon />,
      procurement: <ShoppingCartIcon />,
      hr: <PeopleIcon />,
      system: <WarningIcon />,
      employee: <PersonAddIcon />,
      job: <WorkIcon />,
      meeting: <MeetingRoomIcon />,
      freelancer: <PersonAddIcon />,
      leave: <EventAvailableIcon />,
      team: <GroupIcon />,
      project: <FolderIcon />,
    };
    return iconMap[type] || <CheckCircleIcon />;
  };

  // Get priority color
  const getPriorityColor = (priority?: NotificationItem['priority']) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    try {
      // Safety check to prevent crashes
      if (!notification || !notification.id) {
        console.error('Notification is null, undefined, or missing ID');
        return;
      }
      
      // Mark as read if not already read
      if (!notification.read && markAsRead) {
        markAsRead(notification.id);
      }
      
      // Set the selected notification and open detail view
      setSelectedNotification(notification);
      setNotificationDetailOpen(true);
      setNotificationsOpen(false);
    } catch (error) {
      console.error('Error handling notification click:', error);
      // Close notifications panel on error to prevent UI lockup
      setNotificationsOpen(false);
    }
  };

  const handleNotificationDetailClose = () => {
    setNotificationDetailOpen(false);
    setSelectedNotification(null);
  };

  const handleNavigateFromNotification = (notification: NotificationItem) => {
    // Close the detail view first
    handleNotificationDetailClose();
    
    // Navigate based on actionUrl or notification type
    if (notification.actionUrl) {
      // Navigate to specific URL if provided
      navigate(notification.actionUrl);
    } else {
      // Navigate based on notification type
      switch(notification.type) {
        case 'message':
          navigate('/messages');
          break;
        case 'task':
          navigate('/projects');
          break;
        case 'calendar':
          navigate('/calendar');
          break;
        case 'timesheet':
          navigate('/time-tracking');
          break;
        case 'procurement':
          navigate('/procurement');
          break;
        case 'hr':
          navigate('/hr');
          break;
        case 'employee':
          navigate('/team');
          break;
        case 'job':
          navigate('/projects');
          break;
        case 'meeting':
          navigate('/meetings');
          break;
        case 'freelancer':
          navigate('/freelancers');
          break;
        case 'leave':
          navigate('/hr');
          break;
        case 'team':
          navigate('/team');
          break;
        case 'project':
          navigate('/projects');
          break;
        case 'system':
        default:
          navigate('/messages');
          break;
      }
    }
  };

  const handleNotificationsToggle = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
    setUserMenuOpen(true);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
    setUserMenuOpen(false);
  };

  const handleUserMenuAction = (action: string) => {
    handleUserMenuClose();
    switch (action) {
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'help':
        navigate('/settings');
        break;
      case 'logout':
        // Handle logout logic here
        localStorage.clear();
        navigate('/login');
        break;
      default:
        break;
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setUserStatus(newStatus);
    handleUserMenuClose();
  };

  const handleClockButton = () => {
    if (isClockedIn) {
      setConfirmOpen(true);
    } else {
      // Clock in: start timer and set storage
      const nowDate = new Date();
      localStorage.setItem('clockInToday', nowDate.toDateString());
      localStorage.setItem('clockInTime', nowDate.toISOString());
      setStartTime(nowDate.getTime());
      setIsClockedIn(true);
      // Broadcast clock-in so dashboard can record it
      const evt = new CustomEvent('tm:clockIn', {
        detail: { clockInISO: nowDate.toISOString() }
      });
      console.log('FloatingStatusBar dispatching clock-in event:', evt.detail);
      window.dispatchEvent(evt);
    }
  };

  const confirmClockOut = () => {
    // Clock out: stop timer and clear storage
    setIsClockedIn(false);
    const clockOut = new Date();
    const clockInISO = localStorage.getItem('clockInTime');
    localStorage.removeItem('clockInToday');
    localStorage.removeItem('clockInTime');
    setConfirmOpen(false);
    // Broadcast clock-out so dashboard can finalize the record
    const evt = new CustomEvent('tm:clockOut', {
      detail: { clockInISO, clockOutISO: clockOut.toISOString() }
    });
    console.log('FloatingStatusBar dispatching clock-out event:', evt.detail);
    window.dispatchEvent(evt);
  };

  return (
    <>
    <Box
      sx={{
        position: 'fixed',
        top: { xs: 12, md: 16 },
        right: { xs: 12, md: 20 },
        zIndex: (theme) => theme.zIndex.appBar + 5,
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      <Hollow 
        onClick={() => navigate('/time-tracking')} 
        sx={{ 
          cursor: 'pointer',
          border: isLowTime ? '1px solid #ff5a52' : '1px solid rgba(255,255,255,0.9)',
          background: isLowTime ? 'rgba(255,90,82,0.2)' : 'rgba(0,0,0,0.35)'
        }}
      >
        <WatchLaterOutlined sx={{ color: isLowTime ? '#ff5a52' : 'white', opacity: 0.9, fontSize: 18 }} />
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: isLowTime ? '#ff5a52' : 'white', 
            letterSpacing: 2, 
            fontWeight: 700 
          }}
        >
          {countdown}
        </Typography>
      </Hollow>

      <Button
        variant="contained"
        endIcon={<ArrowForward />}
        sx={{
          px: 2.5,
          py: 1.25,
          fontWeight: 800,
          letterSpacing: 0.5,
          borderRadius: 10,
          textTransform: 'uppercase',
          fontSize: 13,
          border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: 'none',
          background: isClockedIn ? 'linear-gradient(135deg, #ff5a52, #e53935)' : 'rgba(255,255,255,1)',
          color: isClockedIn ? '#ffffff' : 'primary.main'
        }}
        onClick={handleClockButton}
      >
        {isClockedIn ? 'Clock Out' : 'Clock In'}
      </Button>

      <Badge color="error" badgeContent={unreadCount} overlap="circular">
        <RingButton 
          size="large" 
          onClick={handleNotificationsToggle} 
          aria-label="Open notifications"
          sx={{
            border: notificationsOpen ? '1px solid #ff5a52' : '1px solid rgba(255,255,255,0.9)',
            background: notificationsOpen ? 'rgba(255,90,82,0.2)' : 'rgba(0,0,0,0.35)'
          }}
        >
          <NotificationsNoneOutlined />
        </RingButton>
      </Badge>

      <ProfileCircle 
        onClick={handleUserMenuClick} 
        sx={{ 
          cursor: 'pointer',
          border: userMenuOpen ? '1px solid #ff5a52' : '1px solid rgba(255,255,255,0.9)',
          background: userMenuOpen ? '#ff5a52' : currentStatus.color,
          boxShadow: userMenuOpen ? '0 8px 20px rgba(255,90,82,0.4)' : `0 6px 16px ${currentStatus.color}40`
        }} 
        aria-label="Open user menu"
      >
        <Person />
      </ProfileCircle>
    </Box>
    <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle>Clock Out</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          Are you sure you want to clock out?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
        <Button variant="contained" color="error" onClick={confirmClockOut}>Clock Out</Button>
      </DialogActions>
    </Dialog>

    {/* Notifications Panel */}
    <Dialog 
      open={notificationsOpen} 
      onClose={() => setNotificationsOpen(false)} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          position: 'fixed',
          top: { xs: 80, md: 90 },
          right: { xs: 12, md: 20 },
          left: 'auto',
          bottom: 'auto',
          maxHeight: '70vh',
          borderRadius: 3,
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(255,255,255,0.95)',
        }
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {unreadCount > 0 && (
              <Chip 
                label={`${unreadCount} unread`} 
                color="error" 
                size="small" 
                variant="outlined"
              />
            )}
            <Button 
              size="small" 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all read
            </Button>
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {!notifications || notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: '50vh', overflow: 'auto' }}>
            {notifications.map((notification, index) => {
              // Safety check for each notification
              if (!notification || !notification.id) {
                console.warn('Invalid notification found at index:', index);
                return null;
              }
              
              return (
                <React.Fragment key={notification.id}>
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      backgroundColor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                      borderLeft: notification.read ? 'none' : '4px solid #1976d2',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.12)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          backgroundColor: notification.read ? 'grey.300' : 'primary.main',
                          color: 'white'
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: notification.read ? 400 : 600,
                              color: notification.read ? 'text.secondary' : 'text.primary'
                            }}
                          >
                            {notification.title || 'No Title'}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {notification.priority && (
                              <Chip 
                                label={notification.priority} 
                                color={getPriorityColor(notification.priority)}
                                size="small"
                                variant="outlined"
                              />
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {notification.time || 'Unknown time'}
                            </Typography>
                          </Stack>
                        </Stack>
                      }
                      secondary={
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {notification.description || 'No description'}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button 
          onClick={() => navigate('/messages')} 
          variant="outlined" 
          fullWidth
        >
          View All Messages
        </Button>
      </DialogActions>
    </Dialog>

    {/* User Menu Dropdown */}
    <Menu
      anchorEl={userMenuAnchor}
      open={userMenuOpen}
      onClose={handleUserMenuClose}
      PaperProps={{
        sx: {
          position: 'fixed',
          top: { xs: 80, md: 90 },
          right: { xs: 12, md: 20 },
          left: 'auto',
          bottom: 'auto',
          borderRadius: 3,
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(255,255,255,0.95)',
          minWidth: 200,
          mt: 1,
        }
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
    >
      <MenuList sx={{ p: 1 }}>
        {/* Current Status Display */}
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
            Current Status
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
            <Box sx={{ color: currentStatus.color }}>
              {currentStatus.icon}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {currentStatus.label}
            </Typography>
          </Stack>
        </Box>

        {/* Status Options */}
        <Box sx={{ px: 1, py: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, px: 1 }}>
            Set Status
          </Typography>
          {userStatusOptions.map((status) => (
            <MenuItem 
              key={status.value}
              onClick={() => handleStatusChange(status.value)} 
              sx={{ 
                borderRadius: 2, 
                mb: 0.5,
                backgroundColor: userStatus === status.value ? `${status.color}15` : 'transparent',
                '&:hover': {
                  backgroundColor: `${status.color}20`,
                }
              }}
            >
              <ListItemIcon sx={{ color: status.color }}>
                {status.icon}
              </ListItemIcon>
              <ListItemText 
                primary={status.label}
                sx={{ 
                  '& .MuiListItemText-primary': {
                    fontWeight: userStatus === status.value ? 600 : 400,
                    color: userStatus === status.value ? status.color : 'inherit'
                  }
                }}
              />
              {userStatus === status.value && (
                <CheckCircleIcon sx={{ color: status.color, fontSize: 20 }} />
              )}
            </MenuItem>
          ))}
        </Box>

        <Divider sx={{ my: 1 }} />
        
        {/* User Actions */}
        <MenuItem onClick={() => handleUserMenuAction('profile')} sx={{ borderRadius: 2, mb: 0.5 }}>
          <ListItemIcon>
            <AccountCircleIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        
        <MenuItem onClick={() => handleUserMenuAction('settings')} sx={{ borderRadius: 2, mb: 0.5 }}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        
        <MenuItem onClick={() => handleUserMenuAction('help')} sx={{ borderRadius: 2, mb: 0.5 }}>
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText primary="Help & Support" />
        </MenuItem>
        
        <Divider sx={{ my: 1 }} />
        
        <MenuItem onClick={() => handleUserMenuAction('logout')} sx={{ borderRadius: 2 }}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </MenuList>
    </Menu>

    {/* Notification Detail Dialog */}
    <Dialog
      open={notificationDetailOpen && !!selectedNotification}
      onClose={handleNotificationDetailClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      {selectedNotification && (
        <>
          <DialogTitle sx={{ 
            pb: 1,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Avatar sx={{ 
              bgcolor: 'primary.main',
              width: 40,
              height: 40
            }}>
              {getNotificationIcon(selectedNotification.type) || <MessageIcon />}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {selectedNotification?.title || 'No Title'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={(selectedNotification?.type || 'unknown').charAt(0).toUpperCase() + (selectedNotification?.type || 'unknown').slice(1)}
                size="small"
                  sx={{
                    height: 24,
                    fontSize: '0.75rem',
                    bgcolor: 'rgba(25, 118, 210, 0.08)',
                    color: 'primary.main',
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {selectedNotification?.time || 'Unknown time'}
                </Typography>
                {selectedNotification?.priority && (
                  <Chip
                    label={selectedNotification.priority.toUpperCase()}
                    size="small"
                    color={getPriorityColor(selectedNotification.priority) as any}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            </Box>
          </DialogTitle>
          
          <DialogContent sx={{ py: 3 }}>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
              {selectedNotification?.description || 'No description available'}
            </Typography>
            
            {/* Additional Details Section */}
            <Box sx={{ 
              bgcolor: 'grey.50', 
              p: 2, 
              borderRadius: 1,
              border: 1,
              borderColor: 'grey.200'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Notification Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {(selectedNotification?.type || 'unknown').charAt(0).toUpperCase() + (selectedNotification?.type || 'unknown').slice(1)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedNotification?.read ? 'Read' : 'Unread'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Received
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedNotification?.time || 'Unknown time'}
                  </Typography>
                </Grid>
                {selectedNotification?.priority && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Priority
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedNotification.priority.charAt(0).toUpperCase() + selectedNotification.priority.slice(1)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ 
            px: 3, 
            py: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            gap: 1
          }}>
            <Button
              onClick={handleNotificationDetailClose}
              variant="outlined"
              sx={{ minWidth: 100 }}
            >
              Close
            </Button>
            <Button
              onClick={() => selectedNotification && handleNavigateFromNotification(selectedNotification)}
              variant="contained"
              sx={{ minWidth: 120 }}
            >
              {selectedNotification?.actionUrl ? 'Go to Page' : 
               selectedNotification?.type === 'message' ? 'View Messages' :
               selectedNotification?.type === 'task' ? 'Go to Projects' :
               selectedNotification?.type === 'calendar' ? 'Go to Calendar' :
               selectedNotification?.type === 'timesheet' ? 'Go to Time Tracking' :
               selectedNotification?.type === 'procurement' ? 'Go to Procurement' :
               selectedNotification?.type === 'hr' ? 'Go to HR' :
               selectedNotification?.type === 'employee' ? 'Go to Team' :
               selectedNotification?.type === 'job' ? 'Go to Projects' :
               selectedNotification?.type === 'meeting' ? 'Go to Meetings' :
               selectedNotification?.type === 'freelancer' ? 'Go to Freelancers' :
               selectedNotification?.type === 'leave' ? 'Go to HR' :
               selectedNotification?.type === 'team' ? 'Go to Team' :
               selectedNotification?.type === 'project' ? 'Go to Projects' :
               'Take Action'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
    </>
  );
};

export default FloatingStatusBar;


