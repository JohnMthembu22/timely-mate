import React from 'react';
import { Box, Button, Stack, Typography, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { glassCardSx } from '../../../theme/surfaces';
import { tmColors } from '../../../theme/designTokens';
import { Zap } from 'lucide-react';

export interface QuickActionItem {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
}

export function QuickActionsBar({
  primaryActions,
  managementActions,
}: {
  primaryActions: QuickActionItem[];
  managementActions?: QuickActionItem[];
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const renderChip = (action: QuickActionItem, variant: 'primary' | 'secondary') => (
    <Button
      key={action.title}
      onClick={action.onClick}
      variant={variant === 'primary' ? 'contained' : 'outlined'}
      startIcon={action.icon}
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        fontSize: { xs: '0.8125rem', sm: '0.8125rem' },
        borderRadius: '8px',
        minHeight: 40,
        py: 0.75,
        px: 1.5,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        justifyContent: 'center',
        ...(variant === 'secondary' && {
          borderColor: isDark ? tmColors.borderStrong : 'divider',
          color: 'text.primary',
          '&:hover': {
            borderColor: tmColors.neonBlue,
            bgcolor: alpha(tmColors.neonBlue, 0.08),
          },
        }),
      }}
    >
      {action.title}
    </Button>
  );

  const allActions = [...primaryActions, ...(managementActions ?? [])];

  return (
    <Box sx={{ ...glassCardSx(theme), p: { xs: 2, sm: 2 } }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: { xs: 2, sm: 1.5 } }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(tmColors.emerald, 0.15),
            color: tmColors.emerald,
            flexShrink: 0,
          }}
        >
          <Zap size={16} strokeWidth={2} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '0.9375rem' }, color: 'text.primary' }}>
            Quick actions
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.8125rem', sm: '0.75rem' }, color: 'text.secondary', lineHeight: 1.4 }}>
            Launch operations without leaving command center
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction="row"
        flexWrap="wrap"
        useFlexGap
        sx={{
          gap: 1,
          alignItems: 'center',
          overflowX: 'auto',
          pb: 0.25,
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: alpha('#fff', 0.15), borderRadius: 2 },
        }}
      >
        {allActions.map((a, i) =>
          renderChip(a, i < primaryActions.length ? 'primary' : 'secondary')
        )}
      </Stack>
    </Box>
  );
}
