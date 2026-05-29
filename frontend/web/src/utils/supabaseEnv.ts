/** Supabase URL/key from Vite build env or runtime `public/env-config.js`. */
declare global {
  interface Window {
    ENV?: Record<string, string | undefined>;
  }
}

function readEnv(key: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'): string {
  const fromVite = import.meta.env[key];
  if (fromVite && String(fromVite).trim() !== '') {
    return String(fromVite).trim();
  }
  if (typeof window !== 'undefined') {
    const fromRuntime = window.ENV?.[key];
    if (fromRuntime && String(fromRuntime).trim() !== '') {
      return String(fromRuntime).trim();
    }
  }
  return '';
}

export function getSupabaseUrl(): string {
  return readEnv('VITE_SUPABASE_URL');
}

export function getSupabaseAnonKey(): string {
  return readEnv('VITE_SUPABASE_ANON_KEY');
}

export const isSupabaseAuthEnabled = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return !!(url && key);
};
