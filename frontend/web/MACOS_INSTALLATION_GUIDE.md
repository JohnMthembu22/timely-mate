# Timely Mate Desktop App - macOS Installation Guide

## 🚨 macOS Security Warning Fix

If you're getting the error **"The application 'Timely Mate' can't be opened"** on macOS, this is due to Apple's security measures for unsigned applications.

## 🔧 Quick Fix Methods

### Method 1: Use the Security Fix Script (Recommended)
1. Download the `fix-macos-security.sh` script
2. Open Terminal and navigate to the script location
3. Run: `./fix-macos-security.sh`
4. Follow the on-screen instructions

### Method 2: Manual Fix via Terminal
1. Open Terminal
2. Run this command (replace with your actual app path):
   ```bash
   xattr -d com.apple.quarantine "/Applications/Timely Mate.app"
   ```

### Method 3: Right-Click Method
1. Right-click on the Timely Mate app
2. Select "Open" from the context menu
3. Click "Open" in the security dialog that appears

### Method 4: System Preferences Method
1. Go to **System Preferences** > **Security & Privacy**
2. Look for a message about Timely Mate being blocked
3. Click **"Open Anyway"**

### Method 5: Disable Gatekeeper (Not Recommended)
⚠️ **Warning**: This disables macOS security for all apps
```bash
sudo spctl --master-disable
```
To re-enable: `sudo spctl --master-enable`

## 📱 Installation Steps

1. **Download** the appropriate DMG file:
   - `Timely Mate-1.0.0.dmg` (Intel Macs)
   - `Timely Mate-1.0.0-arm64.dmg` (Apple Silicon Macs)

2. **Open** the DMG file by double-clicking it

3. **Drag** the Timely Mate app to your Applications folder

4. **Apply** one of the security fixes above

5. **Launch** the app from Applications or Spotlight

## 🔍 Troubleshooting

### App Still Won't Open?
- Make sure you've applied one of the security fixes above
- Check if you have the correct version for your Mac (Intel vs Apple Silicon)
- Try restarting your Mac after applying fixes

### Permission Errors?
- Make sure you have administrator privileges
- Try running Terminal commands with `sudo` if needed

### App Crashes on Launch?
- Check the Console app for error messages
- Make sure you have the latest macOS version
- Try running from Terminal: `/Applications/Timely\ Mate.app/Contents/MacOS/Timely\ Mate`

## 📞 Support

If you continue to have issues:
1. Check the Console app for detailed error messages
2. Try running the app from Terminal to see error output
3. Make sure your macOS version is compatible (macOS 10.14 or later)

## 🔒 Security Note

The Timely Mate app is safe to use. The security warnings appear because:
- The app is not signed with an Apple Developer certificate
- Apple's Gatekeeper blocks unsigned applications by default
- This is normal for development/distribution apps

The security fixes above only remove the quarantine attribute and don't compromise your system security.
















