import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpIcon,
  MailOutline as MailIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PRICING_FAQ } from '../pricingData';
import { tmColors, tmGradients } from '../../../theme/designTokens';

export const PricingFAQ: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';
  const [expanded, setExpanded] = useState<string | false>('panel-0');

  return (
    <Box
      component="section"
      aria-label="Pricing frequently asked questions"
      sx={{
        position: 'relative',
        borderRadius: 4,
        overflow: 'hidden',
        bgcolor: isDark ? alpha(tmColors.charcoal900, 0.6) : alpha(theme.palette.primary.main, 0.03),
        border: '1px solid',
        borderColor: isDark ? tmColors.borderSubtle : tmColors.lightBorder,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '40%',
          height: '100%',
          background: isDark
            ? `radial-gradient(circle at 100% 0%, ${alpha(tmColors.neonBlue, 0.08)}, transparent 60%)`
            : `radial-gradient(circle at 100% 0%, ${alpha(theme.palette.primary.main, 0.06)}, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ p: { xs: 3, md: 5 }, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="flex-start">
          <Grid item xs={12} md={4}>
            <Chip
              icon={<HelpIcon sx={{ fontSize: '16px !important' }} />}
              label="FAQ"
              size="small"
              sx={{
                mb: 2,
                fontWeight: 700,
                bgcolor: isDark ? alpha(tmColors.neonBlue, 0.12) : alpha(theme.palette.primary.main, 0.08),
                color: isDark ? tmColors.neonBlue : theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              }}
            />
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                mb: 1.5,
                fontSize: { xs: '1.75rem', md: '2.125rem' },
              }}
            >
              Frequently asked questions
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 3 }}>
              Clear answers for finance, HR, and operations leaders evaluating Timely Mate.
            </Typography>

            <Box
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: isDark ? alpha('#fff', 0.04) : '#fff',
                border: '1px solid',
                borderColor: isDark ? tmColors.borderSubtle : tmColors.lightBorder,
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75 }}>
                Still have questions?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.65 }}>
                Our team can walk through pricing, rollout, and compliance for your organisation.
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<MailIcon />}
                onClick={() => navigate('/contact')}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Contact sales
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack spacing={1.25}>
              {PRICING_FAQ.map((faq, index) => {
                const panelId = `panel-${index}`;
                const isOpen = expanded === panelId;

                return (
                  <Accordion
                    key={faq.question}
                    expanded={isOpen}
                    onChange={(_, isExp) => setExpanded(isExp ? panelId : false)}
                    disableGutters
                    elevation={0}
                    sx={{
                      borderRadius: '16px !important',
                      overflow: 'hidden',
                      bgcolor: isDark ? alpha(tmColors.charcoal850, 0.85) : '#fff',
                      border: '1px solid',
                      borderColor: isOpen
                        ? alpha(theme.palette.primary.main, 0.45)
                        : isDark
                          ? tmColors.borderSubtle
                          : tmColors.lightBorder,
                      boxShadow: isOpen
                        ? isDark
                          ? `0 16px 48px rgba(0,0,0,0.35), inset 3px 0 0 ${theme.palette.primary.main}`
                          : `0 16px 48px rgba(15, 23, 42, 0.08), inset 3px 0 0 ${theme.palette.primary.main}`
                        : 'none',
                      '&:before': { display: 'none' },
                      transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: isOpen
                              ? alpha(theme.palette.primary.main, isDark ? 0.2 : 0.12)
                              : isDark
                                ? alpha('#fff', 0.06)
                                : alpha(theme.palette.primary.main, 0.06),
                            color: isOpen ? 'primary.main' : 'text.secondary',
                            transition: 'background 0.2s ease, color 0.2s ease',
                          }}
                        >
                          <ExpandMoreIcon
                            sx={{
                              fontSize: 22,
                              transform: isOpen ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.25s ease',
                            }}
                          />
                        </Box>
                      }
                      sx={{
                        px: { xs: 2, sm: 2.5 },
                        py: 0.25,
                        '& .MuiAccordionSummary-content': { my: 1.75, alignItems: 'center', gap: 2 },
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          flexShrink: 0,
                          borderRadius: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          background: isOpen ? tmGradients.buttonPrimary : alpha(theme.palette.primary.main, isDark ? 0.12 : 0.08),
                          color: isOpen ? '#fff' : isDark ? tmColors.neonBlue : theme.palette.primary.main,
                        }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </Box>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ pr: 1 }}>
                        {faq.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: { xs: 2, sm: 2.5 }, pt: 0, pb: 2.5, pl: { xs: 2, sm: 7.5 } }}>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: 560 }}>
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
