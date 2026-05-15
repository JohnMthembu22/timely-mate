import { RegisteredUser } from './userStorage';

// Define all the data keys that need to be persisted
export const PERSISTENCE_KEYS = {
  // Authentication
  AUTH_TOKEN: 'timelymate_token',
  USER_DATA: 'timelymate_user',
  REGISTERED_USERS: 'timelymate_registered_users',
  
  // Time Tracking & Attendance
  CLOCK_IN_TODAY: 'clockInToday',
  CLOCK_IN_TIME: 'clockInTime',
  CLOCK_IN_RECORDS: 'timelymate_clockin_records',
  TIMESHEETS: 'timelymate_timesheets',
  
  // User Status & Preferences
  USER_STATUS: 'userStatus',
  STATUS_MESSAGE: 'statusMessage',
  AUTO_AWAY_ENABLED: 'isAutoAwayEnabled',
  THEME_MODE: 'themeMode',
  PREFERRED_CURRENCY: 'preferredCurrency',
  DETECTED_CURRENCY: 'detectedCurrency',
  DETECTED_COUNTRY: 'detectedCountry',
  
  // Business Data
  PROCUREMENT_VENDORS: 'timelymate_procurement_vendors',
  OFFSITE_SETTINGS: 'offsiteWorkSettings',
  OFFSITE_LOCATIONS: 'offsiteWorkLocations',
  EMPLOYEES: 'timelymate_employees',
  
  // Notifications & Communication
  NOTIFICATIONS: 'timelymate_notifications',
  
  // Redux Store
  REDUX_AUTH: 'auth',
  REDUX_THEME: 'theme',
  
  // Timezone Cache
  TIMEZONE_CACHE: 'timezoneCache',
} as const;

// Define the structure of session data
export interface SessionData {
  // Authentication
  authToken?: string;
  userData?: any;
  registeredUsers?: RegisteredUser[];
  
  // Time Tracking & Attendance
  clockInToday?: string;
  clockInTime?: string;
  clockInRecords?: Array<{
    id: string;
    clockIn: string;
    clockOut: string | null;
    duration: string | null;
  }>;
  timesheets?: any[];
  
  // User Status & Preferences
  userStatus?: string;
  statusMessage?: string;
  autoAwayEnabled?: boolean;
  themeMode?: string;
  preferredCurrency?: string;
  detectedCurrency?: string;
  detectedCountry?: string;
  
  // Business Data
  procurementVendors?: any[];
  offsiteSettings?: any;
  offsiteLocations?: any[];
  employees?: any[];
  
  // Notifications & Communication
  notifications?: any[];
  
  // Redux Store
  reduxAuth?: any;
  reduxTheme?: any;
  
  // Timezone Cache
  timezoneCache?: any;
  
  // Metadata
  lastSaved?: string;
  sessionId?: string;
}

class SessionPersistenceService {
  private sessionId: string;
  
  constructor() {
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Save all current session data to localStorage
   */
  saveSessionData(): void {
    try {
      // Always preserve registered users - they should persist indefinitely
      const registeredUsers = this.getParsedItem(PERSISTENCE_KEYS.REGISTERED_USERS);
      
      const sessionData: SessionData = {
        // Authentication
        authToken: localStorage.getItem(PERSISTENCE_KEYS.AUTH_TOKEN) || undefined,
        userData: this.getParsedItem(PERSISTENCE_KEYS.USER_DATA),
        registeredUsers: registeredUsers, // Always include registered users
        
        // Time Tracking & Attendance
        clockInToday: localStorage.getItem(PERSISTENCE_KEYS.CLOCK_IN_TODAY) || undefined,
        clockInTime: localStorage.getItem(PERSISTENCE_KEYS.CLOCK_IN_TIME) || undefined,
        clockInRecords: this.getParsedItem(PERSISTENCE_KEYS.CLOCK_IN_RECORDS),
        timesheets: this.getParsedItem(PERSISTENCE_KEYS.TIMESHEETS),
        
        // User Status & Preferences
        userStatus: localStorage.getItem(PERSISTENCE_KEYS.USER_STATUS) || undefined,
        statusMessage: localStorage.getItem(PERSISTENCE_KEYS.STATUS_MESSAGE) || undefined,
        autoAwayEnabled: localStorage.getItem(PERSISTENCE_KEYS.AUTO_AWAY_ENABLED) === 'true',
        themeMode: localStorage.getItem(PERSISTENCE_KEYS.THEME_MODE) || undefined,
        preferredCurrency: localStorage.getItem(PERSISTENCE_KEYS.PREFERRED_CURRENCY) || undefined,
        detectedCurrency: localStorage.getItem(PERSISTENCE_KEYS.DETECTED_CURRENCY) || undefined,
        detectedCountry: localStorage.getItem(PERSISTENCE_KEYS.DETECTED_COUNTRY) || undefined,
        
        // Business Data
        procurementVendors: this.getParsedItem(PERSISTENCE_KEYS.PROCUREMENT_VENDORS),
        offsiteSettings: this.getParsedItem(PERSISTENCE_KEYS.OFFSITE_SETTINGS),
        offsiteLocations: this.getParsedItem(PERSISTENCE_KEYS.OFFSITE_LOCATIONS),
        employees: this.getParsedItem(PERSISTENCE_KEYS.EMPLOYEES), // Always preserve employees
        
        // Notifications & Communication
        notifications: this.getParsedItem(PERSISTENCE_KEYS.NOTIFICATIONS),
        
        // Redux Store
        reduxAuth: this.getParsedItem(PERSISTENCE_KEYS.REDUX_AUTH),
        reduxTheme: this.getParsedItem(PERSISTENCE_KEYS.REDUX_THEME),
        
        // Timezone Cache
        timezoneCache: this.getParsedItem(PERSISTENCE_KEYS.TIMEZONE_CACHE),
        
        // Metadata
        lastSaved: new Date().toISOString(),
        sessionId: this.sessionId,
      };
      
      // Save to localStorage with session-specific key
      const sessionKey = `timelymate_session_${this.sessionId}`;
      localStorage.setItem(sessionKey, JSON.stringify(sessionData));
      
      // Also save to a general backup key for recovery
      localStorage.setItem('timelymate_session_backup', JSON.stringify(sessionData));
      
      console.log('Session data saved successfully', { sessionId: this.sessionId, dataKeys: Object.keys(sessionData) });
    } catch (error) {
      console.error('Error saving session data:', error);
    }
  }
  
  /**
   * Restore session data from localStorage
   */
  restoreSessionData(): boolean {
    try {
      // Try to restore from current session first
      const sessionKey = `timelymate_session_${this.sessionId}`;
      let sessionData = this.getParsedItem(sessionKey);
      
      // If no current session data, try to restore from backup
      if (!sessionData) {
        sessionData = this.getParsedItem('timelymate_session_backup');
      }
      
      // Check if session data has expired (1 day = 24 hours = 86400000 ms)
      if (sessionData && sessionData.lastSaved) {
        const lastSaved = new Date(sessionData.lastSaved).getTime();
        const now = Date.now();
        const oneDayInMs = 24 * 60 * 60 * 1000; // 1 day
        
        if (now - lastSaved > oneDayInMs) {
          console.log('Session data expired, clearing...');
          this.clearExpiredSessionData();
          return false;
        }
      }
      
      if (!sessionData) {
        console.log('No session data found to restore');
        return false;
      }
      
      // Restore all data to localStorage
      // IMPORTANT: Always preserve registered users - merge with existing if needed
      const existingRegisteredUsers = this.getParsedItem(PERSISTENCE_KEYS.REGISTERED_USERS) || [];
      const sessionRegisteredUsers = sessionData.registeredUsers || [];
      
      // Merge registered users (keep all unique users)
      const mergedUsers = [...existingRegisteredUsers];
      sessionRegisteredUsers.forEach((user: any) => {
        if (!mergedUsers.find((u: any) => u.email === user.email)) {
          mergedUsers.push(user);
        }
      });
      
      // Always save merged registered users (they persist indefinitely)
      if (mergedUsers.length > 0) {
        localStorage.setItem(PERSISTENCE_KEYS.REGISTERED_USERS, JSON.stringify(mergedUsers));
      }
      
      // IMPORTANT: Always preserve employees - merge with existing if needed
      const existingEmployees = this.getParsedItem(PERSISTENCE_KEYS.EMPLOYEES) || [];
      const sessionEmployees = sessionData.employees || [];
      
      // Merge employees (keep all unique employees by ID)
      const mergedEmployees = [...existingEmployees];
      sessionEmployees.forEach((emp: any) => {
        if (!mergedEmployees.find((e: any) => e.id === emp.id)) {
          mergedEmployees.push(emp);
        }
      });
      
      // Always save merged employees (they persist indefinitely)
      if (mergedEmployees.length > 0) {
        localStorage.setItem(PERSISTENCE_KEYS.EMPLOYEES, JSON.stringify(mergedEmployees));
      }
      
      this.restoreItem(PERSISTENCE_KEYS.AUTH_TOKEN, sessionData.authToken);
      this.restoreItem(PERSISTENCE_KEYS.USER_DATA, sessionData.userData);
      
      this.restoreItem(PERSISTENCE_KEYS.CLOCK_IN_TODAY, sessionData.clockInToday);
      this.restoreItem(PERSISTENCE_KEYS.CLOCK_IN_TIME, sessionData.clockInTime);
      this.restoreItem(PERSISTENCE_KEYS.CLOCK_IN_RECORDS, sessionData.clockInRecords);
      this.restoreItem(PERSISTENCE_KEYS.TIMESHEETS, sessionData.timesheets);
      
      this.restoreItem(PERSISTENCE_KEYS.USER_STATUS, sessionData.userStatus);
      this.restoreItem(PERSISTENCE_KEYS.STATUS_MESSAGE, sessionData.statusMessage);
      this.restoreItem(PERSISTENCE_KEYS.AUTO_AWAY_ENABLED, sessionData.autoAwayEnabled?.toString());
      this.restoreItem(PERSISTENCE_KEYS.THEME_MODE, sessionData.themeMode);
      this.restoreItem(PERSISTENCE_KEYS.PREFERRED_CURRENCY, sessionData.preferredCurrency);
      this.restoreItem(PERSISTENCE_KEYS.DETECTED_CURRENCY, sessionData.detectedCurrency);
      this.restoreItem(PERSISTENCE_KEYS.DETECTED_COUNTRY, sessionData.detectedCountry);
      
      this.restoreItem(PERSISTENCE_KEYS.PROCUREMENT_VENDORS, sessionData.procurementVendors);
      this.restoreItem(PERSISTENCE_KEYS.OFFSITE_SETTINGS, sessionData.offsiteSettings);
      this.restoreItem(PERSISTENCE_KEYS.OFFSITE_LOCATIONS, sessionData.offsiteLocations);
      // Employees are already restored above in the merge logic
      
      this.restoreItem(PERSISTENCE_KEYS.NOTIFICATIONS, sessionData.notifications);
      
      this.restoreItem(PERSISTENCE_KEYS.REDUX_AUTH, sessionData.reduxAuth);
      this.restoreItem(PERSISTENCE_KEYS.REDUX_THEME, sessionData.reduxTheme);
      
      this.restoreItem(PERSISTENCE_KEYS.TIMEZONE_CACHE, sessionData.timezoneCache);
      
      console.log('Session data restored successfully', { 
        sessionId: this.sessionId, 
        restoredAt: new Date().toISOString(),
        dataKeys: Object.keys(sessionData).filter(key => key !== 'lastSaved' && key !== 'sessionId')
      });
      
      return true;
    } catch (error) {
      console.error('Error restoring session data:', error);
      return false;
    }
  }
  
  /**
   * Clear all session data
   */
  clearSessionData(): void {
    try {
      // Clear all persistence keys EXCEPT registered users, employees, and auth
      // We want to keep registered users, employees, and auth tokens
      const keysToKeep = [
        PERSISTENCE_KEYS.REGISTERED_USERS,
        PERSISTENCE_KEYS.EMPLOYEES, // Always preserve employees
        PERSISTENCE_KEYS.AUTH_TOKEN,
        PERSISTENCE_KEYS.USER_DATA,
        PERSISTENCE_KEYS.REDUX_AUTH,
      ];
      
      Object.values(PERSISTENCE_KEYS).forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear session-specific data
      const sessionKey = `timelymate_session_${this.sessionId}`;
      localStorage.removeItem(sessionKey);
      localStorage.removeItem('timelymate_session_backup');
      
      console.log('Session data cleared successfully (preserved registered users and auth)');
    } catch (error) {
      console.error('Error clearing session data:', error);
    }
  }

  /**
   * Clear expired session data (but keep registered users and auth)
   */
  clearExpiredSessionData(): void {
    try {
      // Clear session backups but keep registered users and auth
      localStorage.removeItem('timelymate_session_backup');
      
      // Clear all session-specific keys
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('timelymate_session_')) {
          localStorage.removeItem(key);
        }
      });
      
      console.log('Expired session data cleared (preserved registered users and auth)');
    } catch (error) {
      console.error('Error clearing expired session data:', error);
    }
  }
  
  /**
   * Get current session data summary
   */
  getSessionSummary(): { [key: string]: any } {
    const summary: { [key: string]: any } = {};
    
    Object.entries(PERSISTENCE_KEYS).forEach(([name, key]) => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          summary[name] = JSON.parse(value);
        } catch {
          summary[name] = value;
        }
      }
    });
    
    return summary;
  }
  
  /**
   * Check if session data exists
   */
  hasSessionData(): boolean {
    const sessionKey = `timelymate_session_${this.sessionId}`;
    const backupKey = 'timelymate_session_backup';
    
    return !!(localStorage.getItem(sessionKey) || localStorage.getItem(backupKey));
  }
  
  /**
   * Auto-save session data (call this periodically)
   */
  autoSave(): void {
    this.saveSessionData();
  }
  
  /**
   * Helper method to safely parse localStorage items
   */
  private getParsedItem(key: string): any {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }
  
  /**
   * Helper method to safely restore items to localStorage
   */
  private restoreItem(key: string, value: any): void {
    if (value !== undefined && value !== null) {
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }
  }
}

// Create singleton instance
export const sessionPersistence = new SessionPersistenceService();

// Auto-save every 30 seconds
setInterval(() => {
  if (sessionPersistence.hasSessionData()) {
    sessionPersistence.autoSave();
  }
}, 30000);

// Auto-save before page unload
window.addEventListener('beforeunload', () => {
  sessionPersistence.saveSessionData();
});

// Auto-save on visibility change (when user switches tabs/apps)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    sessionPersistence.saveSessionData();
  }
});

export default sessionPersistence;










