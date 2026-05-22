import React, { useState } from 'react';
import {
  Button,
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { Email, FileDownload, PictureAsPdf, TableChart } from '@mui/icons-material';
import type { FieldIncidentReport } from '../incidentReportTypes';
import { runIncidentExport, type IncidentExportFormat } from '../incidentReportExport';
import { IncidentReportEmailDialog } from './IncidentReportEmailDialog';

const FORMAT_LABELS: Record<Exclude<IncidentExportFormat, 'email'>, string> = {
  excel: 'Excel (.xlsx)',
  pdf: 'PDF (.pdf)',
};

export interface IncidentReportExportMenuProps {
  report: FieldIncidentReport;
  suggestedRecipientEmail?: string;
  onExported?: (format: IncidentExportFormat) => void;
  onError?: (message: string) => void;
  /** Compact icon button for register cards */
  compact?: boolean;
}

export function IncidentReportExportMenu({
  report,
  suggestedRecipientEmail,
  onExported,
  onError,
  compact = false,
}: IncidentReportExportMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [busy, setBusy] = useState<Exclude<IncidentExportFormat, 'email'> | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const handleExport = async (format: Exclude<IncidentExportFormat, 'email'>) => {
    setAnchorEl(null);
    setBusy(format);
    try {
      runIncidentExport(report, format);
      onExported?.(format);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed. Please try again.';
      onError?.(message);
    } finally {
      setBusy(null);
    }
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const trigger = compact ? (
    <Tooltip title="Export report">
      <IconButton
        size="small"
        onClick={openMenu}
        disabled={Boolean(busy)}
        aria-label="Export incident report"
        sx={{ border: '1px solid #e2e8f0', borderRadius: 1.5 }}
      >
        {busy ? <CircularProgress size={16} /> : <FileDownload fontSize="small" />}
      </IconButton>
    </Tooltip>
  ) : (
    <Button
      variant="outlined"
      size="small"
      startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <FileDownload />}
      onClick={openMenu}
      disabled={Boolean(busy)}
      sx={{ textTransform: 'none', fontWeight: 700 }}
    >
      Export
    </Button>
  );

  return (
    <>
      {trigger}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 220, borderRadius: 2 } } }}
      >
        <MenuItem onClick={() => void handleExport('excel')} disabled={busy === 'excel'}>
          <ListItemIcon>
            <TableChart fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={FORMAT_LABELS.excel} secondary="Field / value workbook" />
        </MenuItem>
        <MenuItem onClick={() => void handleExport('pdf')} disabled={busy === 'pdf'}>
          <ListItemIcon>
            <PictureAsPdf fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={FORMAT_LABELS.pdf} secondary="Printable report with photos" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setEmailDialogOpen(true);
          }}
        >
          <ListItemIcon>
            <Email fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Send via email" secondary="Enter recipient, then send" />
        </MenuItem>
      </Menu>

      <IncidentReportEmailDialog
        open={emailDialogOpen}
        report={report}
        suggestedEmail={suggestedRecipientEmail}
        onClose={() => setEmailDialogOpen(false)}
        onSent={() => onExported?.('email')}
        onError={onError}
      />
    </>
  );
}
