# 4AMI Backend Makefile
# Common development and deployment commands

.PHONY: help install build start stop restart logs clean test lint format docker-build docker-up docker-down docker-logs

# Default target
help: ## Show this help message
	@echo "4AMI Backend - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development Commands
install: ## Install dependencies
	npm install

build: ## Build the application
	npm run build

start: ## Start the application in development mode
	npm run start:dev

start-prod: ## Start the application in production mode
	npm run start:prod

stop: ## Stop the application
	pkill -f "nest start" || true

restart: stop start ## Restart the application

# Testing Commands
test: ## Run tests
	npm run test

test-watch: ## Run tests in watch mode
	npm run test:watch

test-cov: ## Run tests with coverage
	npm run test:cov

test-e2e: ## Run end-to-end tests
	npm run test:e2e

# Code Quality Commands
lint: ## Run ESLint
	npm run lint

format: ## Format code with Prettier
	npm run format

# Docker Commands
docker-build: ## Build Docker image
	docker-compose build

docker-up: ## Start all services with Docker Compose
	docker compose up -d

logs: ## Start all services with logs
	docker compose up

docker-down: ## Stop all services
	docker compose down

docker-restart: ## Restart all services
	docker compose restart

docker-logs: ## View logs for all services
	docker compose logs -f

docker-logs-app: ## View application logs
	docker compose logs -f app

docker-logs-db: ## View database logs
	docker compose logs -f postgres

docker-logs-redis: ## View Redis logs
	docker compose logs -f redis

docker-logs-pgadmin: ## View pgAdmin logs
	docker compose logs -f pgadmin

# Database Commands
db-reset: ## Reset database (WARNING: This will delete all data)
	docker compose down -v
	docker compose up -d postgres
	sleep 10
	docker compose up -d

db-migrate: ## Run database migrations
	npm run typeorm:migration:run

db-migrate-generate: ## Generate new migration
	npm run typeorm:migration:generate

db-seed: ## Seed database with sample data
	npm run seed

db-seed-clear: ## Clear seeded data
	npm run seed:clear

# Utility Commands
clean: ## Clean build artifacts and node_modules
	rm -rf dist/
	rm -rf node_modules/
	rm -rf coverage/
	rm -rf .nyc_output/

clean-docker: ## Clean Docker containers and volumes
	docker compose down -v
	docker system prune -f

logs: ## View application logs (if running locally)
	tail -f logs/*.log || echo "No log files found"

# Environment Setup
env-setup: ## Copy environment file
	cp env.example .env
	@echo "Environment file created. Please update .env with your configuration."

# Health Check
health: ## Check application health
	curl -f http://localhost:3000/api/v1/health || echo "Application is not running"

# Development Workflow
dev-setup: env-setup install ## Setup development environment
	@echo "Development environment setup complete!"
	@echo "1. Update .env file with your configuration"
	@echo "2. Run 'make docker-up' to start services"
	@echo "3. Run 'make start' to start the application"

dev-reset: clean docker-down docker-up ## Reset development environment
	@echo "Development environment reset complete!"

# Production Commands
prod-build: ## Build for production
	docker compose -f docker-compose.yml build --no-cache

prod-deploy: ## Deploy to production
	docker compose -f docker-compose.yml up -d

# Monitoring Commands
status: ## Check status of all services
	docker compose ps

monitor: ## Monitor all services
	watch -n 2 'docker compose ps'

# Backup Commands
backup-db: ## Backup database
	docker-compose exec postgres pg_dump -U 4ami_user 4ami_db > backup_$(shell date +%Y%m%d_%H%M%S).sql

restore-db: ## Restore database from backup (usage: make restore-db BACKUP_FILE=backup.sql)
	docker-compose exec -T postgres psql -U 4ami_user 4ami_db < $(BACKUP_FILE)

# Quick Commands
quick-start: docker-up start ## Quick start (Docker + local app)
	@echo "Quick start complete! Application should be running on http://localhost:3000"

quick-stop: docker-down stop ## Quick stop (Docker + local app)
	@echo "All services stopped!"

# API Documentation
docs: ## Open API documentation
	@echo "Opening API documentation..."
	@echo "API Docs: http://localhost:3000/api/v1/docs"
	@echo "Health Check: http://localhost:3000/api/v1/health"

# Service URLs
urls: ## Show service URLs
	@echo "Service URLs:"
	@echo "API: http://localhost:3000/api/v1"
	@echo "API Docs: http://localhost:3000/api/v1/docs"
	@echo "Health: http://localhost:3000/api/v1/health"
	@echo "pgAdmin: http://localhost:5050"
	@echo "PostgreSQL: localhost:5432"
	@echo "Redis: localhost:6379"
