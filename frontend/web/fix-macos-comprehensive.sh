#!/bin/bash

# Comprehensive Timely Mate macOS Fix Script
# This script addresses multiple potential issues with the Timely Mate app

echo "🔧 Timely Mate Comprehensive macOS Fix"
echo "====================================="
echo ""

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script is only for macOS systems."
    exit 1
fi

# Function to fix app security and permissions
fix_app_comprehensive() {
    local app_path="$1"
    local app_name=$(basename "$app_path")
    
    echo "🔍 Processing: $app_name"
    echo "   Path: $app_path"
    
    # Check if app exists
    if [[ ! -d "$app_path" ]]; then
        echo "   ❌ App not found at $app_path"
        return 1
    fi
    
    # Remove all quarantine attributes recursively
    echo "   Removing quarantine attributes..."
    xattr -rd com.apple.quarantine "$app_path" 2>/dev/null || echo "   No quarantine attributes found"
    
    # Remove other security attributes
    echo "   Removing security attributes..."
    xattr -rd com.apple.metadata:kMDItemWhereFroms "$app_path" 2>/dev/null || echo "   No metadata attributes found"
    
    # Fix permissions
    echo "   Fixing permissions..."
    chmod -R 755 "$app_path"
    
    # Make executable
    echo "   Making executable..."
    chmod +x "$app_path/Contents/MacOS/Timely Mate" 2>/dev/null || echo "   Executable not found"
    
    # Check code signing
    echo "   Checking code signing..."
    codesign -dv "$app_path" 2>&1 | head -3
    
    # Check Gatekeeper status
    echo "   Checking Gatekeeper status..."
    spctl -a -v "$app_path" 2>&1 | head -2
    
    echo "   ✅ Comprehensive fix applied to $app_name"
    echo ""
}

# Function to check system requirements
check_system_requirements() {
    echo "🔍 Checking System Requirements"
    echo "==============================="
    
    # Check macOS version
    local macos_version=$(sw_vers -productVersion)
    echo "macOS Version: $macos_version"
    
    # Check architecture
    local arch=$(uname -m)
    echo "Architecture: $arch"
    
    # Check if we have the right app for the architecture
    if [[ "$arch" == "arm64" ]]; then
        echo "⚠️  You're on Apple Silicon. Make sure you're using the ARM64 version."
    else
        echo "✅ You're on Intel. Using the Intel version."
    fi
    
    echo ""
}

# Function to provide manual steps
provide_manual_steps() {
    echo "📋 Manual Steps to Try"
    echo "======================"
    echo ""
    echo "1. **Right-Click Method**:"
    echo "   - Right-click on Timely Mate in Applications"
    echo "   - Select 'Open' from context menu"
    echo "   - Click 'Open' in security dialog"
    echo ""
    echo "2. **System Preferences Method**:"
    echo "   - Go to System Preferences > Security & Privacy"
    echo "   - Look for Timely Mate in the 'General' tab"
    echo "   - Click 'Open Anyway' if it appears"
    echo ""
    echo "3. **Terminal Method**:"
    echo "   - Open Terminal"
    echo "   - Run: open '/Applications/Timely Mate.app'"
    echo ""
    echo "4. **Disable Gatekeeper Temporarily**:"
    echo "   - Run: sudo spctl --master-disable"
    echo "   - Try opening the app"
    echo "   - Re-enable with: sudo spctl --master-enable"
    echo ""
    echo "5. **Check Console for Errors**:"
    echo "   - Open Console app"
    echo "   - Look for Timely Mate errors"
    echo "   - Check for crash reports"
    echo ""
}

# Main execution
main() {
    check_system_requirements
    
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
        echo "1. Downloaded the correct DMG file for your Mac"
        echo "2. Opened the DMG and dragged the app to Applications"
        echo "3. Or extracted the app to a known location"
        exit 1
    fi
    
    echo ""
    echo "🔧 Applying comprehensive fixes..."
    echo ""
    
    # Apply fixes to all found apps
    for app in "${found_apps[@]}"; do
        fix_app_comprehensive "$app"
    done
    
    echo "🎉 Comprehensive fixes completed!"
    echo ""
    
    provide_manual_steps
    
    echo "🚀 Try opening the app now!"
    echo "   If it still doesn't work, try the manual steps above."
    echo ""
    echo "💡 Pro tip: Check the Console app for detailed error messages"
    echo "   if the app crashes or won't start."
}

# Run main function
main
















