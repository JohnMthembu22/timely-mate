import React from 'react';
import { Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { completeReset } from '../utils/completeReset';

/**
 * A simple button component that allows users to completely reset the application
 * and start fresh without any demo data
 */
const FreshStartButton: React.FC = () => {
  return (
    <Button
      variant="outlined"
      color="primary"
      size="small"
      startIcon={<RefreshIcon />}
      onClick={completeReset}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '&:hover': {
          backgroundColor: '#f5f5f5'
        }
      }}
    >
      Fresh Start
    </Button>
  );
};

export default FreshStartButton;
