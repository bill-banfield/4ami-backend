#!/bin/bash

# 4AMI Backend Development Startup Script
# This script starts the application in development mode with hot reloading

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting 4AMI Backend in Development Mode...${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp env.example .env
    echo -e "${GREEN}✅ .env file created. Please update it with your configuration.${NC}"
fi

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
sudo docker compose down 2>/dev/null || true

# Start development environment
echo -e "${BLUE}🔨 Starting development environment with hot reloading...${NC}"
sudo docker compose -f docker-compose.dev.yml --env-file .env up -d --build

# Wait for application to start
echo -e "${YELLOW}⏳ Waiting for application to start...${NC}"
sleep 10

# Check if application is healthy
echo -e "${BLUE}🔍 Checking application health...${NC}"
if curl -f http://localhost:5000/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is healthy and running in development mode!${NC}"
else
    echo -e "${RED}❌ Application health check failed!${NC}"
    echo -e "${YELLOW}📋 Checking logs...${NC}"
    sudo docker compose -f docker-compose.dev.yml logs app --tail=20
    exit 1
fi

# Show running containers
echo -e "${BLUE}📊 Current container status:${NC}"
sudo docker compose -f docker-compose.dev.yml ps

# Show application info
echo -e "${GREEN}🎉 Development environment is ready!${NC}"
echo -e "${BLUE}📋 Application Information:${NC}"
echo -e "   • API URL: http://localhost:5000/api/v1"
echo -e "   • Health Check: http://localhost:5000/api/v1/health"
echo -e "   • API Documentation: http://localhost:5000/api/v1/docs"
echo -e "   • pgAdmin: http://localhost:5050"

echo -e "${BLUE}🔥 Hot Reloading Enabled:${NC}"
echo -e "   • Changes to TypeScript files will automatically restart the server"
echo -e "   • No need to rebuild containers for code changes"
echo -e "   • Source code is mounted as a volume"

echo -e "${BLUE}🛠️  Useful Commands:${NC}"
echo -e "   • View logs: sudo docker compose -f docker-compose.dev.yml logs -f app"
echo -e "   • Restart app: sudo docker compose -f docker-compose.dev.yml restart app"
echo -e "   • Stop all: sudo docker compose -f docker-compose.dev.yml down"
echo -e "   • Start dev: ./start-dev.sh"
