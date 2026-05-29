/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SOCKET_URL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_AUTH_LOCAL_FALLBACK?: string;
  
  // Application Configuration
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_URL: string;
  
  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_ERROR_REPORTING: string;
  readonly VITE_ENABLE_REAL_TIME_CHAT: string;
  
  // Development Settings
  readonly VITE_DEBUG_MODE: string;
  readonly VITE_LOG_LEVEL: string;
  /** When "true", unlocks all routes/features and hides pricing tier comparison */
  readonly VITE_TESTING_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 