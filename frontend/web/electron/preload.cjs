const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  
  // Notifications
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),
  
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Menu actions
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-new-employee', callback);
    ipcRenderer.on('menu-import-data', callback);
    ipcRenderer.on('menu-export-report', callback);
  },
  
  // Tray actions
  onTrayAction: (callback) => {
    ipcRenderer.on('tray-clock-action', callback);
  },
  
  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Add platform detection
contextBridge.exposeInMainWorld('platform', {
  isElectron: true,
  platform: process.platform,
  isMac: process.platform === 'darwin',
  isWindows: process.platform === 'win32',
  isLinux: process.platform === 'linux'
});
