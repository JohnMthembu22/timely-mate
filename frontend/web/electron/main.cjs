const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain, dialog, shell } = require('electron');
const path = require('path');

// Keep a global reference of the window object
let mainWindow;
let tray;

// App metadata
const APP_NAME = 'Timely Mate';
const APP_VERSION = '1.0.0';

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_IS_DEV === 'true';

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs'),
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false,
    frame: true,
    title: APP_NAME,
    webSecurity: !isDev
  });

  // Load the app
  let appUrl;
  if (isDev) {
    // For development, try to find an active dev server
    const ports = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009];
    appUrl = 'http://localhost:3000'; // Default fallback
    
    // Try to find an active development server
    for (const port of ports) {
      try {
        const http = require('http');
        const req = http.request({
          hostname: 'localhost',
          port: port,
          path: '/',
          method: 'HEAD',
          timeout: 1000
        }, (res) => {
          if (res.statusCode === 200) {
            appUrl = `http://localhost:${port}`;
            console.log(`Found dev server on port ${port}`);
          }
        });
        req.on('error', () => {});
        req.end();
      } catch (e) {}
    }
  } else {
    // For production, always use the built files
    appUrl = `file://${path.join(__dirname, '../dist/index.html')}`;
  }
  
  console.log('isDev:', isDev);
  console.log('Loading URL:', appUrl);
  console.log('Dist path:', path.join(__dirname, '../dist/index.html'));
  
  mainWindow.loadURL(appUrl);

  // Add security headers
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    // Different CSP for development vs production
    const csp = isDev 
      ? "default-src 'self' 'unsafe-inline' data: blob:; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: blob: https:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' https: ws: wss:; " +
        "media-src 'self' data: blob:; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'; " +
        "frame-ancestors 'none';"
      : "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: blob: https:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' https:; " +
        "media-src 'self' data: blob:; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'; " +
        "frame-ancestors 'none';";

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
        'X-Content-Type-Options': ['nosniff'],
        'X-Frame-Options': ['DENY'],
        'X-XSS-Protection': ['1; mode=block'],
        'Referrer-Policy': ['strict-origin-when-cross-origin']
      }
    });
  });

  // Prevent new window creation
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    // Allow localhost on any port for development
    const isLocalhost = parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1';
    const isFile = parsedUrl.protocol === 'file:';
    
    if (!isLocalhost && !isFile) {
      event.preventDefault();
    }
  });

  // Additional security measures
  mainWindow.webContents.on('new-window', (event) => {
    event.preventDefault();
  });

  // Disable context menu in production
  if (!isDev) {
    mainWindow.webContents.on('context-menu', (event) => {
      event.preventDefault();
    });
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus on the window
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle minimize to tray
  mainWindow.on('minimize', (event) => {
    if (process.platform === 'win32') {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Handle close to tray
  mainWindow.on('close', (event) => {
    if (process.platform === 'win32' && !app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Create system tray
  createTray();
}

function createTray() {
  // Create tray icon
  const trayIcon = nativeImage.createFromPath(
    path.join(__dirname, '../assets/tray-icon.png')
  );
  
  tray = new Tray(trayIcon);
  
  // Set tooltip
  tray.setToolTip(`${APP_NAME} - Employee Management System`);
  
  // Create context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      label: 'Clock In/Out',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
        // Send message to renderer to trigger clock in/out
        mainWindow.webContents.send('tray-clock-action');
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  
  // Handle tray click
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Employee',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-employee');
          }
        },
        {
          label: 'Import Data',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            mainWindow.webContents.send('menu-import-data');
          }
        },
        { type: 'separator' },
        {
          label: 'Export Report',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('menu-export-report');
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Timely Mate',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Timely Mate',
              message: `${APP_NAME} v${APP_VERSION}`,
              detail: 'Employee Management System\n\nBuilt with Electron and React'
            });
          }
        },
        {
          label: 'Visit Website',
          click: () => {
            shell.openExternal('https://timelymate.com');
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: APP_NAME,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers for native features
ipcMain.handle('show-save-dialog', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save File',
    defaultPath: 'timely-mate-export',
    filters: [
      { name: 'Excel Files', extensions: ['xlsx'] },
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'PDF Files', extensions: ['pdf'] }
    ]
  });
  return result;
});

ipcMain.handle('show-open-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open File',
    properties: ['openFile'],
    filters: [
      { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return result;
});

ipcMain.handle('show-notification', async (event, options) => {
  const notification = new Notification(options.title, {
    body: options.body,
    icon: path.join(__dirname, '../assets/icon.png'),
    silent: false
  });
  
  notification.onclick = () => {
    mainWindow.show();
    mainWindow.focus();
  };
  
  notification.show();
});

ipcMain.handle('get-app-version', () => {
  return APP_VERSION;
});

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuiting = true;
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
