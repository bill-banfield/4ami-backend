#!/bin/bash

# Fix uploads directory permissions for Docker container
# The container runs as user nestjs with UID 1001

echo "Fixing uploads directory permissions..."

# Create directory structure
mkdir -p uploads/projects
mkdir -p uploads/reports

# Change ownership to match container user (UID 1001)
sudo chown -R 1001:1001 uploads/

# Set proper permissions
sudo chmod -R 755 uploads/

echo "✅ Uploads directory permissions fixed!"
echo "   Owner: UID 1001 (nestjs user in container)"
echo "   Permissions: 755"
echo ""
echo "You can now upload files through the API."
