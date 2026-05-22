export function formatIncidentCoordinates(lat: number, lng: number, accuracyM?: number): string {
  const base = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  if (accuracyM != null && Number.isFinite(accuracyM)) {
    return `${base} (±${Math.round(accuracyM)}m)`;
  }
  return base;
}

function geolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location permission denied. Allow location access or enter coordinates manually.';
    case error.POSITION_UNAVAILABLE:
      return 'Location unavailable. Try again or enter coordinates manually.';
    case error.TIMEOUT:
      return 'Location request timed out. Try again.';
    default:
      return 'Unable to get current location.';
  }
}

export function requestCurrentIncidentCoordinates(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported on this device.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        resolve(formatIncidentCoordinates(latitude, longitude, accuracy));
      },
      (error) => reject(new Error(geolocationErrorMessage(error))),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60_000 }
    );
  });
}

/** Parse "lat, lng" or "lat, lng (±12m)" for map links */
export function parseIncidentCoordinates(gps?: string): { lat: number; lng: number } | null {
  if (!gps?.trim()) return null;
  const match = gps.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export function incidentCoordinatesMapUrl(gps?: string): string | null {
  const parsed = parseIncidentCoordinates(gps);
  if (!parsed) return null;
  return `https://www.google.com/maps?q=${parsed.lat},${parsed.lng}`;
}
