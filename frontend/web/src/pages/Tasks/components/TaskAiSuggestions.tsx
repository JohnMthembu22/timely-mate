import React from 'react';
import { Box, Button, Chip, Stack, Typography, alpha, useTheme } from '@mui/material';
import { Sparkles, Plus } from 'lucide-react';
import type { AiTaskSuggestion } from '../types';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '../taskUtils';
import { glassCardSx } from '../../../theme/surfaces';
import { tmColors } from '../../../theme/designTokens';

export function TaskAiSuggestions({
  suggestions,
  onApply,
  onDismiss,
}: {
  suggestions: AiTaskSuggestion[];
  onApply: (s: AiTaskSuggestion) => void;
  onDismiss?: (id: string) => void;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ ...glassCardSx(theme), overflow: 'hidden' }}>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: isDark
            ? `linear-gradient(135deg, ${alpha(tmColors.neonBlueDeep, 0.35)}, ${alpha(tmColors.charcoal800, 0.9)})`
            : `linear-gradient(135deg, ${alpha(tmColors.neonBlueDeep, 0.08)}, ${alpha('#fff', 0.95)})`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Sparkles size={18} color={tmColors.neonBlueBright} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>AI task suggestions</Typography>
          <Chip label="Mock" size="small" sx={{ height: 20, fontSize: '0.625rem', fontWeight: 700 }} />
        </Stack>
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
          Recommended next actions — not connected to live AI
        </Typography>
      </Box>
      <Stack spacing={1.25} sx={{ p: 2, maxHeight: { xs: 280, lg: 520 }, overflowY: 'auto' }}>
        {suggestions.map((s) => (
          <Box
            key={s.id}
            sx={{
              p: 1.25,
              borderRadius: '3px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: isDark ? alpha(tmColors.neonBlue, 0.05) : alpha(tmColors.neonBlueDeep, 0.03),
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1} sx={{ mb: 0.5 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.primary', flex: 1 }}>
                {s.title}
              </Typography>
              <Chip
                label={`${s.confidence}%`}
                size="small"
                sx={{ height: 20, fontSize: '0.625rem', fontWeight: 700 }}
              />
            </Stack>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.45, mb: 1 }}>
              {s.reason}
            </Typography>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" sx={{ mb: 1, gap: 0.5 }}>
              <Chip
                label={PRIORITY_LABELS[s.suggestedPriority]}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  bgcolor: alpha(PRIORITY_COLORS[s.suggestedPriority], 0.15),
                  color: PRIORITY_COLORS[s.suggestedPriority],
                }}
              />
              <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}>
                Suggested due in {s.suggestedDueDays === 0 ? 'today' : `${s.suggestedDueDays}d`}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.75}>
              <Button
                size="small"
                variant="contained"
                startIcon={<Plus size={14} />}
                onClick={() => onApply(s)}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', borderRadius: '3px', flex: 1 }}
              >
                Add task
              </Button>
              {onDismiss && (
                <Button
                  size="small"
                  variant="text"
                  onClick={() => onDismiss(s.id)}
                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                >
                  Dismiss
                </Button>
              )}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
