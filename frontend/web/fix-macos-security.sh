#!/bin/bash

# Timely Mate macOS Security Fix Script
# This script helps bypass macOS security warnings for the Timely Mate app

echo "🔧 Timely Mate macOS Security Fix"
echo "================================="
echo ""

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script is only for macOS systems."
    exit 1
fi

# Function to fix app security
fix_app_security() {
    local app_path="$1"
    local app_name=$(basename "$app_path")
    
    echo "🔍 Processing: $app_name"
    
    # Remove quarantine attribute
    echo "   Removing quarantine attribute..."
    xattr -d com.apple.quarantine "$app_path" 2>/dev/null || echo "   Quarantine attribute not found"
    
    # Add to accessibility permissions (if needed)
    echo "   Adding accessibility permissions..."
    sudo spctl --add "$app_path" 2>/dev/null || echo "   Could not add to accessibility permissions"
    
    echo "   ✅ Security fix applied to $app_name"
    echo ""
}

# Find Timely Mate apps
echo "🔍 Looking for Timely Mate applications..."
echo ""

# Check for apps in common locations
app_locations=(
    "/Applications/Timely Mate.app"
    "$HOME/Applications/Timely Mate.app"
    "$(pwd)/dist-electron/mac/Timely Mate.app"
    "$(pwd)/dist-electron/mac-arm64/Timely Mate.app"
)

found_apps=()

for location in "${app_locations[@]}"; do
    if [[ -d "$location" ]]; then
        found_apps+=("$location")
        echo "✅ Found: $location"
    fi
done

if [[ ${#found_apps[@]} -eq 0 ]]; then
    echo "❌ No Timely Mate applications found."
    echo ""
    echo "Please make sure you have:"
    echo "1. Downloaded the Timely Mate DMG file"
    echo "2. Opened the DMG and dragged the app to Applications"
    echo "3. Or extracted the app to a known location"
    echo ""
    echo "If you have the app in a different location, please run:"
    echo "xattr -d com.apple.quarantine '/path/to/Timely Mate.app'"
    exit 1
fi

echo ""
echo "🔧 Applying security fixes..."
echo ""

# Apply fixes to all found apps
for app in "${found_apps[@]}"; do
    fix_app_security "$app"
done

echo "🎉 Security fixes completed!"
echo ""
echo "📋 Additional steps if the app still won't open:"
echo ""
echo "1. Right-click on the Timely Mate app"
echo "2. Select 'Open' from the context menu"
echo "3. Click 'Open' in the security dialog"
echo ""
echo "4. Or go to System Preferences > Security & Privacy"
echo "5. Click 'Open Anyway' next to the Timely Mate message"
echo ""
echo "5. Alternative: Run this command in Terminal:"
echo "   sudo spctl --master-disable"
echo "   (Re-enable with: sudo spctl --master-enable)"
echo ""
echo "✨ The app should now open without security warnings!"
















