import { RegisteredUser } from './userStorage';

// Define all the data keys that need to be persisted
export const PERSISTENCE_KEYS = {
  AUTH_TOKEN: 'timelymate_token',
  USER_DATA: 'timelymate_user',
  REGISTERED_USERS: 'timelymate_registered_users',
  CLOCK_IN_TODAY: 'clockInToday',
  CLOCK_IN_TIME: 'clockInTime',
  CLOCK_IN_RECORDS: 'timelymate_clockin_records',
  TIMESHEETS: 'timelymate_timesheets',
  USER_STATUS: 'userStatus',
  STATUS_MESSAGE: 'statusMessage',
  AUTO_AWAY_ENABLED: 'isAutoAwayEnabled',
  THEME_MODE: 'themeMode',
  PREFERRED_CURRENCY: 'preferredCurrency',
  DETECTED_CURRENCY: 'detectedCurrency',
  DETECTED_COUNTRY: 'detectedCountry',
  PROCUREMENT_VENDORS: 'timelymate_procurement_vendors',
  OFFSITE_SETTINGS: 'offsiteWorkSettings',
  OFFSITE_LOCATIONS: 'offsiteWorkLocations',
  EMPLOYEES: 'timelymate_employees',
  PROJECTS: 'timelymate_projects',
  NOTIFICATIONS: 'timelymate_notifications',
  REDUX_AUTH: 'auth',
  REDUX_THEME: 'theme',
  TIMEZONE_CACHE: 'timezoneCache',
} as const;

const BACKUP_KEY = 'timelymate_session_backup';
const SESSION_KEY_PREFIX = 'timelymate_session_';
/** Cap backup blob size — full localStorage duplication was exceeding quota. */
const MAX_BACKUP_CHARS = 180_000;

export interface SessionData {
  authToken?: string;
  userData?: unknown;
  registeredUsers?: RegisteredUser[];
  clockInToday?: string;
  clockInTime?: string;
  clockInRecords?: Array<{
    id: string;
    clockIn: string;
    clockOut: string | null;
    duration: string | null;
  }>;
  userStatus?: string;
  statusMessage?: string;
  autoAwayEnabled?: boolean;
  themeMode?: string;
  preferredCurrency?: string;
  detectedCurrency?: string;
  detectedCountry?: string;
  employees?: unknown[];
  lastSaved?: string;
}

function capArray<T>(arr: T[] | null | undefined, max: number): T[] | undefined {
  if (!arr?.length) return undefined;
  return arr.length <= max ? arr : arr.slice(0, max);
}

class SessionPersistenceService {
  /**
   * Remove legacy per-load session snapshots (timelymate_session_session-*) that filled storage.
   */
  pruneLegacySessionKeys(): void {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (key.startsWith(SESSION_KEY_PREFIX) && key !== BACKUP_KEY) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      /* ignore */
    }
  }

  /**
   * Lightweight snapshot — individual keys already persist via hooks; backup is for restore merge only.
   */
  buildLightweightSnapshot(): SessionData {
    const clockInRecords = this.getParsedItem(PERSISTENCE_KEYS.CLOCK_IN_RECORDS);
    return {
      authToken: localStorage.getItem(PERSISTENCE_KEYS.AUTH_TOKEN) || undefined,
      userData: this.getParsedItem(PERSISTENCE_KEYS.USER_DATA),
      registeredUsers: capArray(
        this.getParsedItem(PERSISTENCE_KEYS.REGISTERED_USERS),
        200
      ),
      clockInToday: localStorage.getItem(PERSISTENCE_KEYS.CLOCK_IN_TODAY) || undefined,
      clockInTime: localStorage.getItem(PERSISTENCE_KEYS.CLOCK_IN_TIME) || undefined,
      clockInRecords: capArray(clockInRecords, 120),
      userStatus: localStorage.getItem(PERSISTENCE_KEYS.USER_STATUS) || undefined,
      statusMessage: localStorage.getItem(PERSISTENCE_KEYS.STATUS_MESSAGE) || undefined,
      autoAwayEnabled: localStorage.getItem(PERSISTENCE_KEYS.AUTO_AWAY_ENABLED) === 'true',
      themeMode: localStorage.getItem(PERSISTENCE_KEYS.THEME_MODE) || undefined,
      preferredCurrency: localStorage.getItem(PERSISTENCE_KEYS.PREFERRED_CURRENCY) || undefined,
      detectedCurrency: localStorage.getItem(PERSISTENCE_KEYS.DETECTED_CURRENCY) || undefined,
      detectedCountry: localStorage.getItem(PERSISTENCE_KEYS.DETECTED_COUNTRY) || undefined,
      employees: capArray(this.getParsedItem(PERSISTENCE_KEYS.EMPLOYEES), 300),
      lastSaved: new Date().toISOString(),
    };
  }

  saveSessionData(): void {
    try {
      this.pruneLegacySessionKeys();

      let snapshot = this.buildLightweightSnapshot();
      let payload = JSON.stringify(snapshot);

      while (payload.length > MAX_BACKUP_CHARS && snapshot.employees) {
        snapshot = {
          ...snapshot,
          employees: capArray(snapshot.employees, Math.max(20, (snapshot.employees?.length ?? 0) >> 1)),
          clockInRecords: capArray(snapshot.clockInRecords, 40),
          registeredUsers: capArray(snapshot.registeredUsers, 50),
        };
        payload = JSON.stringify(snapshot);
        if (!snapshot.employees?.length) break;
      }

      localStorage.setItem(BACKUP_KEY, payload);

      if (import.meta.env.DEV) {
        console.log('Session backup saved', { bytes: payload.length });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.handleQuotaExceeded();
      } else {
        console.error('Error saving session data:', error);
      }
    }
  }

  handleQuotaExceeded(): void {
    console.warn('localStorage quota exceeded — pruning old session backups');
    this.pruneLegacySessionKeys();
    try {
      localStorage.removeItem(PERSISTENCE_KEYS.TIMEZONE_CACHE);
      localStorage.removeItem(PERSISTENCE_KEYS.NOTIFICATIONS);
      const minimal = JSON.stringify({
        authToken: localStorage.getItem(PERSISTENCE_KEYS.AUTH_TOKEN),
        userData: this.getParsedItem(PERSISTENCE_KEYS.USER_DATA),
        lastSaved: new Date().toISOString(),
      });
      localStorage.setItem(BACKUP_KEY, minimal);
    } catch {
      /* give up silently — app data still lives in per-key storage */
    }
  }

  restoreSessionData(): boolean {
    try {
      this.pruneLegacySessionKeys();

      let sessionData = this.getParsedItem(BACKUP_KEY) as SessionData | null;

      if (sessionData?.lastSaved) {
        const lastSaved = new Date(sessionData.lastSaved).getTime();
        const oneDayInMs = 24 * 60 * 60 * 1000;
        if (Date.now() - lastSaved > oneDayInMs) {
          this.clearExpiredSessionData();
          return false;
        }
      }

      if (!sessionData) {
        return false;
      }

      const existingRegisteredUsers = this.getParsedItem(PERSISTENCE_KEYS.REGISTERED_USERS) || [];
      const sessionRegisteredUsers = sessionData.registeredUsers || [];
      const mergedUsers = [...existingRegisteredUsers];
      sessionRegisteredUsers.forEach((user: RegisteredUser) => {
        if (!mergedUsers.find((u: RegisteredUser) => u.email === user.email)) {
          mergedUsers.push(user);
        }
      });
      if (mergedUsers.length > 0) {
        localStorage.setItem(PERSISTENCE_KEYS.REGISTERED_USERS, JSON.stringify(mergedUsers));
      }

      this.restoreItem(PERSISTENCE_KEYS.AUTH_TOKEN, sessionData.authToken);
      this.restoreItem(PERSISTENCE_KEYS.USER_DATA, sessionData.userData);
      this.restoreItem(PERSISTENCE_KEYS.CLOCK_IN_TODAY, sessionData.clockInToday);
      this.restoreItem(PERSISTENCE_KEYS.CLOCK_IN_TIME, sessionData.clockInTime);
      this.restoreItem(PERSISTENCE_KEYS.CLOCK_IN_RECORDS, sessionData.clockInRecords);
      this.restoreItem(PERSISTENCE_KEYS.USER_STATUS, sessionData.userStatus);
      this.restoreItem(PERSISTENCE_KEYS.STATUS_MESSAGE, sessionData.statusMessage);
      this.restoreItem(PERSISTENCE_KEYS.AUTO_AWAY_ENABLED, sessionData.autoAwayEnabled?.toString());
      this.restoreItem(PERSISTENCE_KEYS.THEME_MODE, sessionData.themeMode);
      this.restoreItem(PERSISTENCE_KEYS.PREFERRED_CURRENCY, sessionData.preferredCurrency);
      this.restoreItem(PERSISTENCE_KEYS.DETECTED_CURRENCY, sessionData.detectedCurrency);
      this.restoreItem(PERSISTENCE_KEYS.DETECTED_COUNTRY, sessionData.detectedCountry);

      return true;
    } catch (error) {
      console.error('Error restoring session data:', error);
      return false;
    }
  }

  clearSessionData(): void {
    try {
      const keysToKeep: string[] = [
        PERSISTENCE_KEYS.REGISTERED_USERS,
        PERSISTENCE_KEYS.EMPLOYEES,
        PERSISTENCE_KEYS.AUTH_TOKEN,
        PERSISTENCE_KEYS.USER_DATA,
        PERSISTENCE_KEYS.REDUX_AUTH,
        PERSISTENCE_KEYS.PROJECTS,
      ];

      Object.values(PERSISTENCE_KEYS).forEach((key) => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      this.pruneLegacySessionKeys();
      localStorage.removeItem(BACKUP_KEY);
    } catch (error) {
      console.error('Error clearing session data:', error);
    }
  }

  clearExpiredSessionData(): void {
    try {
      localStorage.removeItem(BACKUP_KEY);
      this.pruneLegacySessionKeys();
    } catch (error) {
      console.error('Error clearing expired session data:', error);
    }
  }

  getSessionSummary(): Record<string, unknown> {
    const summary: Record<string, unknown> = {};
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

  hasSessionData(): boolean {
    return !!localStorage.getItem(BACKUP_KEY);
  }

  autoSave(): void {
    this.saveSessionData();
  }

  private getParsedItem(key: string): unknown {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  private restoreItem(key: string, value: unknown): void {
    if (value === undefined || value === null) return;
    if (typeof value === 'string') {
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
}

export const sessionPersistence = new SessionPersistenceService();

// Prune legacy keys once on load (safe no-op after first visit post-fix)
sessionPersistence.pruneLegacySessionKeys();

// Save lightweight backup before tab close — not on a timer (was duplicating storage every 30s)
window.addEventListener('beforeunload', () => {
  sessionPersistence.saveSessionData();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    sessionPersistence.saveSessionData();
  }
});

export default sessionPersistence;
