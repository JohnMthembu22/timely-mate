/**
 * Script to clear all demo data from localStorage
 * Run this script before starting the application to test as a new user
 */

// Function to clear all Timely Mate related data from localStorage
function clearDemoData() {
  if (typeof localStorage === 'undefined') {
    console.error('localStorage is not available in this environment');
    return;
  }
  
  // Clear authentication data
  localStorage.removeItem('timelymate_token');
  localStorage.removeItem('timelymate_user');
  
  // Clear any other application data that might be stored
  const keysToRemove = [];
  
  // Find all keys that start with 'timelymate_'
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('timelymate_')) {
      keysToRemove.push(key);
    }
  }
  
  // Remove all identified keys
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  console.log('✅ All demo data has been cleared from localStorage');
}

// Execute the function
clearDemoData();

console.log('🚀 You can now start the application to test as a new user');
console.log('   Run: npm run dev');
