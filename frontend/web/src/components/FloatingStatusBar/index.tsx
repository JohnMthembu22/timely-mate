import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stack,
  Menu,
  MenuItem,
  MenuList,
} from '@mui/material';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Person from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HelpIcon from '@mui/icons-material/Help';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CircleIcon from '@mui/icons-material/Circle';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { performAppLogout } from '../../utils/authSession';
import TourGuideButton from '../TourGuideButton';
import StatusBarCountdown from './StatusBarCountdown';
import NotificationsMenu from './NotificationsMenu';

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

interface FloatingStatusBarProps {
  /** Renders inside the mobile dashboard app bar (not fixed below it). */
  embedded?: boolean;
  /** Offset from top when dashboard mobile app bar is visible */
  mobileAppBarOffset?: number;
}

const FloatingStatusBar: React.FC<FloatingStatusBarProps> = ({
  embedded = false,
  mobileAppBarOffset = 0,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    await performAppLogout(dispatch, navigate);
  };
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isCompact = useMediaQuery(theme.breakpoints.down('sm'));
  const [isClockedIn, setIsClockedIn] = useState(() => {
    const clockInToday = localStorage.getItem('clockInToday');
    return clockInToday === new Date().toDateString();
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [userStatus, setUserStatus] = useState<string>(() => {
    return localStorage.getItem('userStatus') || 'available';
  });
  const [startTime, setStartTime] = useState(() => {
    const saved = localStorage.getItem('clockInTime');
    return saved ? new Date(saved).getTime() : Date.now();
  });
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
        window.dispatchEvent(new CustomEvent('tm:startTour'));
        break;
      case 'logout':
        void handleLogout();
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

  const statusControls = (
    <>
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <StatusBarCountdown
          isClockedIn={isClockedIn}
          startTime={startTime}
          onClick={() => navigate('/time-tracking')}
          sx={{
            border: '1px solid rgba(255,255,255,0.9)',
            background: 'rgba(0,0,0,0.35)',
            py: { xs: 0.75, md: 1 },
            px: { xs: 1, md: 1.5 },
          }}
        />
      </Box>

      {!embedded && <TourGuideButton variant="button" size="small" />}

      <Button
        data-tour="status-clock-in"
        variant="contained"
        endIcon={isCompact && !embedded ? undefined : embedded || isCompact ? undefined : <ArrowForward />}
        sx={{
          px: embedded ? 1 : { xs: 1.25, sm: 2, md: 2.5 },
          py: embedded ? 0.5 : { xs: 0.75, md: 1.25 },
          minWidth: { xs: 'auto', sm: embedded ? 'auto' : 100 },
          minHeight: embedded ? 36 : undefined,
          fontWeight: 800,
          letterSpacing: 0.5,
          borderRadius: embedded ? 2 : { xs: 2, md: 10 },
          textTransform: 'uppercase',
          fontSize: embedded ? 9 : { xs: 10, sm: 11, md: 13 },
          border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: 'none',
          background: isClockedIn ? 'linear-gradient(135deg, #ff5a52, #e53935)' : 'rgba(255,255,255,1)',
          color: isClockedIn ? '#ffffff' : 'primary.main',
          flexShrink: 0,
        }}
        onClick={handleClockButton}
      >
        {embedded || isCompact ? (isClockedIn ? 'Out' : 'In') : isClockedIn ? 'Clock Out' : 'Clock In'}
      </Button>

      <NotificationsMenu isCompact={embedded || isCompact} />

      <ProfileCircle
        onClick={handleUserMenuClick}
        sx={{
          cursor: 'pointer',
          width: embedded ? 36 : { xs: 40, md: 50 },
          height: embedded ? 36 : { xs: 40, md: 50 },
          flexShrink: 0,
          border: userMenuOpen ? '1px solid #ff5a52' : '1px solid rgba(255,255,255,0.9)',
          background: userMenuOpen ? '#ff5a52' : currentStatus.color,
          boxShadow: userMenuOpen ? '0 8px 20px rgba(255,90,82,0.4)' : `0 6px 16px ${currentStatus.color}40`,
        }}
        aria-label="Open user menu"
      >
        <Person sx={{ fontSize: embedded ? 18 : { xs: 20, md: 24 } }} />
      </ProfileCircle>
    </>
  );

  return (
    <>
    <Box
      sx={
        embedded
          ? {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              flexWrap: 'nowrap',
              gap: 0.5,
              flexShrink: 0,
              minWidth: 0,
            }
          : {
              position: 'fixed',
              top: isMobile ? mobileAppBarOffset + 8 : 16,
              right: { xs: 8, sm: 12, md: 20 },
              left: 'auto',
              maxWidth: isMobile ? 'calc(100vw - 72px)' : 'none',
              zIndex: (t) => t.zIndex.appBar + 5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              flexWrap: 'nowrap',
              gap: { xs: 0.5, sm: 1, md: 2 },
            }
      }
    >
      {statusControls}
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

    {/* User Menu Dropdown */}
    <Menu
      anchorEl={userMenuAnchor}
      open={userMenuOpen}
      onClose={handleUserMenuClose}
      PaperProps={{
        sx: {
          position: 'fixed',
          top: isMobile ? mobileAppBarOffset + 52 : 90,
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
    </>
  );
};

export default FloatingStatusBar;


