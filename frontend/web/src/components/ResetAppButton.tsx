import React, { useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  Snackbar,
  Alert,
  Typography,
  Box
} from '@mui/material';
import { resetApp } from '../utils/resetApp';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

/**
 * Component that provides a prominent button to reset the application
 * and clear all demo data
 */
const ResetAppButton: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleReset = () => {
    setDialogOpen(false);
    setSnackbarOpen(true);
    
    // Reset after a short delay to allow the snackbar to show
    setTimeout(() => {
      resetApp();
    }, 1500);
  };

  return (
    <>
      {/* Prominent reset button */}
      <Box 
        sx={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          zIndex: 99999,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: 3,
          borderRadius: 2,
          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          pointerEvents: 'auto' // Ensure pointer events work
        }}
        onClick={(e) => e.stopPropagation()} // Prevent click from propagating
      >
        <Typography variant="h5" component="h2" gutterBottom>
          Clear Demo Data
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Click the button below to reset the application and remove all demo data.
        </Typography>
        
        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={<DeleteForeverIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{
            padding: '12px 24px',
            fontSize: '1.2rem',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#d32f2f',
              transform: 'scale(1.05)',
              transition: 'transform 0.2s'
            }
          }}
        >
          Reset Application
        </Button>
      </Box>
      
      {/* Confirmation dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle>
          Reset Application?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will clear all demo data and reset the application to its initial state.
            You will be logged out and all local data will be removed.
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReset} color="error" autoFocus>
            Reset
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Resetting application and clearing all demo data...
        </Alert>
      </Snackbar>
    </>
  );
};

export default ResetAppButton;
