import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import type { TaskFormValues, TaskPriority, TaskStatus } from '../pages/Tasks/types';

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: TaskFormValues) => void;
  initialTask?: Partial<TaskFormValues> & {
    title: string;
    description: string;
    status: TaskStatus;
    assignee: string;
  };
}

const defaultForm: TaskFormValues = {
  title: '',
  description: '',
  status: 'TODO',
  assignee: '',
  priority: 'medium',
  dueDate: '',
  project: 'General',
};

export const TaskDialog: React.FC<TaskDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialTask,
}) => {
  const [task, setTask] = useState<TaskFormValues>(defaultForm);

  useEffect(() => {
    if (open) {
      setTask({
        ...defaultForm,
        ...initialTask,
        priority: initialTask?.priority ?? 'medium',
        dueDate: initialTask?.dueDate ?? '',
        project: initialTask?.project ?? 'General',
      });
    }
  }, [open, initialTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(task);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setTask((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initialTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              name="title"
              label="Title"
              value={task.title}
              onChange={handleTextChange}
              required
              fullWidth
            />
            <TextField
              name="description"
              label="Description"
              value={task.description}
              onChange={handleTextChange}
              multiline
              rows={4}
              required
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={task.status} label="Status" onChange={handleSelectChange}>
                <MenuItem value="TODO">To Do</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Priority</InputLabel>
              <Select name="priority" value={task.priority} label="Priority" onChange={handleSelectChange}>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            <TextField
              name="dueDate"
              label="Due date"
              type="date"
              value={task.dueDate}
              onChange={handleTextChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="project"
              label="Project"
              value={task.project ?? ''}
              onChange={handleTextChange}
              fullWidth
            />
            <TextField
              name="assignee"
              label="Assignee Email"
              value={task.assignee}
              onChange={handleTextChange}
              required
              fullWidth
              type="email"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {initialTask ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
