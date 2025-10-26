# Railway Deployment Guide for 4AMI Backend

This guide will help you deploy the 4AMI Backend application to Railway.

## Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app))
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Required environment variables configured

## Step 1: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo" (or your preferred Git provider)
4. Choose your repository containing the 4AMI Backend code

## Step 2: Add Required Services

### PostgreSQL Database
1. In your Railway project, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically provision a PostgreSQL database
4. Note the connection details (they'll be available as environment variables)

### Redis Cache (Optional but Recommended)
1. Click "New Service" again
2. Select "Database" → "Redis"
3. Railway will provision a Redis instance

## Step 3: Configure Environment Variables

In your Railway project settings, add the following environment variables:

### Required Variables
```bash
# Application
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1
CORS_ORIGIN=*

# Database (Railway will auto-populate these from PostgreSQL service)
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_DATABASE=${{Postgres.PGDATABASE}}

# Redis (if using Redis service)
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}

# JWT (REQUIRED - Generate a secure secret)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Email Configuration (REQUIRED)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=noreply@4ami.com

# Application URLs
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-railway-app.railway.app

# AI Agent (if using)
AI_AGENT_URL=https://your-ai-agent-url.com
AI_AGENT_API_KEY=your-ai-agent-api-key
```

### How to Set Environment Variables in Railway

1. Go to your Railway project dashboard
2. Click on your service
3. Go to the "Variables" tab
4. Add each environment variable with its value
5. Click "Deploy" to apply changes

## Step 4: Deploy the Application

1. Railway will automatically detect the `Dockerfile` and start building
2. The build process will:
   - Install dependencies
   - Build the TypeScript application
   - Create a production-ready container
3. Once built, Railway will deploy and start your application

## Step 5: Database Migration and Seeding

After deployment, you may need to run database migrations and seed initial data:

### Option 1: Using Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Connect to your project
railway link

# Run database seeder
railway run npm run seed
```

### Option 2: Using Railway Dashboard
1. Go to your service in Railway dashboard
2. Click on "Deployments"
3. Click on the latest deployment
4. Go to "Logs" tab to monitor the application

## Step 6: Verify Deployment

1. Check the deployment logs in Railway dashboard
2. Visit your application URL (provided by Railway)
3. Test the health endpoint: `https://your-app.railway.app/api/v1/health`
4. Check API documentation: `https://your-app.railway.app/api/v1/docs`

## Step 7: Custom Domain (Optional)

1. In Railway dashboard, go to your service
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Configure DNS records as instructed by Railway

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Railway dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Dockerfile syntax

2. **Database Connection Issues**
   - Verify environment variables are set correctly
   - Check if PostgreSQL service is running
   - Ensure database credentials are correct

3. **Application Won't Start**
   - Check application logs
   - Verify PORT environment variable
   - Ensure all required environment variables are set

4. **Health Check Failures**
   - Verify health check endpoint is accessible
   - Check if application is listening on correct port
   - Review health check configuration

### Logs and Monitoring

- View real-time logs in Railway dashboard
- Monitor application performance
- Set up alerts for critical issues

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive data to Git
   - Use Railway's secure environment variable storage
   - Rotate secrets regularly

2. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Regular backups

3. **Application Security**
   - Keep dependencies updated
   - Use HTTPS in production
   - Implement proper CORS policies

## Cost Optimization

1. **Resource Usage**
   - Monitor CPU and memory usage
   - Scale resources based on actual needs
   - Use Railway's usage dashboard

2. **Database Optimization**
   - Regular cleanup of old data
   - Optimize queries
   - Use connection pooling

## Support

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Community: [discord.gg/railway](https://discord.gg/railway)
- 4AMI Team Support: [Your support contact]

---

**Note**: This deployment guide assumes you're using the provided Dockerfile and configuration files. Make sure to customize the environment variables according to your specific requirements.
