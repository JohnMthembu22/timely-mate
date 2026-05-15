#!/bin/bash

# Icon generation script for Timely Mate
# This script creates the required icon formats for Electron

echo "🎨 Creating Timely Mate App Icons..."

# Create a simple icon using ImageMagick (if available) or provide instructions
if command -v convert &> /dev/null; then
    echo "✅ ImageMagick found - generating icons..."
    
    # Create a simple app icon (512x512)
    convert -size 512x512 xc:'#3B82F6' \
            -fill white \
            -pointsize 200 \
            -gravity center \
            -annotate +0+0 'TM' \
            assets/icon.png
    
    # Create Windows .ico file
    convert assets/icon.png -resize 256x256 assets/icon.ico
    
    # Create macOS .icns file (requires iconutil on macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        mkdir -p assets/icon.iconset
        convert assets/icon.png -resize 16x16 assets/icon.iconset/icon_16x16.png
        convert assets/icon.png -resize 32x32 assets/icon.iconset/icon_16x16@2x.png
        convert assets/icon.png -resize 32x32 assets/icon.iconset/icon_32x32.png
        convert assets/icon.png -resize 64x64 assets/icon.iconset/icon_32x32@2x.png
        convert assets/icon.png -resize 128x128 assets/icon.iconset/icon_128x128.png
        convert assets/icon.png -resize 256x256 assets/icon.iconset/icon_128x128@2x.png
        convert assets/icon.png -resize 256x256 assets/icon.iconset/icon_256x256.png
        convert assets/icon.png -resize 512x512 assets/icon.iconset/icon_256x256@2x.png
        convert assets/icon.png -resize 512x512 assets/icon.iconset/icon_512x512.png
        convert assets/icon.png -resize 1024x1024 assets/icon.iconset/icon_512x512@2x.png
        
        iconutil -c icns assets/icon.iconset -o assets/icon.icns
        rm -rf assets/icon.iconset
        echo "✅ macOS .icns file created"
    else
        echo "⚠️  macOS .icns creation skipped (not on macOS)"
    fi
    
    echo "✅ Icons generated successfully!"
    
else
    echo "⚠️  ImageMagick not found. Creating placeholder icons..."
    
    # Create placeholder files
    echo "Placeholder icon" > assets/icon.png
    echo "Placeholder icon" > assets/icon.ico
    echo "Placeholder icon" > assets/icon.icns
    
    echo "📝 Manual icon creation required:"
    echo "   1. Create a 512x512 PNG icon"
    echo "   2. Convert to .ico for Windows"
    echo "   3. Convert to .icns for macOS"
    echo "   4. Use online tools like:"
    echo "      - https://convertio.co/png-ico/"
    echo "      - https://cloudconvert.com/png-to-icns"
fi

echo "🎯 Icon generation complete!"