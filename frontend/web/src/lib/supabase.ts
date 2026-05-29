import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseUrl } from '../utils/supabaseEnv';

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

// Check if Supabase is configured
const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '');

if (!supabaseConfigured) {
  console.warn(
    'Supabase credentials not found. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file. Supabase features will be disabled.'
  );
}

// Create Supabase client only if credentials are provided
// If not configured, create a client with a valid URL format to prevent initialization errors
// The client won't work but won't crash the app
let supabaseInstance: SupabaseClient | null = null;

try {
  if (supabaseConfigured) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
  } else {
    // Create a dummy client with a valid URL format to prevent initialization errors
    // Using a valid Supabase URL format: https://[project-ref].supabase.co
    // This won't work but prevents crashes during initialization
    supabaseInstance = createClient('https://xxxxxxxxxxxxxxxxxxxxx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder');
  }
} catch (error) {
  console.error('Error creating Supabase client:', error);
  // Create a minimal client as fallback
  try {
    supabaseInstance = createClient('https://dummy.supabase.co', 'dummy-key');
  } catch (fallbackError) {
    console.error('Failed to create fallback Supabase client:', fallbackError);
  }
}

export const supabase = supabaseInstance!;

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return supabaseConfigured;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  if (!supabaseConfigured) {
    return null;
  }
  try {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Helper function to get current session
export const getCurrentSession = async () => {
  if (!supabaseConfigured) {
    return null;
  }
  try {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  if (!supabaseConfigured) {
    return false;
  }
  const session = await getCurrentSession();
  return !!session;
};

