import React, { memo } from 'react';
import { Box, Button, List, ListItem, ListItemText, Stack, Typography, alpha } from '@mui/material';
import { Activity, Bell, Briefcase, Clock } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { DashboardPanel, panelScrollSx } from './DashboardPanel';
import type { LiveActivityItem } from '../dashboardOpsData';
import { tmColors } from '../../../theme/designTokens';

const kindIcon = {
  job: Briefcase,
  clock: Clock,
  notification: Bell,
  system: Activity,
};

const kindColor = {
  job: tmColors.neonBlue,
  clock: tmColors.emerald,
  notification: '#fbbf24',
  system: tmColors.textSecondary,
};

export const LiveActivityFeed = memo(function LiveActivityFeed({
  items,
  onViewAll,
  legacyActivitySlot,
}: {
  items: LiveActivityItem[];
  onViewAll?: () => void;
  /** Existing recent-activity block from dashboard (preserved) */
  legacyActivitySlot?: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <DashboardPanel
      title="Live activity feed"
      subtitle="Real-time signals from jobs, attendance, and notifications"
      accent="amber"
      noPadding
    >
      <Box sx={{ ...panelScrollSx(theme), maxHeight: { xs: 360, md: 420 } }}>
        <List dense disablePadding sx={{ px: 1.5, py: 1 }}>
          {items.length === 0 ? (
            <ListItem sx={{ py: 2 }}>
              <ListItemText
                primary="No live events yet"
                secondary="Clock in, track time, or receive messages to populate this feed."
                primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItem>
          ) : (
            items.map((item) => {
              const Icon = kindIcon[item.kind];
              return (
                <ListItem
                  key={item.id}
                  disableGutters
                  sx={{
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mr: 1.25,
                      bgcolor: alpha(kindColor[item.kind], 0.12),
                      color: kindColor[item.kind],
                    }}
                  >
                    <Icon size={16} strokeWidth={2} />
                  </Box>
                  <ListItemText
                    primary={item.title}
                    secondary={
                      <Stack component="span" spacing={0.25}>
                        <Typography component="span" variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                          {item.detail}
                        </Typography>
                        <Typography component="span" variant="caption" sx={{ color: tmColors.neonBlueBright, fontWeight: 600 }}>
                          {item.time}
                        </Typography>
                      </Stack>
                    }
                    primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary' }}
                  />
                </ListItem>
              );
            })
          )}
        </List>
        {legacyActivitySlot && <Box sx={{ px: 2, pb: 1, borderTop: '1px solid', borderColor: 'divider' }}>{legacyActivitySlot}</Box>}
      </Box>
      {onViewAll && (
        <Box sx={{ px: 2, pb: 1.5, pt: 0.5 }}>
          <Button fullWidth variant="text" onClick={onViewAll} sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }}>
            View all activities
          </Button>
        </Box>
      )}
    </DashboardPanel>
  );
});
