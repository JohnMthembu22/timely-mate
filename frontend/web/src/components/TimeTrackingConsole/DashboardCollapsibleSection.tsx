import React, { useState } from 'react';
import { Box, Collapse, IconButton, Paper, Stack, Typography } from '@mui/material';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ttPremiumSx } from './timeTrackingStyles';

/** Shared body height for zone-3 split panels (assignments + heatmap). */
export const ZONE_3_PANEL_HEIGHT = 400;

export interface DashboardCollapsibleSectionProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  defaultExpanded?: boolean;
  /** When true, section cannot collapse (always expanded). */
  pinned?: boolean;
  dense?: boolean;
  /** Stretch panel to fill grid row and apply fixed content min-height when expanded. */
  matchSiblingHeight?: boolean;
  children: React.ReactNode;
}

export function DashboardCollapsibleSection({
  title,
  subtitle,
  badge,
  defaultExpanded = true,
  pinned = false,
  dense = false,
  matchSiblingHeight = false,
  children,
}: DashboardCollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultExpanded);
  const expanded = pinned || open;

  return (
    <Paper
      elevation={0}
      sx={{
        ...ttPremiumSx,
        overflow: 'hidden',
        ...(matchSiblingHeight && {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: expanded ? ZONE_3_PANEL_HEIGHT + 52 : undefined,
        }),
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onClick={pinned ? undefined : () => setOpen((v) => !v)}
        sx={{
          px: dense ? 1.15 : 1.35,
          py: dense ? 0.85 : 1,
          cursor: pinned ? 'default' : 'pointer',
          borderBottom: expanded ? '1px solid #f1f5f9' : 'none',
          '&:hover': pinned ? undefined : { bgcolor: '#fafbfc' },
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {title}
            </Typography>
            {badge}
            {subtitle && (
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>{subtitle}</Typography>
            )}
          </Stack>
        </Box>
        {!pinned && (
          <IconButton size="small" sx={{ color: '#64748b' }} aria-label={expanded ? 'Collapse' : 'Expand'}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </IconButton>
        )}
      </Stack>
      <Collapse
        in={expanded}
        sx={matchSiblingHeight ? { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 } : undefined}
      >
        <Box
          sx={{
            p: dense ? { xs: 1, sm: 1.15 } : { xs: 1.15, sm: 1.35 },
            ...(matchSiblingHeight && {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: ZONE_3_PANEL_HEIGHT,
              overflow: 'hidden',
            }),
          }}
        >
          {children}
        </Box>
      </Collapse>
    </Paper>
  );
}
