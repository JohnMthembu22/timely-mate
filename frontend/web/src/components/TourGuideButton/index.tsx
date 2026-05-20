import React from 'react';
import { Button, IconButton, Tooltip } from '@mui/material';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import { useGuidedTour } from '../../contexts/GuidedTourContext';

type TourGuideButtonProps = {
  variant?: 'icon' | 'button';
  size?: 'small' | 'medium';
};

const TourGuideButton: React.FC<TourGuideButtonProps> = ({ variant = 'button', size = 'small' }) => {
  const { startTour } = useGuidedTour();

  const handleClick = () => {
    startTour({ force: true });
  };

  if (variant === 'icon') {
    return (
      <Tooltip title="Tour guide">
        <IconButton
          data-tour="tour-guide-button"
          size={size}
          onClick={handleClick}
          aria-label="Start guided tour"
          sx={{ color: 'inherit' }}
        >
          <MapOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      data-tour="tour-guide-button"
      size={size}
      variant="outlined"
      startIcon={<MapOutlinedIcon />}
      onClick={handleClick}
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        borderColor: 'rgba(255,255,255,0.85)',
        color: '#fff',
        '&:hover': {
          borderColor: '#fff',
          bgcolor: 'rgba(255,255,255,0.12)',
        },
      }}
    >
      Tour guide
    </Button>
  );
};

export default TourGuideButton;
