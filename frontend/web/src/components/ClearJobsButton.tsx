import React from 'react';
import { Button } from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { clearJobs } from '../utils/clearJobs';

/**
 * A button component that allows users to clear all jobs from the time tracking screen
 * without resetting the entire application
 */
const ClearJobsButton: React.FC = () => {
  return (
    <Button
      variant="outlined"
      color="secondary"
      size="small"
      startIcon={<DeleteSweepIcon />}
      onClick={clearJobs}
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 1000,
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '&:hover': {
          backgroundColor: '#f5f5f5'
        }
      }}
    >
      Clear All Jobs
    </Button>
  );
};

export default ClearJobsButton;
