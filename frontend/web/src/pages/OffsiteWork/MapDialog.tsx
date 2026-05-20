import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  Alert,
} from '@mui/material';
import { LocationOn, Map } from '@mui/icons-material';

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

interface MapDialogProps {
  open: boolean;
  onClose: () => void;
  locations: SiteLocation[];
  selectedLocation: SiteLocation | null;
  onLocationClick: (location: SiteLocation) => void;
  getStatusColor: (status: string) => 'success' | 'warning' | 'default';
}

const MapDialog: React.FC<MapDialogProps> = ({
  open,
  onClose,
  locations,
  selectedLocation,
  onLocationClick,
  getStatusColor,
}) => {
  const handleNavigateToLocation = () => {
    if (selectedLocation?.coordinates?.lat && selectedLocation?.coordinates?.lng) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.coordinates.lat},${selectedLocation.coordinates.lng}`;
      window.open(mapsUrl, '_blank');
    } else {
      alert('No coordinates available for this location');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
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
            <LocationOn sx={{ fontSize: 28, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {selectedLocation ? `${selectedLocation.name} - Location Map` : 'Site Locations Map'}
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
              {selectedLocation ? 'View location details and navigate' : 'Explore all offsite work locations'}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {/* Safe Map Placeholder */}
        <Box sx={{ height: '500px', width: '100%', position: 'relative' }}>
          <Box
            sx={{
              height: '100%',
              width: '100%',
              bgcolor: 'grey.100',
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Map Background Pattern */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  linear-gradient(90deg, #e0e0e0 1px, transparent 1px),
                  linear-gradient(0deg, #e0e0e0 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
                opacity: 0.3,
              }}
            />
            
            {/* Map Content */}
            <Box sx={{ textAlign: 'center', zIndex: 2 }}>
              <Map sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Interactive Map
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedLocation ? `Viewing: ${selectedLocation.name}` : 'All Site Locations'}
              </Typography>
              
              {/* Location Info */}
              {selectedLocation && (
                <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: 2, maxWidth: 300 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {selectedLocation.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {selectedLocation.address}
                  </Typography>
                  <Chip 
                    label={selectedLocation.status} 
                    color={getStatusColor(selectedLocation.status)}
                    size="small" 
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        
        {/* Location Details Panel */}
        {selectedLocation && (
          <Box sx={{ 
            p: 4, 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderTop: '1px solid rgba(0,0,0,0.05)'
          }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <LocationOn sx={{ color: 'primary.main', fontSize: 20 }} />
                  Location Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Name</Typography>
                    <Typography variant="body2" fontWeight={600}>{selectedLocation.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Address</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ textAlign: 'right', maxWidth: '60%' }}>{selectedLocation.address}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Status</Typography>
                    <Chip 
                      label={selectedLocation.status} 
                      color={getStatusColor(selectedLocation.status)}
                      size="small" 
                      sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Map sx={{ color: 'primary.main', fontSize: 20 }} />
                  Coordinates & Progress
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Latitude</Typography>
                    <Typography variant="body2" fontWeight={600}>{selectedLocation.coordinates?.lat?.toFixed(6) || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Longitude</Typography>
                    <Typography variant="body2" fontWeight={600}>{selectedLocation.coordinates?.lng?.toFixed(6) || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Progress</Typography>
                    <Typography variant="body2" fontWeight={600} color="primary.main">{selectedLocation.progress}%</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            
            {/* API Key Notice */}
            <Alert 
              severity="info" 
              sx={{ 
                mt: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.05))',
                border: '1px solid rgba(33, 150, 243, 0.2)',
                '& .MuiAlert-icon': {
                  color: 'info.main'
                }
              }}
            >
              <Typography variant="body2">
                <strong>Google Maps Integration:</strong> To enable interactive maps with real-time data, 
                add your Google Maps API key to the environment variables.
              </Typography>
            </Alert>
          </Box>
        )}
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
            onClick={onClose}
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
            Close
          </Button>
          {selectedLocation && selectedLocation.coordinates && (
            <Button
              variant="contained"
              startIcon={<LocationOn />}
              onClick={handleNavigateToLocation}
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
              Navigate to Location
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default MapDialog;