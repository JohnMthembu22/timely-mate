import React, { useState } from 'react';
import { Box, Collapse, IconButton, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { Brain, ChevronDown, ChevronUp, Grid3X3, Sparkles } from 'lucide-react';
import { WorkforceIntelligencePanel } from './WorkforceIntelligencePanel';
import { AiProductivityInsightsPanel } from './AiProductivityInsightsPanel';
import { WorkforceHeatmaps } from './WorkforceHeatmaps';
import type { TimeTrackingWorkforceIntel } from './timeTrackingWorkforceIntel';
import type { AiProductivityInsightsBundle, AiProductivityInsight } from './aiProductivityInsightsTypes';
import { ttPremiumSx } from './timeTrackingStyles';

export type IntelClusterTab = 'intelligence' | 'ai-insights' | 'heatmaps';

export interface OperationalIntelligenceClusterProps {
  workforceIntel: TimeTrackingWorkforceIntel;
  productivityBundle: AiProductivityInsightsBundle;
  onInsightAction: (actionId: string, insight: AiProductivityInsight) => void;
  defaultTab?: IntelClusterTab;
  defaultExpanded?: boolean;
}

const TAB_META: { id: IntelClusterTab; label: string; short: string; icon: React.ElementType }[] = [
  { id: 'intelligence', label: 'Workforce intelligence', short: 'Intel', icon: Brain },
  { id: 'ai-insights', label: 'AI productivity', short: 'AI', icon: Sparkles },
  { id: 'heatmaps', label: 'Heatmaps', short: 'Maps', icon: Grid3X3 },
];

export function OperationalIntelligenceCluster({
  workforceIntel,
  productivityBundle,
  onInsightAction,
  defaultTab = 'intelligence',
  defaultExpanded = false,
}: OperationalIntelligenceClusterProps) {
  const [open, setOpen] = useState(defaultExpanded);
  const [tab, setTab] = useState<IntelClusterTab>(defaultTab);

  return (
    <Paper elevation={0} sx={{ ...ttPremiumSx, overflow: 'hidden' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onClick={() => setOpen((v) => !v)}
        sx={{
          px: 1.15,
          py: 0.85,
          cursor: 'pointer',
          borderBottom: open ? '1px solid #f1f5f9' : 'none',
          '&:hover': { bgcolor: '#fafbfc' },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Operational intelligence
          </Typography>
          {open && (
            <Typography sx={{ fontSize: '0.625rem', color: '#94a3b8', mt: 0.2 }}>
              Workforce intel · AI productivity · heatmaps
            </Typography>
          )}
        </Box>
        <IconButton size="small" sx={{ color: '#64748b' }} aria-label={open ? 'Collapse' : 'Expand'}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </IconButton>
      </Stack>

      <Collapse in={open}>
        <Box sx={{ px: 1.15, pt: 0.75, pb: 0, borderBottom: '1px solid #f1f5f9' }} onClick={(e) => e.stopPropagation()}>
          <Tabs
            value={tab}
            onChange={(_, v: IntelClusterTab) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 36,
              '& .MuiTab-root': {
                minHeight: 36,
                py: 0.5,
                px: 1.25,
                fontSize: '0.6875rem',
                fontWeight: 800,
                textTransform: 'none',
                color: '#64748b',
              },
              '& .Mui-selected': { color: '#4338ca' },
              '& .MuiTabs-indicator': { height: 2, borderRadius: 2, bgcolor: '#6366f1' },
            }}
          >
            {TAB_META.map(({ id, label, short, icon: Icon }) => (
              <Tab
                key={id}
                value={id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Icon size={13} />
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{label}</Box>
                    <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>{short}</Box>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>
        <Box sx={{ p: { xs: 0.75, sm: 1 } }} onClick={(e) => e.stopPropagation()}>
          {tab === 'intelligence' && <WorkforceIntelligencePanel data={workforceIntel} />}
          {tab === 'ai-insights' && (
            <AiProductivityInsightsPanel bundle={productivityBundle} onInsightAction={onInsightAction} defaultOpen={false} />
          )}
          {tab === 'heatmaps' && <WorkforceHeatmaps />}
        </Box>
      </Collapse>
    </Paper>
  );
}
