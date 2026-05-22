import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from '@mui/material';
import { UserPlus, ClipboardList } from 'lucide-react';
import type { Employee } from '../../contexts/EmployeeContext';
import type { SiteLocation } from './types';
import type { OffsiteFieldAssignment } from './offsiteAssignments';
import { fieldShellSx, fieldSubtitleSx, fieldTitleSx } from './fieldOpsStyles';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: { maxHeight: ITEM_HEIGHT * 5.5 + ITEM_PADDING_TOP },
  },
};

export interface AssignFieldWorkPanelProps {
  offsiteWorkers: Employee[];
  locations: SiteLocation[];
  assignments: OffsiteFieldAssignment[];
  onAssign: (input: {
    title: string;
    description?: string;
    siteId?: string;
    assigneeIds: string[];
    dueDate?: string;
  }) => void;
}

export function AssignFieldWorkPanel({
  offsiteWorkers,
  locations,
  assignments,
  onAssign,
}: AssignFieldWorkPanelProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [siteId, setSiteId] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');

  const openAssignments = useMemo(
    () => assignments.filter((a) => a.status !== 'completed').slice(0, 6),
    [assignments]
  );

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSiteId('');
    setAssigneeIds([]);
    setDueDate('');
  };

  const handleSubmit = () => {
    if (!title.trim() || assigneeIds.length === 0) return;
    onAssign({
      title: title.trim(),
      description: description.trim() || undefined,
      siteId: siteId || undefined,
      assigneeIds,
      dueDate: dueDate || undefined,
    });
    resetForm();
    setOpen(false);
  };

  return (
    <>
      <Paper elevation={0} sx={{ ...fieldShellSx, p: { xs: 1.25, sm: 1.5 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={1.25}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <UserPlus size={17} color="#0ea5e9" />
              <Typography sx={fieldTitleSx}>Assign field work</Typography>
              <Chip
                size="small"
                label={`${offsiteWorkers.length} field`}
                sx={{ height: 20, fontWeight: 800, fontSize: '0.5625rem', bgcolor: '#eff6ff', color: '#1d4ed8' }}
              />
            </Stack>
            <Typography sx={{ ...fieldSubtitleSx, maxWidth: 520 }}>
              Brief jobs to field crews only. When work is submitted or marked complete, the person who briefed it is notified.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<UserPlus size={14} />}
            onClick={() => setOpen(true)}
            disabled={offsiteWorkers.length === 0}
            sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#0ea5e9', borderRadius: 1.5, alignSelf: { xs: 'stretch', sm: 'center' } }}
          >
            Assign to field team
          </Button>
        </Stack>

        {openAssignments.length > 0 && (
          <Stack spacing={0.75} sx={{ mt: 1.25, pt: 1.25, borderTop: '1px solid #f1f5f9' }}>
            <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Active briefings
            </Typography>
            {openAssignments.map((a) => (
              <Stack
                key={a.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ py: 0.65, px: 1, borderRadius: 1.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}
              >
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0 }}>
                  <ClipboardList size={14} color="#64748b" />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }} noWrap>
                      {a.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }} noWrap>
                      {a.assigneeNames.join(', ')}
                      {a.siteName ? ` · ${a.siteName}` : ''}
                    </Typography>
                  </Box>
                </Stack>
                <Chip size="small" label={a.status.replace('_', ' ')} sx={{ fontWeight: 700, fontSize: '0.625rem', textTransform: 'capitalize' }} />
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Assign field work</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              label="Work title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              placeholder="e.g. Site inspection — Block C"
            />
            <TextField
              label="Instructions"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <FormControl fullWidth>
              <InputLabel>Site (optional)</InputLabel>
              <Select value={siteId} label="Site (optional)" onChange={(e) => setSiteId(e.target.value)}>
                <MenuItem value="">
                  <em>No specific site</em>
                </MenuItem>
                {locations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Field crew</InputLabel>
              <Select
                multiple
                value={assigneeIds}
                onChange={(e) => setAssigneeIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                input={<OutlinedInput label="Field crew" />}
                renderValue={(selected) =>
                  offsiteWorkers
                    .filter((w) => selected.includes(w.id))
                    .map((w) => w.name)
                    .join(', ')
                }
                MenuProps={MenuProps}
              >
                {offsiteWorkers.map((w) => (
                  <MenuItem key={w.id} value={w.id}>
                    <Checkbox checked={assigneeIds.includes(w.id)} size="small" />
                    <ListItemText primary={w.name} secondary={w.position} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Due date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!title.trim() || assigneeIds.length === 0}>
            Brief & assign
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
