# 4AMI Platform - Postman Collection

This directory contains the Postman collection and environment files for the 4AMI Platform API.

## Files

- **4AMI-Platform-API.postman_collection.json** - Complete API collection with all endpoints
- **4AMI-Platform-Development.postman_environment.json** - Development environment configuration
- **4AMI-Platform-Production.postman_environment.json** - Production environment configuration
- **convert-swagger-to-postman.js** - Script to regenerate collection from Swagger

## How to Import into Postman

### Import Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select **4AMI-Platform-API.postman_collection.json**
4. Click **Import**

### Import Environment

1. In Postman, click on **Environments** (left sidebar)
2. Click **Import**
3. Select **4AMI-Platform-Development.postman_environment.json**
4. Repeat for **4AMI-Platform-Production.postman_environment.json** if needed
5. Select the environment you want to use from the dropdown (top right)

## Using the Collection

### 1. Authentication

Before testing protected endpoints, you need to authenticate:

1. Go to **Authentication** folder
2. Run **POST /auth/signin** request
3. The response will contain a JWT token
4. Copy the token from the response
5. Set it in your environment variable `authToken`:
   - Click on the environment (top right)
   - Update the `authToken` value
   - Save

**Pre-configured Admin Credentials (Development):**
- Email: `admin@4ami.com`
- Password: `Admin@123456`

### 2. Auto-Authentication (Recommended)

You can also add a test script to automatically save the token:

1. Open **POST /auth/signin** request
2. Go to **Tests** tab
3. Add this script:

```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("authToken", jsonData.token);
    console.log("Auth token saved:", jsonData.token);
}
```

Now the token will be automatically saved to your environment after login!

### 3. Testing Endpoints

The collection is organized by modules:

- **Health** - Health check endpoints
- **Authentication** - Sign up, sign in, profile, email verification
- **Users** - User management (CRUD, invitations)
- **Projects** - Project management
- **Assets** - Asset management and bulk import
- **Reports** - Report generation and download
- **Email** - Email sending and invitations
- **AI** - AI-powered analysis and insights

## Environment Variables

### Development Environment

| Variable | Value | Description |
|----------|-------|-------------|
| `baseUrl` | `http://localhost:3000/api/v1` | API base URL |
| `authToken` | `` | JWT token (auto-filled after login) |
| `adminEmail` | `admin@4ami.com` | Admin email |
| `adminPassword` | `Admin@123456` | Admin password |

### Production Environment

Update these values for your production environment:

| Variable | Value | Description |
|----------|-------|-------------|
| `baseUrl` | `https://your-domain.com/api/v1` | Production API URL |
| `authToken` | `` | JWT token (auto-filled after login) |
| `adminEmail` | `` | Production admin email |
| `adminPassword` | `` | Production admin password |

## Regenerating Collection

If the API changes, you can regenerate the Postman collection:

```bash
# Make sure your app is running
npm run start:dev

# Run the conversion script
cd postman
node convert-swagger-to-postman.js
```

This will fetch the latest Swagger documentation and regenerate all Postman files.

## Tips

1. **Use Variables**: The collection uses `{{baseUrl}}` and `{{authToken}}` variables for easy switching between environments

2. **Bearer Token**: Most endpoints require authentication. The collection is configured to use the `authToken` environment variable automatically

3. **Test Scripts**: Add test scripts to automatically validate responses and extract data

4. **Pre-request Scripts**: Use pre-request scripts for dynamic data generation

5. **Folders**: Endpoints are organized by tags/modules for easy navigation

## API Documentation

Full API documentation is available at:
- Development: http://localhost:3000/api/v1/docs
- Production: https://your-domain.com/api/v1/docs

## Support

For issues or questions, please refer to the main project README or contact the development team.
