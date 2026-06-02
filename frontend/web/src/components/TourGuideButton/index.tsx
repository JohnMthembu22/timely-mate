import React from 'react';
import { Button, IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import { useGuidedTour } from '../../contexts/GuidedTourContext';

type TourGuideButtonProps = {
  variant?: 'icon' | 'button';
  size?: 'small' | 'medium';
};

const TourGuideButton: React.FC<TourGuideButtonProps> = ({ variant = 'button', size = 'small' }) => {
  const { startTour } = useGuidedTour();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleClick = () => {
    startTour({ force: true });
  };

  if (isMobile) {
    return null;
  }

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
        borderRadius: 2,
        px: 1.5,
        background: 'linear-gradient(135deg, rgba(33,150,243,0.25) 0%, rgba(52,211,153,0.2) 100%)',
        backdropFilter: 'blur(6px)',
        '&:hover': {
          borderColor: '#fff',
          bgcolor: 'rgba(255,255,255,0.18)',
          boxShadow: '0 4px 14px rgba(33, 150, 243, 0.35)',
        },
      }}
    >
      Tour guide
    </Button>
  );
};

export default TourGuideButton;
