import React from 'react';
import { Button } from '@mui/material';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import { removeAllMockData } from '../utils/removeAllMockData';

/**
 * A button component that removes all mock data from the application
 * and provides a clean slate with no dummy data
 */
const RemoveMockDataButton: React.FC = () => {
  return (
    <Button
      variant="contained"
      color="primary"
      size="medium"
      startIcon={<CleaningServicesIcon />}
      onClick={removeAllMockData}
      sx={{
        position: 'fixed',
        bottom: 80, // Position above other buttons
        right: 16,
        zIndex: 1000,
        backgroundColor: '#4caf50', // Green color to distinguish it
        boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
        '&:hover': {
          backgroundColor: '#388e3c'
        }
      }}
    >
      Remove All Mock Data
    </Button>
  );
};

export default RemoveMockDataButton;
