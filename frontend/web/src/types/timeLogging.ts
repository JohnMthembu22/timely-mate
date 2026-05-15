export interface BiometricData {
  pulseRate?: number;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: string;
}

export interface DailyCode {
  code: string;
  generatedAt: string;
  expiresAt: string;
  isValid: boolean;
}

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  startTime: string;
  endTime: string | null;
  type: 'manual' | 'voice' | 'geofence' | 'smartwatch';
  status: 'active' | 'paused' | 'completed';
  metadata: {
    command?: string;
    confidence?: number;
    locationId?: string;
    locationName?: string;
    pulseRate?: number;
  };
}

export interface VoiceCommand {
  command: string;
  timestamp: string;
  action: 'clockIn' | 'clockOut' | 'pauseTask' | 'resumeTask';
  confidence: number;
}

export interface GeofenceZone {
  id: string;
  name: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in meters
  isActive: boolean;
}
