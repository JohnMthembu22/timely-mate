import React, { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Typography } from '@mui/material';

interface GoogleMapProps {
  locations: Array<{
    id: string;
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
    status: 'active' | 'completed' | 'pending';
  }>;
  selectedLocation?: {
    id: string;
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
    status: 'active' | 'completed' | 'pending';
  } | null;
  onLocationClick?: (location: any) => void;
  height?: string;
}

const MapComponent: React.FC<{
  locations: GoogleMapProps['locations'];
  selectedLocation?: GoogleMapProps['selectedLocation'];
  onLocationClick?: GoogleMapProps['onLocationClick'];
}> = ({ locations, selectedLocation, onLocationClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    if (ref.current && !map && typeof google !== 'undefined' && google.maps) {
      try {
        const mapInstance = new google.maps.Map(ref.current, {
          center: selectedLocation 
            ? { lat: selectedLocation.coordinates.lat, lng: selectedLocation.coordinates.lng }
            : locations.length > 0 
              ? { lat: locations[0].coordinates.lat, lng: locations[0].coordinates.lng }
              : { lat: 40.7128, lng: -74.0060 }, // Default to NYC
          zoom: locations.length > 0 ? 12 : 8,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });
        setMap(mapInstance);
      } catch (error) {
        console.error('Error initializing Google Map:', error);
      }
    }
  }, [ref, map, locations, selectedLocation]);

  useEffect(() => {
    if (map && locations.length > 0 && typeof google !== 'undefined' && google.maps) {
      try {
        // Clear existing markers
        markers.forEach(marker => marker.setMap(null));
        
        const newMarkers: google.maps.Marker[] = [];
        
        locations.forEach(location => {
          if (location.coordinates && location.coordinates.lat !== 0 && location.coordinates.lng !== 0) {
            const marker = new google.maps.Marker({
              position: { lat: location.coordinates.lat, lng: location.coordinates.lng },
              map: map,
              title: location.name,
              icon: {
                url: getMarkerIcon(location.status),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 32)
              }
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 8px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${location.name}</h3>
                  <p style="margin: 0 0 4px 0; font-size: 14px; color: #666;">${location.address}</p>
                  <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; text-transform: capitalize; background-color: ${getStatusColor(location.status)}; color: white;">
                    ${location.status}
                  </span>
                </div>
              `
            });

            marker.addListener('click', () => {
              infoWindow.open(map, marker);
              if (onLocationClick) {
                onLocationClick(location);
              }
            });

            newMarkers.push(marker);
          }
        });

        setMarkers(newMarkers);

        // Fit map to show all markers
        if (newMarkers.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          newMarkers.forEach(marker => {
            const position = marker.getPosition();
            if (position) {
              bounds.extend(position);
            }
          });
          map.fitBounds(bounds);
          
          // Ensure minimum zoom level
          google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
            if (map.getZoom()! > 15) {
              map.setZoom(15);
            }
          });
        }
      } catch (error) {
        console.error('Error creating markers:', error);
      }
    }
  }, [map, locations, onLocationClick]);

  useEffect(() => {
    if (map && selectedLocation && selectedLocation.coordinates) {
      try {
        map.setCenter({ lat: selectedLocation.coordinates.lat, lng: selectedLocation.coordinates.lng });
        map.setZoom(15);
      } catch (error) {
        console.error('Error updating map center:', error);
      }
    }
  }, [map, selectedLocation]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

const getMarkerIcon = (status: string): string => {
  const colors = {
    active: '#4caf50',
    pending: '#ff9800',
    completed: '#9e9e9e'
  };
  
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12" fill="${colors[status as keyof typeof colors] || '#2196f3'}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
    </svg>
  `)}`;
};

const getStatusColor = (status: string): string => {
  const colors = {
    active: '#4caf50',
    pending: '#ff9800',
    completed: '#9e9e9e'
  };
  return colors[status as keyof typeof colors] || '#2196f3';
};

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #2196f3',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ margin: 0, color: '#666' }}>Loading map...</p>
          </div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          backgroundColor: '#f5f5f5',
          flexDirection: 'column'
        }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Map Unavailable</h3>
            <p style={{ margin: '0 0 16px 0', color: '#666' }}>
              Unable to load Google Maps. Please check your internet connection.
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      );
    default:
      return null;
  }
};

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  locations, 
  selectedLocation, 
  onLocationClick, 
  height = '400px' 
}) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

  // If no API key is provided, show a placeholder
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return (
      <div style={{ width: '100%', height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
          <Typography variant="h6" sx={{ marginBottom: '8px', color: '#333' }}>
            Google Maps Integration
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: '16px', color: '#666' }}>
            To enable interactive maps, please add your Google Maps API key to the environment variables.
          </Typography>
          <Typography variant="caption" sx={{ color: '#999' }}>
            Add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <Wrapper apiKey={apiKey} render={render}>
        <MapComponent 
          locations={locations} 
          selectedLocation={selectedLocation}
          onLocationClick={onLocationClick}
        />
      </Wrapper>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default GoogleMap;
