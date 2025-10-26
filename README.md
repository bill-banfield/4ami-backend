# 4AMI Platform Backend MVP

A comprehensive backend system for the 4AMI platform built with NestJS, PostgreSQL, Redis, and Docker.

## Features

### Core Modules
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Admin, Customer Admin, and Customer User roles
- **Project Management**: Create, manage, and track projects
- **Asset Management**: Import, manage, and analyze assets with bulk import
- **Report Generation**: Generate various types of reports with AI integration
- **Email Service**: Send invitations, notifications, and system emails
- **AI Integration**: Process residual analysis and generate insights

### User Roles
- **Admin**: Full system access, manage all users and projects
- **Customer Admin**: Manage users and projects within their organization
- **Customer User**: Access to assigned projects and assets

### Key Workflows
1. **User Onboarding**: Email invitations, signup, and profile setup
2. **Project Management**: Create projects, assign assets, track progress
3. **Asset Import**: Bulk import assets from CSV files
4. **Residual Analysis**: AI-powered analysis of asset residual values
5. **Report Generation**: Automated report creation and export

## Technology Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Queue**: Bull Queue for background jobs
- **Email**: Nodemailer with Handlebars templates
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

#### For Local Development

1. Copy the environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your local configuration (see env.example for details)

### Running with Docker

1. **Security First**: Make sure you've updated your `.env` file with secure values (see Environment Setup above)

2. Start all services:
```bash
docker-compose up -d
```

3. The application will be available at:
- API: http://localhost:3001/api/v1
- API Documentation: http://localhost:3000/api/v1/docs
- Health Check: http://localhost:3000/api/v1/health
- pgAdmin: http://localhost:5050 (admin@4ami.com / your_pgadmin_password)

4. **Important Security Notes**:
   - Never commit `.env` files to version control
   - Use strong, unique passwords for all services
   - Generate a secure JWT secret using `openssl rand -base64 64`
   - Change default pgAdmin credentials

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start PostgreSQL and Redis (using Docker):
```bash
docker-compose up -d postgres redis
```

3. Run the application:
```bash
npm run start:dev
```

## API Documentation

Once the application is running, visit http://localhost:3000/api/v1/docs to access the interactive Swagger documentation.

### Key Endpoints

#### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `GET /auth/profile` - Get current user profile

#### Users
- `GET /users` - List users (Admin/Customer Admin)
- `POST /users` - Create user (Admin/Customer Admin)
- `POST /users/invite` - Send user invitation

#### Projects
- `GET /projects` - List projects
- `POST /projects` - Create project
- `GET /projects/dashboard/stats` - Project statistics

#### Assets
- `GET /assets` - List assets
- `POST /assets` - Create asset
- `POST /assets/bulk-import` - Bulk import assets from CSV
- `GET /assets/form` - Get asset form fields

#### Reports
- `GET /reports` - List reports
- `POST /reports/generate/:projectId` - Generate report
- `GET /reports/:id/download` - Download report

#### AI
- `POST /ai/residual-analysis` - Process residual analysis
- `GET /ai/job/:jobId` - Get AI job status

## Database Schema

The application uses the following main entities:
- **Users**: User accounts with roles and permissions
- **Projects**: Project management and tracking
- **Assets**: Asset information and metadata
- **ResidualForms**: Form data for residual analysis
- **Reports**: Generated reports and analytics

## Background Jobs

The system uses Bull Queue for processing:
- **Asset Import**: Bulk CSV import processing
- **Report Generation**: PDF report creation
- **Email Sending**: Asynchronous email delivery
- **AI Processing**: Residual analysis and insights

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Environment-based configuration

## Monitoring

- Health check endpoint: `/api/v1/health`
- Docker health checks
- Queue monitoring through Bull Dashboard (can be added)

## License

This project is proprietary software for 4AMI Platform.
