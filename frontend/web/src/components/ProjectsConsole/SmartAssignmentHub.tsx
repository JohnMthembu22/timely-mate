import React, { useCallback, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  alpha,
  Alert,
  Snackbar,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Sparkles,
  GripVertical,
  UserPlus,
  AlertTriangle,
  Lightbulb,
  Shuffle,
  Building2,
  Calendar,
  Link2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type {
  AssignmentQueueItem,
  SmartAssignmentInsight,
  TeamAvailabilityLane,
} from './projectAssignmentHub';
import { daysUntilLabel } from './projectAssignmentHub';
import { sectionHeaderSx, sectionShellSx, sectionSubtitleSx, sectionTitleSx } from './projectsConsoleStyles';

const DRAG_TYPE = 'application/x-timelymate-assignment';

const insightStyle = {
  suggestion: { icon: Lightbulb, color: '#2563eb', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.22)' },
  warning: { icon: AlertTriangle, color: '#dc2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.25)' },
  rebalance: { icon: Shuffle, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.22)' },
};

const priorityBadge = {
  high: { label: 'P1', color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
  medium: { label: 'P2', color: '#d97706', bg: 'rgba(245,158,11,0.1)' },
  low: { label: 'P3', color: '#64748b', bg: '#f1f5f9' },
};

export interface SmartAssignmentHubProps {
  insights: SmartAssignmentInsight[];
  queue: AssignmentQueueItem[];
  teamLanes: TeamAvailabilityLane[];
  departments: string[];
  projectOptions: { id: string; name: string }[];
  onAssignToProject: (projectId: string) => void;
  onQuickAssign: (item: AssignmentQueueItem, teamMemberId: string) => void;
}

export function SmartAssignmentHub({
  insights,
  queue,
  teamLanes,
  departments,
  projectOptions,
  onAssignToProject,
  onQuickAssign,
}: SmartAssignmentHubProps) {
  const [draggedItem, setDraggedItem] = useState<AssignmentQueueItem | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [assignNotice, setAssignNotice] = useState<string | null>(null);
  const [quickProject, setQuickProject] = useState('');
  const [quickDept, setQuickDept] = useState('');
  const [quickPriority, setQuickPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [quickDeadline, setQuickDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [sectionExpanded, setSectionExpanded] = useState(true);

  const assignToLane = useCallback(
    (item: AssignmentQueueItem, laneId: string) => {
      const lane = teamLanes.find((l) => l.id === laneId);
      if (!lane) return;
      onQuickAssign(item, laneId);
      setAssignNotice(`Assigned "${item.title}" to ${lane.name}`);
      setDraggedItem(null);
      setDropTarget(null);
    },
    [onQuickAssign, teamLanes]
  );

  const handleDragStart = (e: React.DragEvent, item: AssignmentQueueItem) => {
    setDraggedItem(item);
    e.dataTransfer.setData(DRAG_TYPE, JSON.stringify({ itemId: item.id }));
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDropTarget(null);
  };

  const handleDragOverLane = (e: React.DragEvent, laneId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(laneId);
  };

  const handleDragLeaveLane = (e: React.DragEvent) => {
    const related = e.relatedTarget as Node | null;
    if (related && e.currentTarget.contains(related)) return;
    setDropTarget(null);
  };

  const handleDropOnLane = (e: React.DragEvent, laneId: string) => {
    e.preventDefault();
    e.stopPropagation();

    let item = draggedItem;
    if (!item) {
      try {
        const raw = e.dataTransfer.getData(DRAG_TYPE) || e.dataTransfer.getData('text/plain');
        const parsed = raw.startsWith('{') ? JSON.parse(raw) : { itemId: raw };
        item = queue.find((q) => q.id === parsed.itemId) ?? null;
      } catch {
        item = null;
      }
    }

    if (item) assignToLane(item, laneId);
    else setDropTarget(null);
  };

  const laneDropActive = dropTarget !== null;

  return (
    <Paper elevation={0} sx={{ ...sectionShellSx, overflow: 'hidden' }}>
      <Snackbar
        open={Boolean(assignNotice)}
        autoHideDuration={4000}
        onClose={() => setAssignNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          icon={<CheckCircle2 size={18} />}
          onClose={() => setAssignNotice(null)}
          sx={{ width: '100%', fontWeight: 600 }}
        >
          {assignNotice}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          ...sectionHeaderSx,
          background: 'linear-gradient(180deg, rgba(37,99,235,0.06) 0%, transparent 100%)',
          ...(!sectionExpanded && { borderBottom: 'none' }),
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <UserPlus size={18} color="#2563eb" />
            <Typography sx={sectionTitleSx}>Operational assignment hub</Typography>
            <Chip
              size="small"
              icon={<Sparkles size={10} color="#4f46e5" />}
              label="Smart routing"
              sx={{
                fontWeight: 800,
                fontSize: '0.5625rem',
                bgcolor: '#eef2ff',
                color: '#4338ca',
                border: '1px solid #c7d2fe',
              }}
            />
          </Stack>
          <Typography sx={sectionSubtitleSx}>
            Drag tasks from the queue onto a team lane, or use Quick assign on each card.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip
            size="small"
            label={`${queue.length} in queue`}
            sx={{
              fontWeight: 700,
              fontSize: '0.6875rem',
              bgcolor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e2e8f0',
            }}
          />
          <Tooltip title={sectionExpanded ? 'Collapse section' : 'Expand section'}>
            <IconButton
              size="small"
              onClick={() => setSectionExpanded((open) => !open)}
              aria-expanded={sectionExpanded}
              aria-label={
                sectionExpanded ? 'Collapse assignment hub' : 'Expand assignment hub'
              }
              sx={{
                color: '#64748b',
                border: '1px solid #e2e8f0',
                bgcolor: '#fff',
                '&:hover': {
                  bgcolor: '#f8fafc',
                  color: '#2563eb',
                  borderColor: '#bfdbfe',
                },
              }}
            >
              {sectionExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Collapse in={sectionExpanded} timeout={280}>
      <Box sx={{ px: { xs: 1.25, sm: 1.5 }, py: 1.25, display: 'flex', gap: 1.15, overflowX: 'auto' }}>
        {insights.map((ins) => {
          const meta = insightStyle[ins.type];
          const Icon = meta.icon;
          return (
            <Paper
              key={ins.id}
              elevation={0}
              sx={{
                p: 1.5,
                minWidth: 260,
                flex: '0 0 auto',
                borderRadius: 2,
                border: `1px solid ${meta.border}`,
                bgcolor: meta.bg,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Icon size={16} color={meta.color} style={{ marginTop: 2 }} />
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.35 }}>
                    {ins.headline}
                  </Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', mt: 0.5, lineHeight: 1.4 }}>
                    {ins.detail}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          );
        })}
      </Box>

      <Box
        sx={{
          mx: 2.5,
          mb: 2,
          p: 2,
          borderRadius: 2,
          border: '1px solid #e8edf4',
          bgcolor: '#fafbfc',
        }}
      >
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', mb: 1.5, letterSpacing: '0.06em' }}>
          QUICK ASSIGN
        </Typography>
        <Grid container spacing={1.5} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Project</InputLabel>
              <Select label="Project" value={quickProject} onChange={(e) => setQuickProject(e.target.value)}>
                <MenuItem value="">Select…</MenuItem>
                {projectOptions.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select label="Department" value={quickDept} onChange={(e) => setQuickDept(e.target.value)}>
                <MenuItem value="">Any</MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                label="Priority"
                value={quickPriority}
                onChange={(e) => setQuickPriority(e.target.value as typeof quickPriority)}
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              size="small"
              fullWidth
              type="date"
              label="Deadline"
              value={quickDeadline}
              onChange={(e) => setQuickDeadline(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              disabled={!quickProject}
              onClick={() => quickProject && onAssignToProject(quickProject)}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: '#0f172a',
                borderRadius: 1.5,
                py: 1,
              }}
            >
              Open & assign
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={1.5} sx={{ px: { xs: 1.25, sm: 1.5 }, pb: { xs: 1.25, sm: 1.5 } }}>
        <Grid item xs={12} lg={5}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', mb: 1.5 }}>
            Unassigned queue · drag to team lane
          </Typography>
          {draggedItem && (
            <Alert severity="info" sx={{ mb: 1.5, py: 0.5, fontSize: '0.75rem' }}>
              Dragging: <strong>{draggedItem.title}</strong>
            </Alert>
          )}
          <Stack
            spacing={1.25}
            sx={{
              maxHeight: 360,
              overflow: 'auto',
              pr: 0.5,
              minHeight: 120,
            }}
          >
            {queue.length === 0 ? (
              <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8', py: 4, textAlign: 'center' }}>
                Queue empty — all tasks are assigned.
              </Typography>
            ) : (
              queue.map((item) => {
                const pri = priorityBadge[item.priority];
                const isDragging = draggedItem?.id === item.id;
                const suggestedLane = teamLanes.find(
                  (l) =>
                    l.available &&
                    (item.assigneeSuggestion
                      ? l.name.toLowerCase().includes(item.assigneeSuggestion.split(' ')[0].toLowerCase())
                      : l.department === item.department)
                );

                return (
                  <Paper
                    key={item.id}
                    elevation={0}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragEnd={handleDragEnd}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '2px solid',
                      borderColor: isDragging ? '#6366f1' : '#e8edf4',
                      bgcolor: isDragging ? alpha('#6366f1', 0.06) : '#fff',
                      cursor: isDragging ? 'grabbing' : 'grab',
                      opacity: draggedItem && !isDragging ? 0.55 : 1,
                      boxShadow: isDragging ? '0 12px 32px rgba(99,102,241,0.2)' : 'none',
                      transform: isDragging ? 'scale(1.02)' : 'none',
                      transition: 'box-shadow 150ms ease, opacity 150ms ease, border-color 150ms ease',
                      userSelect: 'none',
                      WebkitUserDrag: 'element',
                      '&:hover': { borderColor: '#a5b4fc' },
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Box
                        sx={{
                          mt: 0.5,
                          color: '#94a3b8',
                          cursor: 'grab',
                          touchAction: 'none',
                        }}
                        aria-hidden
                      >
                        <GripVertical size={14} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={0.5}>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>
                            {item.title}
                          </Typography>
                          <Chip
                            size="small"
                            label={pri.label}
                            sx={{
                              height: 20,
                              fontSize: '0.625rem',
                              fontWeight: 900,
                              color: pri.color,
                              bgcolor: pri.bg,
                            }}
                          />
                        </Stack>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', mt: 0.25 }}>
                          {item.projectName}
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.75 }}>
                          <Chip size="small" icon={<Building2 size={10} />} label={item.department} sx={{ height: 20, fontSize: '0.625rem' }} />
                          <Chip size="small" icon={<Calendar size={10} />} label={daysUntilLabel(item.dueDate)} sx={{ height: 20, fontSize: '0.625rem' }} />
                        </Stack>
                        <Stack direction="row" spacing={0.75} sx={{ mt: 1.25 }} flexWrap="wrap">
                          {suggestedLane && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={(e) => {
                                e.stopPropagation();
                                assignToLane(item, suggestedLane.id);
                              }}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.6875rem',
                                py: 0.35,
                                bgcolor: '#4f46e5',
                                borderRadius: 1.5,
                              }}
                            >
                              Assign to {suggestedLane.name.split(' ')[0]}
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAssignToProject(item.projectId);
                            }}
                            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.6875rem', borderRadius: 1.5 }}
                          >
                            Open project
                          </Button>
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })
            )}
          </Stack>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', mb: 1.5 }}>
            Team availability · drop to assign
          </Typography>
          {laneDropActive && (
            <Alert severity="success" sx={{ mb: 1.5, py: 0.5, fontSize: '0.75rem' }}>
              Release to assign to highlighted lane
            </Alert>
          )}
          <Grid container spacing={1.5}>
            {teamLanes.map((lane) => {
              const hot = lane.loadPercent >= 88;
              const isDrop = dropTarget === lane.id;
              const canDrop = Boolean(draggedItem) && lane.available;

              return (
                <Grid item xs={12} sm={6} key={lane.id}>
                  <Box
                    onDragEnter={(e) => handleDragOverLane(e, lane.id)}
                    onDragOver={(e) => handleDragOverLane(e, lane.id)}
                    onDragLeave={handleDragLeaveLane}
                    onDrop={(e) => handleDropOnLane(e, lane.id)}
                    sx={{
                      borderRadius: 2.5,
                      outline: isDrop ? '2px solid #6366f1' : '2px solid transparent',
                      outlineOffset: 2,
                      transition: 'outline-color 120ms ease',
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: '2px dashed',
                        borderColor: isDrop
                          ? '#6366f1'
                          : canDrop
                            ? '#a5b4fc'
                            : lane.available
                              ? '#e2e8f0'
                              : '#fecaca',
                        bgcolor: isDrop
                          ? alpha('#6366f1', 0.12)
                          : canDrop
                            ? alpha('#99,102,241', 0.04)
                            : lane.available
                              ? '#fafbfc'
                              : '#fef2f2',
                        minHeight: 108,
                        transition: 'background-color 150ms ease, border-color 150ms ease',
                        pointerEvents: 'auto',
                      }}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar src={lane.avatar} sx={{ width: 36, height: 36, fontSize: '0.75rem' }}>
                          {lane.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>
                            {lane.name}
                          </Typography>
                          <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                            {lane.role} · {lane.department}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={lane.loadPercent}
                            sx={{
                              mt: 0.75,
                              height: 5,
                              borderRadius: 99,
                              bgcolor: '#e2e8f0',
                              '& .MuiLinearProgress-bar': { bgcolor: hot ? '#ef4444' : '#10b981' },
                            }}
                          />
                        </Box>
                        <Chip
                          size="small"
                          label={lane.available ? 'Available' : 'Full'}
                          sx={{
                            height: 22,
                            fontSize: '0.5625rem',
                            fontWeight: 800,
                            bgcolor: lane.available ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            color: lane.available ? '#059669' : '#dc2626',
                          }}
                        />
                      </Stack>
                      {isDrop && (
                        <Typography
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            color: '#4338ca',
                            mt: 1.25,
                            textAlign: 'center',
                          }}
                        >
                          Drop to assign here
                        </Typography>
                      )}
                      {!lane.available && !isDrop && (
                        <Typography sx={{ fontSize: '0.625rem', color: '#dc2626', mt: 1, textAlign: 'center', fontWeight: 600 }}>
                          Lane at capacity
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
      </Collapse>
    </Paper>
  );
}
