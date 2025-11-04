#!/bin/bash

echo "Switching from Docker volume to local bind mount..."
echo ""

# Step 1: Stop containers
echo "1. Stopping containers..."
docker compose down

# Step 2: Create local directories
echo "2. Creating local directories..."
mkdir -p uploads/projects
mkdir -p uploads/reports

# Step 3: Copy existing files from volume to local
echo "3. Copying existing files from Docker volume..."
docker run --rm \
  -v 4ami-backend_uploads_data:/source \
  -v "$(pwd)/uploads":/destination \
  alpine sh -c "cp -r /source/* /destination/"

# Step 4: Fix permissions for local directories
echo "4. Fixing permissions (requires sudo)..."
sudo chown -R 1001:1001 uploads/
sudo chmod -R 755 uploads/

# Step 5: Update docker-compose.yml
echo "5. Updating docker-compose.yml..."
sed -i 's|- uploads_data:/app/uploads|- ./uploads:/app/uploads|g' docker-compose.yml

# Step 6: Start containers
echo "6. Starting containers..."
docker compose up -d

echo ""
echo "✅ Done! Files are now in ./uploads/ directory"
echo ""
echo "Your files:"
ls -la uploads/projects/
