import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import sessionPersistence from '../../services/sessionPersistence';

interface SessionRestoreProviderProps {
  children: React.ReactNode;
}

const SessionRestoreProvider: React.FC<SessionRestoreProviderProps> = ({ children }) => {
  const [isRestoring, setIsRestoring] = useState(true);
  const [restoreStatus, setRestoreStatus] = useState<string>('Initializing...');

  useEffect(() => {
    const restoreSession = async () => {
      try {
        sessionPersistence.pruneLegacySessionKeys();
        setRestoreStatus('Checking for saved session data...');
        
        // Always ensure registered users are preserved (they never expire)
        // Registered users are stored separately and should persist indefinitely
        
        // Check if there's any session data to restore
        if (sessionPersistence.hasSessionData()) {
          setRestoreStatus('Restoring session data...');
          
          // Restore session data (will check expiration)
          const restored = sessionPersistence.restoreSessionData();
          
          if (restored) {
            setRestoreStatus('Session data restored successfully!');
            console.log('Session restored successfully');
          } else {
            setRestoreStatus('No valid session data found');
            console.log('No valid session data to restore');
          }
        } else {
          setRestoreStatus('No previous session found');
          console.log('No previous session found');
        }
        
        // Ensure registered users persist (they're stored separately)
        // This ensures users don't lose their registered accounts
        
        setIsRestoring(false);
      } catch (error) {
        console.error('Error during session restoration:', error);
        setRestoreStatus('Error restoring session data');
        setIsRestoring(false);
      }
    };

    restoreSession();

    // Never block the UI indefinitely (slow mobile networks / storage errors)
    const failSafe = window.setTimeout(() => setIsRestoring(false), 2500);
    return () => window.clearTimeout(failSafe);
  }, []);

  if (isRestoring) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <CircularProgress 
          size={60} 
          sx={{ 
            mb: 3,
            color: '#2196F3'
          }} 
        />
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#212121',
            textAlign: 'center',
            maxWidth: 400,
            px: 2
          }}
        >
          {restoreStatus}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#757575',
            mt: 1,
            textAlign: 'center',
            maxWidth: 400,
            px: 2
          }}
        >
          Ensuring your data is preserved across sessions...
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default SessionRestoreProvider;
