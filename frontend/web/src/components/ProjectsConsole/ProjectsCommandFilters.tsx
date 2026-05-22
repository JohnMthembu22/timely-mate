import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  InputAdornment,
  Divider,
  alpha,
} from '@mui/material';
import {
  Search,
  FileText,
  UserPlus,
  Video,
  CalendarRange,
  Download,
  Bell,
  SlidersHorizontal,
} from 'lucide-react';
import type { ProjectFilterState, ProjectSortMode, ProjectStatusFilter, UtilizationFilter } from './projectConsoleFilters';
import { sectionShellSx } from './projectsConsoleStyles';

export type CommandQuickActionId =
  | 'generate-report'
  | 'assign-resources'
  | 'launch-meeting'
  | 'open-timeline'
  | 'export-dashboard'
  | 'notify-team';

const sortOptions: { value: ProjectSortMode; label: string }[] = [
  { value: 'ai-smart', label: 'AI smart sort' },
  { value: 'risk', label: 'Risk (high first)' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'workload', label: 'Workload' },
  { value: 'progress', label: 'Progress' },
  { value: 'name', label: 'Name A–Z' },
];

const statusOptions: { value: ProjectStatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'In progress' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'at-risk', label: 'At risk' },
];

const utilOptions: { value: UtilizationFilter; label: string }[] = [
  { value: 'all', label: 'All utilization' },
  { value: 'under', label: 'Under 65%' },
  { value: 'optimal', label: '65–85%' },
  { value: 'over', label: 'Over 85%' },
];

const quickActions: { id: CommandQuickActionId; label: string; icon: React.ElementType }[] = [
  { id: 'generate-report', label: 'Report', icon: FileText },
  { id: 'assign-resources', label: 'Assign', icon: UserPlus },
  { id: 'launch-meeting', label: 'Meeting', icon: Video },
  { id: 'open-timeline', label: 'Timeline', icon: CalendarRange },
  { id: 'export-dashboard', label: 'Export', icon: Download },
  { id: 'notify-team', label: 'Notify', icon: Bell },
];

export interface ProjectsCommandFiltersProps {
  filters: ProjectFilterState;
  departments: string[];
  resultCount: number;
  totalCount: number;
  onFiltersChange: (patch: Partial<ProjectFilterState>) => void;
  onQuickAction: (action: CommandQuickActionId) => void;
}

export function ProjectsCommandFilters({
  filters,
  departments,
  resultCount,
  totalCount,
  onFiltersChange,
  onQuickAction,
}: ProjectsCommandFiltersProps) {
  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.department !== 'all' ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.utilization !== 'all' ? 1 : 0) +
    (filters.sort !== 'ai-smart' ? 1 : 0);

  return (
    <Paper elevation={0} sx={{ ...sectionShellSx, overflow: 'visible' }}>
      <Box sx={{ px: { xs: 1.25, sm: 1.5 }, pt: 1.35, pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SlidersHorizontal size={16} color="#6366f1" />
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Command filters
            </Typography>
            {activeFilterCount > 0 && (
              <Chip
                size="small"
                label={`${activeFilterCount} active`}
                sx={{ height: 20, fontWeight: 800, fontSize: '0.625rem', bgcolor: '#eef2ff', color: '#4338ca' }}
              />
            )}
          </Stack>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            Showing <strong>{resultCount}</strong> of {totalCount} workspaces
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 1.25, sm: 1.5 }, pb: 1.35 }}>
        <GridLikeFilters
          filters={filters}
          departments={departments}
          onFiltersChange={onFiltersChange}
        />
      </Box>

      <Divider />

      <Box
        sx={{
          px: { xs: 1.25, sm: 1.5 },
          py: 1.15,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          alignItems: 'center',
          bgcolor: alpha('#6366f1', 0.03),
        }}
      >
        <Typography
          sx={{
            fontSize: '0.625rem',
            fontWeight: 800,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            mr: 0.5,
          }}
        >
          Quick actions
        </Typography>
        {quickActions.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            size="small"
            variant="outlined"
            startIcon={<Icon size={13} />}
            onClick={() => onQuickAction(id)}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.6875rem',
              borderRadius: 1.5,
              borderColor: '#e2e8f0',
              color: '#475569',
              bgcolor: '#fff',
              '&:hover': {
                borderColor: '#a5b4fc',
                color: '#4338ca',
                bgcolor: '#f8fafc',
              },
            }}
          >
            {label}
          </Button>
        ))}
      </Box>
    </Paper>
  );
}

function GridLikeFilters({
  filters,
  departments,
  onFiltersChange,
}: {
  filters: ProjectFilterState;
  departments: string[];
  onFiltersChange: (patch: Partial<ProjectFilterState>) => void;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr 1fr',
          md: '2fr 1fr 1fr 1fr 1fr',
        },
        gap: 1.5,
        alignItems: 'flex-end',
      }}
    >
      <TextField
        size="small"
        placeholder="Search projects, departments, risk…"
        value={filters.search}
        onChange={(e) => onFiltersChange({ search: e.target.value })}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={16} color="#94a3b8" />
            </InputAdornment>
          ),
        }}
        sx={{ gridColumn: { xs: '1', md: '1 / 2' } }}
      />
      <FormControl size="small">
        <InputLabel>Department</InputLabel>
        <Select
          label="Department"
          value={filters.department}
          onChange={(e) => onFiltersChange({ department: e.target.value })}
        >
          <MenuItem value="all">All departments</MenuItem>
          {departments.map((d) => (
            <MenuItem key={d} value={d}>
              {d}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small">
        <InputLabel>Status</InputLabel>
        <Select
          label="Status"
          value={filters.status}
          onChange={(e) => onFiltersChange({ status: e.target.value as ProjectStatusFilter })}
        >
          {statusOptions.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small">
        <InputLabel>Utilization</InputLabel>
        <Select
          label="Utilization"
          value={filters.utilization}
          onChange={(e) => onFiltersChange({ utilization: e.target.value as UtilizationFilter })}
        >
          {utilOptions.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small">
        <InputLabel>Sort</InputLabel>
        <Select
          label="Sort"
          value={filters.sort}
          onChange={(e) => onFiltersChange({ sort: e.target.value as ProjectSortMode })}
        >
          {sortOptions.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
