import AppRoutes from './routes';
import { ThemeProvider } from './contexts/ThemeContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { UserStatusProvider } from './contexts/UserStatusContext';
import { EmployeeProvider } from './contexts/EmployeeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import SessionRestoreProvider from './components/SessionRestoreProvider';
import { useElectron, useElectronMenu, useElectronTray } from './hooks/useElectron';
import { useEffect } from 'react';

const AppContent = () => {
  const { isElectron, showNotification } = useElectron();

  // Handle menu actions
  useElectronMenu((action) => {
    switch (action) {
      case 'menu-new-employee':
        // Navigate to HR page and open new employee dialog
        window.location.href = '/hr';
        break;
      case 'menu-import-data':
        // Navigate to appropriate import page
        window.location.href = '/hr';
        break;
      case 'menu-export-report':
        // Trigger export functionality
        showNotification('Export Report', 'Export functionality will be implemented');
        break;
    }
  });

  // Handle tray actions
  useElectronTray(() => {
    // Trigger clock in/out functionality
    showNotification('Clock Action', 'Clock in/out triggered from system tray');
  });

  // Request notification permission on app start
  useEffect(() => {
    if (!isElectron && 'Notification' in window) {
      Notification.requestPermission();
    }
  }, [isElectron]);

  return <AppRoutes />;
};

const App = () => {
  return (
    <SessionRestoreProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <UserStatusProvider>
            <SubscriptionProvider>
              <EmployeeProvider>
                <NotificationProvider>
                  <AppContent />
                  {/* Removed old floating AppStatus */}
                </NotificationProvider>
              </EmployeeProvider>
            </SubscriptionProvider>
          </UserStatusProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </SessionRestoreProvider>
  );
};

export default App;
