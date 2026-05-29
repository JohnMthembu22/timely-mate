import { isSupabaseAuthEnabled } from './authConfig';
import { clearLegacyLocalUserRegistry } from './authSession';
import { stripLegacyDemoFromStorage } from './legacyDemoCleanup';
import { clearOperationalStorage } from './operationalStorage';

const WIPE_KEY = 'timelymate_app_storage_v5';

/** On app load: remove demo mode flag, wipe cached demo datasets once, strip legacy rows. */
export function bootstrapAppStorage(): void {
  try {
    localStorage.removeItem('timelymate_demo_mode');
    if (localStorage.getItem(WIPE_KEY) !== '1') {
      clearOperationalStorage();
      localStorage.setItem(WIPE_KEY, '1');
    }
    stripLegacyDemoFromStorage();
    if (isSupabaseAuthEnabled()) {
      clearLegacyLocalUserRegistry();
    }
  } catch {
    clearOperationalStorage();
    stripLegacyDemoFromStorage();
  }
}
