/**
 * Utility to completely reset the application state
 * This will clear all localStorage data and reset the application to its initial state
 */

export const resetApp = () => {
  console.log('Clearing all application data...');
  
  // Clear all localStorage data
  localStorage.clear();
  console.log('✓ localStorage cleared');
  
  // Force reload the application
  console.log('Reloading application...');
  window.location.href = '/';
};

export default resetApp;
