# Project Status Workflow

## Overview

The project creation and submission workflow supports two modes:
1. **Default (No Status)**: Project automatically becomes PENDING (notifications sent) - **This is the default behavior**
2. **Draft Mode**: Explicitly set `status: "draft"` to save for later (no notifications sent)

## Status Flow

```
DRAFT → PENDING → IN_PROGRESS → COMPLETED/CANCELLED
```

## Creating Projects

### POST /api/v1/projects

#### Option 1: Create and Submit Immediately (DEFAULT)

**Request without status field:**
```bash
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectTypeCode": "residual_analysis",
    "name": "My Submitted Project",
    "description": "This is submitted immediately",
    "startDate": "2024-08-15"
  }'
```

**Behavior:**
- Project status: `pending` (automatically set - **DEFAULT**)
- Email notifications: **✅ SENT to system admins and company admins**
- Use case: User has completed all information and wants to submit immediately

#### Option 2: Save as Draft (Explicit)

**Request with status="draft":**
```bash
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectTypeCode": "residual_analysis",
    "name": "My Draft Project",
    "status": "draft",
    "description": "This is a draft project",
    "startDate": "2024-08-15"
  }'
```

**Behavior:**
- Project status: `draft`
- Email notifications: **❌ NOT sent**
- Use case: User wants to save work in progress and submit later

#### Validation

- ✅ **Allowed:** `status: "draft"` or no status field
- ❌ **Rejected:** Any other status value (`"pending"`, `"in_progress"`, `"completed"`, `"cancelled"`)

**Error Response for Invalid Status:**
```json
{
  "statusCode": 400,
  "message": "Only DRAFT status or no status (for immediate submission) is allowed during project creation",
  "error": "Bad Request"
}
```

## Submitting Draft Projects

### POST /api/v1/projects/:id/submit

Convert a draft project to pending status and send notifications.

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/projects/{PROJECT_ID}/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Behavior:**
- Changes status from `draft` → `pending`
- Sends email notifications to system admins and company admins
- Returns the updated project

**Requirements:**
- Project must be in `draft` status
- User must be the project creator or have ADMIN role

**Error Response if Not Draft:**
```json
{
  "statusCode": 400,
  "message": "Cannot submit project. Project is already in pending status. Only DRAFT projects can be submitted.",
  "error": "Bad Request"
}
```

## Email Notifications

### When Notifications Are Sent

Email notifications are sent in these scenarios:
1. **Creating project without status field** → Status becomes `pending` → Emails sent
2. **Submitting a draft project** via `POST /projects/:id/submit` → Status changes to `pending` → Emails sent

### When Notifications Are NOT Sent

Email notifications are **NOT** sent when:
1. Creating project with `status: "draft"`
2. Updating project details (via `PATCH /projects/:id`)
3. Manually changing status (via `PATCH /projects/:id/status`)

### Email Recipients

When notifications are sent, they go to:
1. **All System Admins**: Users with `role = 'ADMIN'` and `isActive = true`
2. **All Company Admins**: Users with `role = 'CUSTOMER_ADMIN'`, same company as project, and `isActive = true`

## Complete Workflow Examples

### Example 1: Draft → Submit Later

**Step 1: Create as Draft**
```bash
POST /api/v1/projects
{
  "projectTypeCode": "residual_analysis",
  "name": "Equipment Analysis Q4 2024",
  "status": "draft",
  "startDate": "2024-10-15"
}
```
**Result:** Project saved as draft, no emails sent.

**Step 2: Update Draft (Optional)**
```bash
PATCH /api/v1/projects/{PROJECT_ID}
{
  "description": "Updated description",
  "client": {
    "clientName": "ABC Corporation",
    "clientEmail": "contact@abc.com"
  }
}
```
**Result:** Project updated, still in draft status, no emails sent.

**Step 3: Submit Draft**
```bash
POST /api/v1/projects/{PROJECT_ID}/submit
```
**Result:** Status changed to pending, emails sent to admins.

### Example 2: Direct Submission

**Step 1: Create and Submit Immediately**
```bash
POST /api/v1/projects
{
  "projectTypeCode": "residual_analysis",
  "name": "Urgent Equipment Analysis",
  "startDate": "2024-10-15",
  "client": {
    "clientName": "ABC Corporation",
    "clientEmail": "contact@abc.com"
  }
}
```
**Result:** Project created with pending status, emails sent immediately.

## API Endpoints Summary

| Endpoint | Method | Purpose | Emails Sent? |
|----------|--------|---------|--------------|
| `/api/v1/projects` | POST | Create project (draft or submitted) | Only if no status provided |
| `/api/v1/projects/:id` | PATCH | Update project details | No |
| `/api/v1/projects/:id/submit` | POST | Submit draft project | Yes |
| `/api/v1/projects/:id/status` | PATCH | Manually change status | No |

## Status Descriptions

| Status | Description | Allowed Transitions |
|--------|-------------|-------------------|
| `draft` | Project saved but not submitted | → `pending` (via submit) |
| `pending` | Project submitted, awaiting review | → `in_progress`, `cancelled` |
| `in_progress` | Work has started on project | → `completed`, `cancelled` |
| `completed` | Project finished successfully | Final state |
| `cancelled` | Project cancelled | Final state |

## Business Rules

1. **Creation Rules:**
   - Can only create with `status: "draft"` or no status (becomes `pending`)
   - Cannot create directly with `pending`, `in_progress`, `completed`, or `cancelled` status

2. **Draft Submission Rules:**
   - Only `draft` projects can be submitted via `/submit` endpoint
   - Submission automatically changes status to `pending`
   - Cannot submit projects that are already in `pending` or other statuses

3. **Permission Rules:**
   - Users can only create/update/submit their own projects
   - ADMIN role can perform all operations on any project

4. **Email Rules:**
   - Notifications sent only when project transitions to `pending` status
   - Notifications sent to all active system admins and company admins
   - Email failures do not block project creation/submission

## Frontend Integration

### Recommended UI Flow

**Draft Button:**
```javascript
// Save as draft
const saveDraft = async (projectData) => {
  const response = await fetch('/api/v1/projects', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...projectData,
      status: 'draft'  // Explicitly set to draft
    })
  });
  // Show success: "Draft saved. You can submit it later."
};
```

**Submit Button:**
```javascript
// Submit immediately
const submitProject = async (projectData) => {
  const response = await fetch('/api/v1/projects', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...projectData
      // No status field = auto-submit
    })
  });
  // Show success: "Project submitted successfully. Admins have been notified."
};
```

**Submit Draft Button (for existing drafts):**
```javascript
// Submit a draft that was saved earlier
const submitDraft = async (projectId) => {
  const response = await fetch(`/api/v1/projects/${projectId}/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  // Show success: "Project submitted successfully. Admins have been notified."
};
```

## Testing

### Test Case 1: Create Draft
```bash
# Should create project with draft status, no emails
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectTypeCode":"residual_analysis","name":"Test Draft","status":"draft"}'

# Expected: status="draft", no email logs
```

### Test Case 2: Create and Submit
```bash
# Should create project with pending status, send emails
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectTypeCode":"residual_analysis","name":"Test Submit"}'

# Expected: status="pending", email logs showing notifications sent
```

### Test Case 3: Submit Draft
```bash
# First create a draft
PROJECT_ID=$(curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectTypeCode":"residual_analysis","name":"Test Draft","status":"draft"}' \
  | jq -r '.id')

# Then submit it
curl -X POST http://localhost:3000/api/v1/projects/$PROJECT_ID/submit \
  -H "Authorization: Bearer $TOKEN"

# Expected: status changed to "pending", email logs showing notifications sent
```

### Test Case 4: Invalid Status
```bash
# Should fail with 400 error
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectTypeCode":"residual_analysis","name":"Test Invalid","status":"pending"}'

# Expected: 400 Bad Request with error message
```

## Logs to Monitor

**Draft Creation (No Emails):**
```
No special logs (emails not sent)
```

**Submission (Emails Sent):**
```
📧 EmailService.sendProjectCreationNotification called: {...}
✅ Project creation notifications queued for 3 recipients (1 system admins + 2 company admins)
🔄 Email job {jobId} is now active
✅ Email sent successfully to admin@4ami.com
✅ Email sent successfully to company.admin@company.com
```

**Submission Error:**
```
❌ Failed to send project creation notifications: [error details]
```

## Troubleshooting

**Issue: Emails not sent when submitting**
- Check if admins exist in database with correct roles
- Verify Redis is running (email queue requires Redis)
- Check email configuration in environment variables

**Issue: Cannot submit draft**
- Verify project status is actually "draft"
- Check user permissions (must be creator or admin)

**Issue: Status validation failing**
- Ensure status field is either "draft" or omitted entirely
- Other status values are not allowed during creation
