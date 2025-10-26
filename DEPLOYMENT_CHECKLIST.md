# Railway Deployment Checklist

## Pre-Deployment Checklist

- [ ] Code is pushed to Git repository
- [ ] All tests are passing locally
- [ ] Environment variables are documented
- [ ] Database schema is ready
- [ ] Docker build works locally

## Railway Setup Checklist

- [ ] Railway account created
- [ ] Project created from Git repository
- [ ] PostgreSQL service added
- [ ] Redis service added (optional)
- [ ] Environment variables configured
- [ ] Custom domain configured (if needed)

## Environment Variables Checklist

### Required Variables
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` (secure random string)
- [ ] `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS`
- [ ] `FRONTEND_URL`
- [ ] `BACKEND_URL`

### Database Variables (Auto-populated by Railway)
- [ ] `DB_HOST=${{Postgres.PGHOST}}`
- [ ] `DB_PORT=${{Postgres.PGPORT}}`
- [ ] `DB_USERNAME=${{Postgres.PGUSER}}`
- [ ] `DB_PASSWORD=${{Postgres.PGPASSWORD}}`
- [ ] `DB_DATABASE=${{Postgres.PGDATABASE}}`

### Optional Variables
- [ ] `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- [ ] `AI_AGENT_URL`, `AI_AGENT_API_KEY`
- [ ] `CORS_ORIGIN`
- [ ] `MAX_FILE_SIZE`

## Post-Deployment Checklist

- [ ] Application is accessible via Railway URL
- [ ] Health check endpoint responds (`/api/v1/health`)
- [ ] API documentation is accessible (`/api/v1/docs`)
- [ ] Database connection is working
- [ ] Email functionality is working
- [ ] File upload is working
- [ ] Authentication is working
- [ ] All API endpoints are responding

## Monitoring Checklist

- [ ] Application logs are visible
- [ ] Error monitoring is set up
- [ ] Performance metrics are tracked
- [ ] Database performance is monitored
- [ ] Backup strategy is in place

## Security Checklist

- [ ] All secrets are in environment variables
- [ ] No sensitive data in code
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Database access is restricted
- [ ] Regular security updates scheduled

## Quick Commands

```bash
# Check deployment status
railway status

# View logs
railway logs

# Run database seeder
railway run npm run seed

# Connect to database
railway connect postgres
```

## Emergency Contacts

- Railway Support: [support@railway.app](mailto:support@railway.app)
- 4AMI Team: [Your team contact]
- Database Admin: [Your DBA contact]
