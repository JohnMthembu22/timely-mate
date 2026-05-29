import { useCallback, useState } from 'react';

export interface AppActionState {
  loading: boolean;
  error: string | null;
}

/**
 * Wraps async handlers with loading guard (prevents double submit) and optional error capture.
 */
export function useAppAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
      if (loading) return undefined;
      setLoading(true);
      setError(null);
      try {
        return await fn();
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Action failed';
        setError(message);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const clearError = useCallback(() => setError(null), []);

  return { loading, error, run, clearError, setError };
}
