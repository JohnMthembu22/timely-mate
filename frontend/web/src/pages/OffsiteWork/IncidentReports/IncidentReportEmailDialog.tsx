import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { Email } from '@mui/icons-material';
import type { FieldIncidentReport } from '../incidentReportTypes';
import { openIncidentReportEmail } from '../incidentReportExport';

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export interface IncidentReportEmailDialogProps {
  open: boolean;
  report: FieldIncidentReport | null;
  suggestedEmail?: string;
  onClose: () => void;
  onSent?: () => void;
  onError?: (message: string) => void;
}

export function IncidentReportEmailDialog({
  open,
  report,
  suggestedEmail,
  onClose,
  onSent,
  onError,
}: IncidentReportEmailDialogProps) {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail(suggestedEmail?.trim() ?? '');
      setTouched(false);
    }
  }, [open, suggestedEmail]);

  if (!report) return null;

  const trimmed = email.trim();
  const invalid = touched && (!trimmed || !isValidEmail(trimmed));

  const handleSend = () => {
    setTouched(true);
    if (!trimmed || !isValidEmail(trimmed)) {
      onError?.('Enter a valid email address.');
      return;
    }
    try {
      openIncidentReportEmail(report, { to: trimmed });
      onSent?.();
      onClose();
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Could not open email.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography sx={{ fontSize: '1.0625rem', fontWeight: 800, color: '#0f172a' }}>Send incident report</Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', mt: 0.5, fontWeight: 500 }}>
          Opens your email app with the report prefilled for {report.referenceNumber ?? report.id}.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Recipient email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          error={invalid}
          helperText={invalid ? 'Enter a valid email address' : suggestedEmail ? 'Line manager suggested — edit if needed' : undefined}
          placeholder="manager@company.com"
          sx={{ mt: 0.5 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<Email />}
          onClick={handleSend}
          disabled={!trimmed}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}
