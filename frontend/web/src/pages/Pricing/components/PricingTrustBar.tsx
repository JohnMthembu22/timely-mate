import React from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import {
  CreditCardOff as NoCardIcon,
  VerifiedUser as VerifiedIcon,
  Public as ZarIcon,
  Schedule as TrialIcon,
} from '@mui/icons-material';
import { tmColors } from '../../../theme/designTokens';

const TRUST_ITEMS = [
  { icon: <TrialIcon fontSize="small" />, label: '30-day trial on paid plans' },
  { icon: <NoCardIcon fontSize="small" />, label: 'No credit card to start' },
  { icon: <ZarIcon fontSize="small" />, label: 'ZAR pricing for SA teams' },
  { icon: <VerifiedIcon fontSize="small" />, label: 'Enterprise-grade security' },
];

export const PricingTrustBar: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: { xs: 2, md: 4 },
        py: 2,
        px: 3,
        borderRadius: 3,
        bgcolor: isDark ? alpha(tmColors.charcoal800, 0.5) : alpha(theme.palette.primary.main, 0.04),
        border: '1px solid',
        borderColor: isDark ? tmColors.borderSubtle : tmColors.lightBorder,
      }}
    >
      {TRUST_ITEMS.map((item) => (
        <Box
          key={item.label}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'text.secondary',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              color: isDark ? tmColors.neonBlue : theme.palette.primary.main,
            }}
          >
            {item.icon}
          </Box>
          <Typography variant="body2" fontWeight={500}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
