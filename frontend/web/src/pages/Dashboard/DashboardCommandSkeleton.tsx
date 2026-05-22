import React from 'react';
import { Box, Grid, Skeleton } from '@mui/material';

/** Lightweight placeholder while command-center panels mount. */
export function DashboardCommandSkeleton() {
  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
      <Skeleton variant="rounded" height={120} sx={{ mb: 2.5, borderRadius: '3px' }} />
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {[0, 1, 2, 3].map((i) => (
          <Grid item xs={12} md={6} lg={3} key={i}>
            <Skeleton variant="rounded" height={100} sx={{ borderRadius: '3px' }} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: '3px' }} />
        </Grid>
        <Grid item xs={12} lg={5}>
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: '3px' }} />
        </Grid>
      </Grid>
    </Box>
  );
}
