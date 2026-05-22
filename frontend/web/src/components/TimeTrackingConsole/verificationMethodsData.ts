export type VerificationMethodId =
  | 'qr'
  | 'geofence'
  | 'watch'
  | 'voice'
  | 'facial'
  | 'fingerprint'
  | 'nfc'
  | 'ble'
  | 'gps'
  | 'site_geofence'
  | 'fraud_ai'
  | 'selfie';

export type VerificationStatus = 'active' | 'standby' | 'placeholder' | 'syncing';

export interface VerificationMethod {
  id: VerificationMethodId;
  title: string;
  description: string;
  status: VerificationStatus;
  accuracyScore?: number;
  biometricConfidence?: number;
  lastSync?: string;
  checkInKey?: string;
  placeholder?: boolean;
}

export const VERIFICATION_METHODS: VerificationMethod[] = [
  {
    id: 'qr',
    title: 'QR office scan',
    description: 'Enterprise entrance codes with rotating daily payload',
    status: 'active',
    accuracyScore: 99.2,
    biometricConfidence: 98,
    lastSync: '2 min ago',
    checkInKey: 'qr',
  },
  {
    id: 'geofence',
    title: 'Remote geofencing',
    description: 'GPS validation with hybrid work zone locking',
    status: 'active',
    accuracyScore: 96.8,
    biometricConfidence: 94,
    lastSync: '5 min ago',
    checkInKey: 'location',
  },
  {
    id: 'watch',
    title: 'Smartwatch sync',
    description: 'Pulse + motion attestation from wearable devices',
    status: 'active',
    accuracyScore: 97.4,
    biometricConfidence: 96,
    lastSync: '1 min ago',
    checkInKey: 'watch',
  },
  {
    id: 'voice',
    title: 'Voice check-in',
    description: 'Hands-free voiceprint verification for field crews',
    status: 'active',
    accuracyScore: 94.1,
    biometricConfidence: 92,
    lastSync: '12 min ago',
    checkInKey: 'voice',
  },
  {
    id: 'facial',
    title: 'Facial recognition',
    description: 'Liveness-aware face match at kiosk or mobile',
    status: 'placeholder',
    accuracyScore: 98.5,
    biometricConfidence: 97,
    lastSync: 'Pilot Q3',
    placeholder: true,
  },
  {
    id: 'fingerprint',
    title: 'Biometric fingerprint',
    description: 'Hardware TPM-backed fingerprint templates',
    status: 'placeholder',
    accuracyScore: 99.6,
    biometricConfidence: 99,
    lastSync: 'Pilot Q3',
    placeholder: true,
  },
  {
    id: 'nfc',
    title: 'NFC check-in',
    description: 'Tap badge at site reader or mobile NFC',
    status: 'standby',
    accuracyScore: 98.8,
    biometricConfidence: 95,
    lastSync: 'Yesterday',
    placeholder: true,
  },
  {
    id: 'ble',
    title: 'BLE beacon verification',
    description: 'Proximity lock to approved office beacons',
    status: 'standby',
    accuracyScore: 95.2,
    biometricConfidence: 91,
    lastSync: 'Yesterday',
    placeholder: true,
  },
  {
    id: 'gps',
    title: 'GPS validation',
    description: 'High-precision coordinate attestation',
    status: 'active',
    accuracyScore: 96.2,
    biometricConfidence: 93,
    lastSync: '8 min ago',
    placeholder: true,
  },
  {
    id: 'site_geofence',
    title: 'Site geofence lock',
    description: 'Per-site polygon lock for field installations',
    status: 'active',
    accuracyScore: 97.9,
    biometricConfidence: 95,
    lastSync: '4 min ago',
    placeholder: true,
  },
  {
    id: 'fraud_ai',
    title: 'AI fraud detection',
    description: 'Anomaly scoring on punch patterns and device trust',
    status: 'syncing',
    accuracyScore: 93.7,
    biometricConfidence: 88,
    lastSync: 'Live',
    placeholder: true,
  },
  {
    id: 'selfie',
    title: 'Selfie verification',
    description: 'Visual proof-of-presence with anti-spoof checks',
    status: 'placeholder',
    accuracyScore: 92.4,
    biometricConfidence: 90,
    lastSync: 'Pilot Q4',
    placeholder: true,
  },
];

export function getActiveVerificationMethods() {
  return VERIFICATION_METHODS.filter((m) => !m.placeholder && m.checkInKey);
}
