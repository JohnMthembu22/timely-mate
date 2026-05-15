import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  TextField,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Paper,
  Chip,
  IconButton,
  LinearProgress,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Work,
  LocationOn,
  Notifications,
  Security,
  Language,
  AccessTime,
  Edit,
  Download,
  EventAvailable,
  CalendarToday,
  Sick,
  BeachAccess,
  WorkOff,
  Description,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAppSelector } from '../../store';
import { userProfileApi } from '../../services/api';
import timezoneService from '../../services/timezoneService';
import jsPDF from 'jspdf';

interface Payslip {
  id: string;
  month: string;
  year: number;
  amount: string;
  downloadUrl: string;
}

interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  icon: React.ReactNode;
}

const Profile: React.FC = () => {
  const { currency, setCurrency, isLoading, error, detectedCountry } = useCurrency();
  const { user } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    location: '',
    timeZone: '',
    avatar: '',
  });

  const [notifications, setNotifications] = useState({
    email: false,
    push: false,
    updates: false,
  });
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [timezoneLoading, setTimezoneLoading] = useState(false);
  const [timezoneInfo, setTimezoneInfo] = useState<{ timezone: string; city: string; offset: string } | null>(null);

  const payslips: Payslip[] = [
    {
      id: '1',
      month: 'December',
      year: 2024,
      amount: 'R 15,500.00',
      downloadUrl: '/api/payslips/2024-12.pdf'
    },
    {
      id: '2',
      month: 'November',
      year: 2024,
      amount: 'R 15,500.00',
      downloadUrl: '/api/payslips/2024-11.pdf'
    },
    {
      id: '3',
      month: 'October',
      year: 2024,
      amount: 'R 15,500.00',
      downloadUrl: '/api/payslips/2024-10.pdf'
    },
    {
      id: '4',
      month: 'September',
      year: 2024,
      amount: 'R 15,500.00',
      downloadUrl: '/api/payslips/2024-09.pdf'
    },
    {
      id: '5',
      month: 'August',
      year: 2024,
      amount: 'R 15,500.00',
      downloadUrl: '/api/payslips/2024-08.pdf'
    },
    {
      id: '6',
      month: 'July',
      year: 2024,
      amount: 'R 15,500.00',
      downloadUrl: '/api/payslips/2024-07.pdf'
    }
  ];

  const leaveBalances: LeaveBalance[] = [
    {
      type: 'Annual Leave',
      total: 21,
      used: 8,
      icon: <BeachAccess />
    },
    {
      type: 'Sick Leave',
      total: 10,
      used: 2,
      icon: <Sick />
    },
    {
      type: 'Personal Leave',
      total: 5,
      used: 1,
      icon: <EventAvailable />
    },
    {
      type: 'Study Leave',
      total: 3,
      used: 0,
      icon: <WorkOff />
    }
  ];

  // Auto-detect timezone when component mounts
  useEffect(() => {
    const detectTimezone = async () => {
      setTimezoneLoading(true);
      try {
        const tzInfo = await timezoneService.getTimezoneInfo();
        setTimezoneInfo(tzInfo);
        
        // Automatically set timezone in profile
        setProfile(prev => ({
          ...prev,
          timeZone: `${tzInfo.timezone} (${tzInfo.offset}) - ${tzInfo.city}, ${tzInfo.country}`,
        }));
      } catch (error) {
        console.error('Failed to detect timezone:', error);
        // Fallback to browser timezone
        const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setProfile(prev => ({
          ...prev,
          timeZone: `${browserTz} (Auto-detected)`,
        }));
      } finally {
        setTimezoneLoading(false);
      }
    };

    detectTimezone();
  }, []);

  // Populate profile with user data when user changes
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        // Use organization name as the display name for now
        name: user.organizationName || user.email || prev.name,
        email: user.email || prev.email,
        // Set department and position based on role
        department: user.organizationName ? 'Organization Owner' : prev.department,
        position: user.role === 'admin' ? 'Administrator' : 
                 user.role === 'team_leader' ? 'Team Leader' : 
                 'Employee',
        // Keep existing timezone if already detected
        // You can add more mappings here as the user object gets more properties
      }));
    } else {
      // Reset profile if no user is logged in (except timezone)
      setProfile(prev => ({
        name: '',
        position: '',
        department: '',
        email: '',
        phone: '',
        location: '',
        timeZone: prev.timeZone, // Keep timezone
        avatar: '',
      }));
    }
  }, [user]);

  const handleNotificationChange = async (type: keyof typeof notifications) => {
    const newNotifications = {
      ...notifications,
      [type]: !notifications[type],
    };
    
    setNotifications(newNotifications);
    
    // Auto-save notification settings
    try {
      setSaving(true);
      await userProfileApi.updateNotificationSettings(user?.id || '', newNotifications);
      setMessage({ type: 'success', text: 'Notification settings saved!' });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      setMessage({ type: 'error', text: 'Failed to save notification settings' });
      setTimeout(() => setMessage(null), 3000);
      // Revert the change
      setNotifications(notifications);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    setMessage(null);
    try {
      // Use the API service to update the profile
      const response = await userProfileApi.updateProfile(user.id, profile);
      
      console.log('Profile updated successfully:', response.data);
      
      // You could also update the user in the store if needed
      // dispatch(updateUserProfile(profile));
      
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = (payslipId: string) => {
    const payslip = payslips.find(p => p.id === payslipId);
    if (payslip) {
      // Generate actual PDF payslip
      const doc = new jsPDF();
      
      // Company Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('TIMELY MATE CONSTRUCTION', 20, 30);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('123 Business Street, Johannesburg, 2000', 20, 40);
      doc.text('Tel: +27 11 123 4567 | Email: hr@timelymate.co.za', 20, 50);
      
      // Payslip Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYSLIP', 20, 70);
      
      // Employee Information
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Employee: ${profile.name || 'John Doe'}`, 20, 85);
      doc.text(`Employee ID: EMP001`, 20, 95);
      doc.text(`Position: ${profile.position || 'Project Manager'}`, 20, 105);
      doc.text(`Department: ${profile.department || 'Construction'}`, 20, 115);
      
      // Pay Period
      doc.text(`Pay Period: ${payslip.month} ${payslip.year}`, 20, 130);
      doc.text(`Pay Date: ${payslip.month} 31, ${payslip.year}`, 20, 140);
      
      // Earnings Section
      doc.setFont('helvetica', 'bold');
      doc.text('EARNINGS', 20, 160);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Basic Salary', 20, 175);
      doc.text('R 12,500.00', 150, 175);
      
      doc.text('Overtime (8 hours)', 20, 185);
      doc.text('R 1,250.00', 150, 185);
      
      doc.text('Project Bonus', 20, 195);
      doc.text('R 1,750.00', 150, 195);
      
      // Deductions Section
      doc.setFont('helvetica', 'bold');
      doc.text('DEDUCTIONS', 20, 215);
      
      doc.setFont('helvetica', 'normal');
      doc.text('PAYE Tax', 20, 230);
      doc.text('R 2,500.00', 150, 230);
      
      doc.text('UIF', 20, 240);
      doc.text('R 150.00', 150, 240);
      
      doc.text('Medical Aid', 20, 250);
      doc.text('R 800.00', 150, 250);
      
      doc.text('Pension Fund', 20, 260);
      doc.text('R 1,250.00', 150, 260);
      
      // Net Pay
      doc.setFont('helvetica', 'bold');
      doc.text('NET PAY', 20, 280);
      doc.text('R 15,500.00', 150, 280);
      
      // Footer
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('This is a computer-generated payslip. No signature required.', 20, 300);
      doc.text('For queries, contact HR at hr@timelymate.co.za', 20, 310);
      
      // Save the PDF
      doc.save(`payslip-${payslip.month}-${payslip.year}.pdf`);
      
      setMessage({ type: 'success', text: `Downloading ${payslip.month} ${payslip.year} payslip...` });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCopyContact = () => {
    const contactInfo = `
Name: ${profile.name}
Position: ${profile.position}
Department: ${profile.department}
Email: ${profile.email}
Phone: ${profile.phone}
Location: ${profile.location}
    `.trim();
    
    navigator.clipboard.writeText(contactInfo).then(() => {
      setMessage({ type: 'success', text: 'Contact information copied to clipboard!' });
      setTimeout(() => setMessage(null), 3000);
    }).catch(() => {
      setMessage({ type: 'error', text: 'Failed to copy contact information' });
      setTimeout(() => setMessage(null), 3000);
    });
  };

  const handleDownloadContract = () => {
    // Generate actual PDF contract
    const doc = new jsPDF();
    
    // Company Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TIMELY MATE CONSTRUCTION', 20, 30);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('123 Business Street, Johannesburg, 2000', 20, 40);
    doc.text('Tel: +27 11 123 4567 | Email: hr@timelymate.co.za', 20, 50);
    
    // Contract Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPLOYMENT CONTRACT', 20, 70);
    
    // Employee Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Employee: ${profile.name || 'John Doe'}`, 20, 85);
    doc.text(`Employee ID: EMP001`, 20, 95);
    doc.text(`Position: ${profile.position || 'Project Manager'}`, 20, 105);
    doc.text(`Department: ${profile.department || 'Construction'}`, 20, 115);
    doc.text(`Start Date: January 1, 2024`, 20, 125);
    
    // Contract Terms
    doc.setFont('helvetica', 'bold');
    doc.text('CONTRACT TERMS', 20, 145);
    
    doc.setFont('helvetica', 'normal');
    doc.text('1. Employment Type: Permanent Full-time', 20, 160);
    doc.text('2. Working Hours: 40 hours per week (Monday-Friday)', 20, 170);
    doc.text('3. Probation Period: 3 months', 20, 180);
    doc.text('4. Notice Period: 1 month', 20, 190);
    
    // Compensation
    doc.setFont('helvetica', 'bold');
    doc.text('COMPENSATION', 20, 210);
    
    doc.setFont('helvetica', 'normal');
    doc.text('• Basic Salary: R 12,500.00 per month', 20, 225);
    doc.text('• Overtime: R 156.25 per hour', 20, 235);
    doc.text('• Annual Leave: 21 days per annum', 20, 245);
    doc.text('• Sick Leave: 10 days per annum', 20, 255);
    doc.text('• Medical Aid: Company contribution 50%', 20, 265);
    doc.text('• Pension Fund: Company contribution 8%', 20, 275);
    
    // Benefits
    doc.setFont('helvetica', 'bold');
    doc.text('BENEFITS', 20, 295);
    
    doc.setFont('helvetica', 'normal');
    doc.text('• Company vehicle (for business use)', 20, 310);
    doc.text('• Laptop and mobile phone', 20, 320);
    doc.text('• Professional development allowance', 20, 330);
    doc.text('• Performance bonus (up to 15% of annual salary)', 20, 340);
    
    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('This contract is effective from the start date mentioned above.', 20, 360);
    doc.text('For any queries, contact HR at hr@timelymate.co.za', 20, 370);
    
    // Save the PDF
    doc.save(`employment-contract-${profile.name || 'employee'}.pdf`);
    
    setMessage({ type: 'success', text: 'Employment contract downloaded successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <DashboardLayout>
      {/* Header Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
          color: 'white',
          pt: 4,
          pb: 6,
          px: 3,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Grid container alignItems="center" spacing={3}>
            <Grid item>
              <Avatar
                src={profile.avatar}
                sx={{ width: 120, height: 120, border: '4px solid white' }}
              />
            </Grid>
            <Grid item>
              <Typography variant="h3" gutterBottom>
                {profile.name || (!user ? 'Please log in to view profile' : 'Your Profile')}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {!user 
                  ? 'User not authenticated' 
                  : `${profile.position || 'Position'} • ${profile.department || 'Department'}`
                }
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: -4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Left Column - Main Profile Sections */}
          <Grid item xs={12} md={8}>
            {/* Profile Information Section */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Profile Information
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    startIcon={<Description />}
                    variant="outlined"
                    onClick={handleDownloadContract}
                    disabled={!user}
                  >
                    Download Contract
                  </Button>
                  <Button
                    startIcon={<Download />}
                    variant="outlined"
                    onClick={handleCopyContact}
                    disabled={!user}
                  >
                    Copy Contact
                  </Button>
                <Button
                  startIcon={isEditing ? (saving ? <CircularProgress size={16} /> : null) : <Edit />}
                  variant={isEditing ? 'contained' : 'outlined'}
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  disabled={saving || !user}
                >
                  {!user 
                    ? 'Login Required' 
                    : isEditing 
                      ? (saving ? 'Saving...' : 'Save Changes') 
                      : 'Edit Profile'
                  }
                </Button>
                </Box>
              </Box>
              {message && (
                <Alert 
                  severity={message.type} 
                  sx={{ mb: 3 }}
                  onClose={() => setMessage(null)}
                >
                  {message.text}
                </Alert>
              )}
              <Grid container spacing={3}>
                {isEditing ? (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Position"
                        value={profile.position}
                        onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Location"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Time Zone (Auto-detected)"
                        value={timezoneLoading ? 'Detecting timezone...' : profile.timeZone}
                        InputProps={{
                          readOnly: true,
                          startAdornment: timezoneLoading ? (
                            <CircularProgress size={16} sx={{ mr: 1 }} />
                          ) : (
                            <AccessTime sx={{ mr: 1, color: 'action.active' }} />
                          ),
                        }}
                        helperText="Timezone is automatically detected based on your location"
                        sx={{
                          '& .MuiInputBase-input': {
                            cursor: 'default',
                          },
                        }}
                      />
                    </Grid>
                  </>
                ) : (
                  <Grid item xs={12}>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <Email color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Email" secondary={profile.email || 'Not specified'} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Phone color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Phone" secondary={profile.phone || 'Not specified'} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <LocationOn color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Location" secondary={profile.location || 'Not specified'} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <AccessTime color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Time Zone" secondary={profile.timeZone || 'Not specified'} />
                      </ListItem>
                    </List>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Notification Settings Section */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Notification Settings
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive notifications via email"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notifications.email}
                      onChange={() => handleNotificationChange('email')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Notifications />
                  </ListItemIcon>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Receive push notifications"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notifications.push}
                      onChange={() => handleNotificationChange('push')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Work />
                  </ListItemIcon>
                  <ListItemText
                    primary="Project Updates"
                    secondary="Receive updates about your projects"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={notifications.updates}
                      onChange={() => handleNotificationChange('updates')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>

            {/* Currency Settings Section */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Currency Settings
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2">Detecting your location...</Typography>
                    </Box>
                  ) : error ? (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  ) : (
                    <FormControl fullWidth>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        value={currency}
                        label="Currency"
                        onChange={(e) => setCurrency(e.target.value)}
                      >
                        <MenuItem value="ZAR">South African Rand (ZAR)</MenuItem>
                        <MenuItem value="USD">US Dollar (USD)</MenuItem>
                        <MenuItem value="EUR">Euro (EUR)</MenuItem>
                        <MenuItem value="GBP">British Pound (GBP)</MenuItem>
                        <MenuItem value="AUD">Australian Dollar (AUD)</MenuItem>
                        <MenuItem value="CAD">Canadian Dollar (CAD)</MenuItem>
                        <MenuItem value="JPY">Japanese Yen (JPY)</MenuItem>
                        <MenuItem value="CNY">Chinese Yuan (CNY)</MenuItem>
                        <MenuItem value="INR">Indian Rupee (INR)</MenuItem>
                        <MenuItem value="NGN">Nigerian Naira (NGN)</MenuItem>
                        <MenuItem value="KES">Kenyan Shilling (KES)</MenuItem>
                        <MenuItem value="GHS">Ghanaian Cedi (GHS)</MenuItem>
                        <MenuItem value="EGP">Egyptian Pound (EGP)</MenuItem>
                        <MenuItem value="MAD">Moroccan Dirham (MAD)</MenuItem>
                        <MenuItem value="TZS">Tanzanian Shilling (TZS)</MenuItem>
                        <MenuItem value="UGX">Ugandan Shilling (UGX)</MenuItem>
                        <MenuItem value="ETB">Ethiopian Birr (ETB)</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    {isLoading 
                      ? "We're detecting your location to set the appropriate currency automatically."
                      : detectedCountry 
                        ? `Currency automatically detected for ${detectedCountry}. You can manually change it if needed.`
                        : "Your currency is automatically detected based on your location. You can manually change it if needed."
                    }
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Right Column - Stats and Quick Info */}
          <Grid item xs={12} md={4}>
            {/* Quick Stats Section */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Quick Stats
              </Typography>
              <Stack spacing={2}>
                <Card variant="outlined">
                  <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Projects Completed
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>-</Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Tasks Completed
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>-</Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Hours Logged
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>-</Typography>
                  </CardContent>
                </Card>
              </Stack>
            </Paper>

            {/* Skills Section */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Skills
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No skills have been added yet.
              </Typography>
            </Paper>

            {/* Role & Permissions Section */}
            {user && (
              <Paper sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Security color="primary" />
                  Role & Permissions
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                    Current Role
                  </Typography>
                  <Chip 
                    label={
                      user.role === 'admin' ? 'Administrator' :
                      user.role === 'team_leader' ? 'Team Leader' :
                      'Employee'
                    }
                    color={
                      user.role === 'admin' ? 'error' :
                      user.role === 'team_leader' ? 'warning' :
                      'primary'
                    }
                    sx={{ fontWeight: 500 }}
                  />
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                  Permissions
                </Typography>
                
                <Grid container spacing={1}>
                  {Object.entries(user.permissions).map(([permission, hasPermission]) => (
                    <Grid item xs={6} key={permission}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: hasPermission ? 'success.main' : 'error.main',
                          }}
                        />
                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                          {permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                
                {user.role === 'employee' && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      As an employee, you have limited permissions. Contact your team leader or administrator for access to additional features.
                    </Typography>
                  </Alert>
                )}
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Additional Sections */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
          Additional Information
        </Typography>
        
        <Grid container spacing={3}>
          {/* Leave Balance Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: 4, boxShadow: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                <EventAvailable /> Leave Balance
              </Typography>
              <Stack spacing={2}>
                {leaveBalances.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No leave balance information available.
                  </Typography>
                ) : (
                  leaveBalances.map((leave) => (
                    <Card key={leave.type} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {leave.icon}
                          <Typography variant="subtitle1" sx={{ ml: 1 }}>
                            {leave.type}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(leave.used / leave.total) * 100}
                          sx={{ mb: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {leave.used} used of {leave.total} days ({leave.total - leave.used} remaining)
                        </Typography>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* Payslips Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: 4, boxShadow: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                <Download /> Payslips
              </Typography>
              <List>
                {payslips.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No payslips available.
                  </Typography>
                ) : (
                  payslips.map((payslip) => (
                    <React.Fragment key={payslip.id}>
                      <ListItem
                        secondaryAction={
                          <Tooltip title="Download Payslip">
                            <IconButton 
                              edge="end" 
                              aria-label="download" 
                              color="primary"
                              onClick={() => handleDownload(payslip.id)}
                            >
                              <Download />
                            </IconButton>
                          </Tooltip>
                        }
                      >
                        <ListItemIcon>
                          <CalendarToday />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${payslip.month} ${payslip.year}`}
                          secondary={payslip.amount}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))
                )}
              </List>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AccessTime />}
                sx={{ mt: 2 }}
              >
                View All Payslips
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
};

export default Profile; 