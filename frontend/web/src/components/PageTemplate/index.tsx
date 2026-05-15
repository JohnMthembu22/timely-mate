import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageTemplateProps {
  title: string;
  children: React.ReactNode;
}

const PageTemplate: React.FC<PageTemplateProps> = ({ title, children }) => {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
        gap: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>
      </Box>
      
      <Box sx={{ width: '100%' }}>
        {children}
      </Box>
    </Box>
  );
};

export default PageTemplate;
