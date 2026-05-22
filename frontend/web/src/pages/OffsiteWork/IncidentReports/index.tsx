import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import { Add, Close, FilterList, PhotoCamera } from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import FeatureGuard from '../../../components/FeatureGuard';
import { OffsiteWorkSubNav } from '../OffsiteWorkSubNav';
import {
  fieldHeaderSx,
  fieldInnerSx,
  fieldMetricGridSx,
  fieldPageContentSx,
  fieldPremiumShellSx,
  fieldShellSx,
  fieldSubtitleSx,
  fieldTitleSx,
} from '../fieldOpsStyles';
import {
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS,
  type FieldIncidentReport,
  type IncidentStatus,
} from '../incidentReportTypes';
import { saveIncidentReports, seedIncidentReportsIfEmpty } from '../incidentReportStorage';
import {
  buildIncidentReportFromForm,
  defaultIncidentFormState,
  validateIncidentForm,
  type IncidentReportFormState,
} from '../incidentReportForm';
import { IncidentReportFormDialog } from './IncidentReportFormDialog';
import { IncidentPhotoGallery } from './IncidentPhotoAttachments';
import { IncidentReportExportMenu } from './IncidentReportExportMenu';
import type { IncidentExportFormat } from '../incidentReportExport';
import { incidentCoordinatesMapUrl } from '../incidentGeolocation';
import { resolveBriefedByForFieldSubmission } from '../offsiteAssignments';
import type { Employee } from '../../../contexts/EmployeeContext';
import type { ReviewUserRef } from '../../../utils/managerReview';
import { useAppSelector } from '../../../store';
import { useEmployees } from '../../../contexts/EmployeeContext';
import { useNotifications, createNotification } from '../../../contexts/NotificationContext';
import { getAuthUserLabel, getManagerRecipientId } from '../../../utils/managerReview';
import { notifyJobSubmittedToBriefedBy } from '../../../utils/jobLineManager';
import type { SiteLocation } from '../types';

const SEVERITY_COLOR: Record<FieldIncidentReport['severity'], string> = {
  low: '#64748b',
  medium: '#0ea5e9',
  high: '#f59e0b',
  critical: '#ef4444',
};

const STATUS_COLOR: Record<IncidentStatus, 'default' | 'warning' | 'success' | 'info'> = {
  open: 'warning',
  investigating: 'info',
  resolved: 'success',
  closed: 'default',
};

function MetricTile({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.25,
        borderRadius: 2,
        border: '1px solid #e8edf4',
        bgcolor: '#fff',
        position: 'relative',
        overflow: 'hidden',
        '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 2, bgcolor: accent },
      }}
    >
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8' }}>{label}</Typography>
      <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', mt: 0.25 }}>{value}</Typography>
    </Paper>
  );
}

const IncidentReportsPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const { employees } = useEmployees();
  const { addNotification, addNotificationForRecipient } = useNotifications();
  const [reports, setReports] = useState<FieldIncidentReport[]>(() => seedIncidentReportsIfEmpty());
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailReport, setDetailReport] = useState<FieldIncidentReport | null>(null);
  const [sites, setSites] = useState<SiteLocation[]>([]);

  const [form, setForm] = useState<IncidentReportFormState>(defaultIncidentFormState);
  const [formValidationMessage, setFormValidationMessage] = useState<string | undefined>();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('offsiteWorkLocations');
      if (raw) setSites(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const metrics = useMemo(() => {
    const open = reports.filter((r) => r.status === 'open').length;
    const investigating = reports.filter((r) => r.status === 'investigating').length;
    const critical = reports.filter((r) => r.severity === 'critical' && r.status !== 'closed').length;
    const resolved = reports.filter((r) => r.status === 'resolved' || r.status === 'closed').length;
    return { open, investigating, critical, resolved };
  }, [reports]);

  const filtered = useMemo(() => {
    const list = [...reports].sort(
      (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    );
    if (statusFilter === 'all') return list;
    return list.filter((r) => r.status === statusFilter);
  }, [reports, statusFilter]);

  const persist = (next: FieldIncidentReport[]) => {
    setReports(next);
    saveIncidentReports(next);
  };

  const handleSubmit = () => {
    const validation = validateIncidentForm(form);
    if (!validation.valid) {
      setFormValidationMessage(validation.message);
      return;
    }
    setFormValidationMessage(undefined);

    const site = sites.find((s) => s.id === form.siteId);
    const submitterName = getAuthUserLabel(user ?? undefined);
    const report = buildIncidentReportFromForm(form, {
      siteId: form.siteId || undefined,
      siteName: site?.name,
      reportedById: user ? getManagerRecipientId(user) : undefined,
      reportedByName: submitterName,
    });

    persist([report, ...reports]);

    const briefedBy = resolveBriefedByForFieldSubmission(employees, user ?? undefined, form.siteId);
    notifyJobSubmittedToBriefedBy({
      briefedBy,
      submitterEmail: user?.email,
      employees,
      notification: {
        ...createNotification.system(
          'Field incident reported',
          `${submitterName} filed "${report.title}" (${INCIDENT_SEVERITY_LABELS[report.severity]}${report.photos?.length ? `, ${report.photos.length} photo(s)` : ''}). Review in Incident Reports.`,
          report.severity === 'critical' ? 'urgent' : 'high'
        ),
        actionUrl: '/offsite-work/incidents',
      },
      addNotificationForRecipient,
      addNotification,
    });

    addNotification(
      createNotification.system(
        'Incident logged',
        `"${report.title}" submitted to your line manager.`,
        'medium'
      )
    );

    setForm(defaultIncidentFormState());
    setDialogOpen(false);
  };

  const openReportDialog = () => {
    setForm(defaultIncidentFormState());
    setFormValidationMessage(undefined);
    setDialogOpen(true);
  };

  const updateStatus = (id: string, status: IncidentStatus) => {
    const updatedAt = new Date().toISOString();
    const next = reports.map((r) => (r.id === id ? { ...r, status, updatedAt } : r));
    persist(next);
    if (detailReport?.id === id) {
      const updated = next.find((r) => r.id === id);
      if (updated) setDetailReport(updated);
    }
  };

  const openDetail = (report: FieldIncidentReport) => {
    setDetailReport(reports.find((r) => r.id === report.id) ?? report);
  };

  return (
    <DashboardLayout>
      <FeatureGuard feature="offsiteWork">
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2196f3 0%, #e91e63 100%)',
            pt: { xs: 4, md: 6 },
            pb: { xs: 3, md: 4 },
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ color: 'white', mb: 2 }}>
              <Typography variant="h2" component="h1" sx={{ fontWeight: 600, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                Incident reports
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, mt: 0.75, maxWidth: 560 }}>
                Log, track, and escalate field safety and operational incidents
              </Typography>
            </Box>
            <OffsiteWorkSubNav />
          </Container>
        </Box>

        <Container maxWidth="xl" disableGutters sx={{ ...fieldPageContentSx }}>
          <Box sx={fieldInnerSx}>
            <Box sx={{ ...fieldMetricGridSx }}>
              <MetricTile label="Open" value={metrics.open} accent="#f59e0b" />
              <MetricTile label="Investigating" value={metrics.investigating} accent="#0ea5e9" />
              <MetricTile label="Critical active" value={metrics.critical} accent="#ef4444" />
              <MetricTile label="Resolved" value={metrics.resolved} accent="#10b981" />
            </Box>

            <Paper elevation={0} sx={{ ...fieldPremiumShellSx, p: 1.25 }}>
              <Box sx={{ ...fieldHeaderSx, flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  spacing={1}
                >
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <ShieldAlert size={18} color="#ef4444" />
                    <Box>
                      <Typography sx={fieldTitleSx}>Incident register</Typography>
                      <Typography sx={fieldSubtitleSx}>
                        {filtered.length} record{filtered.length !== 1 ? 's' : ''} · routed to line managers
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    variant="contained"
                    disableElevation
                    startIcon={<Add />}
                    onClick={openReportDialog}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: 2,
                      py: 0.85,
                      bgcolor: '#0f172a',
                      flexShrink: 0,
                      alignSelf: { xs: 'stretch', sm: 'center' },
                    }}
                  >
                    Report incident
                  </Button>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
                  <FilterList sx={{ fontSize: 18, color: '#94a3b8' }} />
                  {(['all', 'open', 'investigating', 'resolved', 'closed'] as const).map((s) => (
                    <Chip
                      key={s}
                      size="small"
                      label={s === 'all' ? 'All' : INCIDENT_STATUS_LABELS[s]}
                      onClick={() => setStatusFilter(s)}
                      variant={statusFilter === s ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 700, fontSize: '0.6875rem' }}
                    />
                  ))}
                </Stack>
              </Box>

              <Stack spacing={1} sx={{ p: 1.25, pt: 0 }}>
                {filtered.length === 0 ? (
                  <Paper elevation={0} sx={{ ...fieldShellSx, p: 3, textAlign: 'center' }}>
                    <AlertTriangle size={32} color="#94a3b8" style={{ margin: '0 auto' }} />
                    <Typography sx={{ mt: 1, fontWeight: 600, color: '#64748b' }}>No incidents match this filter</Typography>
                  </Paper>
                ) : (
                  filtered.map((report) => (
                    <IncidentRegisterCard
                      key={report.id}
                      report={report}
                      onOpen={() => openDetail(report)}
                      onStatusChange={(status) => updateStatus(report.id, status)}
                      suggestedRecipientEmail={
                        resolveBriefedByForFieldSubmission(employees, user ?? undefined, report.siteId)?.email
                      }
                      onExportNotify={(format) => {
                        const labels: Record<IncidentExportFormat, string> = {
                          excel: 'Excel file downloaded.',
                          pdf: 'PDF report downloaded.',
                          email: 'Email draft opened in your mail client.',
                        };
                        addNotification(
                          createNotification.system('Incident exported', labels[format], 'medium')
                        );
                      }}
                      onExportError={(message) =>
                        addNotification(createNotification.system('Export failed', message, 'high'))
                      }
                    />
                  ))
                )}
              </Stack>
            </Paper>
          </Box>
        </Container>

        <IncidentDetailDialog
          report={detailReport}
          open={Boolean(detailReport)}
          onClose={() => setDetailReport(null)}
          onStatusChange={(status) => {
            if (detailReport) updateStatus(detailReport.id, status);
          }}
          employees={employees}
          user={user ?? undefined}
          onExportNotify={(format) => {
            const labels: Record<IncidentExportFormat, string> = {
              excel: 'Excel file downloaded.',
              pdf: 'PDF report downloaded.',
              email: 'Email draft opened in your mail client.',
            };
            addNotification(
              createNotification.system('Incident exported', labels[format], 'medium')
            );
          }}
          onExportError={(message) =>
            addNotification(createNotification.system('Export failed', message, 'high'))
          }
        />

        <IncidentReportFormDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          sites={sites}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          submitDisabled={!form.title.trim() || !form.description.trim() || !form.immediateActions.trim()}
          validationMessage={formValidationMessage}
        />
      </FeatureGuard>
    </DashboardLayout>
  );
};

function IncidentRegisterCard({
  report,
  onOpen,
  onStatusChange,
  suggestedRecipientEmail,
  onExportNotify,
  onExportError,
}: {
  report: FieldIncidentReport;
  onOpen: () => void;
  onStatusChange: (status: IncidentStatus) => void;
  suggestedRecipientEmail?: string;
  onExportNotify?: (format: IncidentExportFormat) => void;
  onExportError?: (message: string) => void;
}) {
  const preview =
    report.description.length > 140 ? `${report.description.slice(0, 140)}…` : report.description;

  return (
    <Paper
      elevation={0}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      sx={{
        p: 1.25,
        borderRadius: 2,
        border: '1px solid #e8edf4',
        borderLeft: `3px solid ${SEVERITY_COLOR[report.severity]}`,
        bgcolor: '#fff',
        cursor: 'pointer',
        transition: 'border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease',
        '&:hover': {
          borderColor: alpha(SEVERITY_COLOR[report.severity], 0.45),
          boxShadow: `0 4px 16px ${alpha(SEVERITY_COLOR[report.severity], 0.12)}`,
          bgcolor: '#fafbfc',
        },
        '&:focus-visible': {
          outline: `2px solid ${SEVERITY_COLOR[report.severity]}`,
          outlineOffset: 2,
        },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap alignItems="center">
            <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
              {report.title}
            </Typography>
            <Chip
              size="small"
              label={INCIDENT_SEVERITY_LABELS[report.severity]}
              sx={{
                height: 20,
                fontWeight: 700,
                fontSize: '0.625rem',
                bgcolor: alpha(SEVERITY_COLOR[report.severity], 0.12),
                color: SEVERITY_COLOR[report.severity],
              }}
            />
            <Chip size="small" label={INCIDENT_CATEGORY_LABELS[report.category]} sx={{ height: 20, fontSize: '0.625rem' }} />
            {(report.photos?.length ?? 0) > 0 ? (
              <Chip
                size="small"
                icon={<PhotoCamera sx={{ fontSize: '14px !important' }} />}
                label={String(report.photos!.length)}
                sx={{ height: 20, fontSize: '0.625rem', fontWeight: 700 }}
              />
            ) : null}
          </Stack>
          <Typography
            sx={{
              fontSize: '0.8125rem',
              color: '#64748b',
              mt: 0.5,
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {preview}
          </Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', mt: 0.5 }}>
            {report.referenceNumber ? `${report.referenceNumber} · ` : ''}
            {report.siteName ?? 'No site'} · {report.reportedByName} ·{' '}
            {formatDistanceToNow(new Date(report.reportedAt), { addSuffix: true })} · Tap for details
          </Typography>
        </Box>
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          flexShrink={0}
          onClick={(e) => e.stopPropagation()}
        >
          <IncidentReportExportMenu
            report={report}
            suggestedRecipientEmail={suggestedRecipientEmail}
            onExported={onExportNotify}
            onError={onExportError}
            compact
          />
          <Chip size="small" color={STATUS_COLOR[report.status]} label={INCIDENT_STATUS_LABELS[report.status]} sx={{ fontWeight: 700 }} />
          {report.status !== 'closed' && (
            <FormControl size="small" sx={{ minWidth: 130 }} onClick={(e) => e.stopPropagation()}>
              <Select
                value={report.status}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.stopPropagation();
                  onStatusChange(e.target.value as IncidentStatus);
                }}
                sx={{ fontSize: '0.75rem', fontWeight: 600 }}
              >
                {(['open', 'investigating', 'resolved', 'closed'] as IncidentStatus[]).map((s) => (
                  <MenuItem key={s} value={s}>
                    {INCIDENT_STATUS_LABELS[s]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box>
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.04em' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', mt: 0.25, lineHeight: 1.45 }}>
        {value}
      </Typography>
    </Box>
  );
}

function yesNo(value: boolean | undefined): string {
  if (value === undefined) return '—';
  return value ? 'Yes' : 'No';
}

function NarrativeBlock({ title, body }: { title: string; body: string }) {
  return (
    <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e8edf4' }}>
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', mb: 0.75 }}>{title}</Typography>
      <Typography sx={{ fontSize: '0.9375rem', color: '#334155', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
        {body}
      </Typography>
    </Box>
  );
}

function IncidentDetailDialog({
  report,
  open,
  onClose,
  onStatusChange,
  employees,
  user,
  onExportNotify,
  onExportError,
}: {
  report: FieldIncidentReport | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (status: IncidentStatus) => void;
  employees: Employee[];
  user?: ReviewUserRef;
  onExportNotify?: (format: IncidentExportFormat) => void;
  onExportError?: (message: string) => void;
}) {
  if (!report) return null;

  const briefedBy = resolveBriefedByForFieldSubmission(employees, user, report.siteId);
  const lineManagerEmail = briefedBy?.email?.trim();
  const mapUrl = incidentCoordinatesMapUrl(report.gpsCoordinates);

  const occurredDate = report.incidentOccurredAt
    ? format(new Date(report.incidentOccurredAt), 'PPpp')
    : '—';
  const reportedDate = format(new Date(report.reportedAt), 'PPpp');
  const updatedDate = format(new Date(report.updatedAt), 'PPpp');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box sx={{ minWidth: 0, pr: 1 }}>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {report.title}
            </Typography>
            {report.referenceNumber ? (
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', mt: 0.25 }}>
                Ref {report.referenceNumber}
              </Typography>
            ) : null}
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
              <Chip
                size="small"
                label={INCIDENT_SEVERITY_LABELS[report.severity]}
                sx={{
                  fontWeight: 700,
                  bgcolor: alpha(SEVERITY_COLOR[report.severity], 0.12),
                  color: SEVERITY_COLOR[report.severity],
                }}
              />
              <Chip size="small" label={INCIDENT_CATEGORY_LABELS[report.category]} sx={{ fontWeight: 700 }} />
              <Chip size="small" color={STATUS_COLOR[report.status]} label={INCIDENT_STATUS_LABELS[report.status]} sx={{ fontWeight: 700 }} />
              {report.injuriesReported ? (
                <Chip size="small" label="Injuries" color="error" sx={{ fontWeight: 700 }} />
              ) : null}
              {report.workStopped ? (
                <Chip size="small" label="Work stopped" color="warning" sx={{ fontWeight: 700 }} />
              ) : null}
            </Stack>
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="Close">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <NarrativeBlock title="WHAT HAPPENED" body={report.description} />
          {report.immediateActions ? (
            <NarrativeBlock title="IMMEDIATE ACTIONS" body={report.immediateActions} />
          ) : null}
          {report.photos && report.photos.length > 0 ? (
            <IncidentPhotoGallery photos={report.photos} />
          ) : null}

          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em' }}>
            LOCATION & TIMING
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DetailRow label="Site" value={report.siteName ?? '—'} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailRow label="Location on site" value={report.locationLabel ?? '—'} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailRow
                label="GPS / coordinates"
                value={
                  report.gpsCoordinates ? (
                    mapUrl ? (
                      <Box
                        component="a"
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: '#6366f1', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {report.gpsCoordinates}
                      </Box>
                    ) : (
                      report.gpsCoordinates
                    )
                  ) : (
                    '—'
                  )
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailRow label="Site conditions" value={report.environmentalConditions ?? '—'} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailRow label="Incident occurred" value={occurredDate} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailRow label="Report filed" value={reportedDate} />
            </Grid>
          </Grid>

          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em' }}>
            PEOPLE & IMPACT
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DetailRow label="People involved" value={report.peopleInvolved ?? '—'} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailRow label="Witnesses" value={report.witnesses ?? '—'} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailRow label="Injuries reported" value={yesNo(report.injuriesReported)} />
            </Grid>
            {report.injuriesReported && report.injuryDetails ? (
              <Grid item xs={12}>
                <DetailRow label="Injury details" value={report.injuryDetails} />
              </Grid>
            ) : null}
            <Grid item xs={12} sm={6}>
              <DetailRow label="Work stopped" value={yesNo(report.workStopped)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailRow label="Equipment involved" value={report.equipmentInvolved ?? '—'} />
            </Grid>
            {report.contributingFactors ? (
              <Grid item xs={12}>
                <DetailRow label="Contributing factors" value={report.contributingFactors} />
              </Grid>
            ) : null}
          </Grid>

          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em' }}>
            ESCALATION & FOLLOW-UP
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DetailRow label="Authorities notified" value={yesNo(report.authoritiesNotified)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailRow label="Authority reference" value={report.authorityReference ?? '—'} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailRow label="Follow-up required" value={yesNo(report.followUpRequired)} />
            </Grid>
            {report.followUpNotes ? (
              <Grid item xs={12}>
                <DetailRow label="Follow-up notes" value={report.followUpNotes} />
              </Grid>
            ) : null}
          </Grid>

          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em' }}>
            REPORTER
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DetailRow label="Reported by" value={report.reportedByName} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailRow label="Contact" value={report.reporterContact ?? '—'} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailRow label="Last updated" value={updatedDate} />
            </Grid>
          </Grid>

          {report.status !== 'closed' && (
            <FormControl fullWidth size="small">
              <InputLabel>Update status</InputLabel>
              <Select
                label="Update status"
                value={report.status}
                onChange={(e) => onStatusChange(e.target.value as IncidentStatus)}
              >
                {(['open', 'investigating', 'resolved', 'closed'] as IncidentStatus[]).map((s) => (
                  <MenuItem key={s} value={s}>
                    {INCIDENT_STATUS_LABELS[s]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 1.5, justifyContent: 'space-between' }}>
        <IncidentReportExportMenu
          report={report}
          suggestedRecipientEmail={lineManagerEmail}
          onExported={onExportNotify}
          onError={onExportError}
        />
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default IncidentReportsPage;
