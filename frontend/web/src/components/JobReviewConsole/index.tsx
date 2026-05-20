import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Grid,
  Chip,
  Alert,
} from '@mui/material';
import {
  ClipboardCheck,
  User,
  Building2,
  Clock,
  CheckCircle2,
  RotateCcw,
  MessageSquare,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export interface JobReviewRow {
  id: string;
  name: string;
  client: string;
  elapsedTime: string;
  progress: number;
  submittedBy?: string;
  submittedForReviewAt?: string;
  reviewNotes?: string;
  assignedToManager?: string;
  managerDisplayName?: string;
}

export interface JobReviewConsoleProps {
  jobs: JobReviewRow[];
  onApprove: (jobId: string) => void;
  onRequestChanges: (jobId: string) => void;
  isAdminView?: boolean;
}

const JobReviewConsole: React.FC<JobReviewConsoleProps> = ({
  jobs,
  onApprove,
  onRequestChanges,
  isAdminView = false,
}) => {
  const formatSubmittedAt = (iso?: string) => {
    if (!iso) return '—';
    try {
      return format(parseISO(iso), 'd MMM yyyy, h:mm a');
    } catch {
      return iso;
    }
  };

  return (
    <Box sx={{ bgcolor: 'rgba(248, 250, 252, 0.3)', py: 3, px: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: 1600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid #f1f5f9',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { md: 'center' },
            gap: 2,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', letterSpacing: '-0.02em' }}>
              Jobs to Review
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.25 }}>
              {isAdminView
                ? 'All work submitted for manager review across the team.'
                : 'Work submitted to you for approval. Review notes and approve or request changes.'}
            </Typography>
          </Box>
          <Chip
            label={`${jobs.length} pending`}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              bgcolor: jobs.length > 0 ? 'rgba(245, 158, 11, 0.1)' : '#f1f5f9',
              color: jobs.length > 0 ? '#d97706' : '#64748b',
              border: '1px solid',
              borderColor: jobs.length > 0 ? 'rgba(245, 158, 11, 0.25)' : '#e2e8f0',
            }}
          />
        </Paper>

        {jobs.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid #f1f5f9',
            }}
          >
            <ClipboardCheck size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#475569' }}>
              No jobs awaiting your review
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8', mt: 0.5 }}>
              When a team member submits work to you, it will appear here.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {jobs.map((job) => (
              <Paper
                key={job.id}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
                }}
              >
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid item xs={12} md={8}>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                          {job.name}
                        </Typography>
                        <Chip
                          label="Pending review"
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            bgcolor: 'rgba(245, 158, 11, 0.08)',
                            color: '#d97706',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                          }}
                        />
                      </Box>

                      <Stack direction="row" flexWrap="wrap" gap={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Building2 size={14} color="#94a3b8" />
                          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {job.client}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <User size={14} color="#94a3b8" />
                          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Submitted by {job.submittedBy || 'Team member'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Clock size={14} color="#94a3b8" />
                          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {job.elapsedTime} logged · {job.progress}% complete
                          </Typography>
                        </Box>
                      </Stack>

                      <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                        Submitted {formatSubmittedAt(job.submittedForReviewAt)}
                        {isAdminView && job.managerDisplayName && (
                          <> · Assigned to {job.managerDisplayName}</>
                        )}
                      </Typography>

                      {job.reviewNotes && (
                        <Alert
                          severity="info"
                          icon={<MessageSquare size={16} />}
                          sx={{
                            py: 0.5,
                            '& .MuiAlert-message': { fontSize: '0.8125rem' },
                          }}
                        >
                          <Typography variant="body2" component="span">
                            <strong>Notes from submitter:</strong> {job.reviewNotes}
                          </Typography>
                        </Alert>
                      )}
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Stack direction={{ xs: 'row', md: 'column' }} spacing={1} sx={{ height: '100%', justifyContent: 'flex-end' }}>
                      <Button
                        fullWidth
                        variant="contained"
                        disableElevation
                        startIcon={<CheckCircle2 size={16} />}
                        onClick={() => onApprove(job.id)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                          borderRadius: 2,
                          bgcolor: '#059669',
                          '&:hover': { bgcolor: '#047857' },
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<RotateCcw size={16} />}
                        onClick={() => onRequestChanges(job.id)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                          borderRadius: 2,
                          borderColor: '#e2e8f0',
                          color: '#475569',
                          '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
                        }}
                      >
                        Request changes
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default JobReviewConsole;
