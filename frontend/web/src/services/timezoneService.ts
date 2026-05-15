interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: number;
}

interface TimezoneInfo {
  timezone: string;
  offset: string;
  city: string;
  country: string;
}

class TimezoneService {
  private cache: TimezoneInfo | null = null;
  private readonly CACHE_KEY = 'user_timezone_info';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Get timezone information based on user's geolocation
   */
  async getTimezoneInfo(): Promise<TimezoneInfo> {
    // Check cache first
    const cached = this.getCachedTimezone();
    if (cached) {
      return cached;
    }

    try {
      // Get user's current position
      const position = await this.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      // Get timezone from coordinates
      const timezoneInfo = await this.getTimezoneFromCoords(latitude, longitude);
      
      // Cache the result
      this.setCachedTimezone(timezoneInfo);
      
      return timezoneInfo;
    } catch (error) {
      console.warn('Failed to get geolocation timezone:', error);
      
      // Fallback to browser timezone
      return this.getBrowserTimezone();
    }
  }

  /**
   * Get current position using Geolocation API
   */
  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position as GeolocationPosition),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Get timezone information from coordinates using a timezone API
   */
  private async getTimezoneFromCoords(lat: number, lng: number): Promise<TimezoneInfo> {
    try {
      // Using Google's timezone API (you might want to use a different service)
      // For now, we'll use a fallback approach with browser timezone and reverse geocoding
      
      // Get timezone from browser
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Try to get location info from reverse geocoding
      const locationInfo = await this.reverseGeocode(lat, lng);
      
      return {
        timezone: browserTimezone,
        offset: this.getTimezoneOffset(),
        city: locationInfo.city,
        country: locationInfo.country
      };
    } catch (error) {
      console.warn('Failed to get timezone from coordinates:', error);
      return this.getBrowserTimezone();
    }
  }

  /**
   * Reverse geocode coordinates to get location info
   */
  private async reverseGeocode(lat: number, lng: number): Promise<{ city: string; country: string }> {
    try {
      // Using a free geocoding service (you might want to use Google Maps API in production)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      return {
        city: data.city || data.locality || 'Unknown',
        country: data.countryName || 'Unknown'
      };
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      return { city: 'Unknown', country: 'Unknown' };
    }
  }

  /**
   * Get browser timezone as fallback
   */
  private getBrowserTimezone(): TimezoneInfo {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    return {
      timezone,
      offset: this.getTimezoneOffset(),
      city: 'Detected from browser',
      country: 'Unknown'
    };
  }

  /**
   * Get timezone offset in readable format
   */
  private getTimezoneOffset(): string {
    const offset = new Date().getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset <= 0 ? '+' : '-';
    
    return `GMT${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Get cached timezone info
   */
  private getCachedTimezone(): TimezoneInfo | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;
      
      const parsed = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - parsed.timestamp > this.CACHE_DURATION) {
        localStorage.removeItem(this.CACHE_KEY);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.warn('Failed to get cached timezone:', error);
      return null;
    }
  }

  /**
   * Cache timezone info
   */
  private setCachedTimezone(timezoneInfo: TimezoneInfo): void {
    try {
      const cacheData = {
        data: timezoneInfo,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache timezone:', error);
    }
  }

  /**
   * Clear cached timezone info
   */
  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    this.cache = null;
  }
}

export const timezoneService = new TimezoneService();
export default timezoneService; 