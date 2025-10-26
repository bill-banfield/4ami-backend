# Railway Database Connection Fix

## Issue
Your application is failing to connect to PostgreSQL with the error:
```
password authentication failed for user "4ami_user"
```

## Root Cause
The application is using hardcoded database credentials instead of Railway's automatically generated PostgreSQL credentials.

## Solution

### Step 1: Check Your Railway PostgreSQL Service
1. Go to your Railway project dashboard
2. Click on your **Postgres** service
3. Go to the **Variables** tab
4. Note down the actual database credentials provided by Railway

### Step 2: Set Environment Variables in Railway
In your **4ami-backend** service, go to **Variables** tab and set:

```bash
# Use Railway's PostgreSQL template variables
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_DATABASE=${{Postgres.PGDATABASE}}
```

### Step 3: Alternative - Use Direct Environment Variables
If the template variables don't work, use the actual values from your PostgreSQL service:

```bash
# Get these values from your PostgreSQL service variables
DB_HOST=your-actual-postgres-host
DB_PORT=5432
DB_USERNAME=your-actual-username
DB_PASSWORD=your-actual-password
DB_DATABASE=your-actual-database-name
```

### Step 4: Required Environment Variables
Make sure you also have these set:

```bash
# Application
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key

# Email (required)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=noreply@4ami.com

# URLs
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-railway-app.railway.app
```

### Step 5: Redeploy
1. Save the environment variables
2. Railway will automatically redeploy your application
3. Check the logs to ensure the database connection is successful

## Verification
After deployment, check:
1. Application logs show successful database connection
2. Health check endpoint responds: `https://your-app.railway.app/api/v1/health`
3. API documentation is accessible: `https://your-app.railway.app/api/v1/docs`

## Common Issues
- **Template variables not working**: Use actual values from PostgreSQL service
- **Still getting auth errors**: Double-check the username/password values
- **Connection timeout**: Ensure PostgreSQL service is running and accessible

## Need Help?
- Check Railway documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
