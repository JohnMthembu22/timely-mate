import React from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import { Search, Filter, User } from 'lucide-react';
import type { TaskFiltersState, TaskGroupMode, TaskPriority, TaskStatus } from '../types';
import { PRIORITY_LABELS, STATUS_LABELS } from '../taskUtils';
import { glassCardSx } from '../../../theme/surfaces';

const ALL_STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
const ALL_PRIORITIES: TaskPriority[] = ['urgent', 'high', 'medium', 'low'];

export function TaskFiltersBar({
  filters,
  groupMode,
  assigneeOptions,
  resultCount,
  onFiltersChange,
  onGroupModeChange,
}: {
  filters: TaskFiltersState;
  groupMode: TaskGroupMode;
  assigneeOptions: { email: string; name: string }[];
  resultCount: number;
  onFiltersChange: (next: TaskFiltersState) => void;
  onGroupModeChange: (mode: TaskGroupMode) => void;
}) {
  const theme = useTheme();

  const toggleStatus = (status: TaskStatus) => {
    const has = filters.statuses.includes(status);
    onFiltersChange({
      ...filters,
      statuses: has ? filters.statuses.filter((s) => s !== status) : [...filters.statuses, status],
    });
  };

  const togglePriority = (p: TaskPriority) => {
    const has = filters.priorities.includes(p);
    onFiltersChange({
      ...filters,
      priorities: has ? filters.priorities.filter((x) => x !== p) : [...filters.priorities, p],
    });
  };

  return (
    <Box sx={{ ...glassCardSx(theme), p: { xs: 1.5, md: 2 } }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <TextField
            size="small"
            placeholder="Search tasks…"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: { sm: 360 } }}
          />
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
            <InputLabel>Due</InputLabel>
            <Select
              label="Due"
              value={filters.dueFilter}
              onChange={(e) =>
                onFiltersChange({ ...filters, dueFilter: e.target.value as TaskFiltersState['dueFilter'] })
              }
            >
              <MenuItem value="all">All dates</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
              <MenuItem value="today">Due today</MenuItem>
              <MenuItem value="week">Next 7 days</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
            <InputLabel>Assignee</InputLabel>
            <Select
              label="Assignee"
              value={filters.assignee}
              onChange={(e) => onFiltersChange({ ...filters, assignee: e.target.value })}
            >
              <MenuItem value="">Everyone</MenuItem>
              {assigneeOptions.map((a) => (
                <MenuItem key={a.email} value={a.email}>
                  {a.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Filter size={16} style={{ opacity: 0.6 }} />
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', mr: 0.5 }}>
            Status
          </Typography>
          {ALL_STATUSES.map((s) => (
            <Chip
              key={s}
              label={STATUS_LABELS[s]}
              size="small"
              onClick={() => toggleStatus(s)}
              variant={filters.statuses.includes(s) ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600, fontSize: '0.6875rem' }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', mr: 0.5 }}>
            Priority
          </Typography>
          {ALL_PRIORITIES.map((p) => (
            <Chip
              key={p}
              label={PRIORITY_LABELS[p]}
              size="small"
              onClick={() => togglePriority(p)}
              variant={filters.priorities.includes(p) ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600, fontSize: '0.6875rem' }}
            />
          ))}
          <Chip
            icon={<User size={14} />}
            label="My tasks"
            size="small"
            onClick={() => onFiltersChange({ ...filters, myTasksOnly: !filters.myTasksOnly })}
            color={filters.myTasksOnly ? 'primary' : 'default'}
            variant={filters.myTasksOnly ? 'filled' : 'outlined'}
            sx={{ ml: { md: 'auto' } }}
          />
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
              Group by
            </Typography>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={groupMode}
              onChange={(_, v) => v && onGroupModeChange(v)}
              sx={{
                flexWrap: 'wrap',
                '& .MuiToggleButton-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  px: 1.25,
                  borderRadius: '3px !important',
                  mx: 0.25,
                },
              }}
            >
              <ToggleButton value="status">Status</ToggleButton>
              <ToggleButton value="priority">Priority</ToggleButton>
              <ToggleButton value="due">Due date</ToggleButton>
              <ToggleButton value="assignee">Assignee</ToggleButton>
              <ToggleButton value="project">Project</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary' }}>
            {resultCount} task{resultCount !== 1 ? 's' : ''}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
