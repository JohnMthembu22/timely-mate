/**
 * Utility to clear all jobs from the time tracking screen
 * This will reset the activeJobs state in the TimeTracking component
 */

// We can add Redux store imports here if needed in the future

export const clearJobs = () => {
  console.log('Clearing all job data...');
  
  // Clear jobs from localStorage if they're stored there
  localStorage.removeItem('activeJobs');
  
  // Force reload the application to reset component state
  console.log('Reloading application to reset job state...');
  window.location.href = '/time-tracking';
};

export default clearJobs;
