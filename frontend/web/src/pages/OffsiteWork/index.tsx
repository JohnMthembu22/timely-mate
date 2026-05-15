import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Switch,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  QrCode2,
  CloudUpload,
  FlightTakeoff,
  SignalWifiOff,
  CameraAlt,
  Construction,
  Storage,
  Timeline,
  LocationOn,
  Speed,
  Map,
  PhotoCamera,
  Scanner,
  Sync,
  Visibility,
  NotificationsActive,
  Settings,
  Add,
  ArrowForward,
  CheckCircle,
  Error,
  WifiOff,
  CloudDone,
  CloudQueue,
  CloudOff,
  MyLocation,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import FeatureGuard from '../../components/FeatureGuard';
import MapDialog from './MapDialog';
// No longer need mock data utilities

interface SiteLocation {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'completed' | 'pending';
  lastUpdate: string;
  progress: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface ScannedItem {
  id: string;
  type: 'qr' | 'object';
  data: string;
  timestamp: string;
}

interface QueuedItem {
  id: string;
  data: string;
  timestamp: string;
  status: 'queued' | 'syncing' | 'completed' | 'error';
  retryCount: number;
}

// Empty arrays for site locations, scanned items, and queued items - no mock data
const emptyLocations: SiteLocation[] = [];
const emptyScannedItems: ScannedItem[] = [];
const emptyQueuedItems: QueuedItem[] = [];

const OffsiteWork: React.FC = () => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SiteLocation | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [locations, setLocations] = useState<SiteLocation[]>([]);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [queuedItems, setQueuedItems] = useState<QueuedItem[]>([]);

  // Settings state
  const [settings, setSettings] = useState({
    realTimeUpdates: true,
    pushNotifications: true,
    offlineStorage: true,
  });

  // Add Location form state
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    progress: 0,
    coordinates: { lat: 0, lng: 0 }
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleViewMap = (location: SiteLocation) => {
    setSelectedLocation(location);
    setMapDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('offsiteWorkSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const handleSettingsChange = (setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('offsiteWorkSettings', JSON.stringify(settings));
      setSettingsOpen(false);
      
      // Show success notification
      console.log('Settings saved successfully:', settings);
      
      // You can add a notification here if you have a notification system
      // addNotification(createNotification({
      //   type: 'system',
      //   title: 'Settings Saved',
      //   description: 'Your offsite work settings have been saved successfully.',
      //   time: new Date().toLocaleTimeString(),
      // }));
      
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Load locations from localStorage on component mount
  useEffect(() => {
    const savedLocations = localStorage.getItem('offsiteWorkLocations');
    if (savedLocations) {
      try {
        setLocations(JSON.parse(savedLocations));
      } catch (error) {
        console.error('Error loading locations:', error);
      }
    }
  }, []);

  // Save locations to localStorage whenever locations change
  useEffect(() => {
    localStorage.setItem('offsiteWorkLocations', JSON.stringify(locations));
  }, [locations]);

  // Location management functions
  const handleAddLocation = () => {
    if (!newLocation.name.trim() || !newLocation.address.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const location: SiteLocation = {
      id: Date.now().toString(),
      name: newLocation.name,
      address: newLocation.address,
      status: 'pending',
      lastUpdate: new Date().toISOString(),
      progress: newLocation.progress,
      coordinates: newLocation.coordinates
    };

    setLocations(prev => [...prev, location]);
    setNewLocation({ name: '', address: '', progress: 0, coordinates: { lat: 0, lng: 0 } });
    setLocationDialogOpen(false);
    
    console.log('Location added successfully:', location);
  };

  const handleLocationStatusChange = (locationId: string, newStatus: 'active' | 'completed' | 'pending') => {
    setLocations(prev => prev.map(loc => 
      loc.id === locationId 
        ? { ...loc, status: newStatus, lastUpdate: new Date().toISOString() }
        : loc
    ));
  };

  const handleLocationProgressUpdate = (locationId: string, progress: number) => {
    setLocations(prev => prev.map(loc => 
      loc.id === locationId 
        ? { ...loc, progress: Math.max(0, Math.min(100, progress)), lastUpdate: new Date().toISOString() }
        : loc
    ));
  };

  const handleDeleteLocation = (locationId: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      setLocations(prev => prev.filter(loc => loc.id !== locationId));
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewLocation(prev => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
          console.log('Current location obtained:', position.coords);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please enter coordinates manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <DashboardLayout>
      <FeatureGuard feature="offsiteWork">
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2196f3 0%, #e91e63 100%)',
            pt: 6,
            pb: 4,
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ color: 'white', mb: 6 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h2" component="h1" sx={{ fontWeight: 600 }}>
                  Offsite Work
                </Typography>
                <IconButton 
                  color="inherit" 
                  onClick={() => setSettingsOpen(true)}
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                    mt: '55px'
                  }}
                >
                  <Settings />
                </IconButton>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 400, opacity: 0.9 }}>
                Manage and track your remote projects with advanced tools
              </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
                  <CardContent>
                    <Stack spacing={2} alignItems="center" textAlign="center">
                      <LocationOn sx={{ fontSize: 40, color: '#2196f3' }} />
                      <Typography variant="h4" fontWeight="medium">
                        {locations.length}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Active Sites
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
                  <CardContent>
                    <Stack spacing={2} alignItems="center" textAlign="center">
                      <Scanner sx={{ fontSize: 40, color: '#2196f3' }} />
                      <Typography variant="h4" fontWeight="medium">
                        {scannedItems.length}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Items Scanned
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
                  <CardContent>
                    <Stack spacing={2} alignItems="center" textAlign="center">
                      <CloudQueue sx={{ fontSize: 40, color: '#2196f3' }} />
                      <Typography variant="h4" fontWeight="medium">
                        {queuedItems.filter(item => item.status === 'queued').length}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Pending Sync
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
                  <CardContent>
                    <Stack spacing={2} alignItems="center" textAlign="center">
                      <Timeline sx={{ fontSize: 40, color: '#2196f3' }} />
                      <Typography variant="h4" fontWeight="medium">
                        {locations.length > 0 ? Math.round(locations.reduce((sum, loc) => sum + loc.progress, 0) / locations.length) : 0}%
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Avg Progress
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{ mt: -4 }}>
          {/* Quick Actions */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 4, 
                  bgcolor: 'background.paper', 
                  boxShadow: 2,
                  height: '100%',
                }}
              >
                <Typography variant="h6" fontWeight="medium" sx={{ mb: 3 }}>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<QrCode2 />}
                      onClick={() => setScannerOpen(true)}
                      sx={{ 
                        p: 2, 
                        borderRadius: 3,
                        height: '100%',
                        borderColor: 'primary.main',
                        '&:hover': { borderColor: 'primary.dark' },
                      }}
                    >
                      <Stack spacing={1}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          Scan QR Code
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Track items and verify locations
                        </Typography>
                      </Stack>
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Scanner />}
                      onClick={() => setScannerOpen(true)}
                      sx={{ 
                        p: 2, 
                        borderRadius: 3,
                        height: '100%',
                        borderColor: 'secondary.main',
                        color: 'secondary.main',
                        '&:hover': { borderColor: 'secondary.dark' },
                      }}
                    >
                      <Stack spacing={1}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          Object Scanner
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Identify and log materials
                        </Typography>
                      </Stack>
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 4, 
                  bgcolor: 'background.paper', 
                  boxShadow: 2,
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="medium">
                    Recent Scans
                  </Typography>
                  <Button 
                    size="small"
                    endIcon={<ArrowForward />}
                    sx={{ textTransform: 'none' }}
                  >
                    View All
                  </Button>
                </Box>
                {scannedItems.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Scanner sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No recent scans
                    </Typography>
                  </Box>
                ) : (
                  <List dense>
                    {scannedItems.slice(0, 3).map((item) => (
                      <ListItem key={item.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                          <QrCode2 color="primary" />
                      </ListItemIcon>
                      <ListItemText
                          primary={item.data}
                          secondary={new Date(item.timestamp).toLocaleString()}
                        />
                    </ListItem>
                  ))}
                </List>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Location Management */}
          <Paper sx={{ p: 4, borderRadius: 4, boxShadow: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="medium">
                Site Locations
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setLocationDialogOpen(true)}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Add Location
              </Button>
            </Box>

            {/* Tabs for different views */}
            <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab label="List View" />
              <Tab label="Map View" />
            </Tabs>

            {/* List View */}
            {currentTab === 0 && (
              <Grid container spacing={3}>
                {locations.length === 0 ? (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Map sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Site Locations
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Add your first site location to start tracking offsite work
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setLocationDialogOpen(true)}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                      >
                        Add First Location
                      </Button>
                    </Box>
                  </Grid>
                ) : (
                  locations.map((location) => (
                    <Grid item xs={12} md={6} key={location.id}>
                      <Card
                        sx={{
                          borderRadius: 4,
                          boxShadow: 1,
                          '&:hover': {
                            boxShadow: 4,
                            transform: 'translateY(-4px)',
                            transition: 'all 0.2s ease-in-out',
                          },
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Box>
                              <Typography variant="h6" fontWeight="medium">
                                {location.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {location.address}
                              </Typography>
                            </Box>
                            <Chip
                              label={location.status}
                              color={getStatusColor(location.status)}
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Progress
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  flexGrow: 1,
                                  bgcolor: 'action.hover',
                                  borderRadius: 3,
                                  height: 6,
                                  position: 'relative',
                                  overflow: 'hidden',
                                }}
                              >
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    height: '100%',
                                    bgcolor: 'primary.main',
                                    width: `${location.progress}%`,
                                    borderRadius: 3,
                                  }}
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {location.progress}%
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Last update: {location.lastUpdate}
                            </Typography>
                            <Button
                              variant="outlined"
                              startIcon={<Map />}
                              onClick={() => handleViewMap(location)}
                              sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                              View Map
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            )}

            {/* Map View */}
            {currentTab === 1 && (
              <Box>
                {locations.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Map sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Locations to Display
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Add site locations to see them on the map
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setLocationDialogOpen(true)}
                      sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                      Add Location
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ height: '400px', borderRadius: 3, overflow: 'hidden', bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Map sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Map View
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {locations.length} location{locations.length !== 1 ? 's' : ''} available
                            </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<LocationOn />}
                        onClick={() => {
                          if (locations.length > 0) {
                            setSelectedLocation(locations[0]);
                            setMapDialogOpen(true);
                          }
                        }}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                      >
                        View First Location
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Container>

        {/* Scanner Dialog */}
        <Dialog
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="medium">
              Scanner
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                aspectRatio: '4/3',
                bgcolor: 'action.hover',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <PhotoCamera sx={{ fontSize: 48, color: 'text.secondary' }} />
            </Box>
            <Typography variant="body2" color="text.secondary" align="center">
              Point your camera at a QR code or object to scan
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setScannerOpen(false)}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<CameraAlt />}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Take Photo
            </Button>
          </DialogActions>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="medium">
              Offsite Work Settings
            </Typography>
          </DialogTitle>
          <DialogContent>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Visibility />
                </ListItemIcon>
                <ListItemText
                  primary="Real-time Updates"
                  secondary="Receive instant updates from all sites"
                />
                <ListItemSecondaryAction>
                  <Switch 
                    checked={settings.realTimeUpdates}
                    onChange={(e) => handleSettingsChange('realTimeUpdates', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <NotificationsActive />
                </ListItemIcon>
                <ListItemText
                  primary="Push Notifications"
                  secondary="Get notified of important events"
                />
                <ListItemSecondaryAction>
                  <Switch 
                    checked={settings.pushNotifications}
                    onChange={(e) => handleSettingsChange('pushNotifications', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <Storage />
                </ListItemIcon>
                <ListItemText
                  primary="Offline Storage"
                  secondary="Store data locally when offline"
                />
                <ListItemSecondaryAction>
                  <Switch 
                    checked={settings.offlineStorage}
                    onChange={(e) => handleSettingsChange('offlineStorage', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setSettingsOpen(false)}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveSettings}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Location Dialog */}
        <Dialog
          open={locationDialogOpen}
          onClose={() => setLocationDialogOpen(false)}
          maxWidth="sm"
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
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: 3,
            px: 4,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1), rgba(255,255,255,0.3))'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <LocationOn sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Add New Location
            </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  Create a new offsite work location
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Site Name"
                fullWidth
                value={newLocation.name}
                onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                label="Address"
                fullWidth
                multiline
                rows={2}
                value={newLocation.address}
                onChange={(e) => setNewLocation(prev => ({ ...prev, address: e.target.value }))}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                label="Initial Progress (%)"
                type="number"
                fullWidth
                value={newLocation.progress}
                onChange={(e) => setNewLocation(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                inputProps={{ min: 0, max: 100 }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="Latitude"
                  type="number"
                  value={newLocation.coordinates.lat}
                  onChange={(e) => setNewLocation(prev => ({ 
                    ...prev, 
                    coordinates: { ...prev.coordinates, lat: parseFloat(e.target.value) || 0 }
                  }))}
                  sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  label="Longitude"
                  type="number"
                  value={newLocation.coordinates.lng}
                  onChange={(e) => setNewLocation(prev => ({ 
                    ...prev, 
                    coordinates: { ...prev.coordinates, lng: parseFloat(e.target.value) || 0 }
                  }))}
                  sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                  <Button
                    variant="outlined"
                  startIcon={<MyLocation />}
                  onClick={handleGetCurrentLocation}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                  Get Current
                  </Button>
                </Box>
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
                onClick={() => setLocationDialogOpen(false)}
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
                onClick={handleAddLocation}
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
                  }
                }}
              >
                Add Location
            </Button>
            </Box>
          </DialogActions>
        </Dialog>

        <MapDialog
          open={mapDialogOpen}
          onClose={() => setMapDialogOpen(false)}
          locations={locations}
          selectedLocation={selectedLocation}
          onLocationClick={(location) => setSelectedLocation(location)}
          getStatusColor={getStatusColor}
        />
      </FeatureGuard>
    </DashboardLayout>
  );
};

export default OffsiteWork; 