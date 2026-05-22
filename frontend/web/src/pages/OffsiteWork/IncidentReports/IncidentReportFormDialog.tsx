import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Close, MyLocation } from '@mui/icons-material';
import { requestCurrentIncidentCoordinates } from '../incidentGeolocation';
import {
  INCIDENT_CATEGORY_LABELS,
  INCIDENT_SEVERITY_LABELS,
  type IncidentCategory,
  type IncidentSeverity,
} from '../incidentReportTypes';
import type { IncidentReportFormState } from '../incidentReportForm';
import type { SiteLocation } from '../types';
import { IncidentPhotoAttachments } from './IncidentPhotoAttachments';

function FormSection({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em' }}>
        {title}
      </Typography>
      {hint ? (
        <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.25, mb: 1 }}>{hint}</Typography>
      ) : (
        <Box sx={{ mb: 1 }} />
      )}
      {children}
    </Box>
  );
}

export interface IncidentReportFormDialogProps {
  open: boolean;
  onClose: () => void;
  sites: SiteLocation[];
  form: IncidentReportFormState;
  setForm: React.Dispatch<React.SetStateAction<IncidentReportFormState>>;
  onSubmit: () => void;
  submitDisabled: boolean;
  validationMessage?: string;
}

export function IncidentReportFormDialog({
  open,
  onClose,
  sites,
  form,
  setForm,
  onSubmit,
  submitDisabled,
  validationMessage,
}: IncidentReportFormDialogProps) {
  const patch = (partial: Partial<IncidentReportFormState>) => setForm((f) => ({ ...f, ...partial }));
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleCurrentLocation = async () => {
    setLocationError(null);
    setLocating(true);
    try {
      const coords = await requestCurrentIncidentCoordinates();
      patch({ gpsCoordinates: coords });
    } catch (err) {
      setLocationError(err instanceof Error ? err.message : 'Unable to get current location.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pb: 1 }}>
        <Box>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Report field incident
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', mt: 0.25 }}>
            Complete all sections. Your line manager is notified on submit.
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="Close">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: '#fafbfc' }}>
        <Stack spacing={2.5} sx={{ py: 0.5 }}>
          {validationMessage ? (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              {validationMessage}
            </Alert>
          ) : null}

          <FormSection title="OVERVIEW" hint="What happened and how serious is it?">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Incident title"
                  fullWidth
                  required
                  value={form.title}
                  onChange={(e) => patch({ title: e.target.value })}
                  placeholder="Brief summary, e.g. Scaffold guardrail gap"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date & time of incident"
                  type="datetime-local"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  value={form.incidentOccurredAtLocal}
                  onChange={(e) => patch({ incidentOccurredAtLocal: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    label="Category"
                    value={form.category}
                    onChange={(e) => patch({ category: e.target.value as IncidentCategory })}
                  >
                    {(Object.keys(INCIDENT_CATEGORY_LABELS) as IncidentCategory[]).map((c) => (
                      <MenuItem key={c} value={c}>
                        {INCIDENT_CATEGORY_LABELS[c]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    label="Severity"
                    value={form.severity}
                    onChange={(e) => patch({ severity: e.target.value as IncidentSeverity })}
                  >
                    {(Object.keys(INCIDENT_SEVERITY_LABELS) as IncidentSeverity[]).map((s) => (
                      <MenuItem key={s} value={s}>
                        {INCIDENT_SEVERITY_LABELS[s]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </FormSection>

          <Divider />

          <FormSection title="LOCATION" hint="Where on site did this occur?">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Site</InputLabel>
                  <Select label="Site" value={form.siteId} onChange={(e) => patch({ siteId: e.target.value })}>
                    <MenuItem value="">— None —</MenuItem>
                    {sites.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Location on site"
                  fullWidth
                  value={form.locationLabel}
                  onChange={(e) => patch({ locationLabel: e.target.value })}
                  placeholder="Building, level, grid reference"
                />
              </Grid>
              <Grid item xs={12}>
                {locationError ? (
                  <Alert severity="warning" sx={{ mb: 1, borderRadius: 2 }} onClose={() => setLocationError(null)}>
                    {locationError}
                  </Alert>
                ) : null}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'flex-start' }}>
                  <TextField
                    label="GPS / coordinates (optional)"
                    fullWidth
                    value={form.gpsCoordinates}
                    onChange={(e) => patch({ gpsCoordinates: e.target.value })}
                    placeholder="-26.204102, 28.047305 (±12m)"
                    helperText="Use current location or enter manually"
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => void handleCurrentLocation()}
                    disabled={locating}
                    startIcon={locating ? <CircularProgress size={16} color="inherit" /> : <MyLocation />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      minHeight: 56,
                      px: 2,
                      flexShrink: 0,
                    }}
                  >
                    {locating ? 'Locating…' : 'Current location'}
                  </Button>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Site conditions"
                  fullWidth
                  value={form.environmentalConditions}
                  onChange={(e) => patch({ environmentalConditions: e.target.value })}
                  placeholder="Weather, lighting, terrain"
                />
              </Grid>
            </Grid>
          </FormSection>

          <Divider />

          <FormSection title="PEOPLE & IMPACT">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="People involved"
                  fullWidth
                  multiline
                  minRows={2}
                  value={form.peopleInvolved}
                  onChange={(e) => patch({ peopleInvolved: e.target.value })}
                  placeholder="Names, roles, contractors"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Witnesses"
                  fullWidth
                  value={form.witnesses}
                  onChange={(e) => patch({ witnesses: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.injuriesReported}
                      onChange={(e) => patch({ injuriesReported: e.target.checked, injuryDetails: e.target.checked ? form.injuryDetails : '' })}
                    />
                  }
                  label="Injuries or harm reported"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Switch checked={form.workStopped} onChange={(e) => patch({ workStopped: e.target.checked })} />}
                  label="Work stopped in affected area"
                />
              </Grid>
              {form.injuriesReported ? (
                <Grid item xs={12}>
                  <TextField
                    label="Injury / harm details"
                    fullWidth
                    required
                    multiline
                    minRows={2}
                    value={form.injuryDetails}
                    onChange={(e) => patch({ injuryDetails: e.target.value })}
                    placeholder="Nature of injury, first aid, medical referral"
                  />
                </Grid>
              ) : null}
            </Grid>
          </FormSection>

          <Divider />

          <FormSection title="INCIDENT NARRATIVE" hint="Describe the event and what was done immediately.">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="What happened?"
                  fullWidth
                  required
                  multiline
                  minRows={3}
                  value={form.description}
                  onChange={(e) => patch({ description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Immediate actions taken"
                  fullWidth
                  required
                  multiline
                  minRows={2}
                  value={form.immediateActions}
                  onChange={(e) => patch({ immediateActions: e.target.value })}
                  placeholder="Cordoning, first aid, isolation, notifications"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Equipment / assets involved"
                  fullWidth
                  value={form.equipmentInvolved}
                  onChange={(e) => patch({ equipmentInvolved: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contributing factors"
                  fullWidth
                  value={form.contributingFactors}
                  onChange={(e) => patch({ contributingFactors: e.target.value })}
                  placeholder="Root cause hints, near-miss factors"
                />
              </Grid>
            </Grid>
          </FormSection>

          <Divider />

          <FormSection title="PHOTO EVIDENCE" hint="Attach site photos of the incident scene, damage, or hazards.">
            <IncidentPhotoAttachments
              photos={form.photos}
              onChange={(photos) => patch({ photos })}
            />
          </FormSection>

          <Divider />

          <FormSection title="ESCALATION & FOLLOW-UP">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.authoritiesNotified}
                      onChange={(e) =>
                        patch({
                          authoritiesNotified: e.target.checked,
                          authorityReference: e.target.checked ? form.authorityReference : '',
                        })
                      }
                    />
                  }
                  label="Authorities / regulator notified"
                />
              </Grid>
              {form.authoritiesNotified ? (
                <Grid item xs={12}>
                  <TextField
                    label="Authority / case reference"
                    fullWidth
                    required
                    value={form.authorityReference}
                    onChange={(e) => patch({ authorityReference: e.target.value })}
                  />
                </Grid>
              ) : null}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch checked={form.followUpRequired} onChange={(e) => patch({ followUpRequired: e.target.checked })} />
                  }
                  label="Follow-up action required"
                />
              </Grid>
              {form.followUpRequired ? (
                <Grid item xs={12}>
                  <TextField
                    label="Follow-up notes"
                    fullWidth
                    multiline
                    minRows={2}
                    value={form.followUpNotes}
                    onChange={(e) => patch({ followUpNotes: e.target.value })}
                    placeholder="Inspections, repairs, investigations"
                  />
                </Grid>
              ) : null}
            </Grid>
          </FormSection>

          <Divider />

          <FormSection title="REPORTER">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Your contact number (optional)"
                  fullWidth
                  value={form.reporterContact}
                  onChange={(e) => patch({ reporterContact: e.target.value })}
                  placeholder="For urgent follow-up on site"
                />
              </Grid>
            </Grid>
          </FormSection>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 1.5, bgcolor: '#fff' }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={submitDisabled} sx={{ textTransform: 'none', fontWeight: 700 }}>
          Submit report
        </Button>
      </DialogActions>
    </Dialog>
  );
}
