import type { ElementType } from 'react';
import {
  AlertTriangle,
  Camera,
  ClipboardCheck,
  MapPin,
  Package,
  QrCode,
  ScanLine,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { MobileWorkforceTool } from './mobileWorkforceTypes';

export interface ScanActionConfig {
  id: 'qr' | 'object';
  title: string;
  description: string;
  accent: string;
  icon: ElementType;
  cta: string;
}

export interface MobileToolActionConfig {
  id: MobileWorkforceTool | 'offline';
  title: string;
  description: string;
  accent: string;
  icon: ElementType;
}

export const SCAN_ACTIONS: ScanActionConfig[] = [
  {
    id: 'qr',
    title: 'QR verify',
    description: 'Site check-in, asset tags, and handoff points — device camera opens automatically.',
    accent: '#6366f1',
    icon: QrCode,
    cta: 'Open QR scanner',
  },
  {
    id: 'object',
    title: 'Material scan',
    description: 'Barcodes, equipment labels, and installation proof — live camera decode.',
    accent: '#f59e0b',
    icon: ScanLine,
    cta: 'Scan materials',
  },
];

export const MOBILE_TOOL_ACTIONS: MobileToolActionConfig[] = [
  {
    id: 'photo',
    title: 'Photo capture',
    description: 'Geo-tagged site photos tied to your session',
    accent: '#0ea5e9',
    icon: Camera,
  },
  {
    id: 'gps',
    title: 'GPS check-in',
    description: 'Confirm arrival and activate site status',
    accent: '#10b981',
    icon: MapPin,
  },
  {
    id: 'logistics',
    title: 'Proof of delivery',
    description: 'Signature capture and POD documentation',
    accent: '#8b5cf6',
    icon: Package,
  },
  {
    id: 'inspection',
    title: 'Field inspection',
    description: 'Checklist completion and progress update',
    accent: '#f59e0b',
    icon: ClipboardCheck,
  },
  {
    id: 'escalate',
    title: 'Escalate issue',
    description: 'Urgent flag to line manager who briefed the job',
    accent: '#ef4444',
    icon: AlertTriangle,
  },
  {
    id: 'offline',
    title: 'Offline mode',
    description: 'Queue scans and submissions until connectivity returns',
    accent: '#64748b',
    icon: WifiOff,
  },
];

export function mobileToolIcon(id: MobileToolActionConfig['id'], offlineActive: boolean): ElementType {
  if (id === 'offline') return offlineActive ? WifiOff : Wifi;
  const match = MOBILE_TOOL_ACTIONS.find((t) => t.id === id);
  return match?.icon ?? Camera;
}
