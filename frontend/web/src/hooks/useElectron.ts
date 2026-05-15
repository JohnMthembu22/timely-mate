import { useEffect, useCallback } from 'react';

// Type definitions for Electron API
declare global {
  interface Window {
    electronAPI?: {
      showSaveDialog: () => Promise<{ canceled: boolean; filePath?: string }>;
      showOpenDialog: () => Promise<{ canceled: boolean; filePaths?: string[] }>;
      showNotification: (options: { title: string; body: string }) => Promise<void>;
      getAppVersion: () => Promise<string>;
      onMenuAction: (callback: (event: any, action: string) => void) => void;
      onTrayAction: (callback: (event: any) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
    platform?: {
      isElectron: boolean;
      platform: string;
      isMac: boolean;
      isWindows: boolean;
      isLinux: boolean;
    };
  }
}

export const useElectron = () => {
  const isElectron = window.electronAPI !== undefined;
  const platform = window.platform;

  const showSaveDialog = useCallback(async () => {
    if (!isElectron) {
      // Fallback for web version
      return { canceled: true };
    }
    return await window.electronAPI!.showSaveDialog();
  }, [isElectron]);

  const showOpenDialog = useCallback(async () => {
    if (!isElectron) {
      // Fallback for web version
      return { canceled: true };
    }
    return await window.electronAPI!.showOpenDialog();
  }, [isElectron]);

  const showNotification = useCallback(async (title: string, body: string) => {
    if (!isElectron) {
      // Fallback for web version - use browser notifications
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
      return;
    }
    await window.electronAPI!.showNotification({ title, body });
  }, [isElectron]);

  const getAppVersion = useCallback(async () => {
    if (!isElectron) {
      return '1.0.0'; // Fallback version
    }
    return await window.electronAPI!.getAppVersion();
  }, [isElectron]);

  return {
    isElectron,
    platform,
    showSaveDialog,
    showOpenDialog,
    showNotification,
    getAppVersion,
  };
};

export const useElectronMenu = (onMenuAction: (action: string) => void) => {
  const isElectron = window.electronAPI !== undefined;

  useEffect(() => {
    if (!isElectron) return;

    const handleMenuAction = (event: any, action: string) => {
      onMenuAction(action);
    };

    window.electronAPI!.onMenuAction(handleMenuAction);

    return () => {
      window.electronAPI!.removeAllListeners('menu-new-employee');
      window.electronAPI!.removeAllListeners('menu-import-data');
      window.electronAPI!.removeAllListeners('menu-export-report');
    };
  }, [isElectron, onMenuAction]);
};

export const useElectronTray = (onTrayAction: () => void) => {
  const isElectron = window.electronAPI !== undefined;

  useEffect(() => {
    if (!isElectron) return;

    const handleTrayAction = () => {
      onTrayAction();
    };

    window.electronAPI!.onTrayAction(handleTrayAction);

    return () => {
      window.electronAPI!.removeAllListeners('tray-clock-action');
    };
  }, [isElectron, onTrayAction]);
};
