import React, { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import { Grid3X3, Radio } from 'lucide-react';
import { LiveIndicator } from '../ProjectsConsole/ConsolePrimitives';
import {
  HEATMAP_VIEW_LABELS,
  buildHeatmapData,
  type HeatmapView,
} from './workforceHeatmapMock';
import { ttPremiumSx, ttSectionLabelSx } from './timeTrackingStyles';

function heatColor(value: number, max: number): string {
  const t = max > 0 ? value / max : 0;
  if (t >= 0.85) return '#ef4444';
  if (t >= 0.65) return '#f59e0b';
  if (t >= 0.45) return '#6366f1';
  if (t >= 0.25) return '#0ea5e9';
  return '#e2e8f0';
}

export interface WorkforceHeatmapsProps {
  /** Strip outer chrome when nested inside zone-3 collapsible panel. */
  embedded?: boolean;
}

export function WorkforceHeatmaps({ embedded = false }: WorkforceHeatmapsProps) {
  const [view, setView] = useState<HeatmapView>('department');
  const [hoverCell, setHoverCell] = useState<{ row: string; col: string; value: number } | null>(null);

  const data = useMemo(() => buildHeatmapData(view), [view]);
  const meta = HEATMAP_VIEW_LABELS[view];

  const cellMap = useMemo(() => {
    const m = new Map<string, number>();
    data.cells.forEach((c) => m.set(`${c.row}|${c.col}`, c.value));
    return m;
  }, [data.cells]);

  const tabsBlock = (
    <Tabs
      value={view}
      onChange={(_, v: HeatmapView) => setView(v)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        mb: embedded ? 0.75 : 0,
        minHeight: 32,
        '& .MuiTab-root': {
          minHeight: 28,
          py: 0.35,
          px: 1,
          fontSize: '0.625rem',
          fontWeight: 700,
          textTransform: 'none',
        },
      }}
    >
      {(Object.keys(HEATMAP_VIEW_LABELS) as HeatmapView[]).map((key) => (
        <Tab key={key} value={key} label={HEATMAP_VIEW_LABELS[key].label} />
      ))}
    </Tabs>
  );

  const body = (
    <Box
      sx={{
        p: embedded ? 0 : { xs: 1.25, sm: 1.5 },
        ...(embedded && { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }),
      }}
    >
        {hoverCell && (
          <Chip
            size="small"
            icon={<Radio size={10} />}
            label={`${hoverCell.row} · ${hoverCell.col}: ${hoverCell.value}${view === 'overtime' ? 'h' : '%'}`}
            sx={{ mb: 1, fontWeight: 800, fontSize: '0.625rem', bgcolor: '#eef2ff', color: '#4338ca' }}
          />
        )}

        <Box sx={{ overflowX: 'auto', ...(embedded && { flex: 1, minHeight: 0 }) }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `minmax(88px, 1fr) repeat(${data.cols.length}, minmax(36px, 1fr))`,
              gap: 0.5,
              minWidth: data.cols.length * 40 + 100,
              transition: 'opacity 280ms ease',
            }}
          >
            <Box />
            {data.cols.map((col) => (
              <Typography
                key={col}
                sx={{
                  fontSize: '0.5625rem',
                  fontWeight: 800,
                  color: '#94a3b8',
                  textAlign: 'center',
                  py: 0.5,
                }}
              >
                {col}
              </Typography>
            ))}
            {data.rows.map((row) => (
              <React.Fragment key={row}>
                <Typography
                  sx={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    pr: 0.5,
                  }}
                >
                  {row}
                </Typography>
                {data.cols.map((col) => {
                  const value = cellMap.get(`${row}|${col}`) ?? 0;
                  const bg = heatColor(value, data.maxValue);
                  return (
                    <Tooltip
                      key={`${row}-${col}`}
                      title={`${row} · ${col}: ${value}${view === 'overtime' ? ' hours' : ''}`}
                      arrow
                    >
                      <Box
                        onMouseEnter={() => setHoverCell({ row, col, value })}
                        onMouseLeave={() => setHoverCell(null)}
                        sx={{
                          aspectRatio: '1',
                          minHeight: 28,
                          borderRadius: 1,
                          bgcolor: bg,
                          opacity: hoverCell && (hoverCell.row !== row || hoverCell.col !== col) ? 0.45 : 1,
                          transform: hoverCell?.row === row && hoverCell?.col === col ? 'scale(1.08)' : 'scale(1)',
                          transition: 'transform 200ms ease, opacity 200ms ease, background-color 300ms ease',
                          cursor: 'crosshair',
                          border: '1px solid',
                          borderColor: alpha(bg, 0.5),
                          boxShadow:
                            hoverCell?.row === row && hoverCell?.col === col
                              ? `0 4px 12px ${alpha(bg, 0.4)}`
                              : 'none',
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </React.Fragment>
            ))}
          </Box>
        </Box>

        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1, flexShrink: 0 }} flexWrap="wrap">
          <Typography sx={{ ...ttSectionLabelSx, mr: 0.5 }}>Density</Typography>
          {['#e2e8f0', '#0ea5e9', '#6366f1', '#f59e0b', '#ef4444'].map((c) => (
            <Box key={c} sx={{ width: 20, height: 8, borderRadius: 0.5, bgcolor: c }} />
          ))}
          <Typography sx={{ fontSize: '0.5625rem', color: '#94a3b8', ml: 0.5 }}>low → high</Typography>
        </Stack>
      </Box>
  );

  if (embedded) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5, flexShrink: 0 }}>
          <Typography sx={{ fontSize: '0.625rem', color: '#64748b' }}>{meta.subtitle}</Typography>
          <LiveIndicator label="Live" />
        </Stack>
        {tabsBlock}
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>{body}</Box>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ ...ttPremiumSx, overflow: 'hidden' }}>
      <Box sx={{ px: { xs: 1.25, sm: 1.5 }, pt: 1.25, pb: 0.75, borderBottom: '1px solid #f1f5f9' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Grid3X3 size={18} color="#6366f1" />
            <Box>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Workforce heatmaps
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>{meta.subtitle}</Typography>
            </Box>
          </Stack>
          <LiveIndicator label="Interactive" />
        </Stack>
        {tabsBlock}
      </Box>
      {body}
    </Paper>
  );
}
