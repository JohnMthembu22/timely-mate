/**
 * Utility to clear all demo data from localStorage
 */
export const clearDemoData = () => {
  // Clear authentication data
  localStorage.removeItem('timelymate_token');
  localStorage.removeItem('timelymate_user');
  
  // Clear any other application data that might be stored
  const keysToRemove: string[] = [];
  
  // Find all keys that start with 'timelymate_'
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('timelymate_')) {
      keysToRemove.push(key);
    }
  }
  
  // Remove all identified keys
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  console.log('All demo data has been cleared from localStorage');
};

export default clearDemoData;
