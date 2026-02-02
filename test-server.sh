#!/bin/bash

echo "Testing Scorer App Server..."
echo ""

# Check if port 3001 is in use
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Port 3001 is in use (server is running)"
else
    echo "❌ Port 3001 is free (server is NOT running)"
    echo "   Start server with: npm run dev"
    exit 1
fi

# Test if server responds
echo ""
echo "Testing server response..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/login 2>/dev/null)

if [ "$response" = "200" ]; then
    echo "✅ Server is responding (HTTP $response)"
else
    echo "❌ Server not responding properly (HTTP $response)"
    echo "   Check if server is running: npm run dev"
    exit 1
fi

echo ""
echo "✅ Server is working correctly!"
echo "   Open http://localhost:3001 in your browser"










