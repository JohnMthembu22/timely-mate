import React, { memo, startTransition, useCallback, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  Stack,
  Typography,
} from '@mui/material';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
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
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
  useNotifications,
  type NotificationItem,
} from '../../contexts/NotificationContext';
import { getNotificationRoute } from '../../utils/notificationNavigation';
const DISPLAY_LIMIT = 40;

const RingButton = styled(IconButton)({
  width: 46,
  height: 46,
  color: 'white',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.9)',
  background: 'rgba(0,0,0,0.35)',
});

const iconMap: Record<NotificationItem['type'], React.ReactElement> = {
  message: <MessageIcon fontSize="small" />,
  task: <AssignmentIcon fontSize="small" />,
  calendar: <EventIcon fontSize="small" />,
  timesheet: <AccessTimeIcon fontSize="small" />,
  procurement: <ShoppingCartIcon fontSize="small" />,
  hr: <PeopleIcon fontSize="small" />,
  system: <WarningIcon fontSize="small" />,
  employee: <PersonAddIcon fontSize="small" />,
  job: <WorkIcon fontSize="small" />,
  meeting: <MeetingRoomIcon fontSize="small" />,
  freelancer: <PersonAddIcon fontSize="small" />,
  leave: <EventAvailableIcon fontSize="small" />,
  team: <GroupIcon fontSize="small" />,
  project: <FolderIcon fontSize="small" />,
};

type NotificationsMenuProps = {
  isCompact?: boolean;
};

const NotificationsMenu: React.FC<NotificationsMenuProps> = memo(function NotificationsMenu({
  isCompact = false,
}) {
  const navigate = useNavigate();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const visible = notifications.slice(0, DISPLAY_LIMIT);
  const hasMore = notifications.length > DISPLAY_LIMIT;

  const handleToggle = (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(event.currentTarget);
    setOpen((v) => !v);
  };

  const handleClose = useCallback(() => {
    setOpen(false);
    setAnchor(null);
  }, []);

  const handleItemClick = useCallback(
    (notification: NotificationItem) => {
      if (!notification?.id) return;
      const route = getNotificationRoute(notification);

      if (!notification.read) {
        markAsRead(notification.id);
      }

      handleClose();

      if (route) {
        startTransition(() => navigate(route));
      }
    },
    [handleClose, markAsRead, navigate]
  );

  return (
    <>
      <Badge color="error" badgeContent={unreadCount} overlap="circular">
        <RingButton
          size={isCompact ? 'medium' : 'large'}
          onClick={handleToggle}
          aria-label="Open notifications"
          aria-expanded={open}
          aria-haspopup="true"
          sx={{
            width: { xs: 40, md: 46 },
            height: { xs: 40, md: 46 },
            border: open ? '1px solid #ff5a52' : '1px solid rgba(255,255,255,0.9)',
            background: open ? 'rgba(255,90,82,0.2)' : 'rgba(0,0,0,0.35)',
            flexShrink: 0,
          }}
        >
          <NotificationsNoneOutlined sx={{ fontSize: { xs: 20, md: 24 } }} />
        </RingButton>
      </Badge>

      <Menu
        anchorEl={anchor}
        open={open && Boolean(anchor)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableScrollLock
        PaperProps={{
          sx: {
            width: { xs: 'min(calc(100vw - 24px), 400px)', sm: 400 },
            maxHeight: 'min(70vh, 480px)',
            borderRadius: 3,
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.2)',
            background: '#fff',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            mt: 1,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              Notifications
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {unreadCount > 0 && (
                <Chip label={`${unreadCount} unread`} color="error" size="small" variant="outlined" />
              )}
              <Button size="small" onClick={markAllAsRead} disabled={unreadCount === 0}>
                Mark all read
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {visible.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List disablePadding dense>
              {visible.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    button
                    onClick={() => handleItemClick(notification)}
                    sx={{
                      backgroundColor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                      borderLeft: notification.read ? 'none' : '4px solid #1976d2',
                      '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.12)' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: notification.read ? 'grey.300' : 'primary.main',
                          color: 'white',
                        }}
                      >
                        {iconMap[notification.type] ?? <CheckCircleIcon fontSize="small" />}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.title}
                      secondary={notification.description}
                      primaryTypographyProps={{
                        fontWeight: notification.read ? 400 : 600,
                        noWrap: true,
                      }}
                      secondaryTypographyProps={{ noWrap: true }}
                    />
                  </ListItem>
                  {index < visible.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
          {hasMore && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2, py: 1 }}>
              Showing latest {DISPLAY_LIMIT} of {notifications.length}. Open Messages for the full list.
            </Typography>
          )}
        </Box>

        <Box sx={{ p: 2, pt: 1, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}>
          <Button
            onClick={() => {
              handleClose();
              startTransition(() => navigate('/messages'));
            }}
            variant="outlined"
            fullWidth
          >
            View all in Messages
          </Button>
        </Box>
      </Menu>
    </>
  );
});

export default NotificationsMenu;
