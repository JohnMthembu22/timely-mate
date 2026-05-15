#!/bin/bash

echo "🚀 Timely Mate - Electron Build Script"
echo "====================================="

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building web assets..."
npm run build

echo ""
echo "⚡ Building Electron app..."
npm run electron-build

echo ""
echo "📱 Creating installers..."
npm run electron-dist

echo ""
echo "✅ Build complete! Check the dist-electron folder for your installers."
echo ""
echo "📁 Generated files:"
ls -la dist-electron/

echo ""
echo "🎉 Your Timely Mate desktop app is ready!"
