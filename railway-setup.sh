#!/bin/bash

# Railway Database Setup Script
echo "🚀 Setting up database for Railway deployment..."

# Run database seeder
echo "📊 Running database seeder..."
npm run seed

echo "✅ Database setup complete!"
