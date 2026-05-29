import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Stack,
  useTheme,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemButton,
  Avatar,
  AvatarGroup,
  Badge,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  LocationOn,
  VideoCall,
  Group,
  Add,
  Edit,
  Delete,
  CheckCircle,
  PendingActions,
  Person,
  Event,
  EventAvailable,
  EventBusy,
  EventNote,
  Link,
  Search,
  ContentCopy,
  Videocam as VideocamIcon,
  People,
  Attachment,
  Notes,
  LowPriority,
  ExpandMore,
  Settings,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import VideoChat from '../../components/VideoChat';
import FeatureGuard from '../../components/FeatureGuard';
import {
  popupFormLabelSx,
  popupDialogAdornedFieldSx,
  popupDialogMultilineFieldSx,
} from '../../theme/popupSurfaces';
import { v4 as uuidv4 } from 'uuid';

const meetingFieldIconBoxSx = {
  p: 1,
  borderRadius: 1.5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
} as const;

function FieldLabelWithIcon({
  icon,
  label,
  required,
  fieldId,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  fieldId: string;
}) {
  return (
    <Box
      component="label"
      htmlFor={fieldId}
      sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, cursor: 'pointer' }}
    >
      {icon}
      <Typography component="span" sx={{ ...popupFormLabelSx, mb: 0 }}>
        {label}
        {required ? ' *' : ''}
      </Typography>
    </Box>
  );
}

// Interface definitions for type safety
interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  isVirtual: boolean;
  status: 'upcoming' | 'completed' | 'cancelled';
  participants: string[];
  agenda?: string;
  priority?: string;
  attachments?: MeetingAttachment[];
}

interface MeetingAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  department?: string;
}

const Meetings: React.FC = () => {
  const theme = useTheme();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [teamMembers] = useState<TeamMember[]>([]);
  const [newMeetingDialogOpen, setNewMeetingDialogOpen] = useState(false);
  const [editMeetingDialogOpen, setEditMeetingDialogOpen] = useState(false);
  const [attendeesDialogOpen, setAttendeesDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [videoChatOpen, setVideoChatOpen] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    isVirtual: false,
    participants: [] as string[],
    agenda: '',
    priority: 'medium',
    attachments: [] as MeetingAttachment[],
  });
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  // Filter and search meetings
  const filteredMeetings = meetings.filter(meeting => {
    const matchesStatus = filterStatus === 'all' || meeting.status === filterStatus;
    const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meeting.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleAddNewMeeting = () => {
    if (newMeeting.title && newMeeting.date && newMeeting.startTime) {
      const meetingId = (meetings.length + 1).toString();
      
      const meetingToAdd = {
        id: meetingId,
        title: newMeeting.title,
        description: newMeeting.description,
        date: newMeeting.date,
        startTime: newMeeting.startTime,
        endTime: newMeeting.endTime || '',
        location: newMeeting.location || 'TBD',
        isVirtual: newMeeting.isVirtual,
        status: 'upcoming' as const,
        participants: newMeeting.participants,
        agenda: newMeeting.agenda,
        priority: newMeeting.priority,
        attachments: newMeeting.attachments || [],
      };

      setMeetings([...meetings, meetingToAdd]);
      setNewMeetingDialogOpen(false);
      setNewMeeting({ 
        title: '', 
        description: '', 
        date: '', 
        startTime: '', 
        endTime: '', 
        location: '', 
        isVirtual: false, 
        participants: [],
        agenda: '',
        priority: 'medium',
        attachments: [],
      });
    }
  };

  const handleAddAttendee = (memberId: string) => {
    if (!newMeeting.participants.includes(memberId)) {
      setNewMeeting(prev => ({
        ...prev,
        participants: [...prev.participants, memberId]
      }));
    }
  };

  const handleRemoveAttendee = (memberId: string) => {
    setNewMeeting(prev => ({
      ...prev,
      participants: prev.participants.filter(id => id !== memberId)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAttachments: MeetingAttachment[] = Array.from(files).map(file => ({
        id: uuidv4(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
      }));

      setNewMeeting(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments]
      }));

      setSnackbarMessage(`${files.length} file(s) uploaded successfully!`);
      setSnackbarOpen(true);
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setNewMeeting(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }));
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setEditMeetingDialogOpen(true);
  };

  const handleSaveMeetingEdit = () => {
    if (editingMeeting) {
      setMeetings(prevMeetings =>
        prevMeetings.map(meeting =>
          meeting.id === editingMeeting.id ? editingMeeting : meeting
        )
      );
      setEditMeetingDialogOpen(false);
      setEditingMeeting(null);
    }
  };

  const handleDeleteMeeting = (meetingId: string) => {
    setMeetings(prevMeetings => prevMeetings.filter(meeting => meeting.id !== meetingId));
  };

  const handleMeetingStatusChange = (meetingId: string, newStatus: 'upcoming' | 'completed' | 'cancelled') => {
    setMeetings(prevMeetings =>
      prevMeetings.map(meeting =>
        meeting.id === meetingId ? { ...meeting, status: newStatus } : meeting
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <EventAvailable />;
      case 'completed':
        return <CheckCircle />;
      case 'cancelled':
        return <EventBusy />;
      default:
        return <EventNote />;
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Video chat handlers
  const handleStartVideoCall = (meetingId: string) => {
    setCurrentRoomId(meetingId);
    setVideoChatOpen(true);
  };

  const handleJoinVideoCall = (meetingId: string) => {
    setCurrentRoomId(meetingId);
    setVideoChatOpen(true);
  };

  const handleCloseVideoChat = () => {
    setVideoChatOpen(false);
    setCurrentRoomId('');
  };

  // Copy meeting link
  const handleCopyMeetingLink = (meetingId: string) => {
    const meetingLink = `${window.location.origin}/meetings/join/${meetingId}`;
    navigator.clipboard.writeText(meetingLink);
    setSnackbarOpen(true);
    setSnackbarMessage('Meeting link copied to clipboard');
  };

  return (
    <DashboardLayout>
      <FeatureGuard feature="meetings">
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Header */}
        <Box
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: 'white',
            py: { xs: 4, md: 6 },
          }}
        >
          <Container maxWidth="xl">
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
              Meetings
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Schedule and manage your team meetings
            </Typography>
          </Container>
        </Box>

        {/* Meetings Section */}
        <Container maxWidth="xl" sx={{ py: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4">
              All Meetings
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />}
              sx={{ borderRadius: 2 }}
              onClick={() => setNewMeetingDialogOpen(true)}
            >
              Schedule Meeting
            </Button>
          </Box>

          {/* Meeting Statistics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, bgcolor: 'primary.light', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {meetings.filter(m => m.status === 'upcoming').length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Upcoming Meetings
                      </Typography>
                    </Box>
                    <EventAvailable sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, bgcolor: 'success.light', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {meetings.filter(m => m.status === 'completed').length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Completed
                      </Typography>
                    </Box>
                    <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, bgcolor: 'info.light', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {meetings.filter(m => m.isVirtual).length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Virtual Meetings
                      </Typography>
                    </Box>
                    <VideoCall sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: 3, bgcolor: 'warning.light', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {meetings.filter(m => m.status === 'cancelled').length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Cancelled
                      </Typography>
                    </Box>
                    <EventBusy sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Search and Filter */}
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search meetings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Filter by Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="all">All Meetings</MenuItem>
                    <MenuItem value="upcoming">Upcoming</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={`${filteredMeetings.length} meetings`}
                    color="primary"
                    variant="outlined"
                  />
                  {filterStatus !== 'all' && (
                    <Chip 
                      label={filterStatus}
                      color={getStatusColor(filterStatus)}
                      onDelete={() => setFilterStatus('all')}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          {filteredMeetings.length === 0 ? (
            <Paper sx={{ borderRadius: 4, py: 8, textAlign: 'center' }}>
              <Stack spacing={3} alignItems="center">
                <VideoCall sx={{ fontSize: 80, color: 'text.secondary' }} />
                <Typography variant="h5" color="text.secondary">
                  {meetings.length === 0 ? 'No Meetings Scheduled' : 'No Meetings Found'}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                  {meetings.length === 0 
                    ? 'Get started by scheduling your first meeting. You can organize team syncs, client presentations, and project kickoffs all in one place.'
                    : 'Try adjusting your search or filter criteria to find the meeting you\'re looking for.'
                  }
                </Typography>
                {meetings.length === 0 && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    size="large"
                    onClick={() => setNewMeetingDialogOpen(true)}
                    sx={{ borderRadius: 2, mt: 2 }}
                  >
                    Schedule Your First Meeting
                  </Button>
                )}
              </Stack>
            </Paper>
          ) : (
          <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <List>
              {filteredMeetings.map((meeting, index) => (
                <React.Fragment key={meeting.id}>
                  <ListItem 
                    sx={{ 
                      py: 2,
                      bgcolor: meeting.status === 'upcoming' ? 'rgba(33, 150, 243, 0.05)' : 'inherit',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.02)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      {getStatusIcon(meeting.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {meeting.title}
                          </Typography>
                          <Chip 
                            label={meeting.status} 
                            size="small" 
                            color={getStatusColor(meeting.status)}
                            sx={{ height: 20 }}
                          />
                          {meeting.isVirtual && (
                            <Chip 
                              icon={<VideoCall />}
                              label="Virtual" 
                              size="small" 
                              color="info"
                              sx={{ height: 20 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {meeting.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(meeting.date)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {meeting.startTime} - {meeting.endTime}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {meeting.location}
                              </Typography>
                            </Box>
                          </Box>
                          {meeting.participants && meeting.participants.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <Group sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <AvatarGroup max={4}>
                                {meeting.participants.map(participantId => {
                                  const participant = teamMembers.find(m => m.id === participantId);
                                  return participant ? (
                                    <Tooltip key={participant.id} title={participant.name}>
                                      <Avatar sx={{ width: 28, height: 28, fontSize: '0.875rem' }}>
                                        {participant.avatar}
                                      </Avatar>
                                    </Tooltip>
                                    ) : (
                                      <Tooltip key={participantId} title="Unknown Participant">
                                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.875rem' }}>
                                          ?
                                        </Avatar>
                                      </Tooltip>
                                    );
                                })}
                              </AvatarGroup>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Tooltip title="Edit">
                          <IconButton 
                            edge="end" 
                            onClick={() => handleEditMeeting(meeting)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        {meeting.isVirtual && (
                          <Tooltip title="Copy Meeting Link">
                            <IconButton 
                              edge="end" 
                              onClick={() => handleCopyMeetingLink(meeting.id)}
                              color="secondary"
                            >
                              <ContentCopy />
                            </IconButton>
                          </Tooltip>
                        )}
                        {meeting.status === 'upcoming' && (
                          <>
                            <Tooltip title="Start Video Call">
                              <IconButton 
                                edge="end" 
                                onClick={() => handleStartVideoCall(meeting.id)}
                                color="primary"
                              >
                                <VideoCall />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Join Video Call">
                              <IconButton 
                                edge="end" 
                                onClick={() => handleJoinVideoCall(meeting.id)}
                                color="info"
                              >
                                <Link />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Mark as Completed">
                              <IconButton 
                                edge="end" 
                                onClick={() => handleMeetingStatusChange(meeting.id, 'completed')}
                                color="success"
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel Meeting">
                              <IconButton 
                                edge="end" 
                                onClick={() => handleMeetingStatusChange(meeting.id, 'cancelled')}
                                color="error"
                              >
                                <EventBusy />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Delete">
                          <IconButton 
                            edge="end" 
                            onClick={() => handleDeleteMeeting(meeting.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < meetings.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
          )}
        </Container>

        {/* ======================================================================= */}
        {/* ==================== ADD NEW MEETING DIALOG - START =================== */}
        {/* ======================================================================= */}
        <Dialog 
          open={newMeetingDialogOpen} 
          onClose={() => setNewMeetingDialogOpen(false)}
          maxWidth="md"
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
          <DialogTitle sx={{ position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <VideocamIcon sx={{ fontSize: 28, color: '#fff' }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Schedule a New Meeting
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  Create and organize your team collaboration
                </Typography>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 4, background: 'transparent', overflow: 'visible' }}>
            <Stack spacing={4}>
              {/* Meeting Basics Card */}
              <Box sx={{
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                position: 'relative',
                overflow: 'visible',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #667eea, #764ba2)'
                }
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)'
                  }} />
                  Meeting Details
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FieldLabelWithIcon
                      fieldId="new-meeting-title"
                      required
                      label="Meeting Title"
                      icon={
                        <Box
                          sx={{
                            ...meetingFieldIconBoxSx,
                            background:
                              'linear-gradient(135deg, rgba(102,126,234,0.12), rgba(118,75,162,0.12))',
                          }}
                        >
                          <EventNote sx={{ fontSize: 20, color: '#667eea' }} />
                        </Box>
                      }
                    />
                    <TextField
                      id="new-meeting-title"
                      fullWidth
                      placeholder="Enter meeting title"
                      value={newMeeting.title}
                      onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                      required
                      variant="outlined"
                      sx={popupDialogAdornedFieldSx}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FieldLabelWithIcon
                      fieldId="new-meeting-description"
                      label="Description"
                      icon={
                        <Box
                          sx={{
                            ...meetingFieldIconBoxSx,
                            background:
                              'linear-gradient(135deg, rgba(255,193,7,0.12), rgba(255,152,0,0.12))',
                          }}
                        >
                          <Notes sx={{ fontSize: 20, color: '#ffc107' }} />
                        </Box>
                      }
                    />
                    <TextField
                      id="new-meeting-description"
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Add a short description"
                      value={newMeeting.description}
                      onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                      variant="outlined"
                      sx={popupDialogMultilineFieldSx}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Meeting Type & Location Card */}
              <Box sx={{
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                position: 'relative',
                overflow: 'visible',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #4caf50, #66bb6a)'
                }
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4caf50, #66bb6a)'
                  }} />
                  Meeting Type & Location
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{
                      p: 2,
                      borderRadius: 2,
                      background: newMeeting.isVirtual 
                        ? 'linear-gradient(135deg, rgba(33,150,243,0.1), rgba(33,150,243,0.05))'
                        : 'linear-gradient(135deg, rgba(156,39,176,0.1), rgba(156,39,176,0.05))',
                      border: '1px solid',
                      borderColor: newMeeting.isVirtual ? 'rgba(33,150,243,0.2)' : 'rgba(156,39,176,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        background: newMeeting.isVirtual 
                          ? 'linear-gradient(135deg, rgba(33,150,243,0.2), rgba(33,150,243,0.1))'
                          : 'linear-gradient(135deg, rgba(156,39,176,0.2), rgba(156,39,176,0.1))'
                      }}>
                        {newMeeting.isVirtual ? 
                          <VideocamIcon sx={{ color: '#2196f3', fontSize: 24 }} /> : 
                          <LocationOn sx={{ color: '#9c27b0', fontSize: 24 }} />
                        }
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={newMeeting.isVirtual}
                              onChange={(e) => setNewMeeting({ ...newMeeting, isVirtual: e.target.checked })}
                              sx={{
                                '& .MuiSwitch-thumb': {
                                  background: 'linear-gradient(135deg, #667eea, #764ba2)'
                                },
                                '& .MuiSwitch-track': {
                                  background: 'linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.3))'
                                }
                              }}
                            />
                          }
                          label={
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {newMeeting.isVirtual ? "Virtual Meeting" : "In-Person Meeting"}
                            </Typography>
                          }
                        />
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <FieldLabelWithIcon
                      fieldId="new-meeting-location"
                      label={newMeeting.isVirtual ? 'Meeting URL' : 'Physical Location'}
                      icon={
                        <Box
                          sx={{
                            ...meetingFieldIconBoxSx,
                            background: newMeeting.isVirtual
                              ? 'linear-gradient(135deg, rgba(33,150,243,0.12), rgba(33,150,243,0.06))'
                              : 'linear-gradient(135deg, rgba(156,39,176,0.12), rgba(156,39,176,0.06))',
                          }}
                        >
                          {newMeeting.isVirtual ? (
                            <Link sx={{ fontSize: 20, color: '#2196f3' }} />
                          ) : (
                            <LocationOn sx={{ fontSize: 20, color: '#9c27b0' }} />
                          )}
                        </Box>
                      }
                    />
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1.5}
                      alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                    >
                      <TextField
                        id="new-meeting-location"
                        fullWidth
                        value={newMeeting.location}
                        onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                        placeholder={
                          newMeeting.isVirtual
                            ? 'e.g., https://meet.google.com/xyz-abc'
                            : 'e.g., Main Conference Room'
                        }
                        variant="outlined"
                        sx={popupDialogAdornedFieldSx}
                      />
                      {newMeeting.isVirtual && (
                        <Button
                          variant="contained"
                          sx={{
                            flexShrink: 0,
                            alignSelf: { sm: 'stretch' },
                            minHeight: 48,
                            borderRadius: 2,
                            whiteSpace: 'nowrap',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #764ba2, #667eea)',
                            },
                          }}
                          onClick={() => {
                            const newLink = `${window.location.origin}/meetings/join/${uuidv4()}`;
                            setNewMeeting((prev) => ({ ...prev, location: newLink }));
                            setSnackbarMessage('New meeting link generated!');
                            setSnackbarOpen(true);
                          }}
                        >
                          Generate Link
                        </Button>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Box>

              {/* Date & Time Card */}
              <Box sx={{
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                position: 'relative',
                overflow: 'visible',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #ff9800, #ffc107)'
                }
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff9800, #ffc107)'
                  }} />
                  Date & Time
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FieldLabelWithIcon
                      fieldId="new-meeting-date"
                      required
                      label="Date"
                      icon={
                        <Box
                          sx={{
                            ...meetingFieldIconBoxSx,
                            background:
                              'linear-gradient(135deg, rgba(255,152,0,0.12), rgba(255,193,7,0.12))',
                          }}
                        >
                          <CalendarToday sx={{ fontSize: 20, color: '#ff9800' }} />
                        </Box>
                      }
                    />
                    <TextField
                      id="new-meeting-date"
                      type="date"
                      fullWidth
                      value={newMeeting.date}
                      onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                      required
                      variant="outlined"
                      sx={popupDialogAdornedFieldSx}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <FieldLabelWithIcon
                      fieldId="new-meeting-start-time"
                      required
                      label="Start Time"
                      icon={
                        <Box
                          sx={{
                            ...meetingFieldIconBoxSx,
                            background:
                              'linear-gradient(135deg, rgba(76,175,80,0.12), rgba(102,187,106,0.12))',
                          }}
                        >
                          <AccessTime sx={{ fontSize: 20, color: '#4caf50' }} />
                        </Box>
                      }
                    />
                    <TextField
                      id="new-meeting-start-time"
                      type="time"
                      fullWidth
                      value={newMeeting.startTime}
                      onChange={(e) => setNewMeeting({ ...newMeeting, startTime: e.target.value })}
                      required
                      variant="outlined"
                      sx={popupDialogAdornedFieldSx}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <FieldLabelWithIcon
                      fieldId="new-meeting-end-time"
                      label="End Time"
                      icon={
                        <Box
                          sx={{
                            ...meetingFieldIconBoxSx,
                            background:
                              'linear-gradient(135deg, rgba(76,175,80,0.12), rgba(102,187,106,0.12))',
                          }}
                        >
                          <AccessTime sx={{ fontSize: 20, color: '#4caf50' }} />
                        </Box>
                      }
                    />
                    <TextField
                      id="new-meeting-end-time"
                      type="time"
                      fullWidth
                      value={newMeeting.endTime}
                      onChange={(e) => setNewMeeting({ ...newMeeting, endTime: e.target.value })}
                      variant="outlined"
                      sx={popupDialogAdornedFieldSx}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Participants Card */}
              <Box sx={{
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #e91e63, #f06292)'
                }
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #e91e63, #f06292)'
                  }} />
                  Invite Participants
                  <Chip 
                    label={`${newMeeting.participants.length} selected`}
                    size="small"
                    sx={{
                      ml: 2,
                      background: 'linear-gradient(135deg, rgba(233,30,99,0.1), rgba(240,98,146,0.1))',
                      color: '#e91e63',
                      fontWeight: 600
                    }}
                  />
                </Typography>

                <Grid container spacing={2}>
                  {teamMembers.map((member) => (
                    <Grid item xs={12} sm={6} md={4} key={member.id}>
                      <Box
                        onClick={() => {
                          const newParticipants = newMeeting.participants.includes(member.id)
                            ? newMeeting.participants.filter(id => id !== member.id)
                            : [...newMeeting.participants, member.id];
                          setNewMeeting({ ...newMeeting, participants: newParticipants });
                        }}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          background: newMeeting.participants.includes(member.id)
                            ? 'linear-gradient(135deg, rgba(233,30,99,0.1), rgba(240,98,146,0.05))'
                            : 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
                          border: '1px solid',
                          borderColor: newMeeting.participants.includes(member.id)
                            ? 'rgba(233,30,99,0.3)'
                            : 'rgba(0,0,0,0.1)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            borderColor: 'rgba(233,30,99,0.5)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40,
                              background: newMeeting.participants.includes(member.id)
                                ? 'linear-gradient(135deg, #e91e63, #f06292)'
                                : 'linear-gradient(135deg, #9e9e9e, #bdbdbd)',
                              fontWeight: 700
                            }}
                          >
                            {member.avatar}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600,
                              color: newMeeting.participants.includes(member.id) ? '#e91e63' : 'text.primary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {member.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.role}
                            </Typography>
                          </Box>
                          <Checkbox
                            checked={newMeeting.participants.includes(member.id)}
                            sx={{
                              color: 'rgba(233,30,99,0.3)',
                              '&.Mui-checked': {
                                color: '#e91e63'
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Advanced Options */}
              <Accordion 
                sx={{ 
                  boxShadow: 'none', 
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 3,
                  '&:before': { display: 'none' },
                  overflow: 'hidden'
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: '#667eea' }} />}
                  sx={{
                    background: 'linear-gradient(135deg, rgba(102,126,234,0.05), rgba(118,75,162,0.05))',
                    borderRadius: '12px 12px 0 0',
                    '&.Mui-expanded': {
                      borderRadius: 0
                    }
                  }}
                >
                  <Typography variant="subtitle1" sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    fontWeight: 600,
                    color: '#667eea'
                  }}>
                    <Settings sx={{ fontSize: 20 }} />
                    Advanced Options
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FieldLabelWithIcon
                        fieldId="new-meeting-agenda"
                        label="Meeting Agenda"
                        icon={
                          <Box
                            sx={{
                              ...meetingFieldIconBoxSx,
                              background:
                                'linear-gradient(135deg, rgba(63,81,181,0.12), rgba(63,81,181,0.06))',
                            }}
                          >
                            <Notes sx={{ fontSize: 20, color: '#3f51b5' }} />
                          </Box>
                        }
                      />
                      <TextField
                        id="new-meeting-agenda"
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Outline topics for this meeting"
                        value={newMeeting.agenda}
                        onChange={(e) => setNewMeeting({ ...newMeeting, agenda: e.target.value })}
                        variant="outlined"
                        sx={popupDialogMultilineFieldSx}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel id="new-meeting-priority-label">Priority</InputLabel>
                        <Select
                          id="new-meeting-priority"
                          labelId="new-meeting-priority-label"
                          value={newMeeting.priority}
                          label="Priority"
                          onChange={(e) => setNewMeeting({ ...newMeeting, priority: e.target.value as string })}
                          sx={{
                            borderRadius: 3,
                            background: 'rgba(255,255,255,0.8)',
                            backdropFilter: 'blur(10px)'
                          }}
                        >
                          <MenuItem value="high">🔴 High Priority</MenuItem>
                          <MenuItem value="medium">🟡 Medium Priority</MenuItem>
                          <MenuItem value="low">🟢 Low Priority</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Button
                        variant="outlined"
                        startIcon={<Attachment />}
                        component="label"
                        fullWidth
                        sx={{
                          borderRadius: 3,
                          py: 1.5,
                          borderColor: 'rgba(102,126,234,0.3)',
                          color: '#667eea',
                          background: 'rgba(102,126,234,0.05)',
                          '&:hover': {
                            borderColor: '#667eea',
                            background: 'rgba(102,126,234,0.1)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(102,126,234,0.2)'
                          }
                        }}
                      >
                        Add Attachment
                        <input 
                          type="file" 
                          hidden 
                          multiple 
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.ppt,.pptx"
                        />
                      </Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Attachments Display */}
              {newMeeting.attachments.length > 0 && (
                <Box sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #4caf50, #8bc34a)'
                  }
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4caf50, #8bc34a)'
                    }} />
                    Attached Files
                    <Chip 
                      label={`${newMeeting.attachments.length} file(s)`}
                      size="small"
                      sx={{
                        ml: 2,
                        background: 'linear-gradient(135deg, rgba(76,175,80,0.1), rgba(139,195,74,0.1))',
                        color: '#4caf50',
                        fontWeight: 600
                      }}
                    />
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {newMeeting.attachments.map((attachment) => (
                      <Grid item xs={12} sm={6} key={attachment.id}>
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              transform: 'translateY(-1px)'
                            }
                          }}
                        >
                          <Attachment sx={{ color: 'primary.main' }} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {attachment.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {(attachment.size / 1024).toFixed(1)} KB • {attachment.type}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveAttachment(attachment.id)}
                            sx={{ 
                              color: 'error.main',
                              '&:hover': {
                                backgroundColor: 'rgba(244, 67, 54, 0.1)'
                              }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Paper>
                      </Grid>
                    ))}
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
                onClick={() => setNewMeetingDialogOpen(false)}
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
                onClick={handleAddNewMeeting}
                disabled={!newMeeting.title || !newMeeting.date || !newMeeting.startTime}
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
                Schedule Meeting
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
        {/* ======================================================================= */}
        {/* ===================== ADD NEW MEETING DIALOG - END ==================== */}
        {/* ======================================================================= */}

        {/* Edit Meeting Dialog */}
        <Dialog 
          open={editMeetingDialogOpen} 
          onClose={() => setEditMeetingDialogOpen(false)}
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
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
            <Box sx={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              borderRadius: 2, 
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Edit sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Edit Meeting
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Meeting Title"
                    fullWidth
                    value={editingMeeting?.title || ''}
                    onChange={(e) => setEditingMeeting(prev => prev ? { ...prev, title: e.target.value } : null)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={editingMeeting?.description || ''}
                    onChange={(e) => setEditingMeeting(prev => prev ? { ...prev, description: e.target.value } : null)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Date"
                    type="date"
                    fullWidth
                    value={editingMeeting?.date || ''}
                    onChange={(e) => setEditingMeeting(prev => prev ? { ...prev, date: e.target.value } : null)}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="edit-meeting-type-label">Meeting Type</InputLabel>
                    <Select
                      id="edit-meeting-type"
                      labelId="edit-meeting-type-label"
                      value={editingMeeting?.isVirtual ? 'virtual' : 'in-person'}
                      label="Meeting Type"
                      onChange={(e) => setEditingMeeting(prev => prev ? { ...prev, isVirtual: e.target.value === 'virtual' } : null)}
                    >
                      <MenuItem value="in-person">In-Person</MenuItem>
                      <MenuItem value="virtual">Virtual</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Start Time"
                    type="time"
                    fullWidth
                    value={editingMeeting?.startTime || ''}
                    onChange={(e) => setEditingMeeting(prev => prev ? { ...prev, startTime: e.target.value } : null)}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="End Time"
                    type="time"
                    fullWidth
                    value={editingMeeting?.endTime || ''}
                    onChange={(e) => setEditingMeeting(prev => prev ? { ...prev, endTime: e.target.value } : null)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Location"
                    fullWidth
                    value={editingMeeting?.location || ''}
                    onChange={(e) => setEditingMeeting(prev => prev ? { ...prev, location: e.target.value } : null)}
                    placeholder={editingMeeting?.isVirtual ? "Meeting link or platform" : "Room or location"}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Invite Participants
                  </Typography>
                  <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                    <List>
                      {teamMembers.map((member) => (
                        <ListItem key={member.id} disablePadding>
                          <ListItemButton 
                            dense
                            onClick={() => {
                              if (editingMeeting) {
                                const newParticipants = editingMeeting.participants?.includes(member.id)
                                  ? editingMeeting.participants.filter(id => id !== member.id)
                                  : [...(editingMeeting.participants || []), member.id];
                                setEditingMeeting({ ...editingMeeting, participants: newParticipants });
                              }
                            }}
                          >
                            <ListItemIcon>
                              <Checkbox
                                edge="start"
                                checked={editingMeeting?.participants?.includes(member.id) || false}
                                tabIndex={-1}
                                disableRipple
                              />
                            </ListItemIcon>
                            <ListItemText 
                              primary={member.name} 
                              secondary={member.role} 
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ 
            p: 4, 
            pt: 2,
            background: 'transparent',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            gap: 2,
          }}>
            <Button 
              onClick={() => setEditMeetingDialogOpen(false)}
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
              variant="contained" 
              onClick={handleSaveMeetingEdit}
              disabled={!editingMeeting?.title || !editingMeeting?.date || !editingMeeting?.startTime}
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
                },
                '&:disabled': {
                  background: 'rgba(0,0,0,0.12)',
                  color: 'rgba(0,0,0,0.26)',
                  boxShadow: 'none',
                }
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Video Chat Component */}
        <VideoChat
          roomId={currentRoomId}
          isOpen={videoChatOpen}
          onClose={handleCloseVideoChat}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity="success" 
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
      </FeatureGuard>
    </DashboardLayout>
  );
};

export default Meetings; 