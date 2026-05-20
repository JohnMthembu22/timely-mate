import React, { Component, Suspense, type ReactNode } from 'react';
import LoadingScreen from '../LoadingScreen';

function isChunkLoadError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('MIME type')
  );
}

type ChunkBoundaryState = { hasError: boolean };

/** Reload once after deploy when cached index references removed JS chunks. */
class ChunkLoadErrorBoundary extends Component<
  { children: ReactNode },
  ChunkBoundaryState
> {
  state: ChunkBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: unknown): ChunkBoundaryState | null {
    if (isChunkLoadError(error)) {
      return { hasError: true };
    }
    return null;
  }

  componentDidCatch(error: unknown) {
    if (!isChunkLoadError(error)) {
      throw error;
    }
    const reloaded = sessionStorage.getItem('timelymate_chunk_reload');
    if (!reloaded) {
      sessionStorage.setItem('timelymate_chunk_reload', '1');
      window.location.reload();
      return;
    }
    sessionStorage.removeItem('timelymate_chunk_reload');
  }

  render() {
    if (this.state.hasError) {
      return (
        <LoadingScreen message="Updating app… refresh the page if this persists." />
      );
    }
    return this.props.children;
  }
}

/** Wraps lazy-loaded pages so navigation shows feedback while chunks load. */
export function LazyRoute({ children }: { children: ReactNode }) {
  return (
    <ChunkLoadErrorBoundary>
      <Suspense fallback={<LoadingScreen message="Loading page…" />}>
        {children}
      </Suspense>
    </ChunkLoadErrorBoundary>
  );
}

export default LazyRoute;
