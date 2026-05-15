/**
 * Script to clear all application data from localStorage
 * This can be run directly from the browser console
 */

// Make this function available globally
window.clearTimelyMateData = function() {
  console.log('Clearing all Timely Mate data from localStorage...');
  
  // Clear all localStorage data
  localStorage.clear();
  
  console.log('✅ All data has been cleared from localStorage');
  console.log('Reloading application...');
  
  // Force reload the application
  window.location.reload();
};

// Add a message to the console when the script loads
console.log('=== Timely Mate Reset Tool ===');
console.log('To clear all application data and reset to a new user state:');
console.log('Run this command in the console: clearTimelyMateData()');
