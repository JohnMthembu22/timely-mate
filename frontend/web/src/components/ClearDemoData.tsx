import React, { useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';

/**
 * Component that provides a button to clear all demo data from localStorage
 */
const ClearDemoData: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  const clearDemoData = () => {
    // Clear authentication data
    localStorage.removeItem('timelymate_token');
    localStorage.removeItem('timelymate_user');
    
    // Clear any other application data that might be stored
    const keysToRemove: string[] = [];
    
    // Find all keys that start with 'timelymate_'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('timelymate_')) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all identified keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    setShowSuccess(true);
    
    // Reload the page after a short delay to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <>
      <Button 
        variant="contained" 
        color="secondary" 
        onClick={clearDemoData}
        sx={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}
      >
        Clear Demo Data
      </Button>
      
      <Snackbar 
        open={showSuccess} 
        autoHideDuration={3000} 
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Demo data cleared successfully! Reloading...
        </Alert>
      </Snackbar>
    </>
  );
};

export default ClearDemoData;
