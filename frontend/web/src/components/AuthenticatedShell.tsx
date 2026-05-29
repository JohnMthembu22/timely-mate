import { Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import ClockInGuard from './ClockInGuard';

/**
 * Single auth + clock-in shell for all dashboard routes.
 * Mounts once so navigation does not re-run hydration loaders per page.
 */
const AuthenticatedShell = () => (
  <ProtectedRoute>
    <ClockInGuard>
      <Outlet />
    </ClockInGuard>
  </ProtectedRoute>
);

export default AuthenticatedShell;
