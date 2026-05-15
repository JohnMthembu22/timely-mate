@echo off
echo 🚀 Timely Mate - Electron Build Script
echo =====================================

echo.
echo 📦 Installing dependencies...
call npm install

echo.
echo 🔨 Building web assets...
call npm run build

echo.
echo ⚡ Building Electron app...
call npm run electron-build

echo.
echo 📱 Creating Windows installer...
call npm run electron-dist

echo.
echo ✅ Build complete! Check the dist-electron folder for your installer.
echo.
pause
