# Postman Examples for File Upload

## Complete Project Creation Payload

### Endpoint
```
POST http://localhost:3000/api/v1/projects
```

### Headers
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: multipart/form-data
```

### Body (form-data setup in Postman)

#### 1. Add `projectData` field (Text)

**Key:** `projectData`
**Type:** Text
**Value:** (Copy the JSON below)

```json
{
  "projectTypeCode": "residual_analysis",
  "name": "Reference Semi-Golka ARO Army-Trans",
  "description": "Residual analysis for Semi-Golka ARO equipment",
  "startDate": "2025-10-27",
  "endDate": "2025-12-31",
  "status": "DRAFT",
  "client": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567",
    "website": "https://example.com",
    "communicationPreference": "email"
  },
  "source": {
    "sourceNo": "S-1002",
    "sourceName": "GreenTech Machinery",
    "sourceType": "dealer",
    "contact": "Bob Nolan",
    "title": "Sales Manager",
    "phoneNumber1": "+1-555-987-6543",
    "phoneNumber2": "+1-555-987-6544",
    "email": "bob.nolan@greentech.com",
    "website": "www.greentech.com",
    "communicationPreference": "email"
  },
  "equipments": [
    {
      "industry": "Mining",
      "assetClass": "Heavy Equipment",
      "make": "Volvo",
      "model": "A40G",
      "year": 2020,
      "currentMeterReading": 5000,
      "meterType": "hours",
      "environmentRanking": "New"
    },
    {
      "industry": "Construction",
      "assetClass": "Articulated Truck",
      "make": "Caterpillar",
      "model": "797F",
      "year": 2019,
      "currentMeterReading": 8000,
      "meterType": "hours",
      "environmentRanking": "Used"
    }
  ],
  "financial": {
    "subjectPrice": 250000.50,
    "concession": 5000.00,
    "extendedWarranty": 2000.00,
    "maintenancePMAs": 3000.00
  },
  "transaction": {
    "currentOwner": "ABC Mining Corporation",
    "structure": "lease",
    "application": "mining_operations",
    "environment": "offroad"
  },
  "utilizationScenarios": [
    {
      "scenarioName": "Q1",
      "termMonths": 36,
      "annualUtilization": 2000,
      "funding": 50000,
      "subsidy": 5000,
      "warranty": 2000,
      "pmas": 1000,
      "unitPrice": 180000
    },
    {
      "scenarioName": "Q2",
      "termMonths": 48,
      "annualUtilization": 2500,
      "funding": 60000,
      "subsidy": 6000,
      "warranty": 2500,
      "pmas": 1200,
      "unitPrice": 185000
    },
    {
      "scenarioName": "Q3",
      "termMonths": 60,
      "annualUtilization": 3000,
      "funding": 70000,
      "subsidy": 7000,
      "warranty": 3000,
      "pmas": 1500,
      "unitPrice": 190000
    }
  ],
  "metadata": {
    "priority": "high",
    "category": "residual_analysis",
    "estimatedValue": 250000
  }
}
```

#### 2. Add Files (File type)

Add multiple rows with:
- **Key:** `files` (same key for all files)
- **Type:** File (select from dropdown)
- **Value:** Click "Select Files" and choose your files

**Example:**
```
Row 2: files | File | release-confirmation.pdf
Row 3: files | File | equipment-photo.png
Row 4: files | File | inspection-report.xlsx
Row 5: files | File | bill-of-sale.pdf
```

---

## Minimal Example (Quick Test)

### Endpoint
```
POST http://localhost:3000/api/v1/projects
```

### Body (form-data)

#### projectData (Text)
```json
{
  "projectTypeCode": "residual_analysis",
  "name": "Quick Test Project",
  "status": "DRAFT"
}
```

#### files (File)
- Select 1-2 test files (PDF, PNG, or XLSX)

---

## Expected Success Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "projectNumber": "20250001",
  "name": "Reference Semi-Golka ARO Army-Trans",
  "description": "Residual analysis for Semi-Golka ARO equipment",
  "status": "DRAFT",
  "startDate": "2025-10-27",
  "endDate": "2025-12-31",
  "submitDate": null,
  "metadata": {
    "priority": "high",
    "category": "residual_analysis",
    "estimatedValue": 250000
  },
  "companyId": "company-uuid",
  "projectTypeId": "project-type-uuid",
  "createdById": "user-uuid",
  "createdAt": "2025-10-27T15:00:00.000Z",
  "updatedAt": "2025-10-27T15:00:00.000Z",
  "client": {
    "id": "client-uuid",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-123-4567"
  },
  "source": {
    "id": "source-uuid",
    "sourceNo": "S-1002",
    "sourceName": "GreenTech Machinery"
  },
  "equipments": [
    {
      "id": "equipment-1-uuid",
      "industry": "Mining",
      "make": "Volvo",
      "model": "A40G",
      "year": 2020
    }
  ],
  "financial": {
    "id": "financial-uuid",
    "subjectPrice": "250000.50"
  },
  "transaction": {
    "id": "transaction-uuid",
    "currentOwner": "ABC Mining Corporation",
    "structure": "lease"
  },
  "utilizationScenarios": [
    {
      "id": "scenario-uuid",
      "scenarioName": "Q1",
      "termMonths": 36
    }
  ],
  "attachments": [
    {
      "id": "attachment-1-uuid",
      "fileName": "1730044800000-123456789.pdf",
      "originalFileName": "release-confirmation.pdf",
      "fileSize": 2048576,
      "filePath": "/app/uploads/projects/550e8400-e29b-41d4-a716-446655440000/1730044800000-123456789.pdf",
      "fileUrl": "/uploads/projects/550e8400-e29b-41d4-a716-446655440000/1730044800000-123456789.pdf",
      "mimeType": "application/pdf",
      "uploadedById": "user-uuid",
      "createdAt": "2025-10-27T15:00:00.000Z",
      "updatedAt": "2025-10-27T15:00:00.000Z"
    },
    {
      "id": "attachment-2-uuid",
      "fileName": "1730044801000-987654321.png",
      "originalFileName": "equipment-photo.png",
      "fileSize": 500000,
      "fileUrl": "/uploads/projects/550e8400-e29b-41d4-a716-446655440000/1730044801000-987654321.png",
      "mimeType": "image/png",
      "createdAt": "2025-10-27T15:00:01.000Z"
    }
  ]
}
```

---

## Other File Operations

### 1. Upload Files to Existing Project

**Endpoint:** `POST http://localhost:3000/api/v1/projects/{projectId}/attachments`

**Body (form-data):**
```
files | File | document1.pdf
files | File | document2.xlsx
files | File | photo.png
```

**Response:**
```json
{
  "success": true,
  "message": "3 file(s) uploaded successfully",
  "data": [
    {
      "id": "new-attachment-uuid",
      "fileName": "1730044900000-111111111.pdf",
      "originalFileName": "document1.pdf",
      "fileSize": 1024000,
      "fileUrl": "/uploads/projects/project-id/1730044900000-111111111.pdf",
      "mimeType": "application/pdf",
      "createdAt": "2025-10-27T15:01:40.000Z"
    }
  ]
}
```

### 2. Get All Attachments

**Endpoint:** `GET http://localhost:3000/api/v1/projects/{projectId}/attachments`

**Response:**
```json
[
  {
    "id": "attachment-uuid",
    "fileName": "1730044800000-123456789.pdf",
    "originalFileName": "release-confirmation.pdf",
    "fileSize": 2048576,
    "fileUrl": "/uploads/projects/project-id/1730044800000-123456789.pdf",
    "mimeType": "application/pdf",
    "createdAt": "2025-10-27T15:00:00.000Z"
  }
]
```

### 3. Download Attachment

**Endpoint:** `GET http://localhost:3000/api/v1/projects/{projectId}/attachments/{attachmentId}/download`

**Response:** File download (binary)

### 4. Delete Attachment

**Endpoint:** `DELETE http://localhost:3000/api/v1/projects/{projectId}/attachments/{attachmentId}`

**Response:**
```json
{
  "success": true,
  "message": "Attachment deleted successfully"
}
```

---

## Error Responses

### File Too Large
```json
{
  "statusCode": 400,
  "message": "File document.pdf exceeds maximum size of 10MB",
  "error": "Bad Request"
}
```

### Invalid File Type
```json
{
  "statusCode": 400,
  "message": "File type not allowed. Allowed types: PDF, Images (PNG, JPG), Excel (XLS, XLSX), Word (DOC, DOCX), Text, CSV",
  "error": "Bad Request"
}
```

### Too Many Files
```json
{
  "statusCode": 400,
  "message": "Maximum 10 files allowed per upload",
  "error": "Bad Request"
}
```

### Project Not Found
```json
{
  "statusCode": 404,
  "message": "Project not found",
  "error": "Not Found"
}
```

### Unauthorized
```json
{
  "statusCode": 403,
  "message": "You do not have permission to upload files to this project",
  "error": "Forbidden"
}
```

---

## Step-by-Step Postman Setup

### 1. Create New Request
- Click "New" → "HTTP Request"
- Name it: "Create Project with Files"
- Set method to **POST**
- URL: `http://localhost:3000/api/v1/projects`

### 2. Set Authorization
- Go to "Authorization" tab
- Type: **Bearer Token**
- Token: Paste your JWT token

### 3. Set Body
- Go to "Body" tab
- Select **form-data**
- Add rows as shown above

### 4. Send Request
- Click **Send**
- View response in bottom panel

---

## Quick Verification

After fixing permissions with:
```bash
sudo chown -R 1001:1001 uploads/
sudo chmod -R 755 uploads/
```

Test with curl:
```bash
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F 'projectData={"projectTypeCode":"residual_analysis","name":"Test","status":"DRAFT"}' \
  -F "files=@/path/to/test-file.pdf"
```
