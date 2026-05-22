import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Stack,
  Avatar,
  Box,
} from '@mui/material';
import { format } from 'date-fns';
import type { Employee } from '../../../contexts/EmployeeContext';
import { getOfficeAssignableEmployees } from '../../../utils/offsiteWorkers';

export interface AssignScheduleDialogProps {
  open: boolean;
  taskTitle: string;
  scheduleDay: Date;
  employees: Employee[];
  projectOptions: string[];
  defaultProject?: string;
  onClose: () => void;
  onConfirm: (assigneeId: string, projectName: string) => void;
}

export function AssignScheduleDialog({
  open,
  taskTitle,
  scheduleDay,
  employees,
  projectOptions,
  defaultProject = '',
  onClose,
  onConfirm,
}: AssignScheduleDialogProps) {
  const activeEmployees = useMemo(() => getOfficeAssignableEmployees(employees), [employees]);

  const [assigneeId, setAssigneeId] = useState('');
  const [projectName, setProjectName] = useState(defaultProject);

  React.useEffect(() => {
    if (!open) return;
    setProjectName(defaultProject);
    if (activeEmployees.length > 0 && !assigneeId) {
      setAssigneeId(activeEmployees[0].id);
    }
  }, [open, defaultProject, activeEmployees, assigneeId]);

  const canConfirm = Boolean(assigneeId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
        Assign &amp; schedule
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.5 }}>
          Choose who should own <strong>{taskTitle}</strong> on{' '}
          <strong>{format(scheduleDay, 'EEEE, MMMM d, yyyy')}</strong> before placing it on the week
          runway.
        </Typography>
        <Stack spacing={2.5}>
          <FormControl fullWidth required>
            <InputLabel id="assign-schedule-person-label">Assign to</InputLabel>
            <Select
              labelId="assign-schedule-person-label"
              label="Assign to"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              {activeEmployees.length === 0 ? (
                <MenuItem value="" disabled>
                  No active employees — add people in HR
                </MenuItem>
              ) : (
                activeEmployees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Avatar src={emp.avatar} sx={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                        {emp.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {emp.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {emp.position} · {emp.department}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="assign-schedule-project-label">Project / workstream</InputLabel>
            <Select
              labelId="assign-schedule-project-label"
              label="Project / workstream"
              value={projectOptions.includes(projectName) ? projectName : '__custom__'}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '__custom__') setProjectName('');
                else setProjectName(v);
              }}
            >
              {projectOptions.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
              <MenuItem value="__custom__">Other (specify below)</MenuItem>
            </Select>
          </FormControl>

          {(!projectOptions.includes(projectName) || projectName === '') && (
            <TextField
              label="Project name"
              fullWidth
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Platform Development"
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!canConfirm}
          onClick={() => onConfirm(assigneeId, projectName.trim() || 'General')}
        >
          Schedule on runway
        </Button>
      </DialogActions>
    </Dialog>
  );
}
