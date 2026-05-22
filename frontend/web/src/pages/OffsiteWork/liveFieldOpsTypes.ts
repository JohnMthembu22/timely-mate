export type LiveOpsState = 'optimal' | 'watch' | 'critical' | 'neutral';

export interface LiveFieldMetric {
  id: string;
  label: string;
  value: number;
  display: string;
  suffix?: string;
  state: LiveOpsState;
  delta: string;
  deltaUp: boolean;
  sparkline: number[];
  gps?: { lat: number; lng: number; label: string };
  pulseHz?: number;
}

export interface FleetPulse {
  id: string;
  label: string;
  intensity: number;
  state: LiveOpsState;
}

export interface LiveFieldOpsSnapshot {
  updatedAt: string;
  metrics: LiveFieldMetric[];
  pulses: FleetPulse[];
  activeRegions: { name: string; crews: number; state: LiveOpsState }[];
}
