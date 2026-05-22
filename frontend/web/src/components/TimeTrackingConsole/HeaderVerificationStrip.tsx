import React from 'react';
import { Box, Paper, Stack, Typography, alpha } from '@mui/material';
import type { VerificationMethod, VerificationMethodId } from './verificationMethodsData';
import { VERIFICATION_METHODS } from './verificationMethodsData';
import {
  Bluetooth,
  Camera,
  Fingerprint,
  MapPin,
  Mic,
  Nfc,
  QrCode,
  ScanFace,
  Shield,
  ShieldCheck,
  Watch,
} from 'lucide-react';

/** Exactly five channels shown in the page header strip. */
const HEADER_METHOD_IDS: VerificationMethodId[] = ['qr', 'geofence', 'watch', 'voice', 'facial'];

const methodIcon: Record<VerificationMethodId, React.ElementType> = {
  qr: QrCode,
  geofence: MapPin,
  watch: Watch,
  voice: Mic,
  facial: ScanFace,
  fingerprint: Fingerprint,
  nfc: Nfc,
  ble: Bluetooth,
  gps: MapPin,
  site_geofence: Shield,
  fraud_ai: ShieldCheck,
  selfie: Camera,
};

const headerLabel: Record<VerificationMethodId, string> = {
  qr: 'QR scan',
  geofence: 'Geofence',
  watch: 'Watch',
  voice: 'Voice',
  facial: 'Face ID',
  fingerprint: 'Fingerprint',
  nfc: 'NFC',
  ble: 'BLE',
  gps: 'GPS',
  site_geofence: 'Site fence',
  fraud_ai: 'Fraud AI',
  selfie: 'Selfie',
};

function IconVerificationCard({
  method,
  onVerify,
  onPlaceholder,
}: {
  method: VerificationMethod;
  onVerify: (checkInKey: string) => void;
  onPlaceholder: (title: string) => void;
}) {
  const Icon = methodIcon[method.id];
  const canCheckIn = Boolean(method.checkInKey) && !method.placeholder;
  const label = headerLabel[method.id];

  return (
    <Paper
      elevation={0}
      onClick={() => {
        if (canCheckIn) onVerify(method.checkInKey!);
        else onPlaceholder(method.title);
      }}
      sx={{
        width: 118,
        flexShrink: 0,
        py: 1.5,
        px: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha('#fff', method.status === 'active' ? 0.45 : 0.25),
        bgcolor: alpha('#fff', method.status === 'active' ? 0.2 : 0.1),
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'transform 180ms ease, background-color 180ms ease, border-color 180ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          bgcolor: alpha('#fff', 0.28),
          borderColor: alpha('#fff', 0.55),
        },
      }}
    >
      <Box
        sx={{
          width: 68,
          height: 68,
          mx: 'auto',
          mb: 0.85,
          borderRadius: 2.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha('#fff', 0.22),
          color: '#fff',
        }}
      >
        <Icon size={36} strokeWidth={2.25} />
      </Box>
      <Typography
        sx={{
          fontSize: '0.8125rem',
          fontWeight: 800,
          color: '#fff',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
        }}
      >
        {label}
      </Typography>
    </Paper>
  );
}

export interface HeaderVerificationStripProps {
  isCheckedIn: boolean;
  onVerify: (checkInKey: string) => void;
  onPlaceholder: (title: string) => void;
}

export function HeaderVerificationStrip({ onVerify, onPlaceholder }: HeaderVerificationStripProps) {
  const methods = HEADER_METHOD_IDS.map((id) => VERIFICATION_METHODS.find((m) => m.id === id)!).filter(Boolean);

  return (
    <Box sx={{ my: 2 }}>
      <Stack
        direction="row"
        spacing={1.25}
        justifyContent="flex-start"
        flexWrap="nowrap"
        sx={{
          overflowX: { xs: 'auto', md: 'visible' },
          pb: { xs: 0.5, md: 0 },
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: alpha('#fff', 0.35), borderRadius: 99 },
        }}
      >
        {methods.map((method) => (
          <IconVerificationCard
            key={method.id}
            method={method}
            onVerify={onVerify}
            onPlaceholder={onPlaceholder}
          />
        ))}
      </Stack>
    </Box>
  );
}
