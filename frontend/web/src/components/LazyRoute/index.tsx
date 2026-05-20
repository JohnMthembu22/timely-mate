import React, { Suspense } from 'react';
import LoadingScreen from '../LoadingScreen';

/** Wraps lazy-loaded pages so navigation shows feedback while chunks load. */
export function LazyRoute({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingScreen message="Loading page…" />}>{children}</Suspense>;
}

export default LazyRoute;
