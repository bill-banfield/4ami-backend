# Project Creation Email Notifications

## Overview
When a project is created, automatic email notifications are sent to:
1. **System Admins** (all users with ADMIN role)
2. **All Company Admins** (CUSTOMER_ADMIN role) from the project's company

## Implementation Details

### Email Recipients

#### 1. System Admins
- All users in the `users` table with `role = 'ADMIN'`
- Must have `isActive = true`
- Receives notifications for ALL projects across ALL companies
- Multiple system admins are supported

#### 2. Company Admins
- All users with role `CUSTOMER_ADMIN` in the project's company
- Must have `isActive = true`
- Only notified about projects from their own company

### Email Content

The notification email includes:

**Project Details:**
- Project Number (e.g., PROJ-2025-0001)
- Project Name
- Project Type (e.g., Residual Analysis)
- Status (DRAFT, PENDING, etc.)
- Start Date (if provided)
- Description (if provided)

**Company Details:**
- Company Name
- Company Email

**Creator Details:**
- Creator Name
- Creator Email
- Creator Role

**Action Link:**
- Direct link to view the project in the frontend

### Email Template Example

```
Subject: New Project Created: [Project Name] ([Project Number])

New Project Created

A new project has been created on the 4AMI Platform.

Project Details:
- Project Number: PROJ-2025-0001
- Project Name: Buneeon Sand Volvo A4GG Water Truck
- Project Type: Residual Analysis
- Status: DRAFT
- Start Date: 08/15/2024

Company:
- Company Name: ABC Corporation
- Company Email: contact@abc.com

Created By:
- Name: John Doe
- Email: john@abc.com
- Role: CUSTOMER_ADMIN

[View Project Button]
```

## Configuration

### Database Setup

Ensure you have users with ADMIN role in your database:

```sql
-- Check for system admins
SELECT * FROM users WHERE role = 'ADMIN' AND isActive = true;
```

If no ADMIN users exist, create one:

```sql
-- Example: Create a system admin user
INSERT INTO users (id, email, firstName, lastName, role, isActive, createdAt, updatedAt)
VALUES (
  uuid_generate_v4(),
  'admin@4ami.com',
  'System',
  'Admin',
  'ADMIN',
  true,
  NOW(),
  NOW()
);
```

### Environment Variables

Only the frontend URL is required (for email links):

```bash
# Frontend URL (for email links)
FRONTEND_URL=https://4ami-mu.vercel.app
```

## Technical Implementation

### 1. Email Service Method

**Location:** `src/modules/email/email.service.ts`

```typescript
async sendProjectCreationNotification(
  project: any,
  creator: User,
  company: Company,
  recipients: string[],
): Promise<{ jobId: string; message: string }>
```

### 2. Email Processor Handler

**Location:** `src/modules/email/processors/email.processor.ts`

```typescript
@Process('send-project-creation-notification')
async handleSendProjectCreationNotification(job: Job<{...}>)
```

### 3. Projects Service Integration

**Location:** `src/modules/projects/projects.service.ts`

The notification is sent asynchronously after project creation:

```typescript
// In create() method
const fullProject = await this.findOne(savedProject.id, userId, user.role);

// Send email notifications asynchronously (don't block the response)
this.sendProjectCreationNotifications(fullProject, user).catch((error) => {
  console.error('Failed to send project creation notifications:', error);
  // Don't fail the project creation if email fails
});

return fullProject;
```

### 4. Recipient Resolution Logic

```typescript
private async sendProjectCreationNotifications(project: Project, creator: User) {
  // 1. Get all system admins (users with ADMIN role)
  const systemAdmins = await this.userRepository.find({
    where: {
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  // 2. Get all CUSTOMER_ADMIN users from project's company
  const companyAdmins = await this.userRepository.find({
    where: {
      companyId: project.companyId,
      role: UserRole.CUSTOMER_ADMIN,
      isActive: true,
    },
  });

  // 3. Combine and deduplicate
  const uniqueRecipients = [...new Set([...systemAdminEmails, ...companyAdminEmails])];

  // 4. Send notification
  await this.emailService.sendProjectCreationNotification(...);
}
```

## Important Notes

### Non-Blocking Execution
- Email sending does **NOT** block project creation
- If email fails, project creation still succeeds
- Errors are logged but don't propagate to the client

### Queue-Based Processing
- Emails are queued using Bull/Redis
- Processed asynchronously by email processor
- Provides retry mechanism and monitoring

### Error Handling
- Email failures are logged to console
- System continues operation even if email fails
- Queue provides automatic retry for transient failures

## Testing

### 1. Ensure ADMIN Users Exist

Check database:
```sql
SELECT * FROM users WHERE role = 'ADMIN' AND isActive = true;
```

### 2. Create a Test Project

```bash
POST /api/v1/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "projectTypeCode": "residual_analysis",
  "name": "Test Project",
  "startDate": "2024-08-15"
}
```

### 3. Check Logs

Look for console output:
```
📧 EmailService.sendProjectCreationNotification called: {...}
✅ Project creation notifications queued for 3 recipients
```

### 4. Check Email Queue

Monitor Bull queue dashboard or logs:
```
🔄 Email job {id} is now active
✅ Email job {id} completed: {...}
```

## Customization

### Adding More Recipients

To add additional recipient types (e.g., project managers):

1. Update `sendProjectCreationNotifications()` in `projects.service.ts`
2. Add query to fetch additional users
3. Add their emails to the `recipients` array

Example:
```typescript
// Get all project managers from the company
const projectManagers = await this.userRepository.find({
  where: {
    companyId: project.companyId,
    role: UserRole.PROJECT_MANAGER, // If you add this role
    isActive: true,
  },
});
recipients.push(...projectManagers.map(pm => pm.email));
```

### Customizing Email Content

To modify the email template:

1. Edit `handleSendProjectCreationNotification()` in `email.processor.ts`
2. Update the HTML template
3. Add/remove project fields as needed

### Conditional Notifications

To send notifications only for certain conditions:

```typescript
// Only notify for non-DRAFT projects
if (project.status !== ProjectStatus.DRAFT) {
  this.sendProjectCreationNotifications(fullProject, user).catch(...);
}
```

## Monitoring

### Queue Dashboard

If you have Bull Board installed:
```
http://localhost:3000/admin/queues
```

### Log Messages

**Success:**
- `📧 EmailService.sendProjectCreationNotification called:`
- `✅ Project creation notifications queued for N recipients`
- `✅ Email job {id} completed`

**Warnings:**
- `⚠️ No recipients found for project creation notification`
- `⚠️ Company not found for project notification`

**Errors:**
- `❌ Failed to send project creation notifications:`
- `❌ Email job {id} failed:`

## Troubleshooting

### No Emails Received

1. **Check system admins exist:**
   ```sql
   SELECT * FROM users
   WHERE role = 'ADMIN'
   AND isActive = true;
   ```

2. **Check company admins exist:**
   ```sql
   SELECT * FROM users
   WHERE companyId = '{project-company-id}'
   AND role = 'CUSTOMER_ADMIN'
   AND isActive = true;
   ```

3. **Check email configuration:**
   - Verify SMTP settings in `src/config/mail.config.ts`
   - Check AWS SES credentials (if using SES)

4. **Check queue status:**
   - Ensure Redis is running
   - Check Bull queue for failed jobs

### Duplicate Emails

The system automatically deduplicates recipients using `Set`:
```typescript
const uniqueRecipients = [...new Set(recipients)];
```

If still receiving duplicates, check:
- Email processor implementation
- Queue retry settings

### Email Delays

Emails are queued and processed asynchronously:
- Normal delay: 1-5 seconds
- Under load: May take longer
- Check queue backlog in Bull dashboard

## Future Enhancements

1. **Email Preferences:** Allow users to opt-out of project notifications
2. **Digest Mode:** Send daily/weekly digest instead of immediate emails
3. **Custom Templates:** Allow companies to customize email templates
4. **SMS Notifications:** Add SMS option for urgent projects
5. **Slack/Teams Integration:** Send notifications to team channels
6. **Email Analytics:** Track open rates and engagement
