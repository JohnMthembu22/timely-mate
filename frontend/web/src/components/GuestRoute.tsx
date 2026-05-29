import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';

interface GuestRouteProps {
  children: React.ReactNode;
}

/** For login/signup — redirect authenticated users to the app. */
const GuestRoute = ({ children }: GuestRouteProps) => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';

  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
