import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import {
  AlertCircle,
  Camera,
  GripVertical,
  MapPin,
  Plus,
  QrCode,
  Shield,
  User,
} from 'lucide-react';
import type { OffsiteFieldTask, OffsiteTaskStatus } from './offsiteOpsTypes';
import { OFFSITE_TASK_COLUMNS } from './offsiteOpsTypes';
import { fieldHeaderSx, fieldShellSx, fieldSubtitleSx, fieldTitleSx } from './fieldOpsStyles';

const priorityColor = {
  low: '#64748b',
  medium: '#0ea5e9',
  high: '#f59e0b',
  urgent: '#ef4444',
};

const typeLabel = {
  installation: 'Installation',
  inspection: 'Inspection',
  maintenance: 'Maintenance',
  delivery: 'Delivery',
  general: 'General',
};

function TaskCard({
  task,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  task: OffsiteFieldTask;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const pri = priorityColor[task.priority];
  return (
    <Paper
      elevation={0}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      sx={{
        p: 1.25,
        borderRadius: 2,
        border: '2px solid',
        borderColor: isDragging ? '#6366f1' : task.overdue ? '#fecaca' : '#e8edf4',
        bgcolor: isDragging ? alpha('#6366f1', 0.05) : '#fff',
        cursor: 'grab',
        opacity: isDragging ? 0.9 : 1,
        boxShadow: isDragging ? '0 12px 28px rgba(99,102,241,0.18)' : 'none',
        transition: 'box-shadow 150ms ease, border-color 150ms ease',
        '&:hover': { borderColor: '#a5b4fc' },
      }}
    >
      <Stack direction="row" spacing={0.75} alignItems="flex-start">
        <Box sx={{ color: '#cbd5e1', mt: 0.25 }}>
          <GripVertical size={14} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={0.5}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
              {task.title}
            </Typography>
            {task.overdue && <AlertCircle size={14} color="#ef4444" />}
          </Stack>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
            <Chip size="small" label={typeLabel[task.type]} sx={{ height: 18, fontSize: '0.5rem', fontWeight: 700 }} />
            <Chip
              size="small"
              label={task.priority}
              sx={{ height: 18, fontSize: '0.5rem', fontWeight: 800, color: pri, bgcolor: alpha(pri, 0.1) }}
            />
          </Stack>
          <Stack direction="row" spacing={0.35} alignItems="center" sx={{ mt: 0.75 }}>
            <MapPin size={11} color="#64748b" />
            <Typography sx={{ fontSize: '0.625rem', color: '#64748b', fontWeight: 600 }}>{task.siteName}</Typography>
          </Stack>
          {task.assigneeName && (
            <Stack direction="row" spacing={0.35} alignItems="center" sx={{ mt: 0.35 }}>
              <User size={11} color="#64748b" />
              <Typography sx={{ fontSize: '0.625rem', color: '#475569', fontWeight: 600 }}>
                {task.assigneeName} · Sup. {task.supervisorName}
              </Typography>
            </Stack>
          )}
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.85, pt: 0.75, borderTop: '1px solid #f1f5f9' }}>
            <Typography sx={{ fontSize: '0.5625rem', color: '#94a3b8', fontWeight: 600 }}>
              {task.travelDurationMin > 0 ? `${task.travelDurationMin} min travel` : 'On site'} · ETA {task.etaArrival}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.35} sx={{ mt: 0.65 }}>
            {task.qrVerified && (
              <Chip size="small" icon={<QrCode size={9} />} label="QR" sx={{ height: 18, fontSize: '0.5rem', fontWeight: 700 }} />
            )}
            {task.hasImages && (
              <Chip size="small" icon={<Camera size={9} />} label="Photos" sx={{ height: 18, fontSize: '0.5rem', fontWeight: 700 }} />
            )}
            {task.safetyChecklist && (
              <Chip size="small" icon={<Shield size={9} />} label="Safety" sx={{ height: 18, fontSize: '0.5rem', fontWeight: 700, bgcolor: '#ecfdf5', color: '#059669' }} />
            )}
            {task.completionProof && (
              <Chip size="small" label="Proof ✓" sx={{ height: 18, fontSize: '0.5rem', fontWeight: 700, bgcolor: '#eef2ff', color: '#4338ca' }} />
            )}
          </Stack>
          {task.status === 'in_progress' && (
            <Box sx={{ mt: 0.85, height: 4, borderRadius: 2, bgcolor: '#f1f5f9', overflow: 'hidden' }}>
              <Box sx={{ width: `${task.progress}%`, height: '100%', bgcolor: '#6366f1', borderRadius: 2 }} />
            </Box>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

export interface OffsiteTaskManagementProps {
  tasks: OffsiteFieldTask[];
  onTasksChange: (tasks: OffsiteFieldTask[]) => void;
}

export function OffsiteTaskManagement({ tasks, onTasksChange }: OffsiteTaskManagementProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<OffsiteTaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, task: OffsiteFieldTask) => {
    setDraggedId(task.id);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: OffsiteTaskStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedId;
    if (!id) return;
    onTasksChange(
      tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              progress: status === 'completed' ? 100 : status === 'in_progress' ? Math.max(t.progress, 20) : t.progress,
            }
          : t
      )
    );
    setDraggedId(null);
    setDragOverColumn(null);
  };

  const overdueCount = tasks.filter((t) => t.overdue && t.status !== 'completed').length;

  return (
    <Paper elevation={0} sx={fieldShellSx}>
      <Box sx={fieldHeaderSx}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#eef2ff',
              border: '1px solid #c7d2fe',
            }}
          >
            <GripVertical size={18} color="#4f46e5" />
          </Box>
          <Box>
            <Typography sx={fieldTitleSx}>Field task management</Typography>
            <Typography sx={fieldSubtitleSx}>
              Assign installations · inspections · maintenance · deliveries · drag workflow
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center">
          {overdueCount > 0 && (
            <Chip
              size="small"
              icon={<AlertCircle size={10} />}
              label={`${overdueCount} overdue`}
              sx={{ fontWeight: 800, fontSize: '0.625rem', bgcolor: '#fef2f2', color: '#dc2626' }}
            />
          )}
          <Button
            size="small"
            variant="contained"
            startIcon={<Plus size={14} />}
            sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#4f46e5', borderRadius: 1.5 }}
          >
            New task
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          p: { xs: 1, sm: 1.25 },
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(5, minmax(160px, 1fr))',
          },
          gap: 1,
          overflowX: { lg: 'auto' },
        }}
      >
        {OFFSITE_TASK_COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.id);
          const isDropTarget = dragOverColumn === col.id;
          return (
            <Box
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverColumn(col.id);
              }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => handleDrop(e, col.id)}
              sx={{
                minHeight: 200,
                borderRadius: 2,
                bgcolor: isDropTarget ? alpha('#6366f1', 0.06) : '#f8fafc',
                border: '2px dashed',
                borderColor: isDropTarget ? '#6366f1' : '#e2e8f0',
                p: 1,
                transition: 'background 150ms ease, border-color 150ms ease',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1, px: 0.25 }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                  {col.label}
                </Typography>
                <Chip label={columnTasks.length} size="small" sx={{ height: 20, fontWeight: 800, fontSize: '0.625rem' }} />
              </Stack>
              <Stack spacing={0.85}>
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isDragging={draggedId === task.id}
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
