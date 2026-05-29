import React, { useState, useMemo, useEffect, useRef, useCallback, startTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Container,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Grid,
  Paper,
  IconButton,
  Stack,
  Divider,
  Badge,
  Tabs,
  Tab,
  Chip,
  Menu,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  SelectChangeEvent,
  Checkbox,
  ListItemIcon,
  ListItemSecondaryAction,
  CircularProgress,
} from '@mui/material';
import {
  SearchOutlined,
  Message,
  Person,
  PersonAdd,
  Close,
  Send,
  ArrowBack,
  Notifications as NotificationsIcon,
  FilterList,
  Delete,
  MarkEmailRead,
  Assignment,
  CalendarMonth,
  AccessTime,
  MoreVert,
  Sort,
  ArrowUpward,
  ArrowDownward,
  CheckCircle,
  ShoppingCart,
  Group as GroupIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import FeatureGuard from '../../components/FeatureGuard';
import { useNotifications, type NotificationItem } from '../../contexts/NotificationContext';
import { getNotificationRoute } from '../../utils/notificationNavigation';
import { compareNotifications } from '../../utils/notificationStorage';
import { messagingService, ChatMessage, ChatConversation } from '../../services/messagingService';
import { useEmployees } from '../../contexts/EmployeeContext';
import { useAppSelector } from '../../store';
import authService from '../../services/auth';

// Tab options for Messages page
enum MainTab {
  MESSAGES = 'messages',
  NOTIFICATIONS = 'notifications',
}

// Tab options for Notifications
enum NotificationTab {
  ALL = 'all',
  UNREAD = 'unread',
  READ = 'read',
}

// Icons for notification types
const notificationIcons = {
  message: <Person color="primary" />,
  task: <Assignment color="error" />,
  calendar: <CalendarMonth color="success" />,
  timesheet: <AccessTime color="info" />,
  procurement: <ShoppingCart color="warning" />,
  hr: <GroupIcon color="secondary" />,
  system: <NotificationsIcon color="action" />,
};

interface User {
  id: string;
  name: string;
  position?: string;
  department?: string;
  email: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
  avatar?: string;
}

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { employees } = useEmployees();
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [activeMainTab, setActiveMainTab] = useState<MainTab>(MainTab.MESSAGES);
  const [activeNotificationTab, setActiveNotificationTab] = useState<NotificationTab>(NotificationTab.ALL);
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [filterType, setFilterType] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [notificationDetailOpen, setNotificationDetailOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markManyAsRead,
    markAllAsRead,
    removeNotification,
    removeManyNotifications,
  } = useNotifications();

  // Get available users from employees and registered users
  const availableUsers = useMemo<User[]>(() => {
    const users: User[] = [];
    
    // Add employees
    employees.forEach(emp => {
      users.push({
        id: emp.id,
        name: emp.name,
        position: emp.position,
        department: emp.department,
        email: emp.email,
        status: 'online',
        avatar: emp.avatar,
      });
    });

    // Add registered users (excluding current user)
    const registeredUsers = authService.getAllRegisteredUsers();
    registeredUsers.forEach(user => {
      if (user.id !== currentUser?.id && !users.find(u => u.id === user.id)) {
        users.push({
          id: user.id,
          name: user.email.split('@')[0],
          email: user.email,
          status: 'online',
        });
      }
    });

    return users;
  }, [employees, currentUser?.id]);
  
  const filteredUsers = useMemo(() => 
    availableUsers.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.position && user.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery, availableUsers]);

  useEffect(() => {
    const onTourMessagesTab = () => setActiveMainTab(MainTab.MESSAGES);
    window.addEventListener('tm:tour:messages-tab', onTourMessagesTab);
    return () => window.removeEventListener('tm:tour:messages-tab', onTourMessagesTab);
  }, []);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      try {
        const convs = await messagingService.getConversations();
        setConversations(convs);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeMainTab === MainTab.MESSAGES) {
      loadConversations();
    }
  }, [activeMainTab]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (activeMainTab !== MainTab.MESSAGES) return;

    const unsubscribe = messagingService.subscribeToConversations((convs) => {
      setConversations(convs);
    });

    return () => {
      unsubscribe();
    };
  }, [activeMainTab]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!activeConversation) {
      setActiveMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const messages = await messagingService.getMessages(activeConversation.participant_id);
        setActiveMessages(messages);
        
        // Mark messages as read
        await messagingService.markAsRead(activeConversation.participant_id);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();

    // Subscribe to real-time messages
    const unsubscribe = messagingService.subscribeToMessages(
      activeConversation.participant_id,
      (message) => {
        setActiveMessages(prev => {
          // Avoid duplicates
          if (prev.find(m => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });

        // Mark as read if it's for current user
        if (message.recipient_id === currentUser?.id) {
          messagingService.markAsRead(activeConversation.participant_id);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activeConversation, currentUser?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((notification) => {
        if (activeNotificationTab === NotificationTab.UNREAD) return !notification.read;
        if (activeNotificationTab === NotificationTab.READ) return notification.read;
        return true;
      })
      .filter(
        (notification) => filterType.length === 0 || filterType.includes(notification.type)
      )
      .sort((a, b) => compareNotifications(a, b, sortOrder));
  }, [notifications, activeNotificationTab, filterType, sortOrder]);

  // Open conversation when navigated from Team (or other pages) with recipient state
  useEffect(() => {
    const state = location.state as { recipientEmail?: string; draft?: string } | null;
    if (!state?.recipientEmail || availableUsers.length === 0) return;
    const user = availableUsers.find((u) => u.email === state.recipientEmail);
    if (!user) return;
    setActiveMainTab(MainTab.MESSAGES);
    const existing = conversations.find((c) => c.participant_id === user.id);
    if (existing) {
      setActiveConversation(existing);
    } else {
      const newConversation: ChatConversation = {
        id: `conv-${user.id}`,
        participant_id: user.id,
        participant_name: user.name,
        participant_email: user.email,
        participant_avatar: user.avatar,
        unread_count: 0,
        last_activity: new Date().toISOString(),
      };
      setConversations((prev) => [...prev, newConversation]);
      setActiveConversation(newConversation);
    }
    if (state.draft) setNewMessage(state.draft);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, availableUsers, conversations, navigate]);

  const handleStartConversation = async (user: User) => {
    // Find existing conversation
    const existingConversation = conversations.find(
      conv => conv.participant_id === user.id
    );
    
    if (existingConversation) {
      setActiveConversation(existingConversation);
    } else {
      // Create new conversation
      const newConversation: ChatConversation = {
        id: `conv-${user.id}`,
        participant_id: user.id,
        participant_name: user.name,
        participant_email: user.email,
        participant_avatar: user.avatar,
        unread_count: 0,
        last_activity: new Date().toISOString(),
      };
      setConversations(prev => [...prev, newConversation]);
      setActiveConversation(newConversation);
    }
    
    setUserSearchOpen(false);
    setSearchQuery('');
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !currentUser?.id) return;

    const content = newMessage.trim();
    setNewMessage('');

    try {
      const message = await messagingService.sendMessage(
        activeConversation.participant_id,
        content
      );

      if (message) {
        setActiveMessages((prev) => [...prev, message]);
        const convs = await messagingService.getConversations();
        setConversations(convs);
        setActiveConversation((current) => {
          if (!current) return current;
          const refreshed = convs.find((c) => c.participant_id === current.participant_id);
          return refreshed || current;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
      setNewMessage(content);
    }
  };

  const handleConversationClick = (conversation: ChatConversation) => {
    setActiveConversation(conversation);
    // Messages will be loaded in useEffect
  };

  const handleNotificationTabChange = (_: React.SyntheticEvent, newValue: NotificationTab) => {
    setActiveNotificationTab(newValue);
  };

  const handleNotificationClick = useCallback(
    (notification: NotificationItem) => {
      if (!notification?.id) return;

      const route = getNotificationRoute(notification);

      if (!notification.read) {
        markAsRead(notification.id);
      }

      if (route) {
        if (route === '/messages' || route.startsWith('/messages')) {
          setActiveMainTab(MainTab.MESSAGES);
          return;
        }
        startTransition(() => navigate(route));
        return;
      }

      setSelectedNotification(notification);
      setNotificationDetailOpen(true);
    },
    [markAsRead, navigate]
  );

  const handleNotificationDetailClose = () => {
    setNotificationDetailOpen(false);
    setSelectedNotification(null);
  };

  const handleNavigateFromNotification = (notification: NotificationItem) => {
    handleNotificationDetailClose();
    const route = getNotificationRoute(notification);
    if (route) {
      if (route === '/messages' || route.startsWith('/messages')) {
        setActiveMainTab(MainTab.MESSAGES);
      } else {
        startTransition(() => navigate(route));
      }
    } else {
      setActiveMainTab(MainTab.MESSAGES);
    }
  };

  const handleSelectNotification = (event: React.ChangeEvent<HTMLInputElement>, id: number) => {
    setSelectedNotifications(prev => 
      event.target.checked
        ? [...prev, id]
        : prev.filter(notificationId => notificationId !== id)
    );
    event.stopPropagation();
  };

  const handleSelectAllNotifications = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterTypeChange = (event: SelectChangeEvent<string[]>) => {
    setFilterType(
      typeof event.target.value === 'string' 
        ? event.target.value.split(',') 
        : event.target.value
    );
  };

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortChange = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
    handleSortClose();
  };

  const markSelectedAsRead = () => {
    markManyAsRead(selectedNotifications);
    setSelectedNotifications([]);
  };

  const deleteSelected = () => {
    removeManyNotifications(selectedNotifications);
    setSelectedNotifications([]);
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online': return '#4caf50';
      case 'away': return '#ff9800';
      case 'busy': return '#f44336';
      case 'offline': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  return (
    <DashboardLayout>
      <FeatureGuard feature="messages">
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Header */}
        <Box sx={{ background: 'linear-gradient(45deg, #2196F3, #f50057)', color: 'white', py: 10 }}>
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Messages and Notifications
                  {activeMainTab === MainTab.NOTIFICATIONS && unreadCount > 0 && (
                    <Chip 
                      label={unreadCount} 
                      color="error" 
                      size="small" 
                      sx={{ ml: 1, height: 20, fontSize: '0.75rem', bgcolor: 'rgba(255, 255, 255, 0.3)' }} 
                    />
                  )}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Chat with your team members and stay updated with notifications
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: '35px' }}>
                {activeMainTab === MainTab.MESSAGES && (
              <Button
                data-tour="new-message"
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => setUserSearchOpen(true)}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              >
                New Message
              </Button>
                )}
                {activeMainTab === MainTab.NOTIFICATIONS && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<FilterList />}
                      onClick={handleFilterClick}
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.1)', 
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                        borderRadius: 2 
                      }}
                    >
                      Filter
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Sort />}
                      onClick={handleSortClick}
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.1)', 
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                        borderRadius: 2 
                      }}
                    >
                      Sort
                    </Button>
                    {selectedNotifications.length > 0 && (
                      <>
                        <Button 
                          startIcon={<MarkEmailRead />} 
                          onClick={markSelectedAsRead}
                          variant="contained"
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(255, 255, 255, 0.2)', 
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.3)',
                            },
                            borderRadius: 2 
                          }}
                        >
                          Mark as read
                        </Button>
                        <Button 
                          startIcon={<Delete />} 
                          onClick={deleteSelected}
                          variant="contained"
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(255, 0, 0, 0.5)', 
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'rgba(255, 0, 0, 0.7)',
                            },
                            borderRadius: 2 
                          }}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </>
                )}
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ mt: -4, mb: 4 }}>
          <Card sx={{ borderRadius: 4, overflow: 'visible', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
            {/* Main Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 3 }}>
              <Tabs 
                value={activeMainTab} 
                onChange={(_, newValue) => setActiveMainTab(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    fontWeight: 500,
                    fontSize: '1rem',
                    textTransform: 'none',
                    minWidth: 120
                  }
                }}
              >
                <Tab 
                  label={`Messages`} 
                  value={MainTab.MESSAGES}
                  icon={<Message />}
                  iconPosition="start"
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      Notifications
                      {unreadCount > 0 && (
                        <Chip 
                          label={unreadCount} 
                          color="error" 
                          size="small" 
                          sx={{ height: 18, fontSize: '0.7rem' }} 
                        />
                      )}
                    </Box>
                  } 
                  value={MainTab.NOTIFICATIONS}
                  icon={<NotificationsIcon />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Tab Content */}
            {activeMainTab === MainTab.MESSAGES ? (
              // Messages Content (existing implementation)
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3} sx={{ minHeight: 'calc(100vh - 300px)' }}>
            {/* Conversations List */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Conversations Header */}
                  <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.50' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Your Conversations</Typography>
                  </Box>

                  {/* Conversations */}
                  <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                    {conversations.length === 0 ? (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Message sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No conversations yet
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                          Start a conversation with a team member
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<PersonAdd />}
                          onClick={() => setUserSearchOpen(true)}
                        >
                          Find Someone to Message
                        </Button>
                      </Box>
                    ) : loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <List sx={{ p: 0 }}>
                        {conversations.map((conversation) => (
                          <ListItem 
                            key={conversation.id}
                            button
                            onClick={() => handleConversationClick(conversation)}
                            selected={activeConversation?.id === conversation.id}
                            sx={{
                              '&.Mui-selected': {
                                bgcolor: 'primary.50',
                                borderRight: 3,
                                borderColor: 'primary.main',
                              },
                            }}
                          >
                            <ListItemAvatar>
                              <Badge
                                badgeContent={conversation.unread_count}
                                color="error"
                                max={99}
                              >
                                <Avatar src={conversation.participant_avatar}>
                                  {conversation.participant_name.charAt(0)}
                                </Avatar>
                              </Badge>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {conversation.participant_name}
                                  </Typography>
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      bgcolor: '#4caf50', // Default to online
                                    }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary" noWrap>
                                    {conversation.last_message?.content || 'Start a conversation'}
                                  </Typography>
                                  {conversation.last_message && (
                                    <Typography variant="caption" color="text.disabled">
                                      {new Date(conversation.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                </Box>
              </Card>
            </Grid>

            {/* Chat Area */}
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%', borderRadius: 4, overflow: 'hidden' }}>
                {activeConversation ? (
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Chat Header */}
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                          onClick={() => setActiveConversation(null)}
                          sx={{ display: { md: 'none' } }}
                        >
                          <ArrowBack />
                        </IconButton>
                        <Avatar src={activeConversation.participant_avatar}>
                          {activeConversation.participant_name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {activeConversation.participant_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activeConversation.participant_email}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Messages */}
                    <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                      {loadingMessages ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                          <CircularProgress />
                        </Box>
                      ) : activeMessages.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <Typography variant="body1" color="text.secondary">
                            Send your first message to {activeConversation.participant_name}
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={1}>
                          {activeMessages.map((message) => {
                            const isOwnMessage = message.sender_id === currentUser?.id;
                            return (
                              <Box
                                key={message.id}
                                sx={{
                                  display: 'flex',
                                  justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                                }}
                              >
                                <Paper
                                  sx={{
                                    p: 1.5,
                                    maxWidth: '70%',
                                    bgcolor: isOwnMessage ? 'primary.main' : 'grey.100',
                                    color: isOwnMessage ? 'white' : 'text.primary',
                                    borderRadius: 2,
                                  }}
                                >
                                  <Typography variant="body1">{message.content}</Typography>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      opacity: 0.7,
                                      display: 'block',
                                      textAlign: 'right',
                                      mt: 0.5,
                                    }}
                                  >
                                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {message.read_at && isOwnMessage && ' ✓'}
                                  </Typography>
                                </Paper>
                              </Box>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </Stack>
                      )}
                    </Box>

                    {/* Message Input */}
                    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                      <Stack direction="row" spacing={1} alignItems="flex-end">
                        <TextField
                          id="message-input"
                          name="message"
                          fullWidth
                          multiline
                          maxRows={4}
                          placeholder={`Message ${activeConversation.participant_name}...`}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          variant="outlined"
                          size="small"
                          aria-label={`Message ${activeConversation.participant_name}`}
                        />
                        <IconButton 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          color="primary"
                          sx={{ mb: 0.5 }}
                        >
                          <Send />
                        </IconButton>
                      </Stack>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    textAlign: 'center',
                    p: 4,
                  }}>
                    <Box>
                      <Message sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h5" gutterBottom>Welcome to Messages</Typography>
                      <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Select a conversation to start messaging
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<PersonAdd />}
                        onClick={() => setUserSearchOpen(true)}
                      >
                        Start New Conversation
                      </Button>
                    </Box>
                  </Box>
                )}
              </Card>
            </Grid>
          </Grid>
              </Box>
            ) : (
              // Notifications Content
              <Box sx={{ p: 3 }}>
                {/* Filter and Sort Menus */}
                <Menu
                  anchorEl={filterAnchorEl}
                  open={Boolean(filterAnchorEl)}
                  onClose={handleFilterClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{ sx: { width: 200, mt: 0.5 } }}
                >
                  <Box sx={{ p: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="notification-type-label">Type</InputLabel>
                      <Select
                        labelId="notification-type-label"
                        multiple
                        value={filterType}
                        onChange={handleFilterTypeChange}
                        label="Type"
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip 
                                key={value} 
                                label={value.charAt(0).toUpperCase() + value.slice(1)} 
                                size="small" 
                              />
                            ))}
                          </Box>
                        )}
                      >
                        <MenuItem value="message">Messages</MenuItem>
                        <MenuItem value="task">Tasks</MenuItem>
                        <MenuItem value="calendar">Calendar</MenuItem>
                        <MenuItem value="timesheet">Timesheet</MenuItem>
                        <MenuItem value="procurement">Procurement</MenuItem>
                        <MenuItem value="hr">HR</MenuItem>
                        <MenuItem value="system">System</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Divider />
                  <MenuItem onClick={() => { setFilterType([]); handleFilterClose(); }}>
                    Clear Filters
                  </MenuItem>
                </Menu>

                <Menu
                  anchorEl={sortAnchorEl}
                  open={Boolean(sortAnchorEl)}
                  onClose={handleSortClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{ sx: { width: 150, mt: 0.5 } }}
                >
                  <MenuItem onClick={() => handleSortChange('newest')}>
                    <ListItemIcon>
                      <ArrowDownward fontSize="small" />
                    </ListItemIcon>
                    Newest First
                  </MenuItem>
                  <MenuItem onClick={() => handleSortChange('oldest')}>
                    <ListItemIcon>
                      <ArrowUpward fontSize="small" />
                    </ListItemIcon>
                    Oldest First
                  </MenuItem>
                </Menu>
                
                {/* Notification Tabs */}
                <Tabs 
                  value={activeNotificationTab} 
                  onChange={handleNotificationTabChange}
                  sx={{ 
                    mb: 3, 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    '& .MuiTab-root': {
                      fontWeight: 500,
                      fontSize: '0.9rem',
                      textTransform: 'none',
                      minWidth: 100
                    } 
                  }}
                >
                  <Tab label={`All (${notifications.length})`} value={NotificationTab.ALL} />
                  <Tab label={`Unread (${unreadCount})`} value={NotificationTab.UNREAD} />
                  <Tab label={`Read (${notifications.length - unreadCount})`} value={NotificationTab.READ} />
                </Tabs>
                
                {/* Notifications List */}
                {filteredNotifications.length > 0 ? (
                  <List sx={{ 
                    width: '100%',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: '0 0 5px rgba(0,0,0,0.03)'
                  }}>
                    <ListItem sx={{ px: 2, py: 1 }}>
                      <Checkbox
                        edge="start"
                        onChange={handleSelectAllNotifications}
                        checked={
                          filteredNotifications.length > 0 && 
                          selectedNotifications.length === filteredNotifications.length
                        }
                        indeterminate={
                          selectedNotifications.length > 0 && 
                          selectedNotifications.length < filteredNotifications.length
                        }
                        sx={{ color: 'primary.light' }}
                      />
                      <ListItemText 
                        primary={
                          <Typography variant="body2" color="text.secondary">
                            {selectedNotifications.length > 0 
                              ? `${selectedNotifications.length} selected` 
                              : 'Select all'}
                          </Typography>
                        } 
                      />
                    </ListItem>
                    
                    <Divider />
                    
                    {filteredNotifications.map((notification) => (
                        <React.Fragment key={notification.id}>
                            <ListItem 
                              alignItems="flex-start"
                              onClick={() => handleNotificationClick(notification)}
                              sx={{ 
                                py: 2,
                                px: 2,
                                cursor: 'pointer',
                                '&:hover': { 
                                  bgcolor: 'rgba(25, 118, 210, 0.08)',
                                },
                                bgcolor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.04)',
                                borderLeft: notification.read ? 'none' : '3px solid #1976d2',
                                ...(selectedNotifications.includes(notification.id) && {
                                  bgcolor: 'rgba(25, 118, 210, 0.1)',
                                  borderLeft: '3px solid #1976d2',
                                }),
                              }}
                            >
                          <Checkbox
                            edge="start"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={(e) => handleSelectNotification(e, notification.id)}
                            onClick={(e) => e.stopPropagation()}
                            sx={{ mr: 1, color: 'primary.light' }}
                          />
                          
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'background.default', boxShadow: '0 0 2px rgba(0,0,0,0.1)' }}>
                              {notification.icon || notificationIcons[notification.type as keyof typeof notificationIcons]}
                            </Avatar>
                          </ListItemAvatar>
                          
                          <ListItemText
                            primary={
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  fontWeight: notification.read ? 'normal' : '500',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  color: 'text.primary'
                                }}
                              >
                                {notification.title}
                                {!notification.read && (
                                  <Box
                                    component="span"
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      bgcolor: 'primary.main',
                                      borderRadius: '50%',
                                      display: 'inline-block',
                                    }}
                                  />
                                )}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ display: 'block', mb: 0.5, mt: 0.5 }}
                                >
                                  {notification.description}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip
                                    label={notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.7rem',
                                      borderRadius: 1,
                                      bgcolor: 
                                        notification.type === 'message' ? 'rgba(33, 150, 243, 0.08)' : 
                                        notification.type === 'task' ? 'rgba(244, 67, 54, 0.08)' :
                                        notification.type === 'calendar' ? 'rgba(76, 175, 80, 0.08)' : 
                                        notification.type === 'timesheet' ? 'rgba(3, 169, 244, 0.08)' :
                                        notification.type === 'procurement' ? 'rgba(255, 152, 0, 0.08)' :
                                        notification.type === 'hr' ? 'rgba(156, 39, 176, 0.08)' : 'rgba(158, 158, 158, 0.08)',
                                      color: 
                                        notification.type === 'message' ? 'primary.main' : 
                                        notification.type === 'task' ? 'error.main' :
                                        notification.type === 'calendar' ? 'success.main' : 
                                        notification.type === 'timesheet' ? 'info.main' :
                                        notification.type === 'procurement' ? 'warning.main' :
                                        notification.type === 'hr' ? 'secondary.main' : 'text.secondary',
                                    }}
                                  />
                                  <Typography component="span" variant="caption" color="text.secondary">
                                    {notification.time}
                                  </Typography>
                                </Box>
                              </>
                            }
                          />
                          
                          <ListItemSecondaryAction>
                            <IconButton 
                              edge="end" 
                              size="small" 
                              onClick={(e) => e.stopPropagation()}
                              sx={{ color: 'text.secondary', opacity: 0.7 }}
                            >
                              <MoreVert fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ 
                    py: 8, 
                    textAlign: 'center', 
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: '0 0 5px rgba(0,0,0,0.03)'
                  }}>
                    <CheckCircle sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'normal' }}>
                      {filterType.length > 0 
                        ? 'No notifications match your filters' 
                        : activeNotificationTab === NotificationTab.UNREAD 
                          ? "You're all caught up!" 
                          : 'No notifications to display'}
                    </Typography>
                    {filterType.length > 0 && (
                      <Button 
                        variant="text" 
                        color="primary" 
                        sx={{ mt: 2 }}
                        onClick={() => setFilterType([])}
                      >
                        Clear filters
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Card>
        </Container>

        {/* User Search Dialog */}
        <Dialog 
          open={userSearchOpen} 
          onClose={() => setUserSearchOpen(false)} 
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
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 2, 
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Person sx={{ fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Start New Conversation
              </Typography>
            </Box>
            <Button 
              onClick={() => setUserSearchOpen(false)} 
              sx={{ 
                color: 'white', 
                minWidth: 'auto',
                borderRadius: 2,
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <Close />
            </Button>
          </DialogTitle>
          
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 3 }}>
              <TextField
                id="user-search"
                name="userSearch"
                fullWidth
                placeholder="Search by name, position, department, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment> }}
                aria-label="Search users"
              />
            </Box>
            
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {filteredUsers.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Person sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    {searchQuery ? 'No users found' : 'Search for users'}
                  </Typography>
                </Box>
              ) : (
                filteredUsers.map((user) => (
                  <ListItem key={user.id} button onClick={() => handleStartConversation(user)}>
                    <ListItemAvatar>
                      <Avatar>{user.name.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">{user.name}</Typography>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: getStatusColor(user.status),
                            }}
                          />
                        </Box>
                      }
                      secondary={`${user.position} • ${user.department} • ${user.email}`}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </DialogContent>
        </Dialog>
      </Box>
      </FeatureGuard>

      {/* Notification Detail Dialog */}
      <Dialog
        open={notificationDetailOpen}
        onClose={handleNotificationDetailClose}
        maxWidth="md"
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
        {selectedNotification && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: 2, 
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {selectedNotification.icon || notificationIcons[selectedNotification.type as keyof typeof notificationIcons] || <Message sx={{ fontSize: 24 }} />}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {selectedNotification.title || 'No Title'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={(selectedNotification.type || 'unknown').charAt(0).toUpperCase() + (selectedNotification.type || 'unknown').slice(1)}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.75rem',
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: 500,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {selectedNotification.time}
                  </Typography>
                  {selectedNotification.priority && (
                    <Chip
                      label={selectedNotification.priority.toUpperCase()}
                      size="small"
                      sx={{ 
                        height: 20, 
                        fontSize: '0.7rem',
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 500,
                      }}
                    />
                  )}
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ py: 3 }}>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                {selectedNotification.description || 'No description available'}
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
                      {selectedNotification.type.charAt(0).toUpperCase() + selectedNotification.type.slice(1)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedNotification.read ? 'Read' : 'Unread'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Received
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedNotification.time}
                    </Typography>
                  </Grid>
                  {selectedNotification.priority && (
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
                onClick={() => handleNavigateFromNotification(selectedNotification)}
                variant="contained"
                sx={{ minWidth: 120 }}
              >
                {selectedNotification.actionUrl ? 'Go to Page' : 
                 selectedNotification.type === 'message' ? 'View Messages' :
                 selectedNotification.type === 'task' ? 'Go to Projects' :
                 selectedNotification.type === 'calendar' ? 'Go to Calendar' :
                 selectedNotification.type === 'timesheet' ? 'Go to Time Tracking' :
                 selectedNotification.type === 'procurement' ? 'Go to Procurement' :
                 selectedNotification.type === 'hr' ? 'Go to HR' :
                 selectedNotification.type === 'employee' ? 'Go to Team' :
                 selectedNotification.type === 'job' ? 'Go to Projects' :
                 selectedNotification.type === 'meeting' ? 'Go to Meetings' :
                 selectedNotification.type === 'freelancer' ? 'Go to Freelancers' :
                 selectedNotification.type === 'leave' ? 'Go to HR' :
                 selectedNotification.type === 'team' ? 'Go to Team' :
                 selectedNotification.type === 'project' ? 'Go to Projects' :
                 'Take Action'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DashboardLayout>
  );
};

export default Messages;
