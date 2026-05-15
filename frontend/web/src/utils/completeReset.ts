/**
 * Complete reset utility for Timely Mate
 * This utility will completely reset the application state,
 * clearing all localStorage data and resetting any Redux store state
 */

// No longer need these imports as we're using clearAllAppData
import { clearAllAppData } from './removeAllMockData';

export const completeReset = () => {
  console.log('🧹 Starting complete application reset...');
  
  // Use the clearAllAppData function from removeAllMockData.ts
  // This ensures consistent behavior between the two reset functions
  clearAllAppData();
};

export default completeReset;
