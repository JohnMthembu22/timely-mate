/**
 * Utility functions for managing application cache
 */

/**
 * Clear all application cache including:
 * - Local storage
 * - Session storage
 * - IndexedDB data
 * - Service worker cache
 */
export const clearAppCache = async (): Promise<void> => {
  try {
    // Clear local storage
    localStorage.clear();

    // Clear session storage
    sessionStorage.clear();

    // Clear IndexedDB
    const databases = await window.indexedDB.databases();
    databases.forEach(db => {
      if (db.name) {
        window.indexedDB.deleteDatabase(db.name);
      }
    });

    // Clear service worker caches
    if ('caches' in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys.map(key => caches.delete(key))
      );
    }

    // Clear application state
    // Note: This should be handled by the calling component using Redux actions

    console.log('Application cache cleared successfully');
  } catch (error) {
    console.error('Error clearing application cache:', error);
    throw new Error('Failed to clear application cache');
  }
};
