import React, { useState } from 'react';
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
  ListItemSecondaryAction,
  Switch,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Stack,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Language,
  Palette,
  Notifications,
  Security,
  AccessTime,
  AttachMoney,
  Save,
  Settings as SettingsIcon,
  ColorLens,
  NotificationsActive,
  Shield,
  Timer,
  LightMode,
  DarkMode,
  Computer,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useTheme } from '../../contexts/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import AdminUserManager from '../../components/AdminUserManager';

const Settings: React.FC = () => {
  const { currency, setCurrency, isLoading, error, detectedCountry } = useCurrency();
  const { mode, setMode } = useTheme();
  const { canManageUsers } = usePermissions();
  const [settings, setSettings] = useState({
    language: 'en',
    timeZone: 'Africa/Johannesburg',
    dateFormat: 'DD/MM/YYYY',
    notifications: {
      email: true,
      push: true,
      desktop: false,
    },
    security: {
      twoFactor: true,
      sessionTimeout: 30,
    },
  });

  const handleSaveSettings = () => {
    // Here you would typically make an API call to save the settings
    console.log('Saving settings:', settings);
  };

  const handleThemeChange = (newTheme: string) => {
    if (newTheme === 'system') {
      // Remove manual theme preference to use system preference
      localStorage.removeItem('themeMode');
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setMode(mediaQuery.matches ? 'dark' : 'light');
    } else {
      setMode(newTheme as 'light' | 'dark');
    }
  };

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return <LightMode />;
      case 'dark':
        return <DarkMode />;
      case 'system':
        return <Computer />;
      default:
        return <ColorLens />;
    }
  };

  const getThemeLabel = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Theme';
    }
  };

  return (
    <DashboardLayout>
      {/* Header Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2196F3 0%, #4CAF50 100%)',
          color: 'white',
          pt: 4,
          pb: 6,
          px: 3,
          mb: 4,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <SettingsIcon sx={{ fontSize: 40 }} />
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              Settings
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
            Manage your application preferences and configurations
          </Typography>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: -4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Left Column - Main Settings */}
          <Grid item xs={12} md={8}>
            {/* Regional Settings Section */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Language /> Regional Settings
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={settings.language}
                      label="Language"
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="af">Afrikaans</MenuItem>
                      <MenuItem value="zu">isiZulu</MenuItem>
                      <MenuItem value="xh">isiXhosa</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Time Zone</InputLabel>
                    <Select
                      value={settings.timeZone}
                      label="Time Zone"
                      onChange={(e) => setSettings({ ...settings, timeZone: e.target.value })}
                    >
                      <MenuItem value="Africa/Johannesburg">South Africa (GMT+2)</MenuItem>
                      <MenuItem value="Africa/Lagos">West Africa (GMT+1)</MenuItem>
                      <MenuItem value="Africa/Nairobi">East Africa (GMT+3)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={currency}
                      label="Currency"
                      onChange={(e) => setCurrency(e.target.value as string)}
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
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      value={settings.dateFormat}
                      label="Date Format"
                      onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                    >
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              {detectedCountry && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Currency automatically detected for {detectedCountry}
                </Alert>
              )}
            </Paper>

            {/* Notification Preferences Section */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsActive /> Notification Preferences
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Notifications />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive important updates via email"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.notifications.email}
                      onChange={() => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          email: !settings.notifications.email,
                        },
                      })}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Notifications />
                  </ListItemIcon>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Receive push notifications on your device"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.notifications.push}
                      onChange={() => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          push: !settings.notifications.push,
                        },
                      })}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Notifications />
                  </ListItemIcon>
                  <ListItemText
                    primary="Desktop Notifications"
                    secondary="Show notifications on your desktop"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.notifications.desktop}
                      onChange={() => setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          desktop: !settings.notifications.desktop,
                        },
                      })}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>

            {/* User Management Section - Admin Only */}
            {canManageUsers && (
              <Box sx={{ mb: 3 }}>
                <AdminUserManager />
              </Box>
            )}

            {/* Security Settings Section */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Shield /> Security Settings
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Security />
                  </ListItemIcon>
                  <ListItemText
                    primary="Two-Factor Authentication"
                    secondary="Add an extra layer of security"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.security.twoFactor}
                      onChange={() => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          twoFactor: !settings.security.twoFactor,
                        },
                      })}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Timer />
                  </ListItemIcon>
                  <ListItemText
                    primary="Session Timeout"
                    secondary="Automatically log out after inactivity"
                  />
                  <ListItemSecondaryAction>
                    <FormControl sx={{ width: 100 }}>
                      <Select
                        value={settings.security.sessionTimeout}
                        size="small"
                        onChange={(e) => setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            sessionTimeout: Number(e.target.value),
                          },
                        })}
                      >
                        <MenuItem value={15}>15 min</MenuItem>
                        <MenuItem value={30}>30 min</MenuItem>
                        <MenuItem value={60}>1 hour</MenuItem>
                      </Select>
                    </FormControl>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Right Column - Theme and Actions */}
          <Grid item xs={12} md={4}>
            {/* Theme Settings Section */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ColorLens /> Theme Settings
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={mode}
                  label="Theme"
                  onChange={(e) => handleThemeChange(e.target.value)}
                >
                  <MenuItem value="light">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LightMode />
                      Light
                    </Box>
                  </MenuItem>
                  <MenuItem value="dark">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DarkMode />
                      Dark
                    </Box>
                  </MenuItem>
                  <MenuItem value="system">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Computer />
                      System
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Choose your preferred theme. System will follow your device's theme setting.
              </Typography>
            </Paper>

            {/* Quick Actions Section */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<Save />}
                  onClick={handleSaveSettings}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={() => setSettings({
                    language: 'en',
                    timeZone: 'Africa/Johannesburg',
                    dateFormat: 'DD/MM/YYYY',
                    notifications: {
                      email: true,
                      push: true,
                      desktop: false,
                    },
                    security: {
                      twoFactor: true,
                      sessionTimeout: 30,
                    },
                  })}
                >
                  Reset to Default
                </Button>
              </Stack>
            </Paper>

            {/* Settings Summary */}
            <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Current Settings
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Language:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {settings.language === 'en' ? 'English' : settings.language}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Theme:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {getThemeLabel(mode)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Currency:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {currency}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Notifications:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {Object.values(settings.notifications).filter(Boolean).length}/3
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
};

export default Settings; 