import React from 'react';
import { Box, Typography } from '@mui/material';

export interface DashboardZoneProps {
  zone: number;
  title: string;
  children: React.ReactNode;
}

export function DashboardZone({ zone, title, children }: DashboardZoneProps) {
  return (
    <Box component="section" aria-label={`Zone ${zone}: ${title}`} sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      {children}
    </Box>
  );
}
