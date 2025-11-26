#!/bin/bash

# Setup script for uploads directory
# Works for both development (Docker) and production (bare metal)

echo "🔧 Setting up uploads directory..."
echo ""

# Create directory structure
echo "📁 Creating directories..."
mkdir -p uploads/projects
mkdir -p uploads/reports

# Set permissions (755 = rwxr-xr-x)
echo "🔐 Setting permissions..."
chmod -R 755 uploads/

# If running on production server, ensure Node.js user has access
if [ "$1" == "production" ]; then
    echo "🚀 Production mode: Setting ownership for current user..."
    # Change to current user (not root)
    chown -R $(whoami):$(whoami) uploads/
    echo "   Owner: $(whoami)"
else
    echo "💻 Development mode: Permissions set for Docker"
fi

echo ""
echo "✅ Uploads directory ready!"
echo ""
echo "Structure:"
tree uploads/ 2>/dev/null || ls -R uploads/
echo ""
echo "Permissions:"
ls -la uploads/

echo ""
echo "📝 Note:"
if [ "$1" == "production" ]; then
    echo "   - For production: Files will be stored in ./uploads/"
    echo "   - Make sure your Node.js process has write access"
    echo "   - Consider using PM2 or systemd service"
else
    echo "   - For Docker: Files are in ./uploads/ (visible on host)"
    echo "   - Container runs as root to avoid permission issues"
fi
