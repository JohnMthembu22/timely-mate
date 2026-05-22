import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  Chip,
  alpha,
} from '@mui/material';
import {
  Camera,
  MapPin,
  Package,
  ClipboardCheck,
  AlertTriangle,
  LocateFixed,
} from 'lucide-react';
import { useAppSelector } from '../../store';
import { FieldPhotoCapture } from './FieldPhotoCapture';
import { SignaturePad } from './SignaturePad';
import type { SiteLocation } from './types';
import type { MobileToolSubmitPayload, MobileWorkforceTool } from './mobileWorkforceTypes';

const TOOL_META: Record<
  MobileWorkforceTool,
  { title: string; subtitle: string; color: string; icon: React.ElementType }
> = {
  photo: {
    title: 'Photo capture',
    subtitle: 'Your device camera starts automatically · tied to your registered session',
    color: '#6366f1',
    icon: Camera,
  },
  gps: {
    title: 'GPS check-in',
    subtitle: 'Verify crew arrival with live coordinates and site geofence',
    color: '#0ea5e9',
    icon: MapPin,
  },
  logistics: {
    title: 'Logistics proof of delivery',
    subtitle: 'Record delivery receipt, quantities, and recipient sign-off',
    color: '#8b5cf6',
    icon: Package,
  },
  inspection: {
    title: 'Field inspection',
    subtitle: 'Complete safety and quality checklist before sign-off',
    color: '#f59e0b',
    icon: ClipboardCheck,
  },
  escalate: {
    title: 'Escalate to operations',
    subtitle: 'Flag blockers, safety issues, or SLA risks to mission control',
    color: '#ef4444',
    icon: AlertTriangle,
  },
};

export interface MobileWorkforceToolDialogProps {
  tool: MobileWorkforceTool | null;
  open: boolean;
  onClose: () => void;
  locations: SiteLocation[];
  offlineMode: boolean;
  onSubmit: (payload: MobileToolSubmitPayload) => void;
}

export function MobileWorkforceToolDialog({
  tool,
  open,
  onClose,
  locations,
  offlineMode,
  onSubmit,
}: MobileWorkforceToolDialogProps) {
  const [siteId, setSiteId] = useState('');
  const [notes, setNotes] = useState('');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [recipient, setRecipient] = useState('');
  const [itemCount, setItemCount] = useState('1');
  const [priority, setPriority] = useState<'medium' | 'high' | 'urgent'>('medium');
  const [category, setCategory] = useState('safety');
  const [checks, setChecks] = useState({
    ppe: false,
    perimeter: false,
    tools: false,
    signage: false,
  });
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [fieldLocationLabel, setFieldLocationLabel] = useState('');

  const authUser = useAppSelector((state) => state.auth.user);
  const registeredUserId = String(authUser?.id ?? 'unknown');
  const registeredUserName =
    authUser?.fullName ?? authUser?.name ?? authUser?.email ?? 'Registered user';

  const meta = tool ? TOOL_META[tool] : null;
  const Icon = meta?.icon ?? Camera;

  useEffect(() => {
    if (!open) return;
    setSiteId('');
    setNotes('');
    setGpsCoords(null);
    setGpsError(null);
    setRecipient('');
    setItemCount('1');
    setPriority('medium');
    setCategory('safety');
    setChecks({ ppe: false, perimeter: false, tools: false, signage: false });
    setPhotoDataUrl(null);
    setSignatureDataUrl(null);
    setHasSignature(false);
    setFieldLocationLabel('');
  }, [open, tool]);

  useEffect(() => {
    if (open && tool === 'gps' && !gpsCoords && !gpsLoading) {
      captureGps();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when GPS tool opens
  }, [open, tool]);

  const captureGps = () => {
    setGpsLoading(true);
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported on this device.');
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        setGpsError('Unable to acquire GPS fix. Enable location permissions and retry.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const selectedSite = locations.find((l) => l.id === siteId);

  const handleSubmit = () => {
    if (!tool) return;

    if (tool === 'gps' && !gpsCoords) {
      setGpsError('GPS fix required before check-in.');
      return;
    }

    if (tool === 'logistics') {
      if (!recipient.trim()) {
        alert('Enter recipient name for proof of delivery.');
        return;
      }
      if (!hasSignature || !signatureDataUrl) {
        alert('Recipient signature is required. Draw in the signature pad.');
        return;
      }
    }

    if (tool === 'inspection') {
      const done = Object.values(checks).filter(Boolean).length;
      if (done < 2) {
        alert('Complete at least two inspection items before submitting.');
        return;
      }
    }

    if (tool === 'escalate' && !notes.trim()) {
      alert('Describe the issue to escalate.');
      return;
    }

    if (tool === 'photo' && !photoDataUrl) {
      alert('Take a photo with your device camera before saving.');
      return;
    }

    let summary = '';
    switch (tool) {
      case 'photo':
        summary = notes.trim()
          ? `Photo by ${registeredUserName}: ${notes.trim()}`
          : `Site photo captured by ${registeredUserName}`;
        break;
      case 'gps':
        summary = `Check-in at ${gpsCoords!.lat.toFixed(4)}, ${gpsCoords!.lng.toFixed(4)}`;
        break;
      case 'logistics':
        summary = `POD · ${recipient} · ${itemCount} item(s) · signed`;
        break;
      case 'inspection':
        summary = `Inspection passed · ${Object.values(checks).filter(Boolean).length}/4 checks`;
        break;
      case 'escalate':
        summary = `${priority.toUpperCase()} · ${category}: ${notes.trim()}`;
        break;
    }

    const resolvedSiteName =
      selectedSite?.name ?? (fieldLocationLabel.trim() || undefined);

    onSubmit({
      tool,
      siteId: siteId || undefined,
      siteName: resolvedSiteName,
      fieldLocationLabel: fieldLocationLabel.trim() || undefined,
      summary,
      ...(tool === 'photo' && {
        photoDataUrl: photoDataUrl ?? undefined,
        capturedByUserId: registeredUserId,
        capturedByName: registeredUserName,
      }),
      ...(tool === 'logistics' && {
        signatureDataUrl: signatureDataUrl ?? undefined,
        capturedByUserId: registeredUserId,
        capturedByName: registeredUserName,
      }),
    });
    onClose();
  };

  if (!tool || !meta) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
      <DialogTitle
        sx={{
          pt: { xs: 2.5, sm: 3 },
          pb: { xs: 2, sm: 2.5 },
          px: { xs: 2.5, sm: 3 },
          bgcolor: alpha(meta.color, 0.06),
          borderBottom: `1px solid ${alpha(meta.color, 0.15)}`,
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: alpha(meta.color, 0.12),
              border: `1px solid ${alpha(meta.color, 0.25)}`,
              display: 'flex',
            }}
          >
            <Icon size={22} color={meta.color} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>
              {meta.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {meta.subtitle}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          px: { xs: 2.5, sm: 3 },
          pt: '0 !important',
          pb: 0,
          overflow: 'visible',
        }}
      >
        <Box sx={{ pt: { xs: 2.5, sm: 3 }, pb: { xs: 2, sm: 2.5 } }}>
        {offlineMode && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2, fontSize: '0.8125rem' }}>
            Offline mode — submission will queue until connectivity returns.
          </Alert>
        )}

        {tool && tool !== 'escalate' && (
          locations.length > 0 ? (
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Site (optional)</InputLabel>
              <Select label="Site (optional)" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
                <MenuItem value="">
                  <em>General field operations</em>
                </MenuItem>
                {locations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              label="Location / site label (optional)"
              fullWidth
              size="small"
              value={fieldLocationLabel}
              onChange={(e) => setFieldLocationLabel(e.target.value)}
              placeholder="e.g. Warehouse 4 · Bay 12"
              sx={{ mb: 2 }}
            />
          )
        )}

        {tool === 'photo' && (
          <Stack spacing={2}>
            <FieldPhotoCapture
              active={open && tool === 'photo'}
              userId={registeredUserId}
              userName={registeredUserName}
              accentColor={meta.color}
              onCapture={(dataUrl) => setPhotoDataUrl(dataUrl || null)}
              onClear={() => setPhotoDataUrl(null)}
            />
            {photoDataUrl && (
              <Chip
                size="small"
                label="Photo ready — tap Save photo below"
                sx={{
                  alignSelf: 'flex-start',
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  bgcolor: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                }}
              />
            )}
            <TextField
              label="Caption / notes"
              fullWidth
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Rack install complete · bay 3"
            />
          </Stack>
        )}

        {tool === 'gps' && (
          <Stack spacing={2}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f0f9ff', border: '1px solid #bae6fd' }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <LocateFixed size={18} color="#0284c7" />
                <Typography variant="subtitle2" fontWeight={700}>
                  Live GPS fix
                </Typography>
                {gpsCoords && <Chip size="small" label="Locked" color="success" sx={{ height: 20, fontWeight: 700 }} />}
              </Stack>
              {gpsLoading && (
                <Typography variant="body2" color="text.secondary">
                  Acquiring satellite fix…
                </Typography>
              )}
              {gpsError && (
                <Alert severity="error" sx={{ mt: 1, borderRadius: 1.5 }}>
                  {gpsError}
                </Alert>
              )}
              {gpsCoords && (
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {gpsCoords.lat.toFixed(6)}, {gpsCoords.lng.toFixed(6)}
                </Typography>
              )}
            </Box>
            <Button variant="outlined" startIcon={<LocateFixed size={16} />} onClick={captureGps} disabled={gpsLoading} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Refresh GPS
            </Button>
            <TextField label="Check-in note (optional)" fullWidth value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Crew arrived · gate code verified" />
          </Stack>
        )}

        {tool === 'logistics' && (
          <Stack spacing={2}>
            <TextField label="Recipient name" fullWidth required value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            <TextField label="Items delivered" type="number" fullWidth value={itemCount} onChange={(e) => setItemCount(e.target.value)} inputProps={{ min: 1 }} />
            <SignaturePad
              accentColor={meta.color}
              onChange={(dataUrl, signed) => {
                setSignatureDataUrl(dataUrl);
                setHasSignature(signed);
              }}
            />
            <TextField label="Delivery notes" fullWidth multiline rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Stack>
        )}

        {tool === 'inspection' && (
          <Stack spacing={1}>
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={checks.ppe} onChange={(e) => setChecks((c) => ({ ...c, ppe: e.target.checked }))} />} label="PPE compliance verified" />
              <FormControlLabel control={<Checkbox checked={checks.perimeter} onChange={(e) => setChecks((c) => ({ ...c, perimeter: e.target.checked }))} />} label="Perimeter & access secure" />
              <FormControlLabel control={<Checkbox checked={checks.tools} onChange={(e) => setChecks((c) => ({ ...c, tools: e.target.checked }))} />} label="Tools & equipment accounted" />
              <FormControlLabel control={<Checkbox checked={checks.signage} onChange={(e) => setChecks((c) => ({ ...c, signage: e.target.checked }))} />} label="Safety signage in place" />
            </FormGroup>
            <TextField label="Inspector notes" fullWidth multiline rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} sx={{ mt: 1 }} />
          </Stack>
        )}

        {tool === 'escalate' && (
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <MenuItem value="safety">Safety</MenuItem>
                <MenuItem value="logistics">Logistics delay</MenuItem>
                <MenuItem value="workforce">Workforce</MenuItem>
                <MenuItem value="equipment">Equipment failure</MenuItem>
                <MenuItem value="sla">SLA risk</MenuItem>
              </Select>
            </FormControl>
            {locations.length > 0 && (
              <FormControl fullWidth size="small">
                <InputLabel>Related site (optional)</InputLabel>
                <Select label="Related site (optional)" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
                  <MenuItem value="">None</MenuItem>
                  {locations.map((loc) => (
                    <MenuItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField label="Describe the issue" fullWidth required multiline rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What is blocked and what support is needed?" />
          </Stack>
        )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2.5, sm: 3 }, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            (tool === 'photo' && !photoDataUrl) ||
            (tool === 'logistics' && (!hasSignature || !recipient.trim())) ||
            (tool === 'gps' && !gpsCoords) ||
            (tool === 'inspection' && Object.values(checks).filter(Boolean).length < 2) ||
            (tool === 'escalate' && !notes.trim())
          }
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            bgcolor: meta.color,
            opacity: 1,
            '&:hover': { bgcolor: meta.color, filter: 'brightness(0.92)' },
            '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
          }}
        >
          {tool === 'photo' ? 'Save photo' : tool === 'gps' ? 'Confirm check-in' : tool === 'logistics' ? 'Submit POD' : tool === 'inspection' ? 'Submit inspection' : 'Send escalation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
