#!/bin/bash

echo "🚀 Starting Postman collection generation..."
echo ""

# Step 1: Check if dist folder exists
if [ ! -d "dist" ]; then
  echo "📦 Building TypeScript project..."
  npm run build
  if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors and try again."
    exit 1
  fi
  echo "✅ Build completed successfully"
  echo ""
fi

# Step 2: Generate Swagger JSON
echo "📄 Generating Swagger JSON..."
node postman/generate-swagger.js
if [ $? -ne 0 ]; then
  echo "❌ Swagger generation failed"
  exit 1
fi
echo ""

# Step 3: Convert to Postman collection
echo "🔄 Converting Swagger to Postman collection..."
node postman/convert-swagger-to-postman.js
if [ $? -ne 0 ]; then
  echo "❌ Postman conversion failed"
  exit 1
fi
echo ""

echo "🎉 All done! Postman collection and environments are ready to use."
echo ""
echo "📥 Import these files into Postman:"
echo "   - postman/4AMI-Platform-API.postman_collection.json"
echo "   - postman/4AMI-Platform-Development.postman_environment.json"
echo "   - postman/4AMI-Platform-Production.postman_environment.json"
