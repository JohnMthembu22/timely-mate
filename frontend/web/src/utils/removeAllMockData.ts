/**
 * Utility for data management in the application
 * 
 * NOTE: All mock data has been permanently removed from the application.
 * This utility now only provides methods for clearing application data.
 */

import { store } from '../store';
import { logout } from '../store/slices/authSlice';

/**
 * Clears all application data and resets the application state
 */
export const clearAllAppData = () => {
  console.log('🧹 Starting complete data reset...');
  
  // 1. Clear all localStorage data
  const keys = Object.keys(localStorage);
  console.log(`Found ${keys.length} items in localStorage`);
  
  keys.forEach(key => {
    console.log(`Removing: ${key}`);
    localStorage.removeItem(key);
  });
  
  console.log('✅ All localStorage data cleared');
  
  // 2. Dispatch logout action to reset auth state in Redux
  store.dispatch(logout());
  console.log('✅ Auth state reset');
  
  // 3. Clear any sessionStorage data
  sessionStorage.clear();
  console.log('✅ Session storage cleared');
  
  // 4. Clear any cookies related to the application
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.trim().split('=');
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
  console.log('✅ Cookies cleared');
  
  // 5. Force reload the application
  console.log('🔄 Reloading application...');
  window.location.href = '/';
};

// For backward compatibility with existing code
export const removeAllMockData = clearAllAppData;

// These functions are kept for backward compatibility but now always return true/void
export const shouldHideMockData = (): boolean => true;
export const resetMockDataFlag = (): void => {};

export default clearAllAppData;
