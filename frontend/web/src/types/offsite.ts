export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

export interface ImageMetadata {
  url: string;
  timestamp: string;
  location?: GeoLocation;
  type: 'progress' | 'drone' | 'documentation';
  tags: string[];
}

export interface JobBag {
  id: string;
  projectId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed' | 'archived';
  location?: GeoLocation;
  images: ImageMetadata[];
  qrCode: string;
  offlineId?: string;
}

export interface DroneUpdate {
  id: string;
  jobBagId: string;
  droneId: string;
  flightPath: GeoLocation[];
  capturedAt: string;
  duration: number;
  images: ImageMetadata[];
  coverageArea: number; // in square meters
  altitude: number;
  weatherConditions: {
    temperature: number;
    windSpeed: number;
    visibility: number;
  };
}

export interface OfflineSync {
  id: string;
  createdAt: string;
  syncedAt?: string;
  type: 'jobBag' | 'image' | 'droneUpdate';
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  data: JobBag | ImageMetadata | DroneUpdate;
  retryCount: number;
  error?: string;
}

export interface OfflineCacheConfig {
  maxStorageSize: number; // in bytes
  maxImageSize: number; // in bytes
  compressionQuality: number; // 0-1
  syncInterval: number; // in milliseconds
  retryAttempts: number;
}
