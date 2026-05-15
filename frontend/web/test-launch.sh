#!/bin/bash

# Test script to try different methods of opening Timely Mate

echo "🧪 Testing Timely Mate Launch Methods"
echo "===================================="
echo ""

# Method 1: Direct open command
echo "1️⃣ Testing direct open command..."
open '/Applications/Timely Mate.app' 2>&1
sleep 2

# Method 2: Try with different flags
echo ""
echo "2️⃣ Testing with --args flag..."
open -a 'Timely Mate' 2>&1
sleep 2

# Method 3: Check if app is running
echo ""
echo "3️⃣ Checking if app is running..."
if pgrep -f "Timely Mate" > /dev/null; then
    echo "✅ Timely Mate is running!"
    echo "Processes:"
    pgrep -f "Timely Mate"
else
    echo "❌ Timely Mate is not running"
fi

echo ""
echo "4️⃣ Checking Console for errors..."
echo "Run this command to check Console:"
echo "log show --predicate 'process == \"Timely Mate\"' --last 5m"

echo ""
echo "5️⃣ Alternative: Try running from Terminal directly..."
echo "Run this command:"
echo "'/Applications/Timely Mate.app/Contents/MacOS/Timely Mate'"
















