# 🚀 Timely Mate - Desktop Application

Timely Mate is now available as a native desktop application for Windows, macOS, and Linux using Electron!

## 📦 Features

### 🖥️ **Native Desktop Features**
- **System Tray Integration**: Minimize to tray, quick access to clock in/out
- **Native Notifications**: System-level notifications for important events
- **File System Access**: Import/export data with native file dialogs
- **Menu Integration**: Native application menus with keyboard shortcuts
- **Auto-updater**: Automatic updates (configurable)

### 🎨 **Cross-Platform Support**
- **Windows**: NSIS installer with Start Menu and Desktop shortcuts
- **macOS**: DMG installer with proper code signing support
- **Linux**: AppImage for universal compatibility

### 🔧 **Developer Features**
- **Hot Reload**: Development mode with live reloading
- **DevTools**: Built-in developer tools for debugging
- **Source Maps**: Full debugging support

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Development Setup

1. **Clone and Install Dependencies**
```bash
git clone <repository-url>
cd timely-mate-3/frontend/web
npm install
```

2. **Run Development Mode**
```bash
# Start web development server + Electron
npm run electron-dev

# Or run them separately
npm run dev          # Web server only
npm run electron     # Electron only
```

3. **Build for Production**
```bash
# Build web assets + create Electron app
npm run electron-build

# Create distributables (installers)
npm run electron-dist

# Build for specific platforms
npm run electron-pack-all  # All platforms
npm run electron-pack      # Current platform only
```

## 📁 Project Structure

```
frontend/web/
├── electron/
│   ├── main.js          # Main Electron process
│   └── preload.js       # Secure IPC bridge
├── assets/
│   ├── icon.svg         # Source icon
│   ├── icon.png         # App icon (512x512)
│   ├── tray-icon.png    # Tray icon (32x32)
│   ├── icon.ico         # Windows icon
│   ├── icon.icns        # macOS icon
│   └── entitlements.mac.plist  # macOS permissions
├── src/
│   ├── hooks/
│   │   └── useElectron.ts    # Electron integration hook
│   └── App.tsx              # Main app with Electron features
└── package.json             # Electron build configuration
```

## 🎯 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run electron-dev` | Start development mode (web + Electron) |
| `npm run electron` | Run Electron app only |
| `npm run electron-build` | Build production app |
| `npm run electron-dist` | Create installers |
| `npm run electron-pack` | Package app for current platform |
| `npm run electron-pack-all` | Package for all platforms |

## 🔧 Configuration

### Build Configuration (package.json)

The app is configured to build for:
- **Windows**: NSIS installer (x64)
- **macOS**: DMG installer (x64, ARM64)
- **Linux**: AppImage (x64)

### Customization

1. **App Metadata**: Update `package.json` build section
2. **Icons**: Replace files in `assets/` directory
3. **Permissions**: Modify `entitlements.mac.plist` for macOS
4. **Menu**: Edit `electron/main.js` menu template

## 🚀 Building Installers

### Windows
```bash
npm run electron-dist
# Creates: dist-electron/Timely Mate Setup 1.0.0.exe
```

### macOS
```bash
npm run electron-dist
# Creates: dist-electron/Timely Mate-1.0.0.dmg
```

### Linux
```bash
npm run electron-dist
# Creates: dist-electron/Timely Mate-1.0.0.AppImage
```

## 🔒 Security Features

- **Context Isolation**: Secure communication between processes
- **Preload Script**: Safe API exposure to renderer
- **No Node Integration**: Renderer runs in secure context
- **CSP Headers**: Content Security Policy enabled

## 📱 Native Features Integration

### System Tray
- Minimize to tray
- Quick clock in/out
- Context menu with common actions

### Notifications
- Native system notifications
- Click to focus app
- Customizable notification settings

### File Operations
- Native file dialogs
- Drag & drop support
- File association (optional)

### Menu Integration
- Native application menus
- Keyboard shortcuts
- Platform-specific behaviors

## 🐛 Troubleshooting

### Common Issues

1. **App won't start**
   - Check Node.js version (18+ required)
   - Clear node_modules and reinstall
   - Verify all dependencies installed

2. **Build fails**
   - Check available disk space
   - Verify icon files exist
   - Check platform-specific requirements

3. **Icons not showing**
   - Ensure icon files are in correct format
   - Check file paths in package.json
   - Verify icon dimensions

### Debug Mode

Enable debug mode for troubleshooting:
```bash
DEBUG=electron* npm run electron-dev
```

## 📋 Distribution Checklist

Before distributing your app:

- [ ] Test on target platforms
- [ ] Verify all features work offline
- [ ] Check file permissions
- [ ] Test installer creation
- [ ] Verify app signing (macOS)
- [ ] Test auto-updater (if enabled)
- [ ] Check system requirements

## 🔄 Updates & Maintenance

### Auto-Updater Setup
To enable automatic updates, configure:
- Update server endpoint
- Code signing certificates
- Update channels

### Version Management
- Update version in `package.json`
- Tag releases in Git
- Document changes in CHANGELOG

## 📞 Support

For issues related to:
- **Electron**: Check [Electron Documentation](https://electronjs.org/docs)
- **Build Issues**: Check [electron-builder Documentation](https://www.electron.build/)
- **App Features**: Check Timely Mate documentation

## 🎉 Success!

Your Timely Mate app is now ready for desktop distribution! 

Run `npm run electron-dev` to see it in action, or `npm run electron-dist` to create installers for your users.
