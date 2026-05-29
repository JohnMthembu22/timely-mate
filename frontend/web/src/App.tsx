import AppRoutes from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { UserStatusProvider } from './contexts/UserStatusContext';
import { EmployeeProvider } from './contexts/EmployeeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import SessionRestoreProvider from './components/SessionRestoreProvider';
import { GuidedTourProvider } from './contexts/GuidedTourContext';
import AuthBootstrap from './components/AuthBootstrap';
import AuthHashRedirect from './components/AuthHashRedirect';
import { useElectron, useElectronMenu, useElectronTray } from './hooks/useElectron';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AppContent = () => {
  const { showNotification } = useElectron();
  const navigate = useNavigate();

  useElectronMenu((action) => {
    switch (action) {
      case 'menu-new-employee':
        navigate('/hr');
        break;
      case 'menu-import-data':
        navigate('/hr');
        break;
      case 'menu-export-report':
        navigate('/reports');
        break;
    }
  });

  useElectronTray(() => {
    showNotification('Clock Action', 'Clock in/out triggered from system tray');
  });

  useEffect(() => {
    const onAuthExpired = () => navigate('/login', { replace: true });
    window.addEventListener('timelymate:auth-expired', onAuthExpired);
    return () => window.removeEventListener('timelymate:auth-expired', onAuthExpired);
  }, [navigate]);

  return (
    <>
      <AuthHashRedirect />
      <AppRoutes />
    </>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <SessionRestoreProvider>
        <AuthBootstrap>
          <ThemeProvider>
            <CurrencyProvider>
              <UserStatusProvider>
                <SubscriptionProvider>
                  <EmployeeProvider>
                    <NotificationProvider>
                      <GuidedTourProvider>
                        <AppContent />
                      </GuidedTourProvider>
                    </NotificationProvider>
                  </EmployeeProvider>
                </SubscriptionProvider>
              </UserStatusProvider>
            </CurrencyProvider>
          </ThemeProvider>
        </AuthBootstrap>
      </SessionRestoreProvider>
    </ErrorBoundary>
  );
};

export default App;
