import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  LinearProgress,
  alpha,
  ToggleButtonGroup,
  ToggleButton,
  Collapse,
  keyframes,
} from '@mui/material';
import {
  MapPin,
  Plus,
  Trash2,
  Search,
  LayoutList,
  Map as MapIcon,
  Users,
  CloudSun,
  AlertTriangle,
  Package,
  ClipboardList,
  LogIn,
  LogOut,
  Camera,
  Plane,
  Navigation,
  Shield,
  Calendar,
  Layers,
  User,
} from 'lucide-react';
import { fieldHeaderSx, fieldShellSx, fieldSiteGridSx, fieldSubtitleSx, fieldTitleSx } from './fieldOpsStyles';
import { buildMapClusters, buildSiteIntelRows } from './siteIntelligenceMockData';
import type { SiteIntelFilter, SiteIntelRow, SiteRiskLevel, SiteViewMode } from './siteIntelligenceTypes';
import type { SiteLocation, SiteStatus } from './types';

const livePulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
  50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
`;

const RISK_COLORS: Record<SiteRiskLevel, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

const STATUS_COLORS: Record<SiteLocation['status'], string> = {
  active: '#10b981',
  pending: '#f59e0b',
  completed: '#64748b',
};

const siteTypeLabel: Record<string, string> = {
  visit: 'Site visit',
  installation: 'Installation',
  inspection: 'Inspection',
  logistics: 'Logistics',
  general: 'Field task',
};

export interface SmartSiteIntelligenceProps {
  locations: SiteLocation[];
  onAddSite: () => void;
  onViewMap: (location: SiteLocation) => void;
  onDeleteSite: (id: string) => void;
  onStatusChange: (id: string, status: SiteStatus) => void;
  onProgressChange: (id: string, progress: number) => void;
  getStatusColor: (status: string) => 'success' | 'warning' | 'default';
}

export function SmartSiteIntelligence({
  locations,
  onAddSite,
  onViewMap,
  onDeleteSite,
  onStatusChange,
  onProgressChange,
  getStatusColor,
}: SmartSiteIntelligenceProps) {
  const [viewMode, setViewMode] = useState<SiteViewMode>('list');
  const [filter, setFilter] = useState<SiteIntelFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const rows = useMemo(() => buildSiteIntelRows(locations), [locations]);
  const clusters = useMemo(() => buildMapClusters(rows), [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(({ location, intel }) => {
      if (filter === 'risk-high' && intel.riskLevel !== 'high') return false;
      if (filter === 'health-low' && intel.healthScore >= 65) return false;
      if (filter !== 'all' && filter !== 'risk-high' && filter !== 'health-low') {
        if (filter === 'active' || filter === 'pending' || filter === 'completed') {
          if (location.status !== filter) return false;
        } else if ((location.siteType ?? 'general') !== filter) return false;
      }
      if (!q) return true;
      return (
        location.name.toLowerCase().includes(q) ||
        location.address.toLowerCase().includes(q) ||
        intel.supervisor.toLowerCase().includes(q)
      );
    });
  }, [rows, filter, search]);

  const bounds = useMemo(() => {
    if (rows.length === 0) return { minLat: -28, maxLat: -26, minLng: 28, maxLng: 34 };
    const lats = rows.map((r) => r.intel.mapCoords.lat);
    const lngs = rows.map((r) => r.intel.mapCoords.lng);
    const pad = 0.15;
    return {
      minLat: Math.min(...lats) - pad,
      maxLat: Math.max(...lats) + pad,
      minLng: Math.min(...lngs) - pad,
      maxLng: Math.max(...lngs) + pad,
    };
  }, [rows]);

  const toXY = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * 100;
    const y = 100 - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat || 1)) * 100;
    return { x: Math.max(4, Math.min(96, x)), y: Math.max(8, Math.min(92, y)) };
  };

  return (
    <Paper elevation={0} sx={fieldShellSx}>
      <Box sx={fieldHeaderSx}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Layers size={16} color="#0ea5e9" />
            <Typography sx={fieldTitleSx}>Smart Site Intelligence</Typography>
            <Chip size="small" label="LIVE" sx={{ height: 18, fontWeight: 800, fontSize: '0.5rem', bgcolor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }} />
          </Stack>
          <Typography sx={fieldSubtitleSx}>
            Map · workforce · weather · safety · tasks · logistics · check-ins · imagery
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
          <ToggleButtonGroup
            size="small"
            value={viewMode}
            exclusive
            onChange={(_, v) => v && setViewMode(v)}
            sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.6875rem', py: 0.4, px: 1 } }}
          >
            <ToggleButton value="list">
              <LayoutList size={13} style={{ marginRight: 4 }} /> List
            </ToggleButton>
            <ToggleButton value="map">
              <MapIcon size={13} style={{ marginRight: 4 }} /> Map
            </ToggleButton>
          </ToggleButtonGroup>
          <Button size="small" startIcon={<Plus size={14} />} onClick={onAddSite} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, bgcolor: '#0f172a', color: '#fff', '&:hover': { bgcolor: '#1e293b' } }}>
            New site
          </Button>
        </Stack>
      </Box>

      <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <TextField
          size="small"
          placeholder="Search sites, address, supervisor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} color="#94a3b8" />
              </InputAdornment>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.8125rem', bgcolor: '#fafbfc' } }}
        />
        <ToggleButtonGroup
          size="small"
          value={filter}
          exclusive
          onChange={(_, v) => v && setFilter(v)}
          sx={{ flexWrap: 'wrap', gap: 0.5, '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.625rem', py: 0.35, px: 0.85 } }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="active">Active</ToggleButton>
          <ToggleButton value="pending">Pending</ToggleButton>
          <ToggleButton value="visit">Visits</ToggleButton>
          <ToggleButton value="installation">Install</ToggleButton>
          <ToggleButton value="inspection">Inspect</ToggleButton>
          <ToggleButton value="risk-high">High risk</ToggleButton>
          <ToggleButton value="health-low">Low health</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {locations.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <MapIcon size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <Typography sx={{ fontWeight: 800, color: '#334155', fontSize: '0.9375rem' }}>No field sites yet</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.5, mb: 2 }}>
            Deploy a site to unlock map intelligence, workforce telemetry, and operational overlays.
          </Typography>
          <Button variant="contained" startIcon={<Plus size={14} />} onClick={onAddSite} sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#0f172a' }}>
            Add first site
          </Button>
        </Box>
      ) : viewMode === 'map' ? (
        <SiteMapView
          rows={filtered}
          clusters={clusters}
          selectedId={selectedId}
          onSelect={setSelectedId}
          toXY={toXY}
          onViewMap={onViewMap}
          getStatusColor={getStatusColor}
        />
      ) : filtered.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>No sites match your filters.</Typography>
        </Box>
      ) : (
        <Box sx={{ ...fieldSiteGridSx, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' } }}>
          {filtered.map((row) => (
            <SiteIntelligenceCard
              key={row.location.id}
              row={row}
              expanded={expandedId === row.location.id}
              onToggleExpand={() => setExpandedId((id) => (id === row.location.id ? null : row.location.id))}
              onViewMap={() => onViewMap(row.location)}
              onDelete={() => onDeleteSite(row.location.id)}
              onStatusChange={(s) => onStatusChange(row.location.id, s)}
              onProgressChange={(p) => onProgressChange(row.location.id, p)}
              getStatusColor={getStatusColor}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
}

function SiteMapView({
  rows,
  clusters,
  selectedId,
  onSelect,
  toXY,
  onViewMap,
  getStatusColor,
}: {
  rows: SiteIntelRow[];
  clusters: ReturnType<typeof buildMapClusters>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  toXY: (lat: number, lng: number) => { x: number; y: number };
  onViewMap: (loc: SiteLocation) => void;
  getStatusColor: (status: string) => 'success' | 'warning' | 'default';
}) {
  const selected = rows.find((r) => r.location.id === selectedId);

  return (
    <Box sx={{ p: 1.5 }}>
      <Box
        sx={{
          position: 'relative',
          height: { xs: 320, md: 400 },
          borderRadius: 2.5,
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          bgcolor: '#0f172a',
          backgroundImage: `
            linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 20%, rgba(14,165,233,0.12), transparent 55%)' }} />
        <Typography sx={{ position: 'absolute', top: 10, left: 12, fontSize: '0.5625rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Interactive map · {rows.length} sites · {clusters.filter((c) => c.count > 1).length} clusters
        </Typography>

        {clusters.map((cluster) => {
          const { x, y } = toXY(cluster.lat, cluster.lng);
          const isCluster = cluster.count > 1;
          const color = RISK_COLORS[cluster.riskMax];
          const isSelected = cluster.siteIds.includes(selectedId ?? '');

          if (isCluster) {
            return (
              <Box
                key={cluster.id}
                onClick={() => onSelect(cluster.siteIds[0])}
                sx={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: alpha(color, 0.9),
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  border: `2px solid ${isSelected ? '#fff' : alpha(color, 0.5)}`,
                  boxShadow: `0 4px 14px ${alpha(color, 0.5)}`,
                  zIndex: isSelected ? 3 : 2,
                  animation: isSelected ? `${livePulse} 2s infinite` : undefined,
                }}
              >
                {cluster.count}
              </Box>
            );
          }

          const row = rows.find((r) => r.location.id === cluster.siteIds[0]);
          if (!row) return null;
          const live = row.location.status === 'active';
          return (
            <Box
              key={cluster.id}
              onClick={() => onSelect(row.location.id)}
              sx={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                zIndex: selectedId === row.location.id ? 3 : 2,
              }}
            >
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  bgcolor: STATUS_COLORS[row.location.status],
                  border: '2px solid #fff',
                  boxShadow: live ? `0 0 12px ${STATUS_COLORS.active}` : '0 2px 8px rgba(0,0,0,0.3)',
                  animation: live ? `${livePulse} 2s infinite` : undefined,
                }}
              />
            </Box>
          );
        })}
      </Box>

      {selected && (
        <Paper elevation={0} sx={{ mt: 1.25, p: 1.25, borderRadius: 2, border: '1px solid #e8edf4', bgcolor: '#fafbfc' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>{selected.location.name}</Typography>
              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>{selected.intel.supervisor} · {selected.intel.workforceCount} on site</Typography>
            </Box>
            <Chip size="small" label={selected.location.status} color={getStatusColor(selected.location.status)} sx={{ height: 20, fontWeight: 700, textTransform: 'capitalize' }} />
          </Stack>
          <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
            <Button size="small" variant="contained" startIcon={<Navigation size={12} />} onClick={() => onViewMap(selected.location)} sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#0f172a' }}>
              Open map console
            </Button>
            <Button size="small" variant="outlined" onClick={() => onSelect(null)} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Clear
            </Button>
          </Stack>
        </Paper>
      )}

      <Stack spacing={0.75} sx={{ mt: 1.25, maxHeight: 200, overflow: 'auto' }}>
        {rows.map((row) => (
          <Paper
            key={row.location.id}
            elevation={0}
            onClick={() => onSelect(row.location.id)}
            sx={{
              p: 1,
              borderRadius: 1.5,
              border: `1px solid ${selectedId === row.location.id ? '#7dd3fc' : '#e8edf4'}`,
              bgcolor: selectedId === row.location.id ? '#f0f9ff' : '#fff',
              cursor: 'pointer',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <MapPin size={14} color={RISK_COLORS[row.intel.riskLevel]} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, flex: 1 }} noWrap>{row.location.name}</Typography>
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: '#64748b' }}>{row.intel.healthScore}</Typography>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}

function SiteIntelligenceCard({
  row,
  expanded,
  onToggleExpand,
  onViewMap,
  onDelete,
  onStatusChange,
  onProgressChange,
  getStatusColor,
}: {
  row: SiteIntelRow;
  expanded: boolean;
  onToggleExpand: () => void;
  onViewMap: () => void;
  onDelete: () => void;
  onStatusChange: (s: SiteStatus) => void;
  onProgressChange: (p: number) => void;
  getStatusColor: (status: string) => 'success' | 'warning' | 'default';
}) {
  const { location, intel } = row;
  const type = location.siteType ?? 'general';
  const riskColor = RISK_COLORS[intel.riskLevel];
  const healthColor = intel.healthScore >= 75 ? '#10b981' : intel.healthScore >= 55 ? '#f59e0b' : '#ef4444';

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.5,
        border: `1px solid ${alpha(riskColor, 0.2)}`,
        overflow: 'hidden',
        transition: 'all 200ms ease',
        '&:hover': { borderColor: alpha(riskColor, 0.4), boxShadow: '0 12px 28px rgba(15,23,42,0.08)' },
      }}
    >
      <Box sx={{ p: 1.35, bgcolor: '#fafbfc', borderBottom: '1px solid #f1f5f9' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
            <HealthRing score={intel.healthScore} color={healthColor} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }} noWrap>{location.name}</Typography>
              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }} noWrap>{location.address}</Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={onDelete} sx={{ color: '#94a3b8' }}>
            <Trash2 size={14} />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1 }}>
          <Chip size="small" label={siteTypeLabel[type]} sx={{ height: 20, fontSize: '0.5625rem', fontWeight: 700 }} />
          <Chip size="small" label={location.status} color={getStatusColor(location.status)} sx={{ height: 20, fontSize: '0.5625rem', fontWeight: 700, textTransform: 'capitalize' }} />
          <Chip size="small" icon={<Shield size={10} />} label={`Risk ${intel.riskLevel}`} sx={{ height: 20, fontSize: '0.5625rem', fontWeight: 700, bgcolor: alpha(riskColor, 0.1), color: riskColor }} />
          <Chip size="small" label={intel.completionStatus} sx={{ height: 20, fontSize: '0.5625rem', fontWeight: 700, bgcolor: '#f1f5f9' }} />
        </Stack>
      </Box>

      <Box sx={{ p: 1.35 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 1.25 }}>
          <MiniStat icon={Users} label="Workforce" value={String(intel.workforceCount)} />
          <MiniStat icon={User} label="Supervisor" value={intel.supervisor.split(' ')[0]} sub={intel.supervisor.split(' ')[1]} />
          <MiniStat icon={Calendar} label="ETA complete" value={intel.estimatedCompletion.split(' ').slice(0, 2).join(' ')} sub={intel.estimatedCompletion.split(' ')[2]} />
        </Box>

        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
          <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', flex: 1 }}>Project progress</Typography>
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#0f172a' }}>{location.progress}%</Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={location.progress}
          sx={{
            height: 7,
            borderRadius: 99,
            mb: 1.25,
            bgcolor: '#f1f5f9',
            '& .MuiLinearProgress-bar': { borderRadius: 99, background: `linear-gradient(90deg, #0ea5e9, ${alpha('#6366f1', 0.6)})` },
          }}
        />

        <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mb: 1.25 }}>
          <WeatherChip weather={intel.weather} />
          <Chip
            size="small"
            icon={<Package size={11} />}
            label={`Materials · ${intel.materialDelivery.status.replace('_', ' ')}`}
            sx={{ height: 22, fontSize: '0.5625rem', fontWeight: 700, textTransform: 'capitalize' }}
          />
        </Stack>

        {intel.safetyAlerts.length > 0 && (
          <Stack spacing={0.5} sx={{ mb: 1 }}>
            {intel.safetyAlerts.map((a) => (
              <Box
                key={a.id}
                sx={{
                  px: 1,
                  py: 0.65,
                  borderRadius: 1.5,
                  bgcolor: a.severity === 'critical' ? 'rgba(239,68,68,0.08)' : a.severity === 'warning' ? 'rgba(245,158,11,0.08)' : 'rgba(14,165,233,0.06)',
                  border: `1px solid ${a.severity === 'critical' ? 'rgba(239,68,68,0.2)' : a.severity === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(14,165,233,0.15)'}`,
                }}
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <AlertTriangle size={12} color={a.severity === 'critical' ? '#dc2626' : '#d97706'} />
                  <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#334155' }}>{a.message}</Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}

        <Button size="small" onClick={onToggleExpand} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.6875rem', mb: expanded ? 1 : 0, color: '#0ea5e9' }}>
          {expanded ? 'Hide operational detail' : 'View operational detail'}
        </Button>

        <Collapse in={expanded}>
          <Stack spacing={1.25}>
            <SectionLabel icon={ClipboardList} label="Active tasks" />
            {intel.activeTasks.map((t) => (
              <Box key={t.id} sx={{ pl: 1, borderLeft: `2px solid ${t.status === 'blocked' ? '#ef4444' : '#0ea5e9'}` }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>{t.title}</Typography>
                <Typography sx={{ fontSize: '0.625rem', color: '#64748b' }}>{t.assignee} · {t.due}</Typography>
              </Box>
            ))}

            <SectionLabel icon={Package} label="Material delivery" />
            <Typography sx={{ fontSize: '0.6875rem', color: '#475569', fontWeight: 600 }}>
              {intel.materialDelivery.carrier} · {intel.materialDelivery.items} items · ETA {intel.materialDelivery.eta}
            </Typography>

            <SectionLabel icon={LogIn} label="Check-in / check-out" />
            {intel.checkLogs.map((log) => (
              <Stack key={log.id} direction="row" alignItems="center" spacing={0.75}>
                {log.action === 'check-in' ? <LogIn size={12} color="#10b981" /> : <LogOut size={12} color="#94a3b8" />}
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#334155' }}>
                  {log.person} · {log.action} · {log.time}
                </Typography>
              </Stack>
            ))}

            <SectionLabel icon={Camera} label="Site photos" />
            <Stack direction="row" spacing={0.75}>
              {intel.sitePhotos.map((ph) => (
                <PhotoPlaceholder key={ph.id} label={ph.label} variant="photo" />
              ))}
              {intel.droneImages.map((dr) => (
                <PhotoPlaceholder key={dr.id} label={`Drone · ${dr.label}`} variant="drone" sub={dr.capturedAt} />
              ))}
            </Stack>
          </Stack>
        </Collapse>

        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1.25, pt: 1.25, borderTop: '1px solid #f1f5f9' }}>
          {location.status !== 'active' && (
            <Button size="small" onClick={() => onStatusChange('active')} sx={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'none' }}>
              Activate
            </Button>
          )}
          <Button size="small" variant="outlined" startIcon={<MapIcon size={12} />} onClick={onViewMap} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.6875rem', borderRadius: 1.5 }}>
            Map
          </Button>
          {[25, 50, 75, 100].map((p) => (
            <Button key={p} size="small" onClick={() => onProgressChange(p)} sx={{ minWidth: 0, px: 0.6, fontSize: '0.5625rem', color: '#64748b' }}>
              {p}%
            </Button>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
}

function HealthRing({ score, color }: { score: number; color: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <Box sx={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
      <svg width={52} height={52}>
        <circle cx={26} cy={26} r={r} fill="none" stroke="#f1f5f9" strokeWidth={5} />
        <circle cx={26} cy={26} r={r} fill="none" stroke={color} strokeWidth={5} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 26 26)" />
      </svg>
      <Typography sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 800, color: '#0f172a' }}>
        {score}
      </Typography>
    </Box>
  );
}

function MiniStat({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <Box sx={{ p: 0.85, borderRadius: 1.5, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
      <Stack direction="row" alignItems="center" spacing={0.35} sx={{ mb: 0.25 }}>
        <Icon size={11} color="#94a3b8" />
        <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</Typography>
      </Stack>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{value}</Typography>
      {sub && <Typography sx={{ fontSize: '0.5625rem', color: '#64748b', fontWeight: 600 }}>{sub}</Typography>}
    </Box>
  );
}

function WeatherChip({ weather }: { weather: SiteIntelRow['intel']['weather'] }) {
  return (
    <Chip
      size="small"
      icon={<CloudSun size={11} />}
      label={`${weather.tempC}°C · ${weather.condition} · ${weather.windKph}km/h wind`}
      sx={{ height: 22, fontSize: '0.5625rem', fontWeight: 700, bgcolor: '#f0f9ff', color: '#0369a1' }}
    />
  );
}

function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Icon size={12} color="#64748b" />
      <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</Typography>
    </Stack>
  );
}

function PhotoPlaceholder({ label, variant, sub }: { label: string; variant: 'photo' | 'drone'; sub?: string }) {
  return (
    <Box
      sx={{
        width: 72,
        height: 56,
        borderRadius: 1.5,
        border: '1px dashed #cbd5e1',
        bgcolor: variant === 'drone' ? '#f5f3ff' : '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.25,
      }}
    >
      {variant === 'drone' ? <Plane size={16} color="#8b5cf6" /> : <Camera size={16} color="#94a3b8" />}
      <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: '#64748b', textAlign: 'center', px: 0.5 }} noWrap>
        {label}
      </Typography>
      {sub && <Typography sx={{ fontSize: '0.4375rem', color: '#94a3b8' }}>{sub}</Typography>}
    </Box>
  );
}
