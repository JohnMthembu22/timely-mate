import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  LocationOn,
  Storage,
  Visibility,
  NotificationsActive,
  Settings,
  MyLocation,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import FeatureGuard from '../../components/FeatureGuard';
import MapDialog from './MapDialog';
import { OffsiteWorkSubNav } from './OffsiteWorkSubNav';
import { FieldOpsConsole } from './FieldOpsConsole';
import { LiveFieldOpsDashboard } from './LiveFieldOpsDashboard';
import { MobileFieldOpsBar } from './MobileFieldOpsBar';
import { MobileWorkforceToolDialog } from './MobileWorkforceToolDialog';
import { FieldScannerCapture, type FieldScanResult } from './FieldScannerCapture';
import { fieldPageContentSx } from './fieldOpsStyles';
import { useAppSelector } from '../../store';
import { useEmployees } from '../../contexts/EmployeeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { getAuthUserLabel } from '../../utils/managerReview';
import { getOffsiteAssignableEmployees } from '../../utils/offsiteWorkers';
import { notifyJobSubmittedToBriefedBy } from '../../utils/jobLineManager';
import { createNotification } from '../../contexts/NotificationContext';
import { notifyFieldWorkSubmitted } from './fieldOpsReview';
import {
  createOffsiteAssignment,
  loadOffsiteAssignments,
  resolveBriefedByForFieldSubmission,
  saveOffsiteAssignments,
  type OffsiteFieldAssignment,
} from './offsiteAssignments';
import { recipientIdFromEmail } from '../../utils/taskReview';
import type { MobileToolSubmitPayload, MobileWorkforceTool } from './mobileWorkforceTypes';
import type { QueuedItem, ScannedItem, SiteLocation, SiteType } from './types';

const OffsiteWork: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const { employees } = useEmployees();
  const { addNotification, addNotificationForRecipient } = useNotifications();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<'qr' | 'object'>('qr');
  const [mobileTool, setMobileTool] = useState<MobileWorkforceTool | null>(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SiteLocation | null>(null);
  const [locations, setLocations] = useState<SiteLocation[]>([]);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [queuedItems, setQueuedItems] = useState<QueuedItem[]>([]);
  const [fieldAssignments, setFieldAssignments] = useState<OffsiteFieldAssignment[]>(() =>
    loadOffsiteAssignments()
  );

  const offsiteWorkers = useMemo(() => getOffsiteAssignableEmployees(employees), [employees]);

  // Settings state
  const [settings, setSettings] = useState({
    realTimeUpdates: true,
    pushNotifications: true,
    offlineStorage: true,
  });

  // Add Location form state
  const [newLocation, setNewLocation] = useState<{
    name: string;
    address: string;
    progress: number;
    siteType: SiteType;
    coordinates: { lat: number; lng: number };
  }>({
    name: '',
    address: '',
    progress: 0,
    siteType: 'general',
    coordinates: { lat: 0, lng: 0 },
  });

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

  useEffect(() => {
    const savedScans = localStorage.getItem('offsiteWorkScans');
    if (savedScans) {
      try {
        setScannedItems(JSON.parse(savedScans));
      } catch (error) {
        console.error('Error loading scans:', error);
      }
    }
    const savedQueue = localStorage.getItem('offsiteWorkQueue');
    if (savedQueue) {
      try {
        setQueuedItems(JSON.parse(savedQueue));
      } catch (error) {
        console.error('Error loading queue:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('offsiteWorkScans', JSON.stringify(scannedItems));
  }, [scannedItems]);

  useEffect(() => {
    localStorage.setItem('offsiteWorkQueue', JSON.stringify(queuedItems));
  }, [queuedItems]);

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
      coordinates: newLocation.coordinates,
      siteType: newLocation.siteType,
      assignedCrew: 'Field crew',
    };

    setLocations(prev => [...prev, location]);
    setNewLocation({ name: '', address: '', progress: 0, siteType: 'general', coordinates: { lat: 0, lng: 0 } });
    setLocationDialogOpen(false);
    
    console.log('Location added successfully:', location);
  };

  const handleLocationStatusChange = (locationId: string, newStatus: 'active' | 'completed' | 'pending') => {
    setLocations(prev => prev.map(loc => 
      loc.id === locationId 
        ? { ...loc, status: newStatus, lastUpdate: new Date().toISOString() }
        : loc
    ));

    if (newStatus === 'completed') {
      const site = locations.find((l) => l.id === locationId);
      const submitterLabel = getAuthUserLabel(user ?? undefined);
      const briefedBy = resolveBriefedByForFieldSubmission(employees, user ?? undefined, locationId);
      notifyJobSubmittedToBriefedBy({
        briefedBy,
        submitterEmail: user?.email,
        employees,
        notification: {
          ...createNotification.system(
            'Site work marked complete',
            `${submitterLabel} marked "${site?.name ?? 'Field site'}" complete and sent it for your review.`,
            'high'
          ),
          actionUrl: '/offsite-work',
        },
        addNotificationForRecipient,
        addNotification,
      });
      setFieldAssignments((prev) => {
        const next = prev.map((a) =>
          a.siteId === locationId && a.status !== 'completed'
            ? { ...a, status: 'pending_review' as const }
            : a
        );
        saveOffsiteAssignments(next);
        return next;
      });
    }
  };

  const handleAssignFieldWork = (input: {
    title: string;
    description?: string;
    siteId?: string;
    assigneeIds: string[];
    dueDate?: string;
  }) => {
    const site = input.siteId ? locations.find((l) => l.id === input.siteId) : undefined;
    const assignment = createOffsiteAssignment({
      ...input,
      siteName: site?.name,
      employees,
      briefedByUser: user ?? undefined,
    });
    setFieldAssignments((prev) => {
      const next = [assignment, ...prev];
      saveOffsiteAssignments(next);
      return next;
    });

    assignment.assigneeEmails.forEach((email) => {
      const recipientId = recipientIdFromEmail(email);
      if (recipientId) {
        addNotificationForRecipient(
          recipientId,
          createNotification.system(
            'New field assignment',
            `${getAuthUserLabel(user ?? undefined)} briefed you: "${assignment.title}"${site ? ` at ${site.name}` : ''}.`,
            'high'
          )
        );
      }
    });

    addNotification(
      createNotification.system(
        'Field work assigned',
        `"${assignment.title}" briefed to ${assignment.assigneeNames.join(', ')}.`,
        'medium'
      )
    );
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

  const handleOpenScanner = (mode: 'qr' | 'object') => {
    setScannerMode(mode);
    setScannerOpen(true);
  };

  const handleOpenMobileTool = (tool: MobileWorkforceTool) => {
    setMobileTool(tool);
  };

  const handleMobileToolSubmit = (payload: MobileToolSubmitPayload) => {
    const now = new Date().toISOString();

    if (payload.siteId) {
      setLocations((prev) =>
        prev.map((loc) => {
          if (loc.id !== payload.siteId) return loc;
          const updates: Partial<SiteLocation> = { lastUpdate: now };
          if (payload.tool === 'gps') {
            updates.status = 'active';
          }
          if (payload.tool === 'inspection' && loc.progress < 100) {
            updates.progress = Math.min(100, loc.progress + 10);
          }
          return { ...loc, ...updates };
        })
      );
    }

    if (payload.tool === 'photo' && payload.photoDataUrl) {
      const photoRecord = {
        id: `photo-${Date.now()}`,
        userId: payload.capturedByUserId,
        userName: payload.capturedByName,
        siteId: payload.siteId,
        siteName: payload.siteName,
        caption: payload.summary,
        dataUrl: payload.photoDataUrl,
        timestamp: now,
      };
      try {
        const existing = JSON.parse(localStorage.getItem('offsiteWorkPhotos') ?? '[]');
        const photos = Array.isArray(existing) ? existing : [];
        localStorage.setItem('offsiteWorkPhotos', JSON.stringify([photoRecord, ...photos].slice(0, 40)));
      } catch {
        /* storage quota — still log scan row */
      }
      setScannedItems((prev) => [
        {
          id: photoRecord.id,
          type: 'object',
          data: `PHOTO · ${payload.summary}`,
          timestamp: now,
          siteId: payload.siteId,
        },
        ...prev,
      ]);
    }

    if (payload.tool === 'logistics') {
      const podId = `pod-${Date.now()}`;
      if (payload.signatureDataUrl) {
        try {
          const existing = JSON.parse(localStorage.getItem('offsiteWorkSignatures') ?? '[]');
          const records = Array.isArray(existing) ? existing : [];
          localStorage.setItem(
            'offsiteWorkSignatures',
            JSON.stringify([
              {
                id: podId,
                recipient: payload.summary,
                siteName: payload.siteName ?? payload.fieldLocationLabel,
                dataUrl: payload.signatureDataUrl,
                capturedBy: payload.capturedByName,
                timestamp: now,
              },
              ...records,
            ].slice(0, 30))
          );
        } catch {
          /* storage */
        }
      }
      setScannedItems((prev) => [
        {
          id: podId,
          type: 'qr',
          data: `POD · ${payload.summary}`,
          timestamp: now,
          siteId: payload.siteId,
        },
        ...prev,
      ]);
    }

    if (offlineMode || settings.offlineStorage) {
      setQueuedItems((prev) => [
        {
          id: `q-mobile-${Date.now()}`,
          data: payload.summary,
          timestamp: now,
          status: offlineMode ? 'queued' : 'syncing',
          retryCount: 0,
        },
        ...prev,
      ]);
    }

    notifyFieldWorkSubmitted({
      payload,
      employees,
      user: user ?? undefined,
      addNotificationForRecipient,
      addNotification,
    });
  };

  const handleScannerResult = (result: FieldScanResult) => {
    const now = new Date().toISOString();
    const scan: ScannedItem = {
      id: Date.now().toString(),
      type: scannerMode,
      data: result.data,
      timestamp: now,
      siteId: locations[0]?.id,
    };

    if (result.imageDataUrl) {
      try {
        const existing = JSON.parse(localStorage.getItem('offsiteWorkScanImages') ?? '[]');
        const records = Array.isArray(existing) ? existing : [];
        localStorage.setItem(
          'offsiteWorkScanImages',
          JSON.stringify(
            [
              {
                id: scan.id,
                mode: scannerMode,
                data: result.data,
                format: result.format,
                dataUrl: result.imageDataUrl,
                capturedBy: getAuthUserLabel(user ?? undefined),
                timestamp: now,
              },
              ...records,
            ].slice(0, 40)
          )
        );
      } catch {
        /* storage quota */
      }
    }

    setScannedItems((prev) => [scan, ...prev]);
    if (settings.offlineStorage || offlineMode) {
      const queued: QueuedItem = {
        id: `q-${scan.id}`,
        data: scan.data,
        timestamp: scan.timestamp,
        status: offlineMode ? 'queued' : 'syncing',
        retryCount: 0,
      };
      setQueuedItems((prev) => [queued, ...prev]);
      if (!offlineMode) {
        window.setTimeout(() => {
          setQueuedItems((prev) =>
            prev.map((q) => (q.id === queued.id ? { ...q, status: 'completed' as const } : q))
          );
        }, 1200);
      }
    }

    addNotification(
      createNotification.system(
        scannerMode === 'qr' ? 'QR verified' : 'Material scanned',
        `${getAuthUserLabel(user ?? undefined)} logged: ${result.data.slice(0, 80)}`,
        'medium'
      )
    );
    setScannerOpen(false);
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
            <Box sx={{ color: 'white', mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h2" component="h1" sx={{ fontWeight: 600 }}>
                  Field Operations
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
                Manage field sites, crews, and live operational signals
              </Typography>
            </Box>

            <OffsiteWorkSubNav />

            <Box sx={{ mt: 2, mb: { xs: 2.5, md: 3 } }}>
              <LiveFieldOpsDashboard />
            </Box>
          </Container>
        </Box>

        <Container maxWidth="xl" disableGutters sx={{ mt: { xs: 1.5, md: 2 }, ...fieldPageContentSx }}>
          <FieldOpsConsole
            locations={locations}
            scannedItems={scannedItems}
            queuedItems={queuedItems}
            employees={employees}
            offsiteWorkers={offsiteWorkers}
            fieldAssignments={fieldAssignments}
            onAssignFieldWork={handleAssignFieldWork}
            onAddSite={() => setLocationDialogOpen(true)}
            onViewMap={handleViewMap}
            onOpenScanner={handleOpenScanner}
            onOpenMobileTool={handleOpenMobileTool}
            onDeleteSite={handleDeleteLocation}
            onStatusChange={handleLocationStatusChange}
            onProgressChange={handleLocationProgressUpdate}
            getStatusColor={getStatusColor}
            offlineMode={offlineMode}
            onToggleOffline={() => setOfflineMode((v) => !v)}
            onInsightNotify={(title, description, priority = 'medium') => {
              addNotification(createNotification.system(title, description, priority));
            }}
          />
        </Container>

        <MobileFieldOpsBar
          offlineMode={offlineMode}
          onToggleOffline={() => setOfflineMode((v) => !v)}
          onQuickCheckIn={() => handleOpenMobileTool('gps')}
          onQuickScan={() => handleOpenScanner('qr')}
          onVoiceNote={() => {
            addNotification(
              createNotification.system(
                'Voice note',
                'Voice capture will attach to your active field assignment (coming soon).',
                'low'
              )
            );
          }}
          onImageUpload={() => handleOpenMobileTool('photo')}
          onGpsVerify={() => handleOpenMobileTool('gps')}
          onEmergency={() => handleOpenMobileTool('escalate')}
          onWhatsApp={() => {
            addNotification(
              createNotification.system(
                'WhatsApp dispatch',
                'Crew WhatsApp bridge will open your briefing thread (integration placeholder).',
                'low'
              )
            );
          }}
          onCompleteTask={() => {
            const active = fieldAssignments.find((a) => a.status === 'assigned' || a.status === 'in_progress');
            if (active) {
              addNotification(
                createNotification.system(
                  'Task completion',
                  `Mark "${active.title}" complete from Task Management or submit site sign-off.`,
                  'medium'
                )
              );
            } else {
              addNotification(
                createNotification.system(
                  'Task completion',
                  'No active field assignments — assign work or complete a site from the console.',
                  'low'
                )
              );
            }
          }}
        />

        <MobileWorkforceToolDialog
          tool={mobileTool}
          open={mobileTool !== null}
          onClose={() => setMobileTool(null)}
          locations={locations}
          offlineMode={offlineMode}
          onSubmit={handleMobileToolSubmit}
        />

        {/* Scanner Dialog — live camera QR / material scan */}
        <Dialog
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              {scannerMode === 'qr' ? 'QR verify' : 'Material scan'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {scannerMode === 'qr'
                ? 'Your device camera opens automatically to verify site codes'
                : 'Scan barcodes, QR tags, or material labels with your phone camera'}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <FieldScannerCapture
              active={scannerOpen}
              mode={scannerMode}
              userName={getAuthUserLabel(user ?? undefined)}
              accentColor={scannerMode === 'qr' ? '#6366f1' : '#f59e0b'}
              onScan={handleScannerResult}
            />
            {offlineMode && (
              <Typography variant="caption" color="warning.main" display="block" textAlign="center" sx={{ mt: 1.5 }}>
                Offline mode — scans queue for sync when back online
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setScannerOpen(false)} sx={{ borderRadius: 2, textTransform: 'none' }}>
              Close
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
              Field Operations Settings
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
          <DialogTitle sx={{ position: 'relative' }}>
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
                  Create a new field site location
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
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                <InputLabel>Operation type</InputLabel>
                <Select
                  label="Operation type"
                  value={newLocation.siteType}
                  onChange={(e) => setNewLocation((prev) => ({ ...prev, siteType: e.target.value as SiteType }))}
                >
                  <MenuItem value="visit">Site visit</MenuItem>
                  <MenuItem value="installation">Installation</MenuItem>
                  <MenuItem value="inspection">Inspection</MenuItem>
                  <MenuItem value="logistics">Logistics</MenuItem>
                  <MenuItem value="general">Field task</MenuItem>
                </Select>
              </FormControl>
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